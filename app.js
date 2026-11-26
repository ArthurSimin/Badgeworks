/* ==========================================================================
   BADGEWORKS - APPLICATION LOGIC
   ========================================================================== */

// Application State
const BADGE_STYLES = ['cozy', 'compact', 'cozy-minimal', 'compact-minimal'];
// Measurements from the upstream Devin's Badges design template.
const BADGE_LAYOUTS = {
  cozy: { height: 56, logo: 40, left: 12, gap: 8, right: 12, border: 2.1, radius: 8, subtitleY: 24.5, titleY: 43.5, subtitleSize: 16 },
  compact: { height: 40, logo: 28, left: 8, gap: 6, right: 8, border: 2.143, radius: 8, subtitleY: 26.5, titleY: 26.5, subtitleSize: 17, inline: true },
  'cozy-minimal': { height: 56, logo: 40, left: 8, border: 2.1, radius: 8.4, minimal: true },
  'compact-minimal': { height: 40, logo: 28, left: 6, border: 2.1, radius: 8, minimal: true }
};
const BADGE_FONT = 'Badgeworks Inter';
const BADGE_FONT_FACE = `@font-face{font-family:"${BADGE_FONT}";src:url(${BADGE_FONT_URL}) format("woff2");font-weight:500 800;}`;
const BADGE_FONT_STYLE = `<style>${BADGE_FONT_FACE}</style>`;
const BADGE_TITLE_SIZE = 17;
const BADGE_TITLE_WEIGHT = 800;
const BADGE_SUBTITLE_WEIGHT = 500;
const DEFAULT_LOGO_SIZE = 40;
const COMPACT_LABEL_GAP = 4;
const MAX_BADGE_WIDTH = 420;

const GRADIENT_CONTROLS = {
  title: { label: 'Title', toggle: 'text-grad-toggle', solid: 'text-color' },
  subtitle: { label: 'Subtitle', toggle: 'subtitle-grad-toggle', solid: 'subtitle-color' },
  logo: { label: 'Logo', toggle: 'logo-grad-toggle', solid: 'logo-color', parent: 'custom-logo-color-toggle' },
  outline: { label: 'Outline', toggle: 'logo-stroke-grad-toggle', parent: 'logo-stroke-toggle' },
  border: { label: 'Border' }
};

function defaultTextGradient(color = '#61dafb') {
  return { angle: 180, stops: [{ color, offset: 0 }, { color: '#ffffff', offset: 100 }] };
}

const state = {
  officialBadge: '',
  customizedBadge: '',
  customizedBaseline: null,
  style: 'cozy', // 'cozy' | 'compact' | 'cozy-minimal' | 'compact-minimal'
  iconMode: 'fontawesome', // 'preset' | 'fontawesome' | 'thesvg' | 'upload' | 'raw'
  logoPosition: 'left', // 'left' | 'right' | 'none'
  uploadedDataUrl: '', // base64 DataURL for PNG/JPG/SVG
  rawSvgDataUrl: '', // data URL built from pasted raw SVG code
  uploadFilename: '',
  bgStops: ['#0d6ffb', '#0157ff'], // background gradient stops (2–7)
  textGradients: { title: defaultTextGradient(), subtitle: defaultTextGradient('#e8e8e8'),
    logo: defaultTextGradient(), outline: { angle: 180, stops: [{ color: '#ffffff', offset: 0 }, { color: '#61dafb', offset: 100 }] }, border: defaultTextGradient() },
  bgGradPreset: 'custom', // name of the currently-applied gradient preset ('custom' = manual)
  codeTab: 'md' // 'md' | 'html' | 'svg'
};

// Icons with no equivalent in the official badge collection.
const EXTRA_PRESET_ICONS = {
  vscode: {
    path: "M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z",
    color: "#007ACC"
  },
  docker: {
    path: "M6.94221099,14.9002344 C6.9980621,14.9002344 7.05128211,14.9107588 7.10043586,14.9297745 C7.04721586,14.9606302 7.01109801,15.018335 7.01109801,15.0842919 C7.01109801,15.1828984 7.09098782,15.2626686 7.18959432,15.2626686 C7.25710599,15.2626686 7.31570779,15.2251754 7.34608506,15.1698027 C7.36743286,15.2214082 7.37939241,15.2780367 7.37939241,15.3374756 C7.37939241,15.578939 7.18361455,15.774657 6.94221099,15.774657 C6.70080744,15.774657 6.50496978,15.578939 6.50496978,15.3374756 C6.50496978,15.0959525 6.70080744,14.9002344 6.94221099,14.9002344 L6.94221099,14.9002344 Z M6.94221099,16.0853662 C6.52978585,16.0853662 6.19420083,15.7499008 6.19420083,15.3374756 C6.19420083,14.9250505 6.52978585,14.5895253 6.94221099,14.5895253 C7.35457634,14.5895253 7.69010156,14.9250505 7.69010156,15.3374756 C7.69010156,15.7499008 7.35457634,16.0853662 6.94221099,16.0853662 L6.94221099,16.0853662 Z M20.3859431,11.1838037 C18.2619865,16.8117894 13.4653093,19.318631 7.81023526,19.318631 C5.13823222,19.318631 3.00656172,18.3995992 1.64323262,16.8672219 L1.65327865,16.8605843 C2.04609012,16.880497 2.39758135,16.8872541 2.75439457,16.8872541 C3.08065114,16.8872541 3.39979178,16.8838457 3.6953721,16.8672219 C3.72108514,16.8657867 3.75325633,16.8621989 3.77878997,16.8605843 C3.77902916,16.8605245 3.86998155,16.8546046 3.82549202,16.853887 C4.57667146,16.8075437 5.15892224,16.7031368 5.70188589,16.5482008 C5.70200548,16.548141 5.70212508,16.548141 5.70224467,16.5480812 C5.80091098,16.5198567 5.89658739,16.4901372 5.98825735,16.4583846 C6.09081051,16.4228049 6.14510687,16.3108635 6.109587,16.2083104 C6.07406714,16.1056974 5.96218553,16.0512815 5.85957258,16.0869807 C5.16992503,16.3259326 4.26010213,16.4574876 3.14505333,16.4821841 L3.14475434,16.4821841 C2.57739321,16.4947416 1.95717085,16.4797922 1.28450587,16.4365584 L1.28444607,16.4365584 C1.14529669,16.2507668 1.01649231,16.0576798 0.89869073,15.8577161 L0.71248051,15.5172277 C0.149903198,14.4112083 -0.0964037696,13.1191582 0.0343141305,11.7160038 L16.3965356,11.7160038 C17.7407294,11.7160038 19.0534696,11.2143604 19.6764427,10.6609919 C18.5601381,9.75332174 18.670764,7.59731356 19.3822377,6.774616 C19.9997093,7.270758 20.9954018,8.31584342 20.824141,9.64622396 C21.6011531,9.255625 22.9506091,9.06259783 24,9.66816973 C23.3411483,10.9541803 21.8929064,11.3383809 20.3859431,11.1838037 L20.3859431,11.1838037 Z M2.25508329,11.3188869 L4.46771995,11.3188869 L4.46771995,9.1061306 L2.25508329,9.1061306 L2.25508329,11.3188869 Z M4.80808879,11.3188869 L7.02096464,11.3188869 L7.02096464,9.1061306 L4.80808879,9.1061306 L4.80808879,11.3188869 Z M4.80808879,8.76576176 L7.02096464,8.76576176 L7.02096464,6.5530653 L4.80808879,6.5530653 L4.80808879,8.76576176 Z M7.36127369,11.3188869 L9.57402994,11.3188869 L9.57402994,9.1061306 L7.36127369,9.1061306 L7.36127369,11.3188869 Z M7.36127369,8.76576176 L9.57402994,8.76576176 L9.57402994,6.5530653 L7.36127369,6.5530653 L7.36127369,8.76576176 Z M9.91433899,11.3188869 L12.1270952,11.3188869 L12.1270952,9.1061306 L9.91433899,9.1061306 L9.91433899,11.3188869 Z M9.91433899,8.76576176 L12.1270952,8.76576176 L12.1270952,6.5530653 L9.91433899,6.5530653 L9.91433899,8.76576176 Z M9.91433899,6.21275626 L12.1270952,6.21275626 L12.1270952,4 L9.91433899,4 L9.91433899,6.21275626 Z M12.4674043,11.3188869 L14.6801605,11.3188869 L14.6801605,9.1061306 L12.4674043,9.1061306 L12.4674043,11.3188869 Z",
    color: "#0DB7ED"
  },
  rust: {
    isCustomSvg: true,
    svg: `<g transform="translate(32, 32) scale(0.6)"><path transform="translate(0.5, 0.5)" stroke="#ffffff" stroke-width="1" stroke-linejoin="round" d="M -9,-15 H 4 C 12,-15 12,-7 4,-7 H -9 Z M -40,22 H 0 V 11 H -9 V 3 H 1 C 12,3 6,22 15,22 H 40 V 3 H 34 V 5 C 34,13 25,12 24,7 C 23,2 19,-2 18,-2 C 33,-10 24,-26 12,-26 H -35 V -15 H -25 V 11 H -40 Z"/><g mask="url(#rust-holes)"><circle r="43" fill="none" stroke="#ffffff" stroke-width="9"/><g id="cogs"><polygon id="rust-cog" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" points="46,3 51,0 46,-3"/><use xlink:href="#rust-cog" transform="rotate(11.25)"/><use xlink:href="#rust-cog" transform="rotate(22.50)"/><use xlink:href="#rust-cog" transform="rotate(33.75)"/><use xlink:href="#rust-cog" transform="rotate(45.00)"/><use xlink:href="#rust-cog" transform="rotate(56.25)"/><use xlink:href="#rust-cog" transform="rotate(67.50)"/><use xlink:href="#rust-cog" transform="rotate(78.75)"/><use xlink:href="#rust-cog" transform="rotate(90.00)"/><use xlink:href="#rust-cog" transform="rotate(101.25)"/><use xlink:href="#rust-cog" transform="rotate(112.50)"/><use xlink:href="#rust-cog" transform="rotate(123.75)"/><use xlink:href="#rust-cog" transform="rotate(135.00)"/><use xlink:href="#rust-cog" transform="rotate(146.25)"/><use xlink:href="#rust-cog" transform="rotate(157.50)"/><use xlink:href="#rust-cog" transform="rotate(168.75)"/><use xlink:href="#rust-cog" transform="rotate(180.00)"/><use xlink:href="#rust-cog" transform="rotate(191.25)"/><use xlink:href="#rust-cog" transform="rotate(202.50)"/><use xlink:href="#rust-cog" transform="rotate(213.75)"/><use xlink:href="#rust-cog" transform="rotate(225.00)"/><use xlink:href="#rust-cog" transform="rotate(236.25)"/><use xlink:href="#rust-cog" transform="rotate(247.50)"/><use xlink:href="#rust-cog" transform="rotate(258.75)"/><use xlink:href="#rust-cog" transform="rotate(270.00)"/><use xlink:href="#rust-cog" transform="rotate(281.25)"/><use xlink:href="#rust-cog" transform="rotate(292.50)"/><use xlink:href="#rust-cog" transform="rotate(303.75)"/><use xlink:href="#rust-cog" transform="rotate(315.00)"/><use xlink:href="#rust-cog" transform="rotate(326.25)"/><use xlink:href="#rust-cog" transform="rotate(337.50)"/><use xlink:href="#rust-cog" transform="rotate(348.75)"/></g><g id="mounts"><polygon id="rust-mount" stroke="#ffffff" stroke-width="6" stroke-linejoin="round" points="-7,-42 0,-35 7,-42"/><use xlink:href="#rust-mount" transform="rotate(72)"/><use xlink:href="#rust-mount" transform="rotate(144)"/><use xlink:href="#rust-mount" transform="rotate(216)"/><use xlink:href="#rust-mount" transform="rotate(288)"/></g></g><mask id="rust-holes"><rect x="-60" y="-60" width="120" height="120" fill="#ffffff"/><circle id="rust-hole" cy="-40" r="3"/><use xlink:href="#rust-hole" transform="rotate(72)"/><use xlink:href="#rust-hole" transform="rotate(144)"/><use xlink:href="#rust-hole" transform="rotate(216)"/><use xlink:href="#rust-hole" transform="rotate(288)"/></mask></g>`,
    color: '#ffffff'
  },
  star: {
    path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    color: "#FFD700"
  },
  terminal: {
    path: "M4 17l6-5-6-5v10zm8 0h8v-2h-8v2zM2 3h20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
    color: "#4AF626"
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  setupOfficialPresets();
  setupWorkspace();
  const surfaces = document.querySelectorAll('.surface-option');
  for (const button of surfaces) {
    button.addEventListener('click', () => {
      document.getElementById('badge-stage').dataset.surface = button.dataset.surface;
      for (const option of surfaces) option.setAttribute('aria-pressed', String(option === button));
    });
  }
  setupPresetIcons();
  setIconMode(state.iconMode, false);
  setLogoPosition(state.logoPosition, false);
  setStyle(state.style, false);

  // Build the background gradient stop editor
  renderBgStopEditor();
  setupTextGradientEditors();

  // Wire up drag & drop on the upload dropzone
  const dropzone = document.getElementById('image-dropzone');
  if (dropzone) {
    ['dragover', 'dragenter'].forEach((evtName) => dropzone.addEventListener(evtName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragging');
    }));
    ['dragleave', 'dragend'].forEach((evtName) => dropzone.addEventListener(evtName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragging');
    }));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragging');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) processUploadedFile(file);
    });
  }

  // Prevent the browser from navigating away when a file is dropped elsewhere on the page
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());

  new ResizeObserver(fitPreviewSvg).observe(document.getElementById('badge-stage'));
  const header = document.querySelector('.app-header');
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  }).observe(header);
  setCodeTab(state.codeTab);
  new FontFace(BADGE_FONT, `url(${BADGE_FONT_URL})`, { weight: '500 800' })
    .load().then(font => document.fonts.add(font)).catch(() => {})
    .finally(() => {
      textMeasurementCache.clear();
      renderBadge();
    });
});

// Set Active Style Variant
function setStyle(styleName, render = true) {
  state.style = styleName;
  document.querySelectorAll('.style-option').forEach(card => {
    const selected = card.dataset.style === styleName;
    card.classList.toggle('active', selected);
    card.setAttribute('aria-pressed', selected);
  });
  if (render) renderBadge();
}

// Icon Input Mode Switcher
function setIconMode(mode, render = true) {
  state.iconMode = mode;
  for (const option of ICON_MODES) {
    const selected = option === mode;
    const button = document.getElementById(`seg-${option}`);
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', selected);
    document.getElementById(`icon-mode-${option}`).hidden = !selected;
  }

  // Update FontAwesome preview
  if (mode === 'fontawesome') {
    updateFontAwesomePreview();
    ensureFaRegistry();
  }

  // Update theSVG preview (and lazily load the icon registry for autocomplete)
  if (mode === 'thesvg') {
    refreshTheSvgVariantOptions();
    updateTheSvgPreview();
    ensureTheSvgRegistry();
  }

  if (render) renderBadge();
}

// Logo Position Switcher (left / right / none)
function setLogoPosition(pos, render = true) {
  state.logoPosition = pos;
  for (const option of LOGO_POSITIONS) {
    const button = document.getElementById(`seg-pos-${option}`);
    button.classList.toggle('active', option === pos);
    button.setAttribute('aria-pressed', option === pos);
  }
  if (render) renderBadge();
}

// Known FA pack tokens for dropdown matching & class parsing (Free packs only:
// Font Awesome Free ships solid, regular, and brands — light/thin/duotone/sharp
// and the pixel/mosaic/vellum/slab families are Pro and 404 on the free CDN)
const FA_PACK_TOKENS = [
  'fa-brands', 'fa-solid', 'fa-regular'
];

function parseFontAwesomeInput(raw) {
  const pack = document.getElementById('fa-pack-select');
  const input = document.getElementById('fa-icon-name');
  const text = (raw ?? input.value).trim().toLowerCase();
  const classes = /<i\b[^>]*\bclass\s*=\s*["']([^"']+)/i.exec(text)?.[1] || text;
  const tokens = classes.split(/\s+/);
  const aliases = { fas: 'fa-solid', far: 'fa-regular', fab: 'fa-brands', 'fa-brand': 'fa-brands' };
  const explicitPack = tokens.map(token => aliases[token] || token).find(token => FA_PACK_TOKENS.includes(token));
  const ignored = /^fa-(?:solid|brands?|regular|thin|light|duotone|sharp(?:-.*)?|fw|spin.*|pulse|beat.*|bounce|flip.*|[0-9]+x|xs|sm|lg|xl|2xs|2xl)$/;
  const iconClass = tokens.find(token => /^fa-[a-z0-9-]+$/.test(token) && !ignored.test(token));
  const name = text === '?' ? 'question'
    : iconClass?.slice(3) || (tokens.length === 1 && /^[a-z0-9-]+$/.test(text) ? text : '');
  if (name === 'question') pack.value = 'fa-solid';
  else if (explicitPack) pack.value = explicitPack;
  if (name && input.value !== name) input.value = name;
  return name ? `${pack.value} fa-${name}` : '';
}

function updateFontAwesomePreview() {
  const value = parseFontAwesomeInput();
  const art = document.querySelector('#fa-preview .icon-source-art');
  setIconPreview(art, extractFontAwesomeSvg(value).then(icon => icon
    ? svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeHtml(icon.viewBox)}" fill="#f6f6fa"><path d="${escapeHtml(icon.pathData)}"/></svg>`)
    : ''));
}

function onFaSlugInput() {
  refreshFaPackOption();
  updateFontAwesomePreview();
  renderBadge();
}

// Lazily-loaded FontAwesome metadata: icon name -> { label, freeStyles }.
// Source is the free metadata file pinned to 6.7.2 (the same icons the
// `@fortawesome/fontawesome-free@6` SVG CDN serves), loaded once on first
// FontAwesome use to power name autocomplete. Failures are silent: the name
// input still works via direct CDN fetch.
let faRegistry = null;
let faRegistryPromise = null;
const FA_METADATA_URL = 'https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@6.7.2/metadata/icons.json';

function ensureFaRegistry() {
  if (faRegistry) return Promise.resolve(faRegistry);
  if (faRegistryPromise) return faRegistryPromise;
  faRegistryPromise = fetch(FA_METADATA_URL)
    .then(r => r.ok ? r.json() : null)
    .then((data) => {
      if (!data || typeof data !== 'object') { faRegistry = false; return null; }
      const map = new Map();
      for (const [name, meta] of Object.entries(data)) {
        if (!meta || typeof meta !== 'object') continue;
        const freeStyles = Array.isArray(meta.free)
          ? meta.free.filter(s => ['solid', 'regular', 'brands'].includes(s))
          : [];
        if (freeStyles.length === 0) continue;
        map.set(name, { label: meta.label || name, freeStyles });
      }
      if (map.size === 0) { faRegistry = false; return null; }
      faRegistry = map;
      populateFaDatalist(map);
      const selection = document.getElementById('fa-pack-select').value;
      refreshFaPackOption();
      if (!state.officialBadge && state.iconMode === 'fontawesome' && selection !== document.getElementById('fa-pack-select').value) {
        updateFontAwesomePreview();
        renderBadge();
      }
      return map;
    })
    .catch(() => { faRegistry = false; return null; });
  return faRegistryPromise;
}

// Fill the icon-name autocomplete list (built once — ~1.9k entries)
function populateFaDatalist(map) {
  const list = document.getElementById('fa-icon-list');
  if (!list || list.dataset.populated) return;
  const frag = document.createDocumentFragment();
  for (const [name, entry] of map) {
    const opt = document.createElement('option');
    opt.value = name;
    if (entry.label && entry.label.toLowerCase() !== name.toLowerCase()) opt.label = entry.label;
    frag.appendChild(opt);
  }
  list.appendChild(frag);
  list.dataset.populated = '1';
}

// When the typed name exactly matches a known icon but the selected pack
// doesn't ship it (e.g. `github` only exists in brands), switch the pack to
// the icon's first free style instead of rendering a dangling `?`.
function refreshFaPackOption() {
  if (!faRegistry || faRegistry === false) return;
  const nameInput = document.getElementById('fa-icon-name');
  const packSelect = document.getElementById('fa-pack-select');
  if (!nameInput || !packSelect) return;
  const raw = nameInput.value;
  // Only for bare names — pasted classes/HTML carry their own pack
  if (!raw || raw.includes(' ') || raw.includes('<')) return;
  const clean = raw.replace(/^fa-/, '').trim().toLowerCase();
  if (!clean) return;
  const entry = faRegistry.get(clean);
  if (!entry) return;
  const packFor = (style) => style === 'brands' ? 'fa-brands' : style === 'regular' ? 'fa-regular' : 'fa-solid';
  const available = entry.freeStyles.map(packFor);
  if (!available.includes(packSelect.value)) {
    packSelect.value = available[0];
    if (nameInput.value !== clean) nameInput.value = clean;
  }
}

// The default mark also lives in the header, so it works offline.
const faIconCache = new Map();

function extractFontAwesomeSvg(iconClass) {
  const match = /^fa-(solid|regular|brands) fa-([a-z0-9-]+)$/.exec(iconClass);
  if (!match) return Promise.resolve(null);
  const [, folder, name] = match;
  if (folder === 'solid' && name === 'b') {
    return Promise.resolve({
      viewBox: '0 0 320 512',
      pathData: document.querySelector('.brand-logo path').getAttribute('d')
    });
  }
  if (folder === 'solid' && name === 'question') {
    // Font Awesome Free 6.7.2 by Fonticons, Inc. (CC BY 4.0).
    return Promise.resolve({
      viewBox: '0 0 320 512',
      pathData: 'M80 160c0-35.3 28.7-64 64-64l32 0c35.3 0 64 28.7 64 64l0 3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74l0 1.4c0 17.7 14.3 32 32 32s32-14.3 32-32l0-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7l0-3.6c0-70.7-57.3-128-128-128l-32 0C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z'
    });
  }
  const url = `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/svgs/${folder}/${name}.svg`;
  return loadRemoteIcon(faIconCache, url, markup => {
    const svg = parseSvg(markup);
    const pathData = svg ? Array.from(svg.querySelectorAll('path'), path => path.getAttribute('d')).filter(Boolean).join(' ') : '';
    return pathData ? { viewBox: svg.getAttribute('viewBox') || '0 0 512 512', pathData } : null;
  });
}

function loadRemoteIcon(cache, url, parse) {
  if (!cache.has(url)) {
    if (cache.size >= 160) cache.delete(cache.keys().next().value);
    const request = fetch(url, { signal: AbortSignal.timeout(12000) })
      .then(response => {
        if (response.status === 404) return '';
        if (!response.ok) throw new Error('Icon service unavailable');
        return response.text();
      })
      .then(markup => markup ? parse(markup) : null)
      .catch(() => {
        cache.delete(url);
        return null;
      });
    cache.set(url, request);
  }
  return cache.get(url);
}

// Listen for FontAwesome input changes to update preview
document.addEventListener('DOMContentLoaded', () => {
  const faNameInput = document.getElementById('fa-icon-name');
  const faPackSelect = document.getElementById('fa-pack-select');
  if (faNameInput) faNameInput.addEventListener('input', onFaSlugInput);
  if (faPackSelect) faPackSelect.addEventListener('change', () => {
    updateFontAwesomePreview();
    renderBadge();
  });
});

// --- theSVG brand icons (https://thesvg.org) --------------------------------
// Static, keyless CDN: raw files live at /icons/{slug}/{variant}.svg and the
// searchable manifest at /api/registry.json (same online-first pattern as the
// FontAwesome CDN integration above).

const THESVG_VARIANTS = ['default', 'color', 'mono', 'light', 'dark', 'wordmark'];
const theSvgCache = new Map();
let theSvgRegistry;
let theSvgRegistryPromise;

function normalizeTheSvgSlug(raw) {
  return String(raw ?? '').trim().toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\-.+~]/g, '');
}

function parseTheSvgInput() {
  return {
    slug: normalizeTheSvgSlug(document.getElementById('thesvg-slug').value),
    variant: document.getElementById('thesvg-variant-select').value || 'default'
  };
}

function extractSelectedTheSvg() {
  const { slug, variant } = parseTheSvgInput();
  if (!slug || slug === '.' || slug === '..' || !/^[a-z][a-z0-9-]*$/i.test(variant)) {
    return Promise.resolve(null);
  }
  const filename = variant.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
  const url = `https://thesvg.org/icons/${encodeURIComponent(slug)}/${filename}.svg`;
  return loadRemoteIcon(theSvgCache, url, markup => {
    const svg = parseSvg(markup);
    if (!svg) return null;
    if (!svg.namespaceURI) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    if (!svg.hasAttribute('viewBox')) {
      const width = parseFloat(svg.getAttribute('width'));
      const height = parseFloat(svg.getAttribute('height'));
      svg.setAttribute('viewBox', width > 0 && height > 0 ? `0 0 ${width} ${height}` : '0 0 24 24');
    }
    return svgDataUrl(new XMLSerializer().serializeToString(svg));
  });
}

// Lazily fetch the registry manifest once (on first theSVG use) to power slug
// autocomplete + per-icon variant options. Failures are silent: the slug input
// still works via direct CDN fetch.
function ensureTheSvgRegistry() {
  if (theSvgRegistry) return Promise.resolve(theSvgRegistry);
  if (theSvgRegistryPromise) return theSvgRegistryPromise;
  theSvgRegistryPromise = fetch('https://thesvg.org/api/registry.json')
    .then(r => r.ok ? r.json() : null)
    .then((data) => {
      if (!data || !Array.isArray(data.icons)) { theSvgRegistry = false; return null; }
      const map = new Map();
      for (const icon of data.icons) {
        if (icon && icon.slug) map.set(icon.slug, icon);
      }
      theSvgRegistry = map;
      populateTheSvgDatalist(map);
      if (!state.officialBadge && state.iconMode === 'thesvg') {
        refreshTheSvgVariantOptions();
        updateTheSvgPreview();
        renderBadge();
      }
      return map;
    })
    .catch(() => { theSvgRegistry = false; return null; });
  return theSvgRegistryPromise;
}

// Fill the slug autocomplete list (built once — ~6.5k entries)
function populateTheSvgDatalist(map) {
  const list = document.getElementById('thesvg-slug-list');
  if (!list || list.dataset.populated) return;
  const frag = document.createDocumentFragment();
  for (const [slug, icon] of map) {
    const opt = document.createElement('option');
    opt.value = slug;
    if (icon.title && icon.title !== slug) opt.label = icon.title;
    frag.appendChild(opt);
  }
  list.appendChild(frag);
  list.dataset.populated = '1';
}

function refreshTheSvgVariantOptions(preferred) {
  const { slug, variant } = parseTheSvgInput();
  const entry = theSvgRegistry && theSvgRegistry.get(slug);
  const variants = entry?.variants?.length ? entry.variants : [...new Set([...THESVG_VARIANTS, preferred || variant])];
  const select = document.getElementById('thesvg-variant-select');
  if (select.options.length !== variants.length || variants.some((name, index) => select.options[index].value !== name)) {
    select.replaceChildren(...variants.map(name => new Option(name, name)));
  }
  const selected = preferred || variant;
  select.value = variants.includes(selected) ? selected : variants[0];
}

function setIconPreview(art, request) {
  const loading = document.createTextNode('Loading…');
  art.replaceChildren(loading);
  request.then(source => {
    if (art.firstChild !== loading) return;
    if (!source) {
      art.textContent = 'Icon unavailable';
      return;
    }
    const icon = new Image(48, 48);
    icon.alt = '';
    icon.src = source;
    art.replaceChildren(icon);
  });
}

function updateTheSvgPreview() {
  setIconPreview(document.querySelector('#thesvg-preview .icon-source-art'), extractSelectedTheSvg());
}

document.addEventListener('DOMContentLoaded', () => {
  const update = () => {
    updateTheSvgPreview();
    renderBadge();
  };
  document.getElementById('thesvg-slug').addEventListener('input', () => {
    refreshTheSvgVariantOptions();
    update();
  });
  document.getElementById('thesvg-variant-select').addEventListener('change', update);
});

// Handle File Upload (PNG, JPG, SVG)
function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  processUploadedFile(file);
  // Reset the input so picking the same file again still fires `change`
  e.target.value = '';
}

let uploadRevision = 0;
const imageDataPattern = /^data:image\/(?:png|jpeg|webp|gif|svg\+xml)(?:;[^,]*)?,/i;

async function processUploadedFile(file) {
  const revision = ++uploadRevision;
  const extension = file.name.toLowerCase().split('.').pop();
  const types = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' };
  const type = Object.values(types).includes(file.type) ? file.type : types[extension];
  if (!type || file.size > 8 * 1024 * 1024) {
    showToast('Choose a PNG, JPG, WebP, GIF, or SVG under 8 MB.', 'error');
    return;
  }
  try {
    const dataUrl = type === 'image/svg+xml'
      ? normalizedSvgSource(await file.text())
      : await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file.slice(0, file.size, type));
      });
    if (!dataUrl) throw new Error('Invalid SVG');
    const image = new Image();
    image.src = dataUrl;
    await image.decode();
    if (revision !== uploadRevision) return;
    state.uploadedDataUrl = dataUrl;
    state.uploadFilename = file.name;
    syncUploadPreview();
    renderBadge();
  } catch {
    if (revision === uploadRevision) showToast('This image could not be opened.', 'error');
  }
}

function syncUploadPreview() {
  const thumbnail = document.getElementById('upload-thumb');
  document.getElementById('upload-preview-bar').hidden = !state.uploadedDataUrl;
  document.getElementById('upload-filename').textContent = state.uploadFilename || 'Uploaded logo';
  thumbnail.replaceChildren();
  if (state.uploadedDataUrl) {
    const image = new Image(28, 28);
    image.className = 'upload-thumb';
    image.alt = '';
    image.src = state.uploadedDataUrl;
    thumbnail.append(image);
  }
}

function clearUpload() {
  uploadRevision++;
  state.uploadedDataUrl = '';
  state.uploadFilename = '';
  syncUploadPreview();
  renderBadge();
}

function parseSvg(markup) {
  const { documentElement: svg } = new DOMParser().parseFromString(markup, 'image/svg+xml');
  return svg.localName === 'svg' && (!svg.namespaceURI || svg.namespaceURI === 'http://www.w3.org/2000/svg')
    ? svg : null;
}

function normalizedSvgSource(markup) {
  const svg = parseSvg(markup);
  if (!svg) return '';
  if (!svg.namespaceURI) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return svgDataUrl(new XMLSerializer().serializeToString(svg));
}

function updateRawSvg() {
  const input = document.getElementById('raw-svg-code');
  const markup = input.value.trim();
  state.rawSvgDataUrl = markup ? normalizedSvgSource(markup) : '';
  const invalid = Boolean(markup && !state.rawSvgDataUrl);
  input.setAttribute('aria-invalid', String(invalid));
  document.getElementById('raw-svg-status').textContent = invalid ? 'Enter a complete SVG element.' : '';
}

function handleRawSvgChange() {
  updateRawSvg();
  renderBadge();
}

// Text measurement cache to prevent flickering
const textMeasurementCache = new Map();
const measureContext = document.createElement('canvas').getContext('2d');

// Accurately measure text width using Canvas API
function measureText(text, fontSpec) {
  if (!text) return 0;

  // Check cache first
  const cacheKey = `${text}|${fontSpec}`;
  if (textMeasurementCache.has(cacheKey)) {
    return textMeasurementCache.get(cacheKey);
  }

  if (!measureContext) return Math.ceil(String(text).length * 8);
  measureContext.font = fontSpec;
  const width = measureContext.measureText(text).width;

  // Cache the measurement (cap size so long sessions can't grow it without bound)
  if (textMeasurementCache.size > 1000) textMeasurementCache.clear();
  textMeasurementCache.set(cacheKey, width);

  return width;
}

// Incremented on every render; lets async FontAwesome swaps detect (and skip) stale renders
let renderToken = 0;

// Native-size markup of the last committed preview (display scaling is applied
// to the live DOM node only, so exports and the SVG tab stay native-sized)
let cachedNativeSvg = '';

// Keep display scaling out of the downloaded SVG.
function fitPreviewSvg() {
  const stage = document.getElementById('badge-stage');
  const art = stage.firstElementChild;
  if (!art?.hasAttribute('width')) return;
  const width = Number(art.getAttribute('width'));
  const height = Number(art.getAttribute('height'));
  const available = Math.max(0, stage.clientWidth - 32);
  art.style.width = `${Math.min(available, width * 1.65, 190 * width / height)}px`;
}

// Background gradient presets (2–7 stops each)
const BG_GRADIENT_PRESETS = {
  rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#007fff', '#0000ff', '#8b00ff'],
  'rainbow-pastel': ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e8baff', '#ffb3e6'],
  ocean: ['#0f2027', '#203a43', '#2c5364'],
  sunset: ['#ff512f', '#f09819', '#dd2476', '#6a11cb'],
  fire: ['#ff0000', '#ff4d00', '#ff9900', '#ffcc00', '#ffe066'],
  forest: ['#134e5e', '#56ab2f', '#71b280'],
  synthwave: ['#8e2de2', '#4a00e0', '#ff00cc', '#00e5ff'],
  grayscale: ['#2b2b2b', '#4a4a4a', '#6f6f6f', '#999999', '#c2c2c2'],
  candy: ['#fdfbfb', '#f6d365', '#fda085', '#fbc2eb']
};
const BG_GRADIENT_MAX_STOPS = 7;

// Rebuild the background gradient stop editor rows from state.bgStops
function renderBgStopEditor() {
  const list = document.getElementById('bg-stop-list');
  if (!list) return;
  const sel = document.getElementById('bg-grad-preset');
  if (sel) sel.value = state.bgGradPreset || 'custom';
  list.innerHTML = '';

  state.bgStops.forEach((hex, i) => {
    const row = document.createElement('div');
    row.className = 'bg-stop-row';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'bg-stop-color';
    colorInput.value = hex;
    colorInput.setAttribute('aria-label', `Background gradient stop ${i + 1}`);

    const hexLabel = document.createElement('span');
    hexLabel.className = 'bg-stop-hex';
    hexLabel.innerText = hex;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'bg-stop-remove';
    removeBtn.setAttribute('aria-label', `Remove gradient stop ${i + 1}`);
    removeBtn.textContent = '×';
    removeBtn.disabled = state.bgStops.length <= 2;

    colorInput.addEventListener('input', () => {
      const val = colorInput.value;
      state.bgStops[i] = val;
      hexLabel.innerText = val;
      setBgGradPresetSelect('custom');
      renderBadge();
    });

    removeBtn.addEventListener('click', () => {
      if (state.bgStops.length <= 2) return;
      state.bgStops.splice(i, 1);
      setBgGradPresetSelect('custom');
      renderBgStopEditor();
      renderBadge();
    });

    row.appendChild(colorInput);
    row.appendChild(hexLabel);
    row.appendChild(removeBtn);
    list.appendChild(row);
  });

  const addBtn = document.getElementById('bg-add-stop');
  if (addBtn) addBtn.disabled = state.bgStops.length >= BG_GRADIENT_MAX_STOPS;
}

// Sync the preset dropdown + state with a given preset name
function setBgGradPresetSelect(name) {
  state.bgGradPreset = name;
  const sel = document.getElementById('bg-grad-preset');
  if (sel) sel.value = name;
}

// Preset dropdown change: apply the preset's stops (or leave stops untouched for 'custom')
function onBgGradPresetSelect() {
  const sel = document.getElementById('bg-grad-preset');
  const name = sel ? sel.value : 'custom';
  if (name !== 'custom' && BG_GRADIENT_PRESETS[name]) {
    state.bgStops = BG_GRADIENT_PRESETS[name].slice();
    renderBgStopEditor();
  }
  setBgGradPresetSelect(name);
  renderBadge();
}

// Add another gradient stop (max 7)
function addBgStop() {
  if (state.bgStops.length >= BG_GRADIENT_MAX_STOPS) return;
  state.bgStops.push('#ffffff');
  setBgGradPresetSelect('custom');
  renderBgStopEditor();
  renderBadge();
}

function sortedGradientStops(gradient) {
  return [...gradient.stops].sort((first, second) => first.offset - second.offset);
}

function selectedTextGradient(part) {
  return document.getElementById(GRADIENT_CONTROLS[part].toggle).checked ? state.textGradients[part] : null;
}

function setupGradientPresets(part) {
  const select = document.getElementById(`${part}-gradient-preset`);
  if (!select) return;
  const background = document.getElementById('bg-grad-preset');
  select.replaceChildren(...Array.from(background.options, option => option.cloneNode(true)));
  // Custom reflects edited stops. Each named preset replaces only the stops.
  select.options[0].disabled = true;
  select.addEventListener('change', () => {
    const colors = BG_GRADIENT_PRESETS[select.value];
    if (!colors) return;
    state.textGradients[part].stops = colors.map((color, index) => ({
      color, offset: svgNumber(100 * index / (colors.length - 1))
    }));
    renderTextGradientStops(part);
    renderBadge();
  });
}

function syncGradientPreset(part, gradient) {
  const select = document.getElementById(`${part}-gradient-preset`);
  if (!select) return;
  const stops = sortedGradientStops(gradient);
  const match = Object.entries(BG_GRADIENT_PRESETS).find(([, colors]) =>
    colors.length === stops.length && colors.every((color, index) =>
      color === stops[index].color.toLowerCase() &&
      Math.abs(stops[index].offset - 100 * index / (colors.length - 1)) < 0.001
    )
  );
  select.value = match?.[0] || 'custom';
}

function setupGradientDial(part, input) {
  const dial = document.getElementById(`${part}-gradient-dial`);
  const setAngle = angle => {
    const gradient = state.textGradients[part];
    if (angle === gradient.angle) return;
    gradient.angle = angle;
    input.value = angle;
    renderBadge();
  };
  const pointToAngle = event => {
    const { left, top, width, height } = dial.getBoundingClientRect();
    const dx = event.clientX - left - width / 2;
    const dy = event.clientY - top - height / 2;
    if (Math.hypot(dx, dy) < 3) return;
    const degrees = Math.atan2(dx, -dy) * 180 / Math.PI;
    setAngle((Math.round(degrees) + 360) % 360);
  };
  dial.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    dial.focus({ preventScroll: true });
    dial.setPointerCapture(event.pointerId);
    pointToAngle(event);
  });
  dial.addEventListener('pointermove', event => {
    if (dial.hasPointerCapture(event.pointerId)) pointToAngle(event);
  });
  dial.addEventListener('pointerup', event => {
    if (dial.hasPointerCapture(event.pointerId)) pointToAngle(event);
  });
  dial.addEventListener('keydown', event => {
    const step = event.shiftKey ? 15 : 1;
    const angle = state.textGradients[part].angle;
    const values = {
      ArrowUp: angle + step, ArrowRight: angle + step,
      ArrowDown: angle - step, ArrowLeft: angle - step,
      Home: 0, End: 360
    };
    if (!Object.hasOwn(values, event.key)) return;
    event.preventDefault();
    setAngle(Math.min(360, Math.max(0, values[event.key])));
  });
}

function setupTextGradientEditors() {
  for (const part of Object.keys(GRADIENT_CONTROLS)) {
    setupGradientPresets(part);
    const angleInput = document.getElementById(`${part}-gradient-angle`);
    setupGradientDial(part, angleInput);
    angleInput.addEventListener('input', event => {
      const angle = event.target.valueAsNumber;
      if (!Number.isFinite(angle)) return;
      state.textGradients[part].angle = Math.min(360, Math.max(0, angle));
      renderBadge();
    });
    angleInput.addEventListener('change', event => {
      event.target.value = state.textGradients[part].angle;
    });
    document.getElementById(`${part}-gradient-add`).addEventListener('click', () => {
      const gradient = state.textGradients[part];
      const sorted = sortedGradientStops(gradient);
      // Insert into the largest gap, including the ends of the track.
      const points = [{ ...sorted[0], offset: 0 }, ...sorted, { ...sorted.at(-1), offset: 100 }];
      let start = points[0];
      let gap = 0;
      for (let index = 1; index < points.length; index++) {
        const previous = points[index - 1];
        const distance = points[index].offset - previous.offset;
        if (distance > gap) {
          start = previous;
          gap = distance;
        }
      }
      gradient.stops.push({ color: start.color, offset: Math.round((start.offset + gap / 2) * 100) / 100 });
      renderTextGradientStops(part);
      document.querySelector(`#${part}-gradient-stops .text-gradient-stop:last-child input`).focus();
      renderBadge();
    });
    renderTextGradientStops(part);
  }
}

function renderTextGradientStops(part) {
  const { label } = GRADIENT_CONTROLS[part];
  const gradient = state.textGradients[part];
  const list = document.getElementById(`${part}-gradient-stops`);
  document.getElementById(`${part}-gradient-angle`).value = gradient.angle;
  list.replaceChildren();
  gradient.stops.forEach((stop, index) => {
    const row = document.createElement('div');
    row.className = 'text-gradient-stop';
    const color = document.createElement('input');
    color.type = 'color';
    color.className = 'bg-stop-color';
    color.value = stop.color;
    color.setAttribute('aria-label', `${label} gradient stop ${index + 1} color`);
    const hex = document.createElement('span');
    hex.className = 'bg-stop-hex';
    hex.textContent = stop.color.toUpperCase();
    const offset = document.createElement('input');
    offset.type = 'number';
    offset.className = 'input-text';
    offset.min = '0';
    offset.max = '100';
    offset.step = 'any';
    offset.value = stop.offset;
    offset.setAttribute('aria-label', `${label} gradient stop ${index + 1} position in percent`);
    const percent = document.createElement('span');
    percent.textContent = '%';
    percent.setAttribute('aria-hidden', 'true');
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'bg-stop-remove';
    remove.textContent = '×';
    remove.disabled = gradient.stops.length <= 2;
    remove.setAttribute('aria-label', `Remove ${part} gradient stop ${index + 1}`);
    color.addEventListener('input', () => {
      stop.color = color.value;
      hex.textContent = stop.color.toUpperCase();
      renderBadge();
    });
    offset.addEventListener('input', () => {
      if (!Number.isFinite(offset.valueAsNumber)) return;
      stop.offset = Math.min(100, Math.max(0, offset.valueAsNumber));
      renderBadge();
    });
    offset.addEventListener('change', () => { offset.value = stop.offset; });
    remove.addEventListener('click', () => {
      gradient.stops.splice(index, 1);
      renderTextGradientStops(part);
      document.getElementById(`${part}-gradient-add`).focus();
      renderBadge();
    });
    row.append(color, hex, offset, percent, remove);
    list.append(row);
  });
}

function updateTextGradientControls() {
  const style = BADGE_LAYOUTS[state.style];
  for (const [part, controls] of Object.entries(GRADIENT_CONTROLS)) {
    const toggle = document.getElementById(controls.toggle);
    const enabled = toggle ? toggle.checked : document.getElementById('border-mode').value === 'gradient';
    const available = controls.parent
      ? state.logoPosition !== 'none' && document.getElementById(controls.parent).checked
        && (part !== 'outline' || !document.getElementById('show-disk-toggle').checked)
      : part === 'border' || !style.minimal;
    if (toggle) toggle.disabled = !available;
    if (controls.solid) document.getElementById(controls.solid).disabled = !available || enabled;
    document.getElementById(`${part}-gradient-editor`).hidden = !available || !enabled;
    const gradient = state.textGradients[part];
    const dial = document.getElementById(`${part}-gradient-dial`);
    dial.style.setProperty('--dial-angle', `${gradient.angle}deg`);
    dial.setAttribute('aria-valuenow', gradient.angle);
    dial.setAttribute('aria-valuetext', `${gradient.angle} degrees`);
    if (available && enabled) syncGradientPreset(part, gradient);
    const stops = sortedGradientStops(gradient).map(stop => `${stop.color} ${stop.offset}%`);
    document.getElementById(`${part}-gradient-preview`).style.backgroundImage =
      `linear-gradient(${gradient.angle}deg, ${stops.join(', ')})`;
  }
}

function buildTextGradient(id, gradient, { x, y, width, height }) {
  const radians = gradient.angle * Math.PI / 180;
  const dx = Math.sin(radians);
  const dy = -Math.cos(radians);
  const halfSpan = Math.max(0.001, (Math.abs(dx) * width + Math.abs(dy) * height) / 2);
  const cx = x + width / 2;
  const cy = y + height / 2;
  const coordinates = `x1="${svgNumber(cx - dx * halfSpan)}" y1="${svgNumber(cy - dy * halfSpan)}" x2="${svgNumber(cx + dx * halfSpan)}" y2="${svgNumber(cy + dy * halfSpan)}"`;
  const stops = sortedGradientStops(gradient).map(({ color, offset }) => `<stop offset="${offset}%" stop-color="${color}"/>`).join('');
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" ${coordinates}>${stops}</linearGradient>`;
}

function restoreTextGradients(config) {
  for (const part of Object.keys(GRADIENT_CONTROLS)) {
    const gradient = config.textGradients?.[part];
    if (gradient && Number.isFinite(gradient.angle) && Array.isArray(gradient.stops) && gradient.stops.length >= 2
      && gradient.stops.every(stop => stop && isHexColor(stop.color) && Number.isFinite(stop.offset))) {
      state.textGradients[part] = {
        angle: Math.min(360, Math.max(0, gradient.angle)),
        stops: gradient.stops.map(stop => ({ color: stop.color, offset: Math.min(100, Math.max(0, stop.offset)) }))
      };
    } else if (part === 'title' && (isHexColor(config.textGradTop) || isHexColor(config.textGradBot))) {
      const legacy = defaultTextGradient(isHexColor(config.textGradTop) ? config.textGradTop : undefined);
      if (isHexColor(config.textGradBot)) legacy.stops[1].color = config.textGradBot;
      state.textGradients.title = legacy;
    }
    if (part === 'outline' && !gradient && (isHexColor(config.logoStrokeGradTop) || isHexColor(config.logoStrokeGradBot))) {
      state.textGradients.outline = { angle: 180, stops: [
        { color: isHexColor(config.logoStrokeGradTop) ? config.logoStrokeGradTop : '#ffffff', offset: 0 },
        { color: isHexColor(config.logoStrokeGradBot) ? config.logoStrokeGradBot : '#61dafb', offset: 100 }
      ] };
    }
    renderTextGradientStops(part);
  }
}

// Live-sync the hex text next to every color picker (uppercased).
function updateColorHexes() {
  document.querySelectorAll('.color-val').forEach(span => {
    const wrap = span.closest ? span.closest('.color-picker-wrap') : null;
    const input = wrap && wrap.querySelector('input[type="color"]');
    if (input) span.textContent = input.value.toUpperCase();
  });
}

// Disable controls that only matter when their parent toggle is on, so the UI reads clearly.
function syncDependentControls() {
  const dep = (enabled, ids) => {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.disabled = !enabled;
      el.classList.toggle('fx-dim', !enabled);
    });
  };
  updateTextGradientControls();
  const borderMode = document.getElementById('border-mode').value;
  dep(borderMode === 'solid', ['border-color']);
  dep(['solid', 'gradient'].includes(borderMode), ['border-width', 'border-opacity']);
  const hasText = !BADGE_LAYOUTS[state.style].minimal;
  const hasLogo = state.logoPosition !== 'none';
  const diskOn = hasLogo && document.getElementById('show-disk-toggle').checked;
  dep(hasText, ['top-text', 'bottom-text', 'text-alignment', 'text-stroke-toggle', 'text-shadow-toggle']);
  dep(hasLogo, ['show-disk-toggle', 'custom-logo-color-toggle', 'logo-shadow-toggle', 'icon-scale-slider']);
  dep(hasLogo && !diskOn, ['logo-stroke-toggle']);
  dep(hasLogo && hasText, ['logo-gap']);
  dep(hasText && document.getElementById('text-stroke-toggle').checked, ['text-stroke-color', 'text-stroke-width']);
  dep(hasText && document.getElementById('text-shadow-toggle').checked, ['text-shadow-color', 'text-shadow-blur']);
  dep(diskOn, ['disk-color', 'disk-size-slider']);
  const logoStrokeOn = hasLogo && !diskOn && document.getElementById('logo-stroke-toggle').checked;
  const logoStrokeGradOn = document.getElementById('logo-stroke-grad-toggle')?.checked || false;
  // Solid outline color is unused while the gradient outline is on
  dep(logoStrokeOn && !logoStrokeGradOn, ['logo-stroke-color']);
  dep(logoStrokeOn, ['logo-stroke-width']);
  dep(hasLogo && document.getElementById('logo-shadow-toggle').checked, ['logo-shadow-color', 'logo-shadow-blur']);
}

// Disk-shaped convolution kernel for round (Photoshop-style) outline dilation.
// feMorphology dilates with a SQUARE kernel, which makes diagonals ~1.4x
// thicker than axes at small widths and turns circles into rounded squares at
// large widths. A disk kernel keeps the ring uniform and circular at any size.
// divisor MUST stay 1 (the default sums the kernel, which would normalize the
// dilation into a majority vote); the discrete step then keeps any pixel with
// at least one opaque neighbor inside the disk.
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

// Build the combined logo FX filter (drop shadow + outline stroke + custom tint), or '' if unused.
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
    // Round outside stroke: disk-kernel dilation (uniform width, circular at any
    // size), hardened with a discrete step — crisp, no blur.
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

// Silhouette filter for gradient outlines: same round disk-kernel dilation as
// the solid stroke above (filters can't paint gradients, so the outline is a
// gradient rect clipped by this silhouette via a mask — see buildGradStrokeLayer).
function buildStrokeSilFilter(id, radius) {
  const kernel = strokeDiskKernel(radius);
  return `    <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">\n` +
    `      <feConvolveMatrix in="SourceAlpha" order="${kernel.order}" kernelMatrix="${kernel.matrix}" divisor="1" bias="0" preserveAlpha="false" result="dilated"/>\n` +
    `      <feComponentTransfer in="dilated" result="smoothEdge">\n` +
    `        <feFuncA type="discrete" tableValues="0 1"/>\n` +
    `      </feComponentTransfer>\n` +
    `    </filter>\n`;
}

// Gradient outline layer: a full-badge gradient rect clipped to the logo's
// smoothed silhouette. `logoCopy` is the logo markup WITHOUT fx filters
// (tint/shadow would leak extra alpha into the silhouette). mask-type="alpha"
// so dark logos mask correctly too (luminance masks would drop them).
function buildGradStrokeLayer({ maskId, silFilterId, gradId, width, height, logoCopy }) {
  return `  <mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" mask-type="alpha">\n` +
    `    <g filter="url(#${silFilterId})">\n${logoCopy}\n    </g>\n` +
    `  </mask>\n` +
    `  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#${gradId})" mask="url(#${maskId})"/>\n`;
}

function buildLogoPaint(artwork, id, bounds, width, height, gradient, color) {
  const fill = gradient ? `url(#${id})` : color;
  const definition = gradient ? buildTextGradient(id, gradient, bounds) : '';
  return `<defs>${definition}<mask id="${id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" mask-type="alpha">${artwork}</mask></defs>`
    + `<rect width="${width}" height="${height}" fill="${fill}" mask="url(#${id}-mask)"/>`;
}

// Main Render Logic
function renderBadge() {
  recordWorkspaceHistory();
  const token = ++renderToken;
  const stage = document.getElementById('badge-stage');
  const dimensions = document.getElementById('badge-size-display');
  const status = document.getElementById('preview-status');
  const title = badgeTitle();
  syncBadgeView();
  updateColorHexes();
  syncDependentControls();
  for (const [input, label] of Object.entries({
    'corner-radius': 'radius-val',
    'text-stroke-width': 'text-stroke-val', 'text-shadow-blur': 'text-shadow-val',
    'logo-stroke-width': 'logo-stroke-val', 'logo-shadow-blur': 'logo-shadow-val'
  })) {
    document.getElementById(label).textContent = `${document.getElementById(input).value}px`;
  }

  const layout = BADGE_LAYOUTS[state.style];
  const scale = layout.logo / DEFAULT_LOGO_SIZE;
  for (const [input, label] of [['icon-scale-slider', 'icon-scale-num'], ['disk-size-slider', 'disk-size-num']]) {
    const size = document.getElementById(input).valueAsNumber * scale;
    document.getElementById(label).textContent = `${svgNumber(size)}px`;
  }
  const pad = document.getElementById('padding-horizontal');
  pad.disabled = Boolean(layout.minimal);
  document.getElementById('padding-val').textContent = layout.minimal ? '—' : `${layout.right + pad.valueAsNumber - 12}px`;

  const render = prepareBadge(state.style);
  const commit = (markup, exportable = true) => {
    if (render.image) {
      const { width, height } = getSvgDimensions(markup);
      const image = new Image(width, height);
      image.alt = title;
      image.src = svgDataUrl(markup);
      stage.replaceChildren(image);
    } else {
      stage.innerHTML = markup.replace(BADGE_FONT_STYLE, '');
    }
    const art = stage.firstElementChild;
    dimensions.textContent = `${art.getAttribute('width')} × ${art.getAttribute('height')} px`;
    fitPreviewSvg();
    cachedNativeSvg = exportable ? markup : '';
    updateSnippetOutput();
  };

  status.textContent = '';
  if (render.preview) commit(render.preview, !render.pending);
  else {
    stage.replaceChildren();
    dimensions.textContent = '—';
    cachedNativeSvg = '';
    updateSnippetOutput();
  }

  if (render.pending) {
    status.textContent = render.image ? 'Loading original SVG…' : 'Loading icon…';
    render.pending.then(({ svg, missingIcon }) => {
      if (token !== renderToken) return;
      commit(svg, !missingIcon);
      status.textContent = missingIcon ? 'Icon unavailable. Check the name or try a different source.' : '';
    }).catch(() => {
      if (token === renderToken) status.textContent = 'The badge preview could not be loaded.';
    });
  }
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Escape a string for use as Markdown link text: `![text](...)`
function escapeMarkdownText(str) {
  return String(str ?? '').replace(/\\/g, '\\\\').replace(/\]/g, '\\]').replace(/\[/g, '\\[');
}

function setCodeTab(tab) {
  state.codeTab = tab;
  for (const button of document.querySelectorAll('.code-tab')) {
    const selected = button.id === `codetab-${tab}`;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', selected);
  }
  updateSnippetOutput();
}

function badgeTitle() {
  return DEVINS_BADGES[state.officialBadge]?.name || document.getElementById('bottom-text').value || 'Badge';
}

function badgeFilename(style) {
  const slug = (state.officialBadge || badgeTitle())
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'badge';
  return `devin_${slug}_${style || 'badge'}`;
}

function updateSnippetOutput() {
  const title = badgeTitle();
  const filename = `${badgeFilename()}.svg`;
  const snippets = {
    md: `![${escapeMarkdownText(title)}](${filename})`,
    html: `<img src="${filename}" alt="${escapeHtml(title)}">`,
    svg: cachedNativeSvg
  };
  const output = snippets[state.codeTab];
  document.getElementById('snippet-output').textContent = output;
  document.getElementById('copy-code').disabled = !output;
}

function copyCode() {
  const code = document.getElementById('snippet-output').innerText;
  const done = () => showToast('Copied code snippet to clipboard!');
  const failed = () => showToast('Copy failed — select the code manually.', 'error');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(done).catch(() => {
      fallbackCopyText(code) ? done() : failed();
    });
  } else {
    fallbackCopyText(code) ? done() : failed();
  }
}

// Fallback copy for non-secure contexts where navigator.clipboard is unavailable
function fallbackCopyText(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    const focused = document.activeElement;
    document.body.appendChild(ta);
    try {
      ta.select();
      return document.execCommand('copy');
    } finally {
      ta.remove();
      focused?.focus({ preventScroll: true });
    }
  } catch {
    return false;
  }
}

function prepareBadge(style) {
  return prepareOfficialBadge(style) || generateBadgeForStyle(style);
}

async function getExportSvg(style = state.style) {
  return resolveBadgeExport(prepareBadge(style));
}

async function resolveBadgeExport({ preview, pending }) {
  if (!pending) return preview;
  const { svg, missingIcon } = await pending;
  if (missingIcon) throw new Error('Icon unavailable');
  return svg;
}

function downloadFile(contents, filename, type) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getSvgDimensions(markup) {
  const { documentElement: svg } = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const width = parseFloat(svg.getAttribute('width'));
  const height = parseFloat(svg.getAttribute('height'));
  if (!(width > 0 && height > 0)) throw new Error('Invalid SVG dimensions');
  return { width, height };
}

function svgDataUrl(markup) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
}

async function rasterizeSvg(markup) {
  const { width, height } = getSvgDimensions(markup);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * 3);
  canvas.height = Math.round(height * 3);
  const image = new Image();
  image.src = svgDataUrl(markup);
  await image.decode();
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

async function downloadSVG() {
  const filename = `${badgeFilename()}.svg`;
  try {
    downloadFile(await getExportSvg(), filename, 'image/svg+xml;charset=utf-8');
    showToast('Downloaded SVG');
  } catch {
    showToast('SVG export failed. Please try again.', 'error');
  }
}

async function downloadPNG() {
  const filename = `${badgeFilename()}.png`;
  try {
    const url = await rasterizeSvg(await getExportSvg());
    const response = await fetch(url);
    downloadFile(await response.blob(), filename, 'image/png');
    showToast('Downloaded PNG at 3× resolution');
  } catch {
    showToast('PNG export failed. Please try downloading the SVG.', 'error');
  }
}

function svgNumber(value) {
  return Number(value.toFixed(3));
}

function badgeFontSpec(weight, size) {
  return `${weight} ${size}px "${BADGE_FONT}", sans-serif`;
}

function badgeTextBounds(value, x, baseline, size, weight, width) {
  const ctx = measureContext;
  if (ctx) ctx.font = badgeFontSpec(weight, size);
  const metrics = ctx?.measureText(value);
  const ascent = metrics?.actualBoundingBoxAscent || size * 0.74;
  const descent = metrics?.actualBoundingBoxDescent || 0;
  return { x, y: baseline - ascent, width, height: ascent + descent };
}

function templateShadow(id) {
  return `<filter id="${id}" x="-50%" y="-90%" width="200%" height="280%"><feDropShadow dx="0" dy="0" stdDeviation="2.8" flood-opacity=".25"/></filter>\n`;
}

function generateBadgeForStyle(styleName, labels) {
  const topText = labels?.top ?? document.getElementById('top-text').value;
  const bottomText = labels?.bottom ?? document.getElementById('bottom-text').value;
  const showDisk = document.getElementById('show-disk-toggle').checked;
  const diskColor = document.getElementById('disk-color').value;
  const logoColor = document.getElementById('logo-color').value;
  const bgStops = state.bgStops && state.bgStops.length >= 2 ? state.bgStops : ['#181f29', '#0f131a'];
  const textColor = document.getElementById('text-color').value;
  const radius = parseInt(document.getElementById('corner-radius').value);
  const paddingRight = parseInt(document.getElementById('padding-horizontal').value);

  const diskDiameter = document.getElementById('disk-size-slider').valueAsNumber;
  const userLogoScale = document.getElementById('icon-scale-slider').valueAsNumber;

  const layout = BADGE_LAYOUTS[styleName];
  const { height, minimal, inline } = layout;
  const logoScale = layout.logo / DEFAULT_LOGO_SIZE;
  const logoSize = userLogoScale * logoScale;
  const noLogo = state.logoPosition === 'none';
  const logoOnRight = state.logoPosition === 'right';
  const presetKey = document.getElementById('preset-select').value;
  const catalogIcon = state.iconMode === 'preset' && Object.hasOwn(DEVINS_BADGES, presetKey);

  const subtitleSize = layout.subtitleSize;
  const titleSize = BADGE_TITLE_SIZE;
  const topMeasured = minimal ? 0 : measureText(topText, badgeFontSpec(BADGE_SUBTITLE_WEIGHT, subtitleSize));
  const bottomMeasured = minimal ? 0 : measureText(bottomText, badgeFontSpec(BADGE_TITLE_WEIGHT, titleSize));
  const subtitleAdvance = Math.ceil(topMeasured);
  const titleAdvance = Math.ceil(bottomMeasured);
  const labelGap = inline && subtitleAdvance && titleAdvance ? COMPACT_LABEL_GAP : 0;
  const textNaturalWidth = inline
    ? subtitleAdvance + labelGap + titleAdvance
    : Math.max(subtitleAdvance, titleAdvance);
  const textEdge = (layout.right ?? layout.left) + paddingRight - 12;
  const gap = Number(document.getElementById('logo-gap').valueAsNumber);
  const textXLeft = layout.left + logoSize + (Number.isFinite(gap) ? Math.min(64, Math.max(0, gap)) : layout.gap || 0);
  const alignment = document.getElementById('text-alignment').value;
  const horizontalSpace = noLogo ? textEdge * 2 : textXLeft + textEdge;
  const width = minimal ? height : Math.max(height, Math.min(MAX_BADGE_WIDTH, Math.round(textNaturalWidth + horizontalSpace)));
  const availableTextWidth = Math.max(1, width - horizontalSpace);
  const textX = noLogo || logoOnRight ? textEdge : textXLeft;
  const titleGradient = selectedTextGradient('title');
  const subtitleGradient = selectedTextGradient('subtitle');

  const useTextStroke = document.getElementById('text-stroke-toggle')?.checked || false;
  const textStrokeColor = document.getElementById('text-stroke-color')?.value || '#000000';
  const textStrokeWidth = document.getElementById('text-stroke-width')?.value || '1.5';
  const subtitleColor = document.getElementById('subtitle-color')?.value || '#e0e0e0';
  const useTextShadow = document.getElementById('text-shadow-toggle')?.checked || false;
  const textShadowColor = document.getElementById('text-shadow-color')?.value || '#000000';
  const textShadowBlur = parseFloat(document.getElementById('text-shadow-blur')?.value || '2');

  const useCustomLogoColor = document.getElementById('custom-logo-color-toggle')?.checked || false;
  const customLogoColor = document.getElementById('logo-color')?.value || '#ffffff';
  const useLogoStroke = document.getElementById('logo-stroke-toggle')?.checked || false;
  const logoStrokeColor = document.getElementById('logo-stroke-color')?.value || '#ffffff';
  const logoStrokeWidth = document.getElementById('logo-stroke-width')?.value || '2';
  const useLogoStrokeGrad = document.getElementById('logo-stroke-grad-toggle')?.checked || false;
  const logoGradient = !noLogo && useCustomLogoColor && selectedTextGradient('logo');
  const outlineGradient = selectedTextGradient('outline');
  const useLogoShadow = document.getElementById('logo-shadow-toggle')?.checked || false;
  const logoShadowColor = document.getElementById('logo-shadow-color')?.value || '#000000';
  const logoShadowBlur = parseFloat(document.getElementById('logo-shadow-blur')?.value || '2');

  // Solid and gradient outlines are mutually exclusive (same toggle + width);
  // both stay suppressed while the disk is shown, like before.
  const solidStrokeActive = !noLogo && useLogoStroke && !showDisk && !useLogoStrokeGrad;
  const gradStrokeActive = !noLogo && useLogoStroke && !showDisk && useLogoStrokeGrad;

  // Build SVG
  let svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" fill="none" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="badge-bg-${styleName}" x1="0" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
${bgStops.map((hex, i) => `      <stop offset="${(i / (bgStops.length - 1)).toFixed(3)}" stop-color="${hex}"/>`).join('\n')}
    </linearGradient>
`;

  // Combined Logo Filter (Universal Tinting for all Uploads/Images/SVGs + Logo Outline Stroke + Drop Shadow)
  // (Gradient outlines render as a separate masked layer below, not in this filter.)
  const effectiveExportTint = !noLogo && useCustomLogoColor && !logoGradient;
  const effectiveExportStroke = solidStrokeActive;
  svgMarkup += buildLogoFxFilter(`badge-logo-fx-${styleName}`, {
    useTint: effectiveExportTint,
    tintColor: customLogoColor,
    useStroke: effectiveExportStroke,
    strokeColor: logoStrokeColor,
    strokeWidth: logoStrokeWidth,
    useShadow: useLogoShadow,
    shadowColor: logoShadowColor,
    shadowBlur: logoShadowBlur
  });

  // Gradient outline defs (silhouette filter + vertical gradient paint)
  if (gradStrokeActive) {
    svgMarkup += buildStrokeSilFilter(`badge-logo-stroke-sil-${styleName}`, logoStrokeWidth);

  }

  // Text drop shadow filter (title + subtitle)
  svgMarkup += buildLogoFxFilter(`badge-text-fx-${styleName}`, {
    useTint: false,
    useStroke: false,
    useShadow: useTextShadow,
    shadowColor: textShadowColor,
    shadowBlur: textShadowBlur
  });

  const naturalRadius = radius === 8 ? layout.radius : radius;
  const border = renderBadgeBorder(styleName, width, height, naturalRadius);
  svgMarkup += border.definitions;
  // The source artwork already carries the template shadow.
  if (!noLogo && !catalogIcon && !useLogoShadow) {
    svgMarkup += templateShadow('badge-default-logo-shadow');
  }
  if (!minimal && !useTextShadow) svgMarkup += templateShadow('badge-default-text-shadow');

  svgMarkup += `  </defs>\n
  <rect width="${width}" height="${height}" fill="url(#badge-bg-${styleName})" rx="${naturalRadius}"/>
  ${border.markup}\n`;

  const useLogoFxFilter = effectiveExportTint || effectiveExportStroke || useLogoShadow;
  const logoFilterAttr = useLogoFxFilter ? ` filter="url(#badge-logo-fx-${styleName})"`
    : catalogIcon ? '' : ' filter="url(#badge-default-logo-shadow)"';
  const textFilterId = useTextShadow ? `badge-text-fx-${styleName}` : 'badge-default-text-shadow';

  const iconX = minimal ? (height - logoSize) / 2 : logoOnRight ? width - logoSize - layout.left : layout.left;
  const iconPosition = (x, y, w, h) => `x="${svgNumber(x)}" y="${svgNumber(y)}" width="${svgNumber(w)}" height="${svgNumber(h)}"`;
  const defaultPosition = iconPosition(iconX, (height - logoSize) / 2, logoSize, logoSize);
  const defaultBounds = { x: iconX, y: (height - logoSize) / 2, width: logoSize, height: logoSize };
  const paintLogo = (artwork, bounds = defaultBounds) => {
    const fillId = `badge-logo-fill-${styleName}`;
    const strokeId = `badge-logo-stroke-grad-${styleName}`;
    const stroke = gradStrokeActive
      ? `<defs>${buildTextGradient(strokeId, outlineGradient, bounds)}</defs>` +
        buildGradStrokeLayer({ maskId: `badge-logo-stroke-mask-${styleName}`, silFilterId: `badge-logo-stroke-sil-${styleName}`, gradId: strokeId, width, height, logoCopy: artwork })
      : '';
    const fill = logoGradient ? buildLogoPaint(artwork, fillId, bounds, width, height, logoGradient) : artwork;
    return stroke + `<g${logoFilterAttr}>${fill}</g>`;
  };


  if (showDisk && !noLogo) {
    const diskR = diskDiameter * logoScale / 2;
    svgMarkup += `  <circle cx="${svgNumber(iconX + logoSize / 2)}" cy="${height / 2}" r="${svgNumber(diskR)}" fill="${diskColor}"/>\n`;
  }

  let pendingIcon;
  // Render Icon
  if (!noLogo && state.iconMode === 'preset') {
    if (catalogIcon) {
      const scale = userLogoScale / DEFAULT_LOGO_SIZE;
      pendingIcon = {
        slot: '<!-- PRESET_ICON_SLOT -->',
        placeholder: '',
        request: loadOfficialLogo(presetKey, styleName).then(({ source, viewport, bounds }) => {
          const position = iconPosition(
            iconX + (viewport.x - layout.left) * scale,
            height / 2 + (viewport.y - height / 2) * scale,
            viewport.width * scale,
            viewport.height * scale
          );
          const image = `<image ${position} href="${source}"/>`;
          return paintLogo(image, {
            x: iconX + (bounds.x - layout.left) * scale,
            y: height / 2 + (bounds.y - height / 2) * scale,
            width: bounds.width * scale, height: bounds.height * scale
          });
        })
      };
      svgMarkup += pendingIcon.slot;
    } else {
      const icon = EXTRA_PRESET_ICONS[presetKey];
      const artwork = icon.isCustomSvg
        ? icon.svg
        : `<path fill="${showDisk ? logoColor : icon.color}" d="${icon.path}"/>`;
      const boxSize = icon.isCustomSvg ? 64 : 24;
      const logo = `<svg ${defaultPosition} viewBox="0 0 ${boxSize} ${boxSize}">${artwork}</svg>`;
      svgMarkup += paintLogo(logo);
    }
  } else if (!noLogo && (state.iconMode === 'upload' || state.iconMode === 'raw')) {
    const source = state.iconMode === 'upload' ? state.uploadedDataUrl : state.rawSvgDataUrl;
    if (source) {
      const image = `<image href="${escapeHtml(source)}" ${defaultPosition}/>`;
      svgMarkup += paintLogo(image);
    }
  } else if (!noLogo && ['fontawesome', 'thesvg'].includes(state.iconMode)) {
    const isFa = state.iconMode === 'fontawesome';
    const fillColor = showDisk ? logoColor : textColor;
    const slot = isFa ? '<!-- FA_ICON_SLOT -->' : '<!-- THESVG_ICON_SLOT -->';
    const request = isFa ? extractFontAwesomeSvg(parseFontAwesomeInput()) : extractSelectedTheSvg();
    pendingIcon = {
      slot,
      placeholder: `<text x="${svgNumber(iconX + logoSize / 2)}" y="${height / 2}" fill="${fillColor}" font-size="${logoSize}" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">?</text>`,
      request: request.then(icon => {
        if (!icon) return '';
        const image = isFa
          ? `<svg ${defaultPosition} viewBox="${escapeHtml(icon.viewBox)}" fill="${fillColor}"><path d="${escapeHtml(icon.pathData)}"/></svg>`
          : `<image ${defaultPosition} href="${icon}"/>`;
        return paintLogo(image);
      })
    };
    svgMarkup += `  ${slot}\n`;
  }

  if (!minimal && (topText || bottomText)) {
    const textStrokeAttr = useTextStroke
      ? ` stroke="${textStrokeColor}" stroke-width="${textStrokeWidth}" stroke-linejoin="round" paint-order="stroke fill"`
      : '';
    const inlineScale = inline && textNaturalWidth > availableTextWidth + 0.5
      ? Math.max(0.01, (availableTextWidth - labelGap) / (subtitleAdvance + titleAdvance)) : 1;
    const align = alignment === 'template' ? (noLogo ? 'center' : 'left') : alignment;
    const alignedOffset = space => align === 'right' ? space : align === 'center' ? space / 2 : 0;
    const inlineWidth = (subtitleAdvance + titleAdvance) * inlineScale + labelGap;
    const lineStart = textX + (inline ? alignedOffset(Math.max(0, availableTextWidth - inlineWidth)) : 0);
    const line = (value, measured, x, y, size, weight, color, gradient, id) => {
      if (!value) return '';
      const available = inline ? measured * inlineScale : availableTextWidth;
      const fit = measured > available + 0.5;
      const visibleWidth = fit ? available : measured;
      const left = inline ? x : x + alignedOffset(Math.max(0, availableTextWidth - visibleWidth));
      const length = fit ? ` textLength="${svgNumber(visibleWidth)}" lengthAdjust="spacingAndGlyphs"` : '';
      if (gradient) {
        const bounds = badgeTextBounds(value, left, y, size, weight, visibleWidth);
        svgMarkup += `<defs>${buildTextGradient(id, gradient, bounds)}</defs>\n`;
      }
      const fill = gradient ? `url(#${id})` : color;
      return `  <text x="${svgNumber(left)}" y="${y}" fill="${fill}"${textStrokeAttr} font-family="${BADGE_FONT}, sans-serif" font-size="${size}" font-weight="${weight}"${length}>${escapeHtml(value)}</text>\n`;
    };
    const titleX = inline ? lineStart + subtitleAdvance * inlineScale + labelGap : textX;
    const subtitle = line(topText, topMeasured, lineStart, layout.subtitleY, subtitleSize,
      BADGE_SUBTITLE_WEIGHT, subtitleColor, subtitleGradient, `badge-subtitle-grad-${styleName}`);
    const title = line(bottomText, bottomMeasured, titleX, layout.titleY, titleSize,
      BADGE_TITLE_WEIGHT, textColor, titleGradient, `badge-text-grad-${styleName}`);
    svgMarkup += `${BADGE_FONT_STYLE}\n<g filter="url(#${textFilterId})">\n${subtitle}${title}</g>\n`;
  }
  svgMarkup += '</svg>';

  if (!pendingIcon) return { preview: svgMarkup };
  const { slot, placeholder, request } = pendingIcon;
  return {
    preview: svgMarkup.replace(slot, () => placeholder),
    pending: request.then(icon => ({
      svg: svgMarkup.replace(slot, () => icon || placeholder),
      missingIcon: !icon
    }))
  };
}

async function downloadAllStyles() {
  const base = badgeFilename();
  try {
    const files = await Promise.all(BADGE_STYLES.map(async style => ({
      name: `${base}_${style}.svg`,
      contents: await getExportSvg(style)
    })));
    downloadFile(zipFiles(files), `${base}_styles.zip`, 'application/zip');
    showToast('Downloaded all four styles');
  } catch {
    showToast('Export failed. Please try again.', 'error');
  }
}

function openGitHubIssueModal() {
  document.getElementById('issue-badge-purpose').value = `A ${badgeTitle()} badge`;
  document.getElementById('github-issue-modal').showModal();
}

function closeGitHubIssueModal() {
  document.getElementById('github-issue-modal').close();
}

async function uploadBadgePreview(png, style) {
  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: 'Client-ID 546c25a59c58ad7',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({ image: png.split(',')[1], type: 'base64', title: `devin-badge-${style}` })
    });
    const result = await response.json();
    return response.ok && result.success ? result.data.link : '';
  } catch {
    return '';
  }
}

async function handleGitHubIssueSubmit(event) {
  event.preventDefault();
  const purpose = document.getElementById('issue-badge-purpose').value.trim();
  if (!purpose) {
    showToast('Enter a badge description.', 'error');
    return;
  }
  const popup = window.open('', '_blank');
  if (!popup) {
    showToast('Allow popups to open the GitHub issue form.', 'error');
    return;
  }
  popup.opener = null;
  popup.document.title = 'Preparing badge submission';
  popup.document.body.textContent = 'Preparing your badge previews…';
  closeGitHubIssueModal();
  showToast('Preparing badge previews…');
  const name = badgeTitle();
  const base = badgeFilename();
  const top = document.getElementById('top-text').value;
  const bottom = document.getElementById('bottom-text').value;
  const category = document.getElementById('issue-badge-category').value;
  const description = [purpose, top && `Top text: ${top}`, bottom && `Bottom text: ${bottom}`].filter(Boolean).join('\n\n');

  try {
    const files = await Promise.all(BADGE_STYLES.map(async style => {
      const svg = await getExportSvg(style);
      const png = await rasterizeSvg(svg);
      const url = await uploadBadgePreview(png, style);
      const bytes = Uint8Array.from(atob(png.split(',')[1]), char => char.charCodeAt(0));
      return { style, svg, bytes, url };
    }));
    const previews = files.filter(file => file.url)
      .map(({ style, url }) => `![${style} badge](${url})`).join('\n');
    const images = [previews, 'Attach the PNG and SVG files from the Badgeworks ZIP.'].filter(Boolean).join('\n\n');
    const attachments = files.flatMap(({ style, svg, bytes }) => [
      { name: `${base}_${style}.svg`, contents: svg },
      { name: `${base}_${style}.png`, contents: bytes }
    ]);
    downloadFile(zipFiles(attachments), `${base}_submission.zip`, 'application/zip');

    const details = [
      `Badge name: ${name}`, description, `Badge category: ${category}`,
      'Badge styles: cozy, cozy minimal, compact, compact minimal',
      'Content disclosure: Made using Badgeworks', images
    ].join('\n\n');
    try {
      await navigator.clipboard.writeText(details);
    } catch {
      fallbackCopyText(details);
    }

    const params = new URLSearchParams({
      template: 'new_badge.yml', title: `[NEW] ${name}`, badge_name: name,
      description, images
    });
    popup.location.replace(`https://github.com/intensed-dev/devinsbadges-customs/issues/new?${params}`);
    showToast(files.every(file => file.url)
      ? 'Issue form opened and badge files downloaded.'
      : 'Issue form opened. Attach the downloaded PNG and SVG files.', 'success', 4000);
  } catch {
    popup.close();
    showToast('Could not prepare the badge submission. Please try again.', 'error');
  }
}

function showToast(message, type = 'success', duration = 2200) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.replaceChildren(toast);
  setTimeout(() => toast.remove(), duration);
}

// Config field names stay compatible with existing Badgeworks exports.
const CONFIG_FIELDS = {
  textAlignment: 'text-alignment', logoGap: 'logo-gap', borderMode: 'border-mode', borderColor: 'border-color',
  borderWidth: 'border-width', borderOpacity: 'border-opacity',
  topText: 'top-text', bottomText: 'bottom-text', presetKey: 'preset-select',
  faPack: 'fa-pack-select', faIconName: 'fa-icon-name',
  thesvgSlug: 'thesvg-slug', thesvgVariant: 'thesvg-variant-select',
  showDisk: 'show-disk-toggle', diskColor: 'disk-color', logoColor: 'logo-color',
  textColor: 'text-color', radius: 'corner-radius', paddingRight: 'padding-horizontal',
  diskDiameter: 'disk-size-slider', userLogoScale: 'icon-scale-slider',
  useCustomLogoColor: 'custom-logo-color-toggle', useLogoGrad: 'logo-grad-toggle', useLogoStroke: 'logo-stroke-toggle',
  logoStrokeColor: 'logo-stroke-color', logoStrokeWidth: 'logo-stroke-width',
  useLogoStrokeGrad: 'logo-stroke-grad-toggle', useLogoShadow: 'logo-shadow-toggle',
  logoShadowColor: 'logo-shadow-color', logoShadowBlur: 'logo-shadow-blur',
  useTextGrad: 'text-grad-toggle', useSubtitleGrad: 'subtitle-grad-toggle',
  useTextStroke: 'text-stroke-toggle', textStrokeColor: 'text-stroke-color',
  textStrokeWidth: 'text-stroke-width', subtitleColor: 'subtitle-color',
  useTextShadow: 'text-shadow-toggle', textShadowColor: 'text-shadow-color',
  textShadowBlur: 'text-shadow-blur'
};
const CONFIG_STATE = [
  'style', 'iconMode', 'logoPosition', 'officialBadge', 'customizedBadge', 'customizedBaseline', 'uploadedDataUrl',
  'uploadFilename', 'rawSvgDataUrl', 'bgStops', 'bgGradPreset', 'textGradients'
];
const ICON_MODES = ['preset', 'fontawesome', 'thesvg', 'upload', 'raw'];
const LOGO_POSITIONS = ['left', 'right', 'none'];
const isHexColor = value => typeof value === 'string' && /^#[a-f\d]{6}$/i.test(value);

function getBadgeConfig() {
  const config = { version: '3.3' };
  for (const key of CONFIG_STATE) config[key] = state[key];
  for (const [key, id] of Object.entries(CONFIG_FIELDS)) {
    const input = document.getElementById(id);
    config[key] = input.type === 'checkbox' ? input.checked
      : input.type === 'range' ? input.valueAsNumber : input.value;
  }
  return config;
}

function applyBadgeConfig(config, render = true) {
  config = {
    textAlignment: 'template', logoGap: '', borderMode: 'template',
    borderColor: '#ffffff', borderWidth: '2.1', borderOpacity: '100',
    ...config
  };
  uploadRevision++;
  state.officialBadge = Object.hasOwn(DEVINS_BADGES, config.officialBadge) ? config.officialBadge : '';
  state.customizedBadge = Object.hasOwn(DEVINS_BADGES, config.customizedBadge) && Array.isArray(config.customizedBaseline?.bgStops)
    ? config.customizedBadge : '';
  state.customizedBaseline = state.customizedBadge ? config.customizedBaseline : null;
  for (const [key, id] of Object.entries(CONFIG_FIELDS)) {
    const value = key === 'presetKey' ? migratePresetIcon(config[key]) : config[key];
    const input = document.getElementById(id);
    if (input.type === 'checkbox') {
      if (typeof value === 'boolean') input.checked = value;
    } else if (input.type === 'range') {
      if (Number.isFinite(value) || (typeof value === 'string' && value.trim() && Number.isFinite(Number(value)))) {
        input.value = value;
      }
    } else if (input.type === 'color') {
      if (isHexColor(value)) input.value = value;
    } else if (typeof value === 'string') {
      if (input.tagName === 'SELECT' && !Array.from(input.options).some(option => option.value === value)) continue;
      input.value = value;
    }
  }
  if (config.faIconName === undefined && typeof config.faIconInput === 'string') parseFontAwesomeInput(config.faIconInput);
  if (typeof config.thesvgVariant === 'string') refreshTheSvgVariantOptions(config.thesvgVariant);
  if (typeof config.uploadedDataUrl === 'string') {
    state.uploadedDataUrl = imageDataPattern.test(config.uploadedDataUrl) ? config.uploadedDataUrl : '';
    state.uploadFilename = typeof config.uploadFilename === 'string' ? config.uploadFilename : '';
    syncUploadPreview();
  }
  if (typeof config.rawSvgDataUrl === 'string') {
    const input = document.getElementById('raw-svg-code');
    const data = /^data:image\/svg\+xml((?:;[^,]*)?),(.*)$/is.exec(config.rawSvgDataUrl);
    try {
      input.value = data ? (data[1].includes(';base64')
        ? new TextDecoder().decode(Uint8Array.from(atob(data[2]), char => char.charCodeAt(0)))
        : decodeURIComponent(data[2])) : '';
    } catch {
      input.value = '';
    }
    updateRawSvg();
  }
  const stops = Array.isArray(config.bgStops) ? config.bgStops
    : [config.bgColorTop, config.bgColorBottom];
  if (stops.length >= 2 && stops.every(isHexColor)) {
    state.bgStops = stops.slice(0, BG_GRADIENT_MAX_STOPS);
  }
  const gradient = config.bgGradPreset;
  const presetStops = typeof gradient === 'string' && Object.hasOwn(BG_GRADIENT_PRESETS, gradient)
    ? BG_GRADIENT_PRESETS[gradient] : null;
  const matchingGradient = presetStops?.length === state.bgStops.length
    && presetStops.every((color, index) => color.toLowerCase() === state.bgStops[index].toLowerCase());
  setBgGradPresetSelect(matchingGradient ? gradient : 'custom');
  renderBgStopEditor();
  restoreTextGradients(config);

  setStyle(BADGE_STYLES.includes(config.style) ? config.style : state.style, false);
  setLogoPosition(LOGO_POSITIONS.includes(config.logoPosition) ? config.logoPosition : state.logoPosition, false);
  setIconMode(ICON_MODES.includes(config.iconMode) ? config.iconMode : state.iconMode, false);
  if (render) renderBadge();
}

function isValidBadgeConfig(config) {
  return config && typeof config === 'object' && !Array.isArray(config)
    && [...CONFIG_STATE, ...Object.keys(CONFIG_FIELDS), 'faIconInput', 'bgColorTop', 'bgColorBottom', 'textGradTop', 'textGradBot', 'logoStrokeGradTop', 'logoStrokeGradBot']
      .some(key => Object.hasOwn(config, key));
}

function saveConfigToLocalStorage() {
  try {
    const config = getBadgeConfig();
    localStorage.setItem('devin_badge_config', JSON.stringify(config));
    showToast('Saved preset to browser memory!');
  } catch (err) {
    if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
      showToast('Save failed — image too large for browser memory. Use a smaller logo or Export JSON.', 'error');
    } else {
      showToast('Failed to save config!', 'error');
    }
  }
}

function loadConfigFromLocalStorage() {
  try {
    const raw = localStorage.getItem('devin_badge_config');
    if (!raw) {
      showToast('No saved preset found in browser memory!', 'error');
      return;
    }
    const config = JSON.parse(raw);
    if (!isValidBadgeConfig(config)) {
      showToast('Invalid saved config format!', 'error');
      return;
    }
    applyBadgeConfig(config);
    showToast('Loaded preset from browser memory!');
  } catch {
    showToast('Failed to load saved config!', 'error');
  }
}

function exportConfigJSON() {
  try {
    downloadFile(JSON.stringify(getBadgeConfig(), null, 2), 'devin_badge_config.json', 'application/json');
    showToast('Downloaded Badgeworks settings');
  } catch {
    showToast('JSON export failed.', 'error');
  }
}

let importRevision = 0;
async function importConfigJSON(event) {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  const revision = ++importRevision;
  try {
    const config = JSON.parse(await file.text());
    if (revision !== importRevision) return;
    if (!isValidBadgeConfig(config)) throw new Error('Invalid Badgeworks config');
    applyBadgeConfig(config);
    showToast('Imported Badgeworks settings');
  } catch {
    if (revision === importRevision) showToast('Choose a valid Badgeworks JSON file.', 'error');
  }
}

// Close issue modal on backdrop click
const issueModal = document.getElementById('github-issue-modal');
if (issueModal) {
  issueModal.addEventListener('click', (e) => {
    const rect = issueModal.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) closeGitHubIssueModal();
  });
}
