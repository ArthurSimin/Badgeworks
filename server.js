#!/usr/bin/env node
/* Badgeworks API server.
 *
 * Serves the badge-generation API backed by badge-core.js + sharp.
 *   - Auth: API key via `Authorization: Bearer <key>`, `X-API-Key: <key>`,
 *     or `?key=<key>` query param. Keys live in keys.json (see scripts/manage-keys.js)
 *     or the BADGEWORKS_API_KEY env var (comma-separated for multiple).
 *   - Endpoints:
 *       GET  /api/presets            -> list of preset icons with brand metadata
 *       GET  /api/styles             -> list of style names
 *       GET  /api/gradients          -> list of background gradient presets
 *       GET  /api/badge.svg          -> raw SVG (Content-Type: image/svg+xml)
 *       GET  /api/badge.png          -> rasterized PNG (Content-Type: image/png)
 *       GET/POST /api/badge          -> JSON { svg, png (base64), width, height, format }
 *   - Also serves the static site (index.html, index.css, app.js, badge-core.js)
 *     on the same port for one-command deployment.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BadgeCore = require('./badge-core.js');

const PORT = parseInt(process.env.PORT || '8080', 10);
const SCALE = parseInt(process.env.BADGEWORKS_SCALE || '3', 10);
const HOST = process.env.HOST || '0.0.0.0';

let sharp = null;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('sharp is not installed; PNG endpoints will return 501. Run: npm install');
}

const ROOT = __dirname;

/* ----------------------------- key store ------------------------------ */

const KEYS_FILE = path.join(ROOT, 'keys.json');
let keysCache = null;
let keysMtime = 0;

function loadKeys() {
  try {
    const stat = fs.statSync(KEYS_FILE);
    if (keysCache && stat.mtimeMs === keysMtime) return keysCache;
    const data = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    const map = new Map();
    if (data.keys && Array.isArray(data.keys)) {
      for (const entry of data.keys) {
        if (entry && entry.key) map.set(entry.key, entry);
      }
    }
    keysCache = map;
    keysMtime = stat.mtimeMs;
    return keysCache;
  } catch (e) {
    return new Map();
  }
}

function envKeys() {
  return (process.env.BADGEWORKS_API_KEY || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

function isAuthorized(req, url) {
  const headers = req.headers;
  let provided = null;
  const authHeader = headers.authorization;
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    provided = authHeader.replace(/^Bearer\s+/i, '').trim();
  } else if (headers['x-api-key']) {
    provided = String(headers['x-api-key']).trim();
  } else if (url.searchParams.get('key')) {
    provided = url.searchParams.get('key').trim();
  }
  if (!provided) return false;

  if (envKeys().includes(provided)) return true;
  const entry = loadKeys().get(provided);
  if (!entry) return false;
  if (entry.revoked) return false;
  return true;
}

/* --------------------------- config building --------------------------- */

const BOOL_KEYS = new Set([
  'showDisk', 'useCustomLogoColor', 'useLogoStroke', 'useLogoShadow',
  'useTextGrad', 'useTextStroke', 'useTextShadow', 'isUploadedSvg',
]);

const NUM_KEYS = new Set([
  'radius', 'paddingRight', 'diskDiameter', 'userLogoScale',
  'logoStrokeWidth', 'logoShadowBlur', 'textStrokeWidth', 'textShadowBlur',
]);

function parseBool(v) {
  if (v === undefined || v === null) return undefined;
  if (typeof v === 'boolean') return v;
  return /^(true|1|yes|on)$/i.test(String(v).trim());
}

function collectParams(req, url) {
  const params = {};
  for (const [k, v] of url.searchParams.entries()) {
    addParam(params, k, v);
  }
  return params;
}

function addParam(params, key, value) {
  if (key === 'bgStops') {
    if (!params.bgStops) params.bgStops = [];
    // support "a,b,c" or repeated bgStops params
    const parts = String(value).split(',');
    for (const p of parts) {
      const t = p.trim();
      if (t) params.bgStops.push(t);
    }
    return;
  }
  if (Object.prototype.hasOwnProperty.call(params, key)) {
    if (!Array.isArray(params[key])) params[key] = [params[key]];
    params[key].push(value);
  } else {
    params[key] = value;
  }
}

function buildConfig(params) {
  const cfg = {};
  for (const key of Object.keys(BadgeCore.DEFAULT_CONFIG)) {
    cfg[key] = BadgeCore.DEFAULT_CONFIG[key];
  }
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (Array.isArray(value)) {
      if (key === 'bgStops') cfg.bgStops = value;
      else cfg[key] = value[value.length - 1];
      continue;
    }
    if (BOOL_KEYS.has(key)) cfg[key] = parseBool(value);
    else if (NUM_KEYS.has(key)) {
      const n = parseFloat(value);
      cfg[key] = Number.isNaN(n) ? cfg[key] : n;
    } else if (key === 'bgGradPreset') {
      cfg.bgGradPreset = String(value);
    } else if (key === 'style') {
      cfg.style = String(value);
    } else {
      cfg[key] = String(value);
    }
  }
  return cfg;
}

/* ---------------------------- FA resolution ---------------------------- */

const faCache = new Map();

async function resolveFaIcon(faInput) {
  const { style, name } = BadgeCore.parseFaClass(faInput);
  if (!name) return null;
  const cacheKey = `${style}:${name}`;
  if (faCache.has(cacheKey)) return faCache.get(cacheKey);

  const folder = style === 'brands' ? 'brands' : style === 'regular' ? 'regular' : 'solid';
  const url = `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/${folder}/${name}.svg`;
  let result = null;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      const vb = text.match(/viewBox="([^"]+)"/);
      const paths = Array.from(text.matchAll(/<path[^>]*\bd="([^"]*)"/g))
        .map((m) => m[1]).filter(Boolean).join(' ');
      if (paths) result = { viewBox: vb ? vb[1] : '0 0 512 512', pathData: paths };
    }
  } catch (e) { /* network error -> null */ }
  faCache.set(cacheKey, result);
  return result;
}

/* ------------------------------ response ------------------------------- */

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

function sendBytes(res, code, buffer, contentType, filename) {
  res.writeHead(code, {
    'Content-Type': contentType,
    'Content-Length': buffer.length,
    'Access-Control-Allow-Origin': '*',
    ...(filename ? { 'Content-Disposition': `inline; filename="${filename}"` } : {}),
  });
  res.end(buffer);
}

/* ------------------------------- handlers ------------------------------ */

async function renderBadgeFromParams(params) {
  const cfg = buildConfig(params);
  let faIcon = null;
  if (cfg.iconMode === 'fontawesome') {
    faIcon = await resolveFaIcon(cfg.faIconInput || `${cfg.faPack} fa-${cfg.faIconName}`);
  }
  const result = BadgeCore.buildBadgeSvg(cfg, cfg.style || null, faIcon, null, {});
  if (result.svg.includes('<!-- FA_ICON_SLOT -->')) {
    // Icon could not be resolved (e.g. bad name); fall back to "?" placeholder like the app.
    result.svg = result.svg.replace('<!-- FA_ICON_SLOT -->', '');
  }
  return result;
}

function assertParams(cfg) {
  const errs = [];
  if (cfg.iconMode === 'preset' && !BadgeCore.OFFICIAL_BRAND_ICONS[cfg.presetKey]) {
    errs.push(`unknown presetKey "${cfg.presetKey}"`);
  }
  if (!['cozy', 'compact', 'cozy-minimal', 'compact-minimal'].includes(cfg.style)) {
    errs.push(`invalid style "${cfg.style}"`);
  }
  if (cfg.bgStops.length > BadgeCore.BG_GRADIENT_MAX_STOPS) {
    errs.push(`bgStops exceeds ${BadgeCore.BG_GRADIENT_MAX_STOPS} stops`);
  }
  return errs;
}

async function handleApi(req, res, url) {
  if (!isAuthorized(req, url)) {
    sendJson(res, 401, { error: 'missing or invalid API key' });
    return;
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    });
    res.end();
    return;
  }

  const pathname = url.pathname;

  if (pathname === '/api/presets' && req.method === 'GET') {
    const presets = Object.entries(BadgeCore.OFFICIAL_BRAND_ICONS).map(([key, icon]) => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      isCustomSvg: !!icon.isCustomSvg,
      scalable: !!icon.scalable,
      color: icon.color || null,
      defaultScale: icon.defaultScale || null,
    }));
    sendJson(res, 200, { presets });
    return;
  }

  if (pathname === '/api/styles' && req.method === 'GET') {
    sendJson(res, 200, { styles: ['cozy', 'compact', 'cozy-minimal', 'compact-minimal'] });
    return;
  }

  if (pathname === '/api/gradients' && req.method === 'GET') {
    sendJson(res, 200, { gradients: BadgeCore.BG_GRADIENT_PRESETS });
    return;
  }

  const isBadge = pathname === '/api/badge' || pathname === '/api/badge.svg' || pathname === '/api/badge.png';
  if (!isBadge) {
    sendJson(res, 404, { error: 'not found' });
    return;
  }

  let params;
  if (req.method === 'POST' && pathname === '/api/badge') {
    const raw = await readBody(req);
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        params = {};
        for (const [k, v] of Object.entries(parsed)) addParam(params, k, v);
      }
    } catch (e) {
      sendJson(res, 400, { error: 'invalid JSON body' });
      return;
    }
  } else if (req.method === 'GET' || req.method === 'HEAD') {
    params = collectParams(req, url);
  } else {
    sendJson(res, 405, { error: 'method not allowed' });
    return;
  }

  try {
    const cfg = buildConfig(params);
    const errs = assertParams(cfg);
    if (errs.length) {
      sendJson(res, 400, { error: errs.join('; ') });
      return;
    }
    const result = await renderBadgeFromParams(params);
    const svgBuffer = Buffer.from(result.svg, 'utf8');
    const svgName = `${cfg.bottomText || 'badge'}-${cfg.style || 'cozy'}`.toLowerCase().replace(/[^a-z0-9_-]+/g, '_');

    if (pathname === '/api/badge.svg') {
      sendBytes(res, 200, svgBuffer, 'image/svg+xml', `${svgName}.svg`);
      return;
    }

    if (pathname === '/api/badge.png') {
      if (!sharp) { sendJson(res, 501, { error: 'sharp not installed' }); return; }
      const png = await sharp(svgBuffer, { density: 72 * SCALE }).png().toBuffer();
      sendBytes(res, 200, png, 'image/png', `${svgName}.png`);
      return;
    }

    // JSON envelope
    let pngBase64 = null;
    if (sharp) {
      const png = await sharp(svgBuffer, { density: 72 * SCALE }).png().toBuffer();
      pngBase64 = png.toString('base64');
    }
    sendJson(res, 200, {
      format: 'svg',
      width: result.width,
      height: result.height,
      svg: result.svg,
      png: pngBase64, // base64-encoded PNG (3x scale); null if sharp is unavailable
    });
  } catch (e) {
    sendJson(res, 500, { error: String((e && e.message) || e) });
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 2 * 1024 * 1024) {
        reject(new Error('body too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/* ------------------------------ static site ---------------------------- */

const STATIC_FILES = {
  '/': { file: 'index.html', type: 'text/html' },
  '/index.html': { file: 'index.html', type: 'text/html' },
  '/index.css': { file: 'index.css', type: 'text/css' },
  '/app.js': { file: 'app.js', type: 'text/javascript' },
  '/badge-core.js': { file: 'badge-core.js', type: 'text/javascript' },
};

function serveStatic(res, pathname) {
  const entry = STATIC_FILES[pathname];
  if (!entry) {
    sendJson(res, 404, { error: 'not found' });
    return;
  }
  fs.readFile(path.join(ROOT, entry.file), (err, data) => {
    if (err) { sendJson(res, 500, { error: 'read error' }); return; }
    res.writeHead(200, { 'Content-Type': entry.type, 'Content-Length': data.length });
    res.end(data);
  });
}

/* --------------------------------- main -------------------------------- */

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url).catch((e) => {
      sendJson(res, 500, { error: String((e && e.message) || e) });
    });
    return;
  }
  serveStatic(res, url.pathname);
});

server.listen(PORT, HOST, () => {
  const keys = envKeys().length + loadKeys().size;
  console.log(`Badgeworks API listening on http://${HOST}:${PORT}`);
  console.log(`API keys loaded: ${keys}`);
  console.log(`sharp PNG support: ${sharp ? 'enabled' : 'DISABLED (npm install sharp)'}`);
});
