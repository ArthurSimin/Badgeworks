const OFFICIAL_ASSETS = 'assets/devins-badges/';
const OFFICIAL_CATEGORIES = {
  available: 'Available',
  'built-with': 'Built with',
  documentation: 'Documentation',
  donate: 'Donate',
  requires: 'Requires',
  social: 'Social',
  supported: 'Supported',
  unsupported: 'Unsupported',
  translate: 'Translate'
};
const officialSvgCache = new Map();
const officialMarkupCache = new Map();
const officialPackCache = new Map();
const officialPackDecoders = new Map();

function registerOfficialBadgePack(style, packed) {
  const bytes = Uint8Array.from(atob(packed), char => char.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  officialPackDecoders.set(style, new Response(stream).json());
}

function loadOfficialBadgePack(style) {
  if (!officialPackCache.has(style)) {
    const request = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${OFFICIAL_ASSETS}${style}.js`;
      script.onload = () => {
        script.remove();
        const decoder = officialPackDecoders.get(style);
        officialPackDecoders.delete(style);
        if (decoder) resolve(decoder);
        else reject(new Error('Missing SVG pack'));
      };
      script.onerror = () => {
        script.remove();
        reject(new Error('Could not open local SVG pack'));
      };
      document.head.append(script);
    }).catch(error => {
      officialPackCache.delete(style);
      throw error;
    });
    officialPackCache.set(style, request);
  }
  return officialPackCache.get(style);
}

function loadOfficialSvg(id, style) {
  const path = DEVINS_BADGES[id].paths[style];
  if (!officialSvgCache.has(path)) {
    const request = (location.protocol === 'file:'
      ? loadOfficialBadgePack(style).then(pack => pack[id])
      : fetch(OFFICIAL_ASSETS + path).then(response => {
        if (!response.ok) throw new Error(`Could not load ${path}`);
        return response.text();
      })
    ).then(markup => {
      officialMarkupCache.set(path, markup);
      return markup;
    }).catch(error => {
      officialSvgCache.delete(path);
      throw error;
    });
    officialSvgCache.set(path, request);
  }
  return officialSvgCache.get(path);
}

const DEFAULT_PRESET_ICON = 'available/github';
const LEGACY_ICON_KEYS = {
  github: DEFAULT_PRESET_ICON, discord: 'social/discord-plural', python: 'built-with/python',
  react: 'built-with/react', npm: 'available/npm', pypi: 'available/pypi',
  deno: 'available/deno', git: 'available/git', gitlab: 'available/gitlab',
  steam: 'available/steam', spotify: 'available/spotify',
  youtube: 'social/youtube-plural', twitter: 'social/twitter-plural'
};

function migratePresetIcon(key) {
  return Object.hasOwn(LEGACY_ICON_KEYS, key) ? LEGACY_ICON_KEYS[key] : key;
}

function setupPresetIcons() {
  const select = document.getElementById('preset-select');
  const groups = new Map();
  for (const [category, label] of Object.entries(OFFICIAL_CATEGORIES)) {
    const group = document.createElement('optgroup');
    group.label = label;
    groups.set(category, group);
  }
  for (const [id, badge] of Object.entries(DEVINS_BADGES)) {
    groups.get(id.split('/')[0]).append(new Option(badge.name, id));
  }
  select.prepend(...groups.values());
  select.value = DEFAULT_PRESET_ICON;
}

function syncBadgeView() {
  const id = state.officialBadge;
  const entry = DEVINS_BADGES[id];
  document.getElementById('studio').classList.toggle('viewing-original', Boolean(entry));
  document.getElementById('original-actions').hidden = !entry;
  document.getElementById('preview-title').textContent = entry?.name || 'Live preview';
  document.getElementById('preview-mode').textContent = entry
    ? `Devin’s Badges / ${OFFICIAL_CATEGORIES[id.split('/')[0]]}`
    : state.customizedBadge ? 'Customizing a Devin’s preset' : 'Badge editor';
  const results = document.getElementById('preset-results');
  const previous = results.querySelector('[aria-pressed="true"]');
  if (previous) previous.setAttribute('aria-pressed', 'false');
  const selected = results.querySelector(`[data-badge-id="${id}"]`);
  if (selected) selected.setAttribute('aria-pressed', 'true');
}

function setupOfficialPresets() {
  const dropdown = document.getElementById('preset-menu');
  const search = document.getElementById('preset-search');
  const category = document.getElementById('preset-category');
  const results = document.getElementById('preset-results');
  const status = document.getElementById('preset-count');
  const trigger = dropdown.querySelector('summary');
  const entries = Object.entries(DEVINS_BADGES);

  for (const [id, label] of Object.entries(OFFICIAL_CATEGORIES)) {
    category.add(new Option(label, id));
  }

  function showMatches() {
    const terms = search.value.toLowerCase().match(/[\w]+/g) || [];
    const groups = new Map();
    let count = 0;
    for (const [id, entry] of entries) {
      const section = id.split('/')[0];
      const matchText = `${entry.name} ${id} ${OFFICIAL_CATEGORIES[section]}`.toLowerCase();
      if ((category.value && section !== category.value) || !terms.every(term => matchText.includes(term))) continue;
      if (!groups.has(section)) {
        const group = document.createElement('section');
        const heading = document.createElement('h3');
        heading.textContent = OFFICIAL_CATEGORIES[section];
        group.append(heading);
        groups.set(section, group);
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'preset-result';
      button.dataset.badgeId = id;
      button.setAttribute('aria-pressed', String(state.officialBadge === id));
      const icon = new Image(30, 30);
      icon.alt = '';
      icon.loading = 'lazy';
      icon.src = OFFICIAL_ASSETS + entry.paths['cozy-minimal'];
      const label = document.createElement('span');
      label.textContent = entry.name;
      button.append(icon, label);
      groups.get(section).append(button);
      count++;
    }
    results.replaceChildren(...groups.values());
    results.scrollTop = 0;
    status.textContent = count ? `${count} ${count === 1 ? 'badge' : 'badges'}` : 'No badges match your search.';
  }

  search.addEventListener('input', showMatches);
  category.addEventListener('change', showMatches);
  dropdown.addEventListener('toggle', () => {
    if (!dropdown.open) return;
    showMatches();
    search.focus();
  });
  dropdown.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      dropdown.open = false;
      trigger.focus();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const buttons = Array.from(results.querySelectorAll('button'));
      const current = buttons.indexOf(document.activeElement);
      const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
      const button = buttons.at(next < 0 ? -1 : next);
      if (button && (current >= 0 || event.target === search)) {
        event.preventDefault();
        button.focus();
      }
    } else if (event.key === 'Enter' && event.target === search) {
      results.querySelector('button')?.click();
    }
  });
  document.addEventListener('pointerdown', event => {
    if (dropdown.open && !dropdown.contains(event.target)) dropdown.open = false;
  });
  results.addEventListener('click', event => {
    const button = event.target.closest('[data-badge-id]');
    if (!button) return;
    state.officialBadge = button.dataset.badgeId;
    dropdown.open = false;
    trigger.focus();
    renderBadge();
  });
}

function leaveOfficialBadge() {
  state.officialBadge = '';
  renderBadge();
}

const OFFICIAL_EDIT_FIELDS = [
  'topText', 'bottomText', 'textColor', 'subtitleColor', 'radius', 'paddingRight', 'bgStops',
  'rawSvgDataUrl', 'iconMode', 'presetKey', 'logoPosition', 'userLogoScale', 'showDisk',
  'textAlignment', 'logoGap', 'borderMode', 'borderColor', 'borderWidth', 'borderOpacity',
  'useCustomLogoColor', 'useLogoGrad', 'logoColor', 'useLogoStroke', 'useLogoStrokeGrad', 'useLogoShadow', 'useTextGrad', 'useSubtitleGrad', 'useTextStroke', 'useTextShadow'
];
const ORIGINAL_LAYER_EDITS = ['topText', 'bottomText', 'textColor', 'subtitleColor', 'radius', 'paddingRight', 'bgStops', 'useTextGrad', 'useSubtitleGrad', 'useCustomLogoColor', 'useLogoGrad', 'logoColor', 'borderMode', 'borderColor', 'borderWidth', 'borderOpacity'];

function officialLayers(svg) {
  const layers = svg.firstElementChild.hasAttribute('clip-path') ? svg.firstElementChild : svg;
  const [logo, lettering] = Array.from(layers.children).filter(node => node.localName === 'g');
  const background = layers.querySelector(':scope > rect[fill]');
  const border = svg.querySelector(':scope > rect[stroke]');
  const gradientId = /^url\(#([^)]*)\)$/.exec(background.getAttribute('fill'))?.[1];
  const gradient = gradientId ? svg.getElementById(gradientId) : null;
  const clipId = /^url\(#([^)]*)\)$/.exec(layers.getAttribute('clip-path') || '')?.[1];
  const clip = clipId ? svg.getElementById(clipId)?.querySelector('rect') : null;
  return { logo, lettering, background, border, gradient, clip };
}

function normalizeOfficialColor(color) {
  if (/^#[a-f\d]{3}$/i.test(color)) return '#' + color.slice(1).replace(/./g, digit => digit.repeat(2));
  return isHexColor(color) ? color : '';
}

function getOfficialGeometry(svg, { logo, lettering }) {
  const host = document.createElement('div');
  host.className = 'badge-geometry';
  host.setAttribute('aria-hidden', 'true');
  host.append(svg);
  document.body.append(host);
  let geometry;
  try {
    geometry = {
      logo: logo.getBBox(),
      text: lettering?.getBBox(),
      lines: lettering ? Array.from(lettering.children, node => node.getBBox()) : []
    };
  } finally {
    host.remove();
  }
  return geometry;
}

const officialLogoCache = new Map();

function loadOfficialLogo(id, style) {
  const key = DEVINS_BADGES[id].paths[style];
  if (!officialLogoCache.has(key)) {
    const request = loadOfficialSvg(id, style).then(markup => {
      const svg = parseSvg(markup);
      const layers = officialLayers(svg);
      const box = getOfficialGeometry(svg, layers).logo;
      layers.background.remove();
      layers.border.remove();
      layers.lettering?.remove();
      pruneLogoDefinitions(svg);
      // Keep the source shadow and strokes while isolating the logo.
      const bleed = 10;
      const viewport = { x: box.x - bleed, y: box.y - bleed, width: box.width + bleed * 2, height: box.height + bleed * 2 };
      svg.setAttribute('viewBox', Object.values(viewport).join(' '));
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      return { source: svgDataUrl(new XMLSerializer().serializeToString(svg)), viewport, bounds: box };
    }).catch(error => {
      officialLogoCache.delete(key);
      throw error;
    });
    officialLogoCache.set(key, request);
  }
  return officialLogoCache.get(key);
}

function pruneLogoDefinitions(svg) {
  const defs = svg.querySelector(':scope > defs');
  const definitions = Array.from(defs.children);
  const byId = new Map(definitions.map(node => [node.id, node]));
  const referenced = new Set();
  function visit(node) {
    for (const attribute of node.attributes) {
      const ids = Array.from(attribute.value.matchAll(/url\(#([^)]*)\)/g), match => match[1]);
      if (attribute.localName === 'href' && attribute.value.startsWith('#')) ids.push(attribute.value.slice(1));
      for (const id of ids) {
        if (referenced.has(id)) continue;
        referenced.add(id);
        if (byId.has(id)) visit(byId.get(id));
      }
    }
    for (const child of node.children) visit(child);
  }
  for (const element of svg.children) {
    if (element !== defs) visit(element);
  }
  for (const definition of definitions) {
    if (definition.id && !referenced.has(definition.id)) definition.remove();
  }
  if (!defs.children.length) defs.remove();
}

function badgeStartingCopy(id) {
  const [category, slug] = id.split('/');
  const name = DEVINS_BADGES[id].name.replace(/ \((?:Singular|Plural)\)$/i, '');
  const prefix = {
    available: 'Available on', 'built-with': 'Built with', documentation: 'Read the docs',
    donate: 'Donate on', requires: 'Requires', social: 'Find us on',
    supported: 'Supports', unsupported: 'Does not support', translate: 'Translate on'
  };
  if (slug.startsWith('youtube-')) return [slug.endsWith('-singular') ? 'Watch me on' : 'Watch us on', 'YouTube'];
  return [prefix[category], name];
}

async function customizeOfficialBadge() {
  const id = state.officialBadge;
  if (!id) return;
  const button = document.getElementById('customize-original');
  button.disabled = true;
  try {
    const cozy = await loadOfficialSvg(id, 'cozy');
    if (state.officialBadge !== id) return;
    const source = parseSvg(cozy);
    const { lettering, gradient, background } = officialLayers(source);
    const colors = (gradient
      ? Array.from(gradient.querySelectorAll('stop'), stop => stop.getAttribute('stop-color'))
      : [background.getAttribute('fill'), background.getAttribute('fill')])
      .map(normalizeOfficialColor).filter(Boolean);
    const [topText, bottomText] = badgeStartingCopy(id);
    applyBadgeConfig({
      officialBadge: '',
      topText, bottomText,
      iconMode: 'preset',
      presetKey: id,
      logoPosition: 'left',
      bgStops: colors.length >= 2 ? colors : ['#181f29', '#0f131a'],
      bgGradPreset: 'custom',
      radius: Math.round(Number(background.getAttribute('rx'))) || 8,
      paddingRight: 12,
      textAlignment: 'template', logoGap: '', borderMode: 'template',
      userLogoScale: DEFAULT_LOGO_SIZE,
      showDisk: false,
      textColor: normalizeOfficialColor(lettering?.lastElementChild?.getAttribute('fill')) || '#ffffff',
      subtitleColor: normalizeOfficialColor(lettering?.firstElementChild?.getAttribute('fill')) || '#e8e8e8',
      useCustomLogoColor: false, useLogoGrad: false, useLogoStroke: false, useLogoShadow: false,
      useLogoStrokeGrad: false, useTextGrad: false, useSubtitleGrad: false, useTextStroke: false, useTextShadow: false
    }, false);
    const config = getBadgeConfig();
    state.customizedBadge = id;
    state.customizedBaseline = Object.fromEntries(OFFICIAL_EDIT_FIELDS.map(key => [key, config[key]]));
    renderBadge();
    const target = state.style.endsWith('-minimal') ? document.querySelector('.style-option.active')
      : document.getElementById('bottom-text');
    target.focus({ preventScroll: true });
  } catch {
    showToast('Could not open this badge in the editor.', 'error');
  } finally {
    button.disabled = false;
  }
}

function prepareOfficialBadge(style) {
  const id = state.officialBadge || state.customizedBadge;
  if (!id) return null;
  const path = DEVINS_BADGES[id].paths[style];
  const config = state.officialBadge ? null : getBadgeConfig();
  const baseline = state.customizedBaseline;
  const changes = config ? OFFICIAL_EDIT_FIELDS.filter(key => {
    if (key === 'textAlignment' && !baseline[key]) return config[key] !== 'template';
    if (key === 'logoGap' && baseline[key] === undefined) return config[key] !== '';
    if (key === 'borderMode' && !baseline[key]) return config[key] !== 'template';
    if (['borderColor', 'borderWidth', 'borderOpacity'].includes(key) && config.borderMode === 'template') return false;
    if (key === 'bgStops') return config.bgStops.join() !== baseline.bgStops.join();
    if (key === 'presetKey' && config.iconMode !== 'preset') return false;
    if (key === 'rawSvgDataUrl' && config.iconMode !== 'raw') return false;
    if (key === 'logoColor' && (!config.useCustomLogoColor || config.useLogoGrad)) return false;
    if (key === 'useLogoGrad' && !config.useCustomLogoColor) return false;
    if (['useSubtitleGrad', 'useLogoGrad', 'useLogoStrokeGrad'].includes(key)) return config[key] !== Boolean(baseline[key]);
    return config[key] !== baseline[key];
  }) : [];
  if (changes.some(key => !ORIGINAL_LAYER_EDITS.includes(key))) return null;

  const prepare = markup => changes.length ? editOfficialLayers(markup, config, changes, style) : markup;
  if (officialMarkupCache.has(path)) return { preview: prepare(officialMarkupCache.get(path)), image: true };
  return {
    pending: loadOfficialSvg(id, style).then(markup => ({ svg: prepare(markup) })),
    image: true
  };
}

// Keep the official artwork intact when editing a label, color, or background.
function editOfficialLayers(markup, config, changes, style) {
  const svg = parseSvg(markup);
  const layers = officialLayers(svg);
  const { background, border, lettering, gradient, clip } = layers;
  const changed = key => changes.includes(key);
  if (changed('bgStops')) {
    const paint = gradient || document.createElementNS(svg.namespaceURI, 'linearGradient');
    if (!gradient) {
      paint.id = 'badge-edit-background';
      paint.setAttribute('x2', '0');
      paint.setAttribute('y2', '1');
      svg.querySelector('defs').append(paint);
      background.setAttribute('fill', `url(#${paint.id})`);
    }
    paint.replaceChildren(...config.bgStops.map((color, index) => {
      const stop = document.createElementNS(svg.namespaceURI, 'stop');
      stop.setAttribute('offset', String(index / (config.bgStops.length - 1)));
      stop.setAttribute('stop-color', color);
      return stop;
    }));
  }
  if (changed('radius')) {
    background.setAttribute('rx', config.radius);
    border.setAttribute('rx', Math.max(0, config.radius - Number(border.getAttribute('x'))));
    clip?.setAttribute('rx', config.radius);
  }
  if (lettering && changes.some(key => !['bgStops', 'radius'].includes(key))) {
    editOfficialLettering(svg, layers, config, changed, style);
  }
  if (config.useCustomLogoColor) {
    const { logo } = layers;
    const { logo: bounds } = getOfficialGeometry(svg, layers);
    const { width, height } = getSvgDimensions(markup);
    const artwork = new XMLSerializer().serializeToString(logo);
    const gradient = config.useLogoGrad ? config.textGradients.logo : null;
    const paint = buildLogoPaint(artwork, 'badge-edit-logo-fill', bounds,
      Number(svg.getAttribute('width')) || width, height, gradient, config.logoColor);
    const replacement = parseSvg(`<svg xmlns="${svg.namespaceURI}">${paint}</svg>`);
    const group = svg.ownerDocument.createElementNS(svg.namespaceURI, 'g');
    group.append(...replacement.children);
    logo.replaceWith(group);
  }
  if (config.borderMode !== 'template') {
    const width = Number(svg.getAttribute('width'));
    const height = Number(svg.getAttribute('height'));
    const paint = renderBadgeBorder(style, width, height, Number(background.getAttribute('rx')), config);
    if (paint.definitions) {
      const definitions = parseSvg(`<svg xmlns="${svg.namespaceURI}">${paint.definitions}</svg>`);
      svg.querySelector('defs').append(...definitions.children);
    }
    const replacement = parseSvg(`<svg xmlns="${svg.namespaceURI}">${paint.markup}</svg>`);
    border.replaceWith(...replacement.children);
  }
  return new XMLSerializer().serializeToString(svg);
}


function editOfficialLettering(svg, layers, config, changed, style) {
  const { background, border, lettering, clip } = layers;
  const { text, lines } = getOfficialGeometry(svg, layers);
  const { height, inline, subtitleY, titleY, subtitleSize } = BADGE_LAYOUTS[style];
  const width = Number(svg.getAttribute('width'));
  const editsText = changed('topText') || changed('bottomText');
  const separate = lines.length > 1 && lines.slice(1).every(box => inline
    ? box.x >= lines[0].x + lines[0].width - 1
    : box.y > lines[0].y + 5);
  const rebuild = !separate && editsText;
  const mergedPaint = !separate && !editsText;
  if (mergedPaint) {
    paintMergedLettering(svg, lettering, text, config, changed, style);
    if (!changed('paddingRight')) return;
  }
  const originalLabels = mergedPaint ? [] : Array.from(lettering.children);
  const ns = svg.namespaceURI;
  const defs = svg.querySelector('defs');
  const padding = changed('paddingRight') ? config.paddingRight : Math.max(4, width - text.x - text.width);
  let fontUsed = false;
  let furthest = text.x;

  const label = ({ nodes, box, left, baseline, size, weight, value, key, colorKey, part, gradient }) => {
    const color = changed(colorKey) ? config[colorKey]
      : nodes.at(-1)?.getAttribute('fill') || config[colorKey];
    let paint = color;
    let art = nodes;
    let bounds = { x: left, y: box.y, width: box.width, height: box.height };

    if (changed(key) || rebuild) {
      nodes.forEach(node => node.remove());
      if (!value) return left;
      const element = document.createElementNS(ns, 'text');
      element.setAttribute('x', svgNumber(left));
      element.setAttribute('y', baseline);
      element.setAttribute('font-family', `${BADGE_FONT}, sans-serif`);
      element.setAttribute('font-weight', weight);
      element.setAttribute('font-size', size);
      element.textContent = value;
      lettering.append(element);
      fontUsed = true;
      art = [element];

      const measured = measureText(value, badgeFontSpec(weight, size));
      const available = Math.max(1, MAX_BADGE_WIDTH - left - padding);
      if (measured > available) {
        element.setAttribute('textLength', svgNumber(available));
        element.setAttribute('lengthAdjust', 'spacingAndGlyphs');
      }
      bounds = badgeTextBounds(value, left, baseline, size, weight, Math.min(measured, available));
    } else if (left !== box.x && nodes.length) {
      const position = document.createElementNS(ns, 'g');
      position.setAttribute('transform', `translate(${svgNumber(left - box.x)} 0)`);
      nodes[0].before(position);
      position.append(...nodes);
    }
    if (gradient) {
      const id = `badge-edit-${part}-gradient`;
      const paintBounds = !changed(key) && !rebuild ? box : bounds;
      const markup = buildTextGradient(id, gradient, paintBounds);
      const definition = parseSvg(`<svg xmlns="${ns}">${markup}</svg>`).firstElementChild;
      defs.append(definition);
      paint = `url(#${id})`;
    }
    if (gradient || changed(key) || changed(colorKey) || rebuild) {
      art.forEach(node => node.setAttribute('fill', paint));
    }
    const end = bounds.x + bounds.width;
    furthest = Math.max(furthest, end);
    return end;
  };

  const subtitleBox = separate ? lines[0] : { x: text.x, y: subtitleY, width: 0, height: 0 };
  const subtitleEnd = label({
    nodes: separate ? originalLabels.slice(0, 1) : [], box: subtitleBox, left: subtitleBox.x,
    baseline: subtitleY, size: subtitleSize, weight: BADGE_SUBTITLE_WEIGHT, value: config.topText,
    key: 'topText', colorKey: 'subtitleColor', part: 'subtitle',
    gradient: config.useSubtitleGrad ? config.textGradients.subtitle : null
  });
  const titleBoxes = separate ? lines.slice(1) : [text];
  const box = titleBoxes.reduce((first, second) => {
    const x = Math.min(first.x, second.x);
    const y = Math.min(first.y, second.y);
    return {
      x, y, width: Math.max(first.x + first.width, second.x + second.width) - x,
      height: Math.max(first.y + first.height, second.y + second.height) - y
    };
  });
  const titleLeft = inline && (changed('topText') || rebuild)
    ? Math.min(MAX_BADGE_WIDTH - padding - 1, subtitleEnd + (config.topText ? COMPACT_LABEL_GAP : 0))
    : box.x;
  label({
    nodes: separate ? originalLabels.slice(1) : originalLabels, box, left: titleLeft,
    baseline: titleY, size: BADGE_TITLE_SIZE, weight: BADGE_TITLE_WEIGHT, value: config.bottomText,
    key: 'bottomText', colorKey: 'textColor', part: 'title',
    gradient: config.useTextGrad ? config.textGradients.title : null
  });
  if (fontUsed) {
    const font = document.createElementNS(ns, 'style');
    font.textContent = BADGE_FONT_FACE;
    defs.append(font);
  }

  const nextWidth = editsText || rebuild || changed('paddingRight')
    ? Math.max(height, Math.min(MAX_BADGE_WIDTH, Math.round(furthest + padding))) : width;
  if (nextWidth === width) return;
  const delta = nextWidth - width;
  for (const node of [background, border, clip].filter(Boolean)) {
    node.setAttribute('width', svgNumber(Number(node.getAttribute('width')) + delta));
  }
  const filterId = /^url\(#([^)]*)\)$/.exec(lettering.getAttribute('filter') || '')?.[1];
  const filter = filterId ? svg.getElementById(filterId) : null;
  if (filter?.getAttribute('filterUnits') === 'userSpaceOnUse') {
    filter.setAttribute('width', svgNumber(Number(filter.getAttribute('width')) + delta));
  }
  svg.setAttribute('width', nextWidth);
  svg.setAttribute('viewBox', `0 0 ${nextWidth} ${height}`);
}


// Some official files use one path for both labels. Clip the paint to each
// label's region so applying colors or gradients keeps those original outlines.
function paintMergedLettering(svg, lettering, box, config, changed, style) {
  const layout = BADGE_LAYOUTS[style];
  const cut = layout.inline
    ? Math.min(box.x + box.width, box.x + Math.ceil(measureText(config.topText,
      badgeFontSpec(BADGE_SUBTITLE_WEIGHT, layout.subtitleSize))) + COMPACT_LABEL_GAP / 2)
    : layout.subtitleY + 3;
  const original = Array.from(lettering.children);
  const namespace = svg.namespaceURI;
  const definitions = svg.querySelector('defs');
  const full = { x: 0, y: 0, width: Number(svg.getAttribute('width')), height: layout.height };
  const parts = [
    { name: 'subtitle', color: 'subtitleColor', gradient: config.useSubtitleGrad && config.textGradients.subtitle },
    { name: 'title', color: 'textColor', gradient: config.useTextGrad && config.textGradients.title }
  ];
  lettering.replaceChildren();
  for (const [index, part] of parts.entries()) {
    const clip = layout.inline
      ? { ...full, x: index ? cut : 0, width: index ? full.width - cut : cut }
      : { ...full, y: index ? cut : 0, height: index ? full.height - cut : cut };
    const group = document.createElementNS(namespace, 'g');
    const clipId = `badge-edit-${part.name}-clip`;
    const clipPath = document.createElementNS(namespace, 'clipPath');
    clipPath.id = clipId;
    const rect = document.createElementNS(namespace, 'rect');
    for (const [key, value] of Object.entries(clip)) rect.setAttribute(key, svgNumber(value));
    clipPath.append(rect);
    definitions.append(clipPath);
    group.setAttribute('clip-path', `url(#${clipId})`);
    let fill = changed(part.color) ? config[part.color] : '';
    if (part.gradient) {
      const id = `badge-edit-${part.name}-gradient`;
      const bounds = {
        x: Math.max(box.x, clip.x), y: Math.max(box.y, clip.y),
        width: Math.max(0, Math.min(box.x + box.width, clip.x + clip.width) - Math.max(box.x, clip.x)),
        height: Math.max(0, Math.min(box.y + box.height, clip.y + clip.height) - Math.max(box.y, clip.y))
      };
      const gradient = parseSvg(`<svg xmlns="${namespace}">${buildTextGradient(id, part.gradient, bounds)}</svg>`);
      definitions.append(gradient.firstElementChild);
      fill = `url(#${id})`;
    }
    for (const node of original) {
      const copy = node.cloneNode(true);
      if (fill) copy.setAttribute('fill', fill);
      group.append(copy);
    }
    lettering.append(group);
  }
}
