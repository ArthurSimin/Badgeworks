/* ==========================================================================
   BADGEWORKS — HEADLESS CORE (no GUI / no DOM)
   ==========================================================================
   A dependency-light Node.js library that produces the same SVG/PNG badges as
   the Badgeworks web app, but driven entirely by a config object instead of a
   browser UI. Everything DOM- and window-specific has been removed so it runs
   inside a Discord bot (or any Node 18+ process).

   Exports:
     generateBadge(cfg)          -> Promise<string>  (SVG markup)
     generateBadgePng(cfg, opts) -> Promise<Buffer>  (PNG bytes, 3x)
     svgToPng(svg, opts)         -> Promise<Buffer>
     normalizeConfig(cfg)        -> resolved config object
     resolvePreset(key)          -> preset config for common badges
     PRESETS                     -> text/icon presets (github, discord, ...)
     OFFICIAL_BRAND_ICONS        -> preset icon data
     BG_GRADIENT_PRESETS         -> named background gradients
     listIcons()                 -> preset icon keys
   ========================================================================== */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import {
  OFFICIAL_BRAND_ICONS,
  BG_GRADIENT_PRESETS,
  BG_GRADIENT_MAX_STOPS
} from './icons.js';

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Known FontAwesome pack tokens + class parsing (ports of the app's pure logic)
// ---------------------------------------------------------------------------
const FA_PACK_TOKENS = ['fa-brands', 'fa-solid', 'fa-regular'];

export function parseFaClass(iconClass) {
  const parts = String(iconClass ?? '').trim().split(/\s+/);
  let style = 'solid';
  let packFull = 'fa-solid';
  let name = null;

  for (const p of parts) {
    if (FA_PACK_TOKENS.includes(p)) {
      packFull = p;
      if (p === 'fa-brands') style = 'brands';
      else if (p === 'fa-regular') style = 'regular';
      else style = 'solid';
    } else if (p.startsWith('fa-') && p !== 'fa') {
      const token = p.replace('fa-', '');
      if (['solid', 'regular', 'brands', 'brand'].includes(token)) {
        if (token === 'brands' || token === 'brand') { style = 'brands'; packFull = 'fa-brands'; }
        else if (token === 'regular') { style = 'regular'; packFull = 'fa-regular'; }
        else { style = 'solid'; packFull = 'fa-solid'; }
      } else if (['light', 'thin', 'duotone', 'sharp', 'pixel', 'mosaic', 'vellum', 'slab'].includes(token) || p.startsWith('fa-sharp')) {
        style = 'solid'; packFull = 'fa-solid';
      } else {
        name = token;
      }
    }
  }
  return { style, packFull, name };
}

// theSVG constants + slug normalization (ports of the app's pure logic)
const THESVG_VARIANTS = ['default', 'color', 'mono', 'light', 'dark', 'wordmark'];

export function normalizeTheSvgSlug(raw) {
  return String(raw ?? '').trim().toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\-.+~]/g, '');
}

// ---------------------------------------------------------------------------
// Config normalization
// ---------------------------------------------------------------------------
const DEFAULTS = {
  style: 'cozy', // 'cozy' | 'compact' | 'cozy-minimal' | 'compact-minimal'
  topText: '',
  bottomText: '',
  iconMode: 'preset', // 'preset' | 'fontawesome' | 'thesvg' | 'upload' | 'raw' | (none handled via logoPosition)
  logoPosition: 'left', // 'left' | 'right' | 'none'
  presetKey: 'github',

  // upload / raw sources
  imageDataUrl: '',     // data URL for 'upload' mode (PNG/JPG/WebP/SVG)
  rawSvgDataUrl: '',    // data URL built from pasted raw SVG for 'raw' mode
  customSvgContent: '', // inner <svg> markup (used to build a data URL if none supplied)
  isUploadedSvg: false,

  // background
  bgStops: ['#181f29', '#0f131a'],

  // layout / styling
  showDisk: false,
  diskColor: '#ffffff',
  logoColor: '#ffffff',
  textColor: '#ffffff',
  subtitleColor: '#e0e0e0',
  radius: 8,
  paddingRight: 8,
  diskDiameter: 40,
  userLogoScale: 34,

  // text FX
  useTextGrad: false,
  textGradTop: '#61DAFB',
  textGradBot: '#FFFFFF',
  useTextStroke: false,
  textStrokeColor: '#000000',
  textStrokeWidth: '1.5',
  useTextShadow: false,
  textShadowColor: '#000000',
  textShadowBlur: 2,

  // logo FX
  useCustomLogoColor: false,
  useLogoStroke: false,
  logoStrokeColor: '#ffffff',
  logoStrokeWidth: '2',
  useLogoStrokeGrad: false,
  logoStrokeGradTop: '#FFFFFF',
  logoStrokeGradBot: '#61DAFB',
  useLogoShadow: false,
  logoShadowColor: '#000000',
  logoShadowBlur: 2,

  // FontAwesome
  faIconClass: 'fa-brands fa-github', // or provide faPack + faIconName
  faPack: 'fa-brands',
  faIconName: 'github',

  // theSVG
  thesvgSlug: 'github',
  thesvgVariant: 'default'
};

export function normalizeConfig(cfg) {
  const c = Object.assign({}, DEFAULTS, cfg || {});

  // style must be one of the 4 supported variants
  if (!['cozy', 'compact', 'cozy-minimal', 'compact-minimal'].includes(c.style)) c.style = 'cozy';
  if (!['left', 'right', 'none'].includes(c.logoPosition)) c.logoPosition = 'left';
  if (!['preset', 'fontawesome', 'thesvg', 'upload', 'raw'].includes(c.iconMode)) c.iconMode = 'preset';

  // preset key fallback
  if (!OFFICIAL_BRAND_ICONS[c.presetKey]) c.presetKey = 'github';

  // bgStops must be 2..N valid hex colors
  const isHex = (v) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
  if (Array.isArray(c.bgStops)) {
    const clean = c.bgStops.filter(isHex).slice(0, BG_GRADIENT_MAX_STOPS);
    if (clean.length >= 2) c.bgStops = clean;
    else c.bgStops = DEFAULTS.bgStops.slice();
  } else {
    c.bgStops = DEFAULTS.bgStops.slice();
  }

  // numeric coercion
  c.radius = Math.max(0, Number(c.radius) || 0);
  c.paddingRight = Math.max(0, Number(c.paddingRight) || 0);
  c.diskDiameter = Math.max(0, Number(c.diskDiameter) || 40);
  c.userLogoScale = Math.max(0, Number(c.userLogoScale) || 34);
  c.textShadowBlur = Number(c.textShadowBlur) || 0;
  c.logoShadowBlur = Number(c.logoShadowBlur) || 0;
  c.textStrokeWidth = String(c.textStrokeWidth ?? DEFAULTS.textStrokeWidth);
  c.logoStrokeWidth = String(c.logoStrokeWidth ?? DEFAULTS.logoStrokeWidth);

  // If the user didn't set an icon size, honor a preset's preferred default scale
  // (github/python/react default to 41 so the cropped glyph matches its pre-crop size).
  if (cfg && cfg.userLogoScale == null) {
    const info = OFFICIAL_BRAND_ICONS[c.presetKey];
    if (info && info.defaultScale) c.userLogoScale = info.defaultScale;
  }

  // FontAwesome class resolution: an explicit class wins, else pack + name
  if (c.faIconClass) {
    const { style, name } = parseFaClass(c.faIconClass);
    c.faPack = `${style === 'brands' ? 'fa-brands' : style === 'regular' ? 'fa-regular' : 'fa-solid'}`;
    c.faIconName = name || c.faIconName || 'github';
  } else if (c.faPack && c.faIconName) {
    c.faIconName = String(c.faIconName).replace(/^fa-/, '') || 'github';
  }

  if (!THESVG_VARIANTS.includes(c.thesvgVariant)) c.thesvgVariant = 'default';

  // Build a data URL for raw/upload when only inner markup was supplied
  if (c.customSvgContent && !c.rawSvgDataUrl && !c.imageDataUrl) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${c.customSvgContent}</svg>`;
    const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    if (c.iconMode === 'raw') c.rawSvgDataUrl = dataUrl;
    else c.imageDataUrl = dataUrl;
  }

  return c;
}

// ---------------------------------------------------------------------------
// Preset text/colour helpers
// ---------------------------------------------------------------------------
export const PRESETS = {
  github: { top: 'Available on', bottom: 'GitHub', icon: 'github' },
  discord: { top: 'Join our', bottom: 'Discord', icon: 'discord' },
  python: { top: 'Built with', bottom: 'Python', icon: 'python' },
  react: { top: 'Powered by', bottom: 'React', icon: 'react' },
  vscode: { top: 'Get for', bottom: 'VS Code', icon: 'vscode' },
  pypi: { top: 'Package on', bottom: 'PyPI', icon: 'pypi' }
};

export function resolvePreset(type, overrides) {
  const p = PRESETS[type];
  if (!p) return null;
  const brand = OFFICIAL_BRAND_ICONS[p.icon] || {};
  const cfg = {
    topText: p.top,
    bottomText: p.bottom,
    presetKey: p.icon,
    iconMode: 'preset',
    logoPosition: 'left',
    bgStops: [brand.bgTop || '#181f29', brand.bgBot || '#0f131a']
  };
  if (brand.defaultScale) cfg.userLogoScale = brand.defaultScale;
  return Object.assign(cfg, overrides || {});
}

export function listIcons() {
  return Object.keys(OFFICIAL_BRAND_ICONS);
}

// ---------------------------------------------------------------------------
// Text measurement (headless: real Inter metrics via canvas, with a heuristic
// fallback when the canvas backend is unavailable)
// ---------------------------------------------------------------------------
const textMeasurementCache = new Map();

// Bundled Inter static weights (SIL OFL-1.1) — the same family the web app
// loads from Google Fonts, so measured widths match the browser 1:1.
const INTER_FONT_FILES = [
  'Inter-Regular.ttf',  // 400
  'Inter-Medium.ttf',   // 500
  'Inter-SemiBold.ttf', // 600
  'Inter-Bold.ttf'      // 700
];

const FONT_DIR = new URL('../fonts/', import.meta.url);

function interFontPaths() {
  return INTER_FONT_FILES.map((f) => fileURLToPath(new URL(f, FONT_DIR)));
}

// Lazily initialised 2D context (skia) used to measure text — mirrors the
// browser's `ctx.measureText()` call from the original app.
let _ctx = null;
let _ctxTried = false;

function getMeasureContext() {
  if (_ctxTried) return _ctx;
  _ctxTried = true;
  try {
    const { GlobalFonts, createCanvas } = require('@napi-rs/canvas');
    let registered = false;
    if (GlobalFonts && typeof GlobalFonts.registerFromPath === 'function') {
      for (const path of interFontPaths()) {
        try {
          if (GlobalFonts.registerFromPath(path, 'Inter')) registered = true;
        } catch {
          // keep going — one bad file should not break the rest
        }
      }
    }
    if (!registered) return (_ctx = null);
    const canvas = createCanvas(10, 10);
    _ctx = canvas.getContext('2d');
  } catch {
    _ctx = null;
  }
  return _ctx;
}

function estimateTextWidth(text, size, weight) {
  let em = 0;
  for (const ch of String(text)) {
    if (ch === ' ') { em += 0.25; continue; }
    if (ch >= '0' && ch <= '9') { em += 0.55; continue; }
    if (ch >= 'A' && ch <= 'Z') { em += 0.72; continue; }
    if (ch >= 'a' && ch <= 'z') { em += 0.52; continue; }
    if ('.,:;!|`\'"'.includes(ch)) { em += 0.26; continue; }
    if (ch === '.' || ch === '-') { em += 0.40; continue; }
    em += 0.58; // brackets, symbols, unicode, etc.
  }
  if (weight >= 700) em *= 1.04;
  return Math.ceil(em * size);
}

export function measureText(text, fontSpec, customMeasure) {
  if (!text) return 0;
  const cacheKey = `${text}|${fontSpec}`;
  if (textMeasurementCache.has(cacheKey)) return textMeasurementCache.get(cacheKey);

  let width;
  if (typeof customMeasure === 'function') {
    width = Math.ceil(customMeasure(text, fontSpec) || 0);
  } else {
    const ctx = getMeasureContext();
    if (ctx) {
      try {
        ctx.font = fontSpec;
        width = Math.ceil(ctx.measureText(text).width);
      } catch {
        width = 0;
      }
    }
    if (!width) {
      const m = /(\d+)\s+([\d.]+)px/.exec(String(fontSpec));
      const weight = m ? parseInt(m[1], 10) : 500;
      const size = m ? parseFloat(m[2]) : 13;
      width = estimateTextWidth(text, size, weight);
    }
  }

  if (textMeasurementCache.size > 2000) textMeasurementCache.clear();
  textMeasurementCache.set(cacheKey, width);
  return width;
}

// ---------------------------------------------------------------------------
// SVG filter builders (exact ports — no DOM)
// ---------------------------------------------------------------------------
function strokeDiskKernel(radius) {
  const r = Math.max(0.5, Number(radius) || 0);
  const R = Math.max(1, Math.ceil(r));
  const vals = [];
  for (let y = -R; y <= R; y++) {
    for (let x = -R; x <= R; x++) {
      vals.push(x * x + y * y <= r * r ? 1 : 0);
    }
  }
  return { order: 2 * R + 1, matrix: vals.join(' ') };
}

function buildLogoFxFilter(id, opts) {
  const { useTint, tintColor, useStroke, strokeColor, strokeWidth, useShadow, shadowColor, shadowBlur } = opts;
  if (!useTint && !useStroke && !useShadow) return '';

  let m = `    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">\n`;
  if (useShadow) {
    m += `      <feOffset in="SourceAlpha" dx="0" dy="2" result="shadowOffset"/>\n`;
    m += `      <feGaussianBlur in="shadowOffset" stdDeviation="${shadowBlur}" result="shadowBlur"/>\n`;
    m += `      <feFlood flood-color="${shadowColor}" flood-opacity="0.85" result="shadowColor"/>\n`;
    m += `      <feComposite in="shadowColor" in2="shadowBlur" operator="in" result="shadow"/>\n`;
  }
  if (useStroke) {
    const kernel = strokeDiskKernel(strokeWidth);
    m += `      <feConvolveMatrix in="SourceAlpha" order="${kernel.order}" kernelMatrix="${kernel.matrix}" divisor="1" bias="0" preserveAlpha="false" result="dilated"/>\n`;
    m += `      <feComponentTransfer in="dilated" result="expanded">\n`;
    m += `        <feFuncA type="discrete" tableValues="0 1"/>\n`;
    m += `      </feComponentTransfer>\n`;
    m += `      <feFlood flood-color="${strokeColor}" result="strokeColor"/>\n`;
    m += `      <feComposite in="strokeColor" in2="expanded" operator="in" result="stroke"/>\n`;
  }
  if (useTint) {
    m += `      <feFlood flood-color="${tintColor}" result="tintColor"/>\n`;
    m += `      <feComposite in="tintColor" in2="SourceAlpha" operator="in" result="tintedGraphic"/>\n`;
  }
  m += `      <feMerge>\n`;
  if (useShadow) m += `        <feMergeNode in="shadow"/>\n`;
  if (useStroke) m += `        <feMergeNode in="stroke"/>\n`;
  m += `        <feMergeNode in="${useTint ? 'tintedGraphic' : 'SourceGraphic'}"/>\n`;
  m += `      </feMerge>\n`;
  m += `    </filter>\n`;
  return m;
}

function buildStrokeSilFilter(id, radius) {
  const kernel = strokeDiskKernel(radius);
  return `    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">\n` +
    `      <feConvolveMatrix in="SourceAlpha" order="${kernel.order}" kernelMatrix="${kernel.matrix}" divisor="1" bias="0" preserveAlpha="false" result="dilated"/>\n` +
    `      <feComponentTransfer in="dilated" result="smoothEdge">\n` +
    `        <feFuncA type="discrete" tableValues="0 1"/>\n` +
    `      </feComponentTransfer>\n` +
    `    </filter>\n`;
}

function buildGradStrokeLayer({ maskId, silFilterId, gradId, width, height, logoCopy }) {
  return `  <mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" mask-type="alpha">\n` +
    `    <g filter="url(#${silFilterId})">\n${logoCopy}\n    </g>\n` +
    `  </mask>\n` +
    `  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#${gradId})" mask="url(#${maskId})"/>\n`;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Icon source fetch (Node fetch) — FontAwesome + theSVG
// ---------------------------------------------------------------------------
const faIconCache = new Map();

export async function extractFontAwesomeSvg(iconClass) {
  const { style, name } = parseFaClass(iconClass);
  if (!name) return null;

  const cacheKey = `${style}:${name}`;
  if (faIconCache.has(cacheKey)) return faIconCache.get(cacheKey);

  const folder = style === 'brands' ? 'brands' : style === 'regular' ? 'regular' : 'solid';
  const url = `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/${folder}/${name}.svg`;

  try {
    const res = await fetch(url);
    if (!res.ok) { faIconCache.set(cacheKey, null); return null; }
    const svgText = await res.text();
    const viewBox = (svgText.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 512 512';
    const paths = [];
    const re = /<path\b[^>]*\bd="([^"]*)"/g;
    let m;
    while ((m = re.exec(svgText)) !== null) paths.push(m[1]);
    const pathData = paths.join(' ');
    const result = pathData ? { viewBox, pathData } : null;
    faIconCache.set(cacheKey, result);
    return result;
  } catch {
    faIconCache.set(cacheKey, null);
    return null;
  }
}

const theSvgCache = new Map();

export async function extractTheSvg(slug, variant) {
  const cleanSlug = normalizeTheSvgSlug(slug) || 'github';
  const cleanVariant = THESVG_VARIANTS.includes(variant) ? variant : 'default';
  const cacheKey = `${cleanSlug}:${cleanVariant}`;
  if (theSvgCache.has(cacheKey)) return theSvgCache.get(cacheKey);

  const fetchVariant = (v) =>
    fetch(`https://thesvg.org/icons/${encodeURIComponent(cleanSlug)}/${encodeURIComponent(v)}.svg`)
      .then(async (r) => (r.ok ? await r.text() : null))
      .catch(() => null);

  let svgText = await fetchVariant(cleanVariant);
  if (!svgText && cleanVariant !== 'default') svgText = await fetchVariant('default');
  if (!svgText) { theSvgCache.set(cacheKey, null); return null; }

  try {
    const svgMatch = svgText.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/i);
    if (!svgMatch || !svgMatch[1].trim()) { theSvgCache.set(cacheKey, null); return null; }
    const viewBox = (svgText.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 24 24';
    const result = { viewBox, inner: svgMatch[1] };
    theSvgCache.set(cacheKey, result);
    return result;
  } catch {
    theSvgCache.set(cacheKey, null);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Core renderer (config -> SVG). Equivalent to the app's `generateBadgeForStyle`,
// but reads everything from a normalized config and emits unique filter/gradient IDs.
// ---------------------------------------------------------------------------
let uidCounter = 0;

export function renderBadgeSvg(cfg, faIcon, theSvgIcon) {
  const c = normalizeConfig(cfg);
  const uid = `b${++uidCounter}`;
  const g = (suffix) => `badge-${uid}-${suffix}`;

  const topText = c.topText;
  const bottomText = c.bottomText;
  const showDisk = c.showDisk;
  const diskColor = c.diskColor;
  const logoColor = c.logoColor;
  const bgStops = c.bgStops && c.bgStops.length >= 2 ? c.bgStops : ['#181f29', '#0f131a'];
  const textColor = c.textColor;
  const radius = c.radius;
  const paddingRight = c.paddingRight;
  const diskDiameter = c.diskDiameter;
  const userLogoScale = c.userLogoScale;
  const measure = c.measureText;

  const styleName = c.style;
  let height = 64;
  let topFont = '500 13px Inter, -apple-system, sans-serif';
  let bottomFont = '700 21px Inter, -apple-system, sans-serif';
  let topY = 25;
  let bottomY = 48;
  let isMinimal = false;
  let isSingleLine = false;

  if (styleName === 'compact') {
    height = 40;
    bottomFont = '700 13px Inter, -apple-system, sans-serif';
    isSingleLine = true;
  } else if (styleName === 'cozy-minimal') {
    height = 64;
    isMinimal = true;
  } else if (styleName === 'compact-minimal') {
    height = 40;
    isMinimal = true;
  }

  const heightScale = height / 64;
  const effectiveLogoSize = Math.round(userLogoScale * heightScale);

  const noLogo = c.logoPosition === 'none';
  const logoOnRight = c.logoPosition === 'right';
  const leftPad = Math.round(12 * heightScale);

  if (noLogo) {
    if (isSingleLine) {
      bottomFont = '700 16px Inter, -apple-system, sans-serif';
    } else {
      topFont = '500 15px Inter, -apple-system, sans-serif';
      bottomFont = '700 26px Inter, -apple-system, sans-serif';
    }
  }

  const brandInfo = OFFICIAL_BRAND_ICONS[c.presetKey] || OFFICIAL_BRAND_ICONS.github;

  const isCustomArtboard = c.iconMode === 'preset' && brandInfo.isCustomSvg && !brandInfo.scalable;
  const logoReserve = isCustomArtboard ? 64 * heightScale : effectiveLogoSize;
  const logoBoxPad = isCustomArtboard ? 0 : leftPad;
  let logoBoxStart = null;

  let textX = 0;
  const textCentered = noLogo;
  if (!noLogo) {
    if (logoOnRight) {
      textX = leftPad;
    } else if (brandInfo && brandInfo.textX && c.iconMode === 'preset') {
      textX = Math.round(brandInfo.textX * heightScale);
    } else {
      textX = Math.round(leftPad + effectiveLogoSize + leftPad);
    }
  }

  let width = height;
  let maxTextW = 0;
  const MAX_BADGE_WIDTH = 420;
  if (!isMinimal) {
    const textCorrectionFactor = 0.98;
    if (isSingleLine) {
      maxTextW = bottomText ? measureText(bottomText, bottomFont, measure) * textCorrectionFactor : 0;
    } else {
      const topW = topText ? measureText(topText, topFont, measure) * textCorrectionFactor : 0;
      const bottomW = bottomText ? measureText(bottomText, bottomFont, measure) * textCorrectionFactor : 0;
      maxTextW = Math.max(topW, bottomW);
    }
    if (noLogo) {
      width = Math.min(Math.ceil(maxTextW + leftPad * 2 + 4), MAX_BADGE_WIDTH);
    } else if (logoOnRight) {
      let textXLeft;
      if (brandInfo && brandInfo.textX && c.iconMode === 'preset') {
        textXLeft = Math.round(brandInfo.textX * heightScale);
      } else {
        textXLeft = Math.round(leftPad + effectiveLogoSize + leftPad);
      }
      logoBoxStart = Math.round(leftPad + maxTextW + (textXLeft - (logoBoxPad + logoReserve)));
      width = Math.min(Math.ceil(logoBoxStart + logoReserve + logoBoxPad), MAX_BADGE_WIDTH);
    } else {
      width = Math.min(Math.ceil(textX + maxTextW + paddingRight + 4), MAX_BADGE_WIDTH);
    }
  }

  let availableTextWidth;
  if (noLogo) {
    availableTextWidth = width - leftPad * 2 - 4;
  } else if (logoOnRight) {
    availableTextWidth = Math.max(maxTextW, width - textX - logoBoxPad - 4);
  } else {
    availableTextWidth = width - textX - paddingRight - 4;
  }

  const useTextGrad = c.useTextGrad;
  const textGradTop = c.textGradTop;
  const textGradBot = c.textGradBot;
  const useTextStroke = c.useTextStroke;
  const textStrokeColor = c.textStrokeColor;
  const textStrokeWidth = c.textStrokeWidth;
  const subtitleColor = c.subtitleColor;
  const useTextShadow = c.useTextShadow;
  const textShadowColor = c.textShadowColor;
  const textShadowBlur = c.textShadowBlur;

  const useCustomLogoColor = c.useCustomLogoColor;
  const customLogoColor = c.logoColor;
  const useLogoStroke = c.useLogoStroke;
  const logoStrokeColor = c.logoStrokeColor;
  const logoStrokeWidth = c.logoStrokeWidth;
  const useLogoStrokeGrad = c.useLogoStrokeGrad;
  const logoStrokeGradTop = c.logoStrokeGradTop;
  const logoStrokeGradBot = c.logoStrokeGradBot;
  const useLogoShadow = c.useLogoShadow;
  const logoShadowColor = c.logoShadowColor;
  const logoShadowBlur = c.logoShadowBlur;

  const solidStrokeActive = useLogoStroke && !showDisk && !useLogoStrokeGrad;
  const gradStrokeActive = useLogoStroke && !showDisk && useLogoStrokeGrad;

  const bgId = g('bg');
  const textGradId = g('text-grad');
  const logoFxId = g('logo-fx');
  const strokeSilId = g('stroke-sil');
  const strokeGradId = g('stroke-grad');
  const strokeMaskId = g('stroke-mask');
  const textFxId = g('text-fx');

  let svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" fill="none" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="${bgId}" x1="0" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
${bgStops.map((hex, i) => `      <stop offset="${(i / (bgStops.length - 1)).toFixed(3)}" stop-color="${hex}"/>`).join('\n')}
    </linearGradient>
`;

  if (useTextGrad) {
    svgMarkup += `    <linearGradient id="${textGradId}" x1="0" y1="0" x2="0" y2="100%" gradientUnits="userSpaceOnUse">
      <stop stop-color="${textGradTop}"/>
      <stop offset="1" stop-color="${textGradBot}"/>
    </linearGradient>\n`;
  }

  const effectiveTint = useCustomLogoColor && !showDisk;
  const effectiveStroke = solidStrokeActive;
  svgMarkup += buildLogoFxFilter(logoFxId, {
    useTint: effectiveTint,
    tintColor: customLogoColor,
    useStroke: effectiveStroke,
    strokeColor: logoStrokeColor,
    strokeWidth: logoStrokeWidth,
    useShadow: useLogoShadow,
    shadowColor: logoShadowColor,
    shadowBlur: logoShadowBlur
  });

  if (gradStrokeActive) {
    svgMarkup += buildStrokeSilFilter(strokeSilId, logoStrokeWidth);
    svgMarkup += `    <linearGradient id="${strokeGradId}" x1="0" y1="0" x2="0" y2="1">\n      <stop stop-color="${logoStrokeGradTop}"/>\n      <stop offset="1" stop-color="${logoStrokeGradBot}"/>\n    </linearGradient>\n`;
  }

  svgMarkup += buildLogoFxFilter(textFxId, {
    useTint: false,
    useStroke: false,
    useShadow: useTextShadow,
    shadowColor: textShadowColor,
    shadowBlur: textShadowBlur
  });

  svgMarkup += `  </defs>\n\n  <rect width="${width}" height="${height}" fill="url(#${bgId})" rx="${radius}"/>\n  <rect width="${width - 2}" height="${height - 2}" x="1" y="1" stroke="#ffffff" stroke-opacity=".15" stroke-width="2" rx="${Math.max(0, radius - 1)}"/>\n`;

  const useLogoFxFilter = effectiveTint || effectiveStroke || useLogoShadow;
  const logoFilterAttr = useLogoFxFilter ? ` filter="url(#${logoFxId})"` : '';
  const textShadowAttr = useTextShadow ? ` filter="url(#${textFxId})"` : '';

  const gradStrokeLayer = (logoCopy) => gradStrokeActive
    ? buildGradStrokeLayer({ maskId: strokeMaskId, silFilterId: strokeSilId, gradId: strokeGradId, width, height, logoCopy })
    : '';

  const boxRightEdge = width - logoReserve - logoBoxPad;
  const iconX = isMinimal
    ? Math.round((height - effectiveLogoSize) / 2)
    : (logoOnRight ? Math.round(logoBoxStart != null ? Math.min(logoBoxStart, boxRightEdge) : boxRightEdge) : leftPad);

  const iconXFull = isMinimal
    ? height * (0.5 - 32 / 64)
    : (logoOnRight ? Math.round(logoBoxStart != null ? Math.min(logoBoxStart, boxRightEdge) : boxRightEdge) : 0);

  if (showDisk && !noLogo) {
    const diskR = Math.round((diskDiameter * heightScale) / 2);
    const diskCx = isMinimal
      ? Math.round(height / 2)
      : Math.round(iconX + logoReserve / 2);
    const diskCy = Math.round(height / 2);
    svgMarkup += `  <circle cx="${diskCx}" cy="${diskCy}" r="${diskR}" fill="${diskColor}"/>\n`;
  }

  if (!noLogo) {
  if (c.iconMode === 'preset') {
    if (brandInfo.isCustomSvg) {
      let svgContent = brandInfo.svg;
      if (!brandInfo.noTint) {
        svgContent = svgContent.replace(/fill="currentColor"/gi, `fill="${brandInfo.color || '#ffffff'}"`);

        if (showDisk) {
          svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${logoColor}"`);
        } else if (useCustomLogoColor) {
          svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${customLogoColor}"`);
        }
      }

      if (brandInfo.scalable) {
        const bb = brandInfo.scalableBox;
        const s = effectiveLogoSize / (bb ? bb.w : 64);
        const logoBox = Math.round(effectiveLogoSize);
        if (bb) {
          const gx = height / 2 - (bb.x + bb.w / 2) * s;
          const gy = height / 2 - (bb.y + bb.h / 2) * s;
          if (isMinimal) {
            svgMarkup += gradStrokeLayer(`  <g transform="translate(${gx.toFixed(2)}, ${gy.toFixed(2)}) scale(${s.toFixed(6)})">\n    ${svgContent}\n  </g>\n`);
            svgMarkup += `  <g transform="translate(${gx.toFixed(2)}, ${gy.toFixed(2)}) scale(${s.toFixed(6)})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
          } else {
            svgMarkup += gradStrokeLayer(`  <g transform="translate(${(iconX - bb.x * s).toFixed(2)}, ${gy.toFixed(2)}) scale(${s.toFixed(6)})">\n    ${svgContent}\n  </g>\n`);
            svgMarkup += `  <g transform="translate(${(iconX - bb.x * s).toFixed(2)}, ${gy.toFixed(2)}) scale(${s.toFixed(6)})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
          }
        } else if (isMinimal) {
          const off = Math.round((height - logoBox) / 2);
          svgMarkup += gradStrokeLayer(`  <g transform="translate(${off}, ${off}) scale(${s})">\n    ${svgContent}\n  </g>\n`);
          svgMarkup += `  <g transform="translate(${off}, ${off}) scale(${s})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
        } else {
          const off = Math.round((height - logoBox) / 2);
          svgMarkup += gradStrokeLayer(`  <g transform="translate(${iconX}, ${off}) scale(${s})">\n    ${svgContent}\n  </g>\n`);
          svgMarkup += `  <g transform="translate(${iconX}, ${off}) scale(${s})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
        }
      } else if (isMinimal) {
        const minimalScale = height / 64;
        const centerOffsetX = height * (0.5 - 32 / 64);
        svgMarkup += gradStrokeLayer(`  <g transform="translate(${centerOffsetX.toFixed(2)}, 0) scale(${minimalScale})">\n    ${svgContent}\n  </g>\n`);
        svgMarkup += `  <g transform="translate(${centerOffsetX.toFixed(2)}, 0) scale(${minimalScale})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
      } else {
        const yOffset = (height - 64 * heightScale) / 2;
        svgMarkup += gradStrokeLayer(`  <g transform="translate(${iconXFull}, ${yOffset.toFixed(2)}) scale(${heightScale})">\n    ${svgContent}\n  </g>\n`);
        svgMarkup += `  <g transform="translate(${iconXFull}, ${yOffset.toFixed(2)}) scale(${heightScale})"${logoFilterAttr}>\n    ${svgContent}\n  </g>\n`;
      }
    } else {
      const scaleFactor = effectiveLogoSize / 24;
      const iconY = Math.round((height - effectiveLogoSize) / 2);
      const fillColor = showDisk ? logoColor : (useCustomLogoColor ? customLogoColor : brandInfo.color);

      svgMarkup += gradStrokeLayer(`  <g transform="translate(${iconX}, ${iconY}) scale(${scaleFactor})" fill="${fillColor}">\n    <path d="${brandInfo.path}"/>\n  </g>\n`);
      svgMarkup += `  <g transform="translate(${iconX}, ${iconY}) scale(${scaleFactor})" fill="${fillColor}"${logoFilterAttr}>\n    <path d="${brandInfo.path}"/>\n  </g>\n`;
    }
  } else if (c.iconMode === 'upload' && c.imageDataUrl) {
    const imgSize = effectiveLogoSize;
    const imgY = Math.round((height - imgSize) / 2);
    svgMarkup += gradStrokeLayer(`  <image href="${c.imageDataUrl}" xlink:href="${c.imageDataUrl}" x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid fit"/>\n`);
    svgMarkup += `  <image href="${c.imageDataUrl}" xlink:href="${c.imageDataUrl}" x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid fit"${logoFilterAttr}/>\n`;
  } else if (c.iconMode === 'fontawesome' && !noLogo) {
    const imgSize = effectiveLogoSize;
    const imgY = Math.round((height - imgSize) / 2);
    const fillColor = showDisk ? logoColor : (useCustomLogoColor ? customLogoColor : textColor);
    if (faIcon) {
      const faSvg = `<svg x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" viewBox="${faIcon.viewBox}" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg"><path d="${faIcon.pathData}"/></svg>`;
      svgMarkup += gradStrokeLayer(`  ${faSvg}\n`) + `  <g${logoFilterAttr}>${faSvg}</g>\n`;
    } else {
      svgMarkup += `  <text x="${Math.round(iconX + imgSize / 2)}" y="${Math.round(height / 2)}" fill="#ffffff" font-size="${effectiveLogoSize}" font-family="'Dosis', 'Inter', sans-serif" font-weight="600" text-anchor="middle" dominant-baseline="central" dy="-0.05em"${logoFilterAttr}>?</text>\n`;
    }
  } else if (c.iconMode === 'thesvg' && !noLogo) {
    const imgSize = effectiveLogoSize;
    const imgY = Math.round((height - imgSize) / 2);
    const fillColor = showDisk ? logoColor : (useCustomLogoColor ? customLogoColor : textColor);
    if (theSvgIcon) {
      const tsSvg = `<svg x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" viewBox="${theSvgIcon.viewBox}" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg">${theSvgIcon.inner}</svg>`;
      svgMarkup += gradStrokeLayer(`  ${tsSvg}\n`) + `  <g${logoFilterAttr}>${tsSvg}</g>\n`;
    } else {
      svgMarkup += `  <text x="${Math.round(iconX + imgSize / 2)}" y="${Math.round(height / 2)}" fill="#ffffff" font-size="${effectiveLogoSize}" font-family="'Dosis', 'Inter', sans-serif" font-weight="600" text-anchor="middle" dominant-baseline="central" dy="-0.05em"${logoFilterAttr}>?</text>\n`;
    }
  } else if (c.iconMode === 'raw' && c.rawSvgDataUrl) {
    const imgSize = effectiveLogoSize;
    const imgY = Math.round((height - imgSize) / 2);
    svgMarkup += gradStrokeLayer(`  <image href="${c.rawSvgDataUrl}" xlink:href="${c.rawSvgDataUrl}" x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid fit"/>\n`);
    svgMarkup += `  <image href="${c.rawSvgDataUrl}" xlink:href="${c.rawSvgDataUrl}" x="${iconX}" y="${imgY}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid fit"${logoFilterAttr}/>\n`;
  }
  }

  const textFillAttr = useTextGrad ? `fill="url(#${textGradId})"` : `fill="${textColor}"`;
  const textStrokeAttr = useTextStroke ? `stroke="${textStrokeColor}" stroke-width="${textStrokeWidth}" stroke-linejoin="round" paint-order="stroke fill"` : '';

  if (!isMinimal) {
    if (isSingleLine) {
      const compactTextW = bottomText ? measureText(bottomText, bottomFont, measure) * 0.98 : 0;
      const compactAvail = availableTextWidth;
      const compactTextLenAttr = compactTextW > compactAvail
        ? `textLength="${compactAvail}" lengthAdjust="spacingAndGlyphs"`
        : '';
      const compactAnchor = textCentered ? `x="${Math.round(width / 2)}" text-anchor="middle"` : `x="${textX}"`;
      svgMarkup += `  <text ${compactAnchor} y="${height / 2 + 5}" ${textFillAttr} ${textStrokeAttr}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="${noLogo ? 16 : 13}" font-weight="700" ${compactTextLenAttr}>${escapeHtml(bottomText)}</text>\n`;
    } else {
      const topMeasured = topText ? measureText(topText, topFont, measure) * 0.98 : 0;
      const bottomMeasured = bottomText ? measureText(bottomText, bottomFont, measure) * 0.98 : 0;
      if (topText) {
        const topTextLenAttr = topMeasured > availableTextWidth
          ? `textLength="${availableTextWidth}" lengthAdjust="spacingAndGlyphs"`
          : '';
        const topAnchor = textCentered ? `x="${Math.round(width / 2)}" text-anchor="middle"` : `x="${textX}"`;
        svgMarkup += `  <text ${topAnchor} y="${topY}" fill="${subtitleColor}" ${textStrokeAttr}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="${noLogo ? 15 : 13}" font-weight="500" ${topTextLenAttr}>${escapeHtml(topText)}</text>\n`;
      }
      if (bottomText) {
        const bottomTextLenAttr = bottomMeasured > availableTextWidth
          ? `textLength="${availableTextWidth}" lengthAdjust="spacingAndGlyphs"`
          : '';
        const bottomAnchor = textCentered ? `x="${Math.round(width / 2)}" text-anchor="middle"` : `x="${textX}"`;
        svgMarkup += `  <text ${bottomAnchor} y="${bottomY}" ${textFillAttr} ${textStrokeAttr}${textShadowAttr} font-family="Inter, -apple-system, sans-serif" font-size="${noLogo ? 26 : 21}" font-weight="700" ${bottomTextLenAttr}>${escapeHtml(bottomText)}</text>\n`;
      }
    }
  }

  svgMarkup += `</svg>`;

  return svgMarkup;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a badge SVG string. Resolves FontAwesome / theSVG icons over the
 * network when those modes are used; presets / upload / raw are synchronous.
 * @param {object} cfg badge config (see normalizeConfig)
 * @returns {Promise<string>}
 */
export async function generateBadge(cfg) {
  const c = normalizeConfig(cfg);

  let faIcon = null;
  let theSvgIcon = null;

  if (c.iconMode === 'fontawesome') {
    const klass = `${c.faPack} fa-${c.faIconName}`;
    faIcon = await extractFontAwesomeSvg(klass);
  } else if (c.iconMode === 'thesvg') {
    theSvgIcon = await extractTheSvg(c.thesvgSlug, c.thesvgVariant);
  }

  return renderBadgeSvg(c, faIcon, theSvgIcon);
}

let _resvg = undefined;

async function getResvg() {
  if (_resvg !== undefined) return _resvg;
  try {
    const mod = await import('@resvg/resvg-js');
    _resvg = mod.Resvg ? mod : null;
  } catch {
    _resvg = null;
  }
  return _resvg;
}

/**
 * Rasterize an SVG string to a PNG Buffer.
 * @param {string} svg SVG markup
 * @param {object} [opts]
 * @param {number} [opts.scale=3] output scale multiplier
 * @param {object} [opts.resvg] raw options passed to `new Resvg(svg, opts.resvg)`
 * @returns {Promise<Buffer>}
 */
export async function svgToPng(svg, opts) {
  const options = opts || {};
  const scale = options.scale || 3;
  const resvgMod = await getResvg();
  if (!resvgMod) {
    throw new Error(
      'PNG export requires the "@resvg/resvg-js" package. Install it, or use generateBadge() for SVG output.'
    );
  }
  const resvgOpts = Object.assign(
    {
      fitTo: { mode: 'zoom', value: scale },
      font: { fontFiles: interFontPaths(), loadSystemFonts: false, defaultFontFamily: 'Inter' }
    },
    options.resvg || {}
  );
  // Merge any caller-supplied font options without silently dropping ours.
  if (options.resvg && options.resvg.font && Array.isArray(options.resvg.font.fontFiles)) {
    resvgOpts.font = {
      ...resvgOpts.font,
      ...options.resvg.font,
      fontFiles: options.resvg.font.fontFiles.length
        ? options.resvg.font.fontFiles
        : resvgOpts.font.fontFiles
    };
  }
  const resvg = new resvgMod.Resvg(svg, resvgOpts);
  return resvg.render().asPng();
}

/**
 * Build a badge and rasterize it to PNG.
 * @param {object} cfg badge config
 * @param {object} [opts] see svgToPng
 * @returns {Promise<Buffer>}
 */
export async function generateBadgePng(cfg, opts) {
  const svg = await generateBadge(cfg);
  return svgToPng(svg, opts);
}

export { OFFICIAL_BRAND_ICONS, BG_GRADIENT_PRESETS, BG_GRADIENT_MAX_STOPS };