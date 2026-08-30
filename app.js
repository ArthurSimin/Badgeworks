/* ==========================================================================
   BADGEWORKS - APPLICATION LOGIC
   ========================================================================== */
// Shared pure rendering core (loaded from badge-core.js - see index.html).
// All badge geometry and brand data live in BadgeCore; this file is DOM/UI glue.
const BadgeCore = window.BadgeCore;
const OFFICIAL_BRAND_ICONS = BadgeCore.OFFICIAL_BRAND_ICONS;
const BG_GRADIENT_PRESETS = BadgeCore.BG_GRADIENT_PRESETS;
const BG_GRADIENT_MAX_STOPS = BadgeCore.BG_GRADIENT_MAX_STOPS;
const FA_PACK_TOKENS = BadgeCore.FA_PACK_TOKENS;
const parseFaClass = BadgeCore.parseFaClass;
const escapeHtml = BadgeCore.escapeHtml;
const buildLogoFxFilter = BadgeCore.buildLogoFxFilter;


// Application State
const state = {
  style: 'cozy', // 'cozy' | 'compact' | 'cozy-minimal' | 'compact-minimal'
  topText: 'Available on',
  bottomText: 'GitHub',
  iconMode: 'preset', // 'preset' | 'fontawesome' | 'upload' | 'raw'
  logoPosition: 'left', // 'left' | 'right' | 'none'
  presetKey: 'github',
  uploadedDataUrl: '', // base64 DataURL for PNG/JPG/SVG
  isUploadedSvg: false,
  uploadFilename: '',
  customSvgContent: '',
  showDisk: false, // Default to FALSE for pure standalone logos!
  diskColor: '#ffffff',
  logoColor: '#0f141c',
  bgStops: ['#181f29', '#0f131a'], // background gradient stops (2–7)
  bgGradPreset: 'custom', // name of the currently-applied gradient preset ('custom' = manual)
  textColor: '#ffffff',
  radius: 8,
  paddingRight: 8,
  codeTab: 'md' // 'md' | 'html' | 'svg'
};


// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  // Apply the default preset's preferred icon-size slider before the first render
  applyIconScaleDefault(document.getElementById('preset-select').value);

  // Build the background gradient stop editor
  renderBgStopEditor();

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

  // Wait for fonts to load before initial render
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      renderBadge();
    });
  } else {
    // Fallback if Font Loading API is not available
    setTimeout(renderBadge, 100);
  }
});

// Apply a preset's preferred icon-size slider default (github/python/react default to 41 so the
// cropped glyph matches its pre-crop size). Presets without `defaultScale` leave the slider alone.
function applyIconScaleDefault(presetKey) {
  const info = OFFICIAL_BRAND_ICONS[presetKey];
  if (info && info.defaultScale) {
    const slider = document.getElementById('icon-scale-slider');
    if (slider) slider.value = String(info.defaultScale);
    const label = document.getElementById('icon-scale-num');
    if (label) label.innerText = `${info.defaultScale}px`;
  }
}

// Preset dropdown change handler
function onPresetSelect() {
  applyIconScaleDefault(document.getElementById('preset-select').value);
  renderBadge();
}

// Set Active Style Variant
function setStyle(styleName) {
  state.style = styleName;
  document.querySelectorAll('.style-option').forEach(card => {
    card.classList.toggle('active', card.dataset.style === styleName);
  });
  renderBadge();
}

// Icon Input Mode Switcher
function setIconMode(mode) {
  state.iconMode = mode;
  document.getElementById('seg-preset').classList.toggle('active', mode === 'preset');
  document.getElementById('seg-fontawesome').classList.toggle('active', mode === 'fontawesome');
  document.getElementById('seg-upload').classList.toggle('active', mode === 'upload');
  document.getElementById('seg-raw').classList.toggle('active', mode === 'raw');

  document.getElementById('icon-mode-preset').style.display = mode === 'preset' ? 'block' : 'none';
  document.getElementById('icon-mode-fontawesome').style.display = mode === 'fontawesome' ? 'block' : 'none';
  document.getElementById('icon-mode-upload').style.display = mode === 'upload' ? 'block' : 'none';
  document.getElementById('icon-mode-raw').style.display = mode === 'raw' ? 'block' : 'none';

  // Update FontAwesome preview
  if (mode === 'fontawesome') {
    updateFontAwesomePreview();
  }

  renderBadge();
}

// Logo Position Switcher (left / right / none)
function setLogoPosition(pos) {
  state.logoPosition = pos;
  document.getElementById('seg-pos-left').classList.toggle('active', pos === 'left');
  document.getElementById('seg-pos-right').classList.toggle('active', pos === 'right');
  document.getElementById('seg-pos-none').classList.toggle('active', pos === 'none');
  renderBadge();
}


// Parse FA input from pack dropdown + name input, or from explicit raw string / pasted HTML
function parseFontAwesomeInput(raw) {
  const packSelect = document.getElementById('fa-pack-select');
  const nameInput = document.getElementById('fa-icon-name');
  
  let rawStr = typeof raw === 'string' ? raw : (nameInput ? nameInput.value : 'github');
  if (!rawStr) rawStr = '';

  const tagMatch = rawStr.match(/<i[^>]+class=["']([^"']+)["']/i);
  const classStr = tagMatch ? tagMatch[1].trim() : rawStr.trim();

  if (classStr.includes(' ')) {
    const { packFull, name } = parseFaClass(classStr);
    const cleanName = name || 'github';
    if (packSelect) {
      const opts = packSelect.options;
      const hasOption = !opts || opts.length === 0 || Array.from(opts).some(opt => opt.value === packFull);
      packSelect.value = hasOption ? packFull : (packSelect.value || 'fa-solid');
    }
    if (nameInput && nameInput.value !== cleanName) nameInput.value = cleanName;
    return `${packSelect ? packSelect.value : packFull} fa-${cleanName}`;
  }

  const pack = packSelect ? packSelect.value : 'fa-brands';
  let cleanName = classStr.replace(/^fa-/, '').trim();
  if (nameInput && nameInput.value !== cleanName && cleanName !== '') {
    nameInput.value = cleanName;
  }
  if (!cleanName) cleanName = 'github';
  return `${pack} fa-${cleanName}`;
}

function updateFontAwesomePreview() {
  const iconClass = parseFontAwesomeInput();
  const faPreview = document.getElementById('fa-preview');
  if (!faPreview) return;

  const iconElement = faPreview.querySelector('i');
  if (iconElement) iconElement.className = iconClass;
}

// FA CDN fetch cache
const faIconCache = new Map();

// Fetch the real SVG from the FontAwesome free CDN and extract path + viewBox
function extractFontAwesomeSvg(iconClass) {
  const { style, name } = parseFaClass(iconClass);
  if (!name) return Promise.resolve(null);

  const cacheKey = `${style}:${name}`;
  if (faIconCache.has(cacheKey)) return Promise.resolve(faIconCache.get(cacheKey));

  // Map style to CDN folder
  const folder = style === 'brands' ? 'brands' : style === 'regular' ? 'regular' : 'solid';
  const url = `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/${folder}/${name}.svg`;

  return fetch(url)
    .then(r => r.ok ? r.text() : null)
    .then(svgText => {
      if (!svgText) { faIconCache.set(cacheKey, null); return null; }
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (!svgEl) { faIconCache.set(cacheKey, null); return null; }
      const viewBox = svgEl.getAttribute('viewBox') || '0 0 512 512';
      const pathData = Array.from(svgEl.querySelectorAll('path'))
        .map(p => p.getAttribute('d')).filter(Boolean).join(' ');
      const result = pathData ? { viewBox, pathData } : null;
      faIconCache.set(cacheKey, result);
      return result;
    })
    .catch(() => { faIconCache.set(cacheKey, null); return null; });
}

// Listen for FontAwesome input changes to update preview
document.addEventListener('DOMContentLoaded', () => {
  const faNameInput = document.getElementById('fa-icon-name');
  const faPackSelect = document.getElementById('fa-pack-select');
  const onFaChange = () => {
    updateFontAwesomePreview();
    renderBadge();
  };
  if (faNameInput) faNameInput.addEventListener('input', onFaChange);
  if (faPackSelect) faPackSelect.addEventListener('change', onFaChange);
});

// Handle File Upload (PNG, JPG, SVG)
function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  processUploadedFile(file);
}

function processUploadedFile(file) {
  const reader = new FileReader();

  if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
    state.isUploadedSvg = true;
    reader.onload = (evt) => {
      const textContent = evt.target.result;
      state.customSvgContent = parseSvgPathContent(textContent);
      
      // Convert SVG text content into Base64 DataURL for <image> and <img> preview compatibility
      const svgBlob = new Blob([textContent], { type: 'image/svg+xml;charset=utf-8' });
      const blobReader = new FileReader();
      blobReader.onload = (e2) => {
        state.uploadedDataUrl = e2.target.result;
        showUploadPreview(file.name, e2.target.result);
        renderBadge();
      };
      blobReader.readAsDataURL(svgBlob);
    };
    reader.readAsText(file);
  } else {
    // Raster image (PNG, JPG, WebP)
    state.isUploadedSvg = false;
    reader.onload = (evt) => {
      state.uploadedDataUrl = evt.target.result; // DataURL
      showUploadPreview(file.name, evt.target.result);
      renderBadge();
    };
    reader.readAsDataURL(file);
  }
}

function showUploadPreview(filename, dataUrl) {
  state.uploadFilename = filename;
  document.getElementById('upload-preview-bar').style.display = 'flex';
  document.getElementById('upload-filename').innerText = filename;
  document.getElementById('upload-thumb').src = dataUrl;
  document.getElementById('upload-status-text').innerText = `Uploaded: ${filename}`;
}

function clearUpload() {
  state.uploadedDataUrl = '';
  state.rawSvgDataUrl = '';
  state.customSvgContent = '';
  state.uploadFilename = '';
  document.getElementById('upload-preview-bar').style.display = 'none';
  document.getElementById('upload-status-text').innerText = 'Click to upload PNG, JPG, or SVG logo';
  document.getElementById('file-input').value = '';
  renderBadge();
}

// Parse SVG content to extract inner paths
function parseSvgPathContent(svgStr) {
  if (!svgStr) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgStr, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return '';
  return svg.innerHTML;
}

function handleRawSvgChange() {
  const val = document.getElementById('raw-svg-code').value.trim();
  state.customSvgContent = parseSvgPathContent(val);
  if (val) {
    state.rawSvgDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(val);
  } else {
    state.rawSvgDataUrl = '';
  }
  renderBadge();
}

// Quick Preset Applier with Authentic Dual-Color Palettes
function applyPreset(type) {
  const presets = {
    github: { top: 'Available on', bottom: 'GitHub', icon: 'github' },
    discord: { top: 'Join our', bottom: 'Discord', icon: 'discord' },
    python: { top: 'Built with', bottom: 'Python', icon: 'python' },
    react: { top: 'Powered by', bottom: 'React', icon: 'react' },
    vscode: { top: 'Get for', bottom: 'VS Code', icon: 'vscode' },
    pypi: { top: 'Package on', bottom: 'PyPI', icon: 'pypi' }
  };

  const p = presets[type];
  if (!p) return;

  const brandInfo = OFFICIAL_BRAND_ICONS[p.icon];
  document.getElementById('top-text').value = p.top;
  document.getElementById('bottom-text').value = p.bottom;
  document.getElementById('preset-select').value = p.icon;
  applyIconScaleDefault(p.icon);
  if (brandInfo) {
    state.bgStops = [brandInfo.bgTop || '#181f29', brandInfo.bgBot || '#0f131a'];
    setBgGradPresetSelect('custom');
    renderBgStopEditor();
  }

  state.iconMode = 'preset';
  setIconMode('preset');
  renderBadge();
}

// Text measurement cache to prevent flickering
const textMeasurementCache = new Map();

// Accurately measure text width using Canvas API
function measureText(text, fontSpec) {
  if (!text) return 0;
  
  // Check cache first
  const cacheKey = `${text}|${fontSpec}`;
  if (textMeasurementCache.has(cacheKey)) {
    return textMeasurementCache.get(cacheKey);
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = fontSpec;
  const width = ctx.measureText(text).width;
  // Always round up to prevent flickering
  const roundedWidth = Math.ceil(width);
  
  // Cache the measurement
  textMeasurementCache.set(cacheKey, roundedWidth);
  
  return roundedWidth;
}

// Incremented on every render; lets async FontAwesome swaps detect (and skip) stale renders
let renderToken = 0;


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

    const hexLabel = document.createElement('span');
    hexLabel.className = 'bg-stop-hex';
    hexLabel.innerText = hex;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'bg-stop-remove';
    removeBtn.title = 'Remove stop';
    removeBtn.innerHTML = '&times;';
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
  dep(document.getElementById('text-grad-toggle')?.checked || false, ['text-grad-top', 'text-grad-bot']);
  dep(document.getElementById('text-stroke-toggle')?.checked || false, ['text-stroke-color', 'text-stroke-width']);
  dep(document.getElementById('text-shadow-toggle')?.checked || false, ['text-shadow-color', 'text-shadow-blur']);
  dep(document.getElementById('show-disk-toggle')?.checked || false, ['disk-color', 'disk-size-slider']);
  dep(document.getElementById('custom-logo-color-toggle')?.checked || false, ['logo-color']);
  dep(document.getElementById('logo-stroke-toggle')?.checked || false, ['logo-stroke-color', 'logo-stroke-width']);
  dep(document.getElementById('logo-shadow-toggle')?.checked || false, ['logo-shadow-color', 'logo-shadow-blur']);
  // The icon-size slider only drives scalable preset icons (e.g. github/python/react/rust).
  const scalablePreset = state.iconMode === 'preset'
    && (OFFICIAL_BRAND_ICONS[document.getElementById('preset-select')?.value]?.scalable === true);
  const slider = document.getElementById('icon-scale-slider');
  if (slider) {
    slider.disabled = !scalablePreset;
    slider.classList.toggle('fx-dim', !scalablePreset);
  }
}


// Main Render Logic
function renderBadge() {
  const token = ++renderToken;
  updateColorHexes();
  syncDependentControls();

  // Read form inputs for the UI labels/swatches
  const diskDiameter = parseInt(document.getElementById('disk-size-slider').value) || 40;
  const userLogoScale = parseInt(document.getElementById('icon-scale-slider').value) || 34;
  const textColor = document.getElementById('text-color').value;
  const radius = parseInt(document.getElementById('corner-radius').value);
  const paddingRight = parseInt(document.getElementById('padding-horizontal').value);
  const textStrokeWidth = document.getElementById('text-stroke-width')?.value || '1.5';
  const textShadowBlur = parseFloat(document.getElementById('text-shadow-blur')?.value || '2');
  const logoStrokeWidth = document.getElementById('logo-stroke-width')?.value || '2';
  const logoShadowBlur = parseFloat(document.getElementById('logo-shadow-blur')?.value || '2');

  // Update slider displays & hex swatches safely
  if (document.getElementById('disk-size-num')) document.getElementById('disk-size-num').innerText = `${diskDiameter}px`;
  if (document.getElementById('icon-scale-num')) document.getElementById('icon-scale-num').innerText = `${userLogoScale}px`;
  if (document.getElementById('text-hex')) document.getElementById('text-hex').innerText = textColor;
  if (document.getElementById('radius-val')) document.getElementById('radius-val').innerText = `${radius}px`;
  if (document.getElementById('padding-val')) document.getElementById('padding-val').innerText = `${paddingRight}px`;
  if (document.getElementById('text-stroke-val')) document.getElementById('text-stroke-val').innerText = `${textStrokeWidth}px`;
  if (document.getElementById('text-shadow-val')) document.getElementById('text-shadow-val').innerText = `${textShadowBlur}px`;
  if (document.getElementById('logo-stroke-val')) document.getElementById('logo-stroke-val').innerText = `${logoStrokeWidth}px`;
  if (document.getElementById('logo-shadow-val')) document.getElementById('logo-shadow-val').innerText = `${logoShadowBlur}px`;

  const cfg = getBadgeConfig();
  const styleName = state.style;
  const result = BadgeCore.buildBadgeSvg(cfg, styleName, null, measureText, { faSlot: true });

  const commit = (svgMarkup, w, h) => {
    document.getElementById('badge-stage').innerHTML = svgMarkup;
    document.getElementById('badge-size-display').innerText = `${w} × ${h} px`;
    updateSnippetOutput(svgMarkup, cfg.bottomText || 'Badge');
  };

  if (cfg.iconMode === 'fontawesome') {
    // Placeholder swap: build a temporary "?" glyph into the FA_ICON_SLOT, then swap in the
    // real icon once the CDN path data arrives (keeps the preview responsive).
    let withPlaceholder = result.svg;
    if (result.faPlaceholder) {
      const p = result.faPlaceholder;
      const placeholderIcon = `<text x="${Math.round(p.x + p.size / 2)}" y="${Math.round(p.height / 2)}" fill="#ffffff" font-size="${p.size}" font-family="'Dosis', 'Inter', sans-serif" font-weight="600" text-anchor="middle" dominant-baseline="central" dy="-0.05em">?</text>`;
      withPlaceholder = result.svg.replace('<!-- FA_ICON_SLOT -->', placeholderIcon);
    }
    commit(withPlaceholder, result.width, result.height);

    // Async: fetch real icon and re-render with the same engine (stale renders are skipped)
    extractFontAwesomeSvg(parseFontAwesomeInput()).then((fa) => {
      if (token !== renderToken) return; // Stale render — a newer one superseded this
      if (!fa) return; // Leave the placeholder if icon not found
      const finalResult = BadgeCore.buildBadgeSvg(getBadgeConfig(), styleName, fa, measureText, {});
      commit(finalResult.svg, finalResult.width, finalResult.height);
    });
    return;
  }

  commit(result.svg, result.width, result.height);
}
function setCodeTab(tab) {
  state.codeTab = tab;
  document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`codetab-${tab}`).classList.add('active');

  const svgMarkup = document.getElementById('badge-stage').innerHTML;
  const title = document.getElementById('bottom-text').value || 'Badge';
  updateSnippetOutput(svgMarkup, title);
}

function updateSnippetOutput(svgMarkup, title) {
  const output = document.getElementById('snippet-output');
  if (!output) return;

  if (state.codeTab === 'md') {
    output.innerText = `![${title}](devin_badge.svg)`;
  } else if (state.codeTab === 'html') {
    output.innerText = `<img src="devin_badge.svg" alt="${title}" />`;
  } else if (state.codeTab === 'svg') {
    output.innerText = svgMarkup;
  }
}

function copyCode() {
  const code = document.getElementById('snippet-output').innerText;
  navigator.clipboard.writeText(code);
  showToast('Copied code snippet to clipboard!');
}

// Build the export-ready SVG for the current style, resolving the FontAwesome icon (if in FA
// mode) so exports never contain the async placeholder or a bare FA_ICON_SLOT comment.
function getExportSvg() {
  if (state.iconMode === 'fontawesome') {
    const faClass = parseFontAwesomeInput();
    return extractFontAwesomeSvg(faClass).then((fa) => generateBadgeForStyle(state.style, fa));
  }
  return Promise.resolve(generateBadgeForStyle(state.style));
}

function downloadSVG() {
  getExportSvg().then((svgMarkup) => {
    const title = (document.getElementById('bottom-text').value || 'badge').toLowerCase().replace(/\s+/g, '_');

    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devin_${title}_badge.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded SVG vector badge!');
  });
}

function downloadPNG() {
  getExportSvg().then((svgMarkup) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      showToast('PNG export failed — try Download SVG instead.');
      return;
    }

    const title = (document.getElementById('bottom-text').value || 'badge').toLowerCase().replace(/\s+/g, '_');
    const width = parseInt(svgElement.getAttribute('width'));
    const height = parseInt(svgElement.getAttribute('height'));
    const scale = 3;

    // Clone and fix up SVG for canvas rendering
    const svgClone = svgElement.cloneNode(true);
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Inject Google Fonts stylesheet so text renders correctly in canvas
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`;
    svgClone.insertBefore(styleEl, svgClone.firstChild);

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `devin_${title}_badge.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloaded high-res PNG badge!');
    };
    img.onerror = () => {
      showToast('PNG export failed — try Download SVG instead.');
    };
    img.src = svgDataUrl;
  });
}

// Helper function to generate badge SVG for a specific style.
// `faIcon` (optional) is a resolved FontAwesome icon ({ viewBox, pathData }) so exports can embed
// the real icon synchronously instead of leaving a bare FA_ICON_SLOT comment.
// All badge geometry comes from BadgeCore.buildBadgeSvg (shared with the API server).
function generateBadgeForStyle(styleName, faIcon) {
  const result = BadgeCore.buildBadgeSvg(getBadgeConfig(), styleName, faIcon || null, measureText, {});
  return result.svg;
}
function downloadAllStyles() {
  const title = (document.getElementById('bottom-text').value || 'badge').toLowerCase().replace(/\s+/g, '_');
  const styles = ['cozy', 'compact', 'cozy-minimal', 'compact-minimal'];

  // Resolve the FontAwesome icon (if in FA mode) so every style exports with the real icon
  const faPromise = state.iconMode === 'fontawesome'
    ? extractFontAwesomeSvg(parseFontAwesomeInput())
    : Promise.resolve(null);

  faPromise.then((faIcon) => {
    let downloadCount = 0;

    styles.forEach((styleName, index) => {
      setTimeout(() => {
        const svgMarkup = generateBadgeForStyle(styleName, faIcon);
        const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `devin_${title}_${styleName}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        downloadCount++;
        if (downloadCount === styles.length) {
          showToast('Downloaded all 4 badge styles!');
        }
      }, index * 200); // Stagger downloads by 200ms
    });
  });
}

function createGitHubIssue() {
  const topText    = document.getElementById('top-text').value   || '';
  const bottomText = document.getElementById('bottom-text').value || '';

  const badgePurpose = prompt(
    'What is the badge for?\n(This will be filled into the issue)',
    bottomText ? `A "${bottomText}" badge` : ''
  );
  if (badgePurpose === null) return;

  showToast('Uploading badge previews… please wait.');

  // Resolve the FA icon SVG if in fontawesome mode, then kick off the rest
  let faIconPromise = Promise.resolve(null);
  if (state.iconMode === 'fontawesome') {
    const faClass = parseFontAwesomeInput();
    faIconPromise = extractFontAwesomeSvg(faClass);
  }

  faIconPromise.then((faIcon) => {
    // Build "preferred icons/text" section
    let iconDescription = '';
    if (state.logoPosition === 'none') {
      iconDescription = 'No logo — text only';
    } else if (state.iconMode === 'preset') {
      const presetKey = document.getElementById('preset-select').value;
      iconDescription = `Preset icon: **${presetKey}**`;
    } else if (state.iconMode === 'fontawesome') {
      const faClass = parseFontAwesomeInput();
      const { name } = parseFaClass(faClass);
      const faUrl = `https://fontawesome.com/icons/${name}`;
      if (faIcon) {
        // Embed the actual SVG so the maintainer has everything they need
        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${faIcon.viewBox}"><path d="${faIcon.pathData}"/></svg>`;
        iconDescription = `FontAwesome icon: [\`${faClass}\`](${faUrl})\n\n\`\`\`xml\n${iconSvg}\n\`\`\``;
      } else {
        iconDescription = `FontAwesome icon: [\`${faClass}\`](${faUrl})`;
      }
    } else if (state.iconMode === 'raw') {
      const rawSvg = document.getElementById('raw-svg-code')?.value?.trim() || '';
      iconDescription = rawSvg ? `Custom SVG icon:\n\`\`\`xml\n${rawSvg}\n\`\`\`` : 'Custom SVG icon';
    } else {
      // Upload mode — only SVGs are useful to the maintainer
      if (!state.isUploadedSvg) {
        showToast('Please use an SVG icon — PNG/JPG uploads cannot be used by the badge maintainer.');
        return;
      }
      // Reconstruct the SVG from the parsed content we already have
      const svgContent = state.customSvgContent || '';
      iconDescription = svgContent
        ? `Custom uploaded SVG icon:\n\`\`\`xml\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n${svgContent}\n</svg>\n\`\`\``
        : 'Custom uploaded SVG icon (see badge examples below)';
    }

    const textLines = [
      topText    ? `Top text: **${topText}**`       : '',
      bottomText ? `Bottom text: **${bottomText}**` : ''
    ].filter(Boolean).join('\n');

    const iconsAndText = [iconDescription, textLines].filter(Boolean).join('\n\n');

    // Generate SVG for each style, embedding the resolved FA icon (if in FA mode)
    function getResolvedSvg(styleName) {
      return Promise.resolve(generateBadgeForStyle(styleName, faIcon));
    }

    // Render one resolved SVG to a PNG base64 string via canvas
    function svgToPngBase64(svgString, w, h) {
      return new Promise((resolve) => {
        const scale = 3;
        const canvas = document.createElement('canvas');
        canvas.width  = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        const img = new Image();
        const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png').split(',')[1]);
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    }

    // Upload a base64 PNG to Imgur anonymously
    function uploadToImgur(base64png, title) {
      return fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 546c25a59c58ad7',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64png, type: 'base64', title })
      })
      .then(r => r.json())
      .then(data => data.success ? data.data.link : null)
      .catch(() => null);
    }

    const styleList = ['cozy', 'compact', 'cozy-minimal', 'compact-minimal'];

    Promise.all(styleList.map(async (s) => {
      const svg = await getResolvedSvg(s);
      const wMatch = svg.match(/width="(\d+)"/);
      const hMatch = svg.match(/height="(\d+)"/);
      const w = wMatch ? parseInt(wMatch[1]) : 200;
      const h = hMatch ? parseInt(hMatch[1]) : 64;
      const base64png = await svgToPngBase64(svg, w, h);
      if (!base64png) return { style: s, url: null };
      const url = await uploadToImgur(base64png, `devin-badge-${s}`);
      return { style: s, url };
    })).then((results) => {
      const exampleLines = results.map(({ style, url }) =>
        url ? `**${style}**\n![${style} badge](${url})` : `**${style}**\n*(upload failed)*`
      ).join('\n\n');

      const body =
`**What is the badge for?**
${badgePurpose}

**Provide any preferred icons/text (icons must be SVG)**
${iconsAndText}

**Example if needed**
${exampleLines}

---
**This issue is made automatically by Badgeworks, so unfortunately no labels and wrong Issue Template :[**`;

      navigator.clipboard.writeText(body)
        .then(() => showToast('Done! Body copied — paste it into the issue form.'))
        .catch(() => showToast('Uploaded! But clipboard failed — copy the body manually.'));

      const title = encodeURIComponent(`${bottomText || badgePurpose} [NEW]`);
      const url = `https://github.com/intensed-dev/devinsbadges-customs/issues/new?template=new-badge.md&title=${title}`;
      window.open(url, '_blank');
    });
  });
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${msg}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, 2200);
}

// Save & Load Configuration Functions
function getBadgeConfig() {
  return {
    version: '3.0',
    style: state.style,
    topText: document.getElementById('top-text')?.value || '',
    bottomText: document.getElementById('bottom-text')?.value || '',
    iconMode: state.iconMode,
    logoPosition: state.logoPosition,
    presetKey: document.getElementById('preset-select')?.value || 'github',
    uploadedDataUrl: state.uploadedDataUrl || '',
    rawSvgDataUrl: state.rawSvgDataUrl || '',
    customSvgContent: state.customSvgContent || '',
    isUploadedSvg: state.isUploadedSvg,
    uploadFilename: state.uploadFilename || '',
    faPack: document.getElementById('fa-pack-select')?.value || 'fa-brands',
    faIconName: document.getElementById('fa-icon-name')?.value || 'github',
    faIconInput: parseFontAwesomeInput(),
    showDisk: document.getElementById('show-disk-toggle')?.checked || false,
    diskColor: document.getElementById('disk-color')?.value || '#ffffff',
    logoColor: document.getElementById('logo-color')?.value || '#ffffff',
    bgStops: state.bgStops && state.bgStops.length >= 2 ? state.bgStops.slice() : ['#181f29', '#0f131a'],
    bgGradPreset: state.bgGradPreset || 'custom',
    bgColorTop: (state.bgStops && state.bgStops[0]) || '#181f29',
    bgColorBottom: (state.bgStops && state.bgStops[state.bgStops.length - 1]) || '#0f131a',
    textColor: document.getElementById('text-color')?.value || '#ffffff',
    radius: parseInt(document.getElementById('corner-radius')?.value || '8'),
    paddingRight: parseInt(document.getElementById('padding-horizontal')?.value || '16'),
    diskDiameter: parseInt(document.getElementById('disk-size-slider')?.value || '40'),
    userLogoScale: parseInt(document.getElementById('icon-scale-slider')?.value || '34'),
    useCustomLogoColor: document.getElementById('custom-logo-color-toggle')?.checked || false,
    useLogoStroke: document.getElementById('logo-stroke-toggle')?.checked || false,
    logoStrokeColor: document.getElementById('logo-stroke-color')?.value || '#ffffff',
    logoStrokeWidth: parseFloat(document.getElementById('logo-stroke-width')?.value || '2'),
    useLogoShadow: document.getElementById('logo-shadow-toggle')?.checked || false,
    logoShadowColor: document.getElementById('logo-shadow-color')?.value || '#000000',
    logoShadowBlur: parseFloat(document.getElementById('logo-shadow-blur')?.value || '2'),
    useTextGrad: document.getElementById('text-grad-toggle')?.checked || false,
    textGradTop: document.getElementById('text-grad-top')?.value || '#61DAFB',
    textGradBot: document.getElementById('text-grad-bot')?.value || '#FFFFFF',
    useTextStroke: document.getElementById('text-stroke-toggle')?.checked || false,
    textStrokeColor: document.getElementById('text-stroke-color')?.value || '#000000',
    textStrokeWidth: parseFloat(document.getElementById('text-stroke-width')?.value || '1.5'),
    subtitleColor: document.getElementById('subtitle-color')?.value || '#e0e0e0',
    useTextShadow: document.getElementById('text-shadow-toggle')?.checked || false,
    textShadowColor: document.getElementById('text-shadow-color')?.value || '#000000',
    textShadowBlur: parseFloat(document.getElementById('text-shadow-blur')?.value || '2')
  };
}

function applyBadgeConfig(cfg) {
  if (!cfg) return;

  if (cfg.style) setStyle(cfg.style);
  if (cfg.topText !== undefined && document.getElementById('top-text')) document.getElementById('top-text').value = cfg.topText;
  if (cfg.bottomText !== undefined && document.getElementById('bottom-text')) document.getElementById('bottom-text').value = cfg.bottomText;

  // Restore logo state BEFORE switching modes, so setIconMode()'s internal render
  // picks up the uploaded image / FontAwesome icon already restored
  if (cfg.uploadedDataUrl !== undefined) state.uploadedDataUrl = cfg.uploadedDataUrl;
  if (cfg.rawSvgDataUrl !== undefined) state.rawSvgDataUrl = cfg.rawSvgDataUrl;
  if (cfg.customSvgContent !== undefined) state.customSvgContent = cfg.customSvgContent;
  if (cfg.isUploadedSvg !== undefined) state.isUploadedSvg = cfg.isUploadedSvg;
  if (cfg.uploadFilename !== undefined) state.uploadFilename = cfg.uploadFilename;
  if (cfg.faPack && document.getElementById('fa-pack-select')) {
    document.getElementById('fa-pack-select').value = cfg.faPack;
  }
  if (cfg.faIconName !== undefined && document.getElementById('fa-icon-name')) {
    document.getElementById('fa-icon-name').value = cfg.faIconName;
    updateFontAwesomePreview();
  } else if (cfg.faIconInput) {
    parseFontAwesomeInput(cfg.faIconInput);
    updateFontAwesomePreview();
  }

  if (cfg.iconMode) setIconMode(cfg.iconMode);
  if (cfg.logoPosition) setLogoPosition(cfg.logoPosition);
  if (cfg.presetKey && document.getElementById('preset-select')) document.getElementById('preset-select').value = cfg.presetKey;

  // Bring back the upload preview bar + status text so a loaded image/SVG doesn't look lost
  if (state.iconMode === 'upload' && state.uploadedDataUrl) {
    showUploadPreview(state.uploadFilename || 'Uploaded logo', state.uploadedDataUrl);
  }

  if (cfg.showDisk !== undefined && document.getElementById('show-disk-toggle')) document.getElementById('show-disk-toggle').checked = cfg.showDisk;
  if (cfg.diskColor && document.getElementById('disk-color')) document.getElementById('disk-color').value = cfg.diskColor;
  if (cfg.logoColor && document.getElementById('logo-color')) document.getElementById('logo-color').value = cfg.logoColor;
  // Background gradient stops (migrate legacy 2-color configs to the stop list)
  if (cfg.bgStops && cfg.bgStops.length >= 2) {
    state.bgStops = cfg.bgStops.slice(0, BG_GRADIENT_MAX_STOPS);
  } else if (cfg.bgColorTop || cfg.bgColorBottom) {
    state.bgStops = [cfg.bgColorTop || '#181f29', cfg.bgColorBottom || '#0f131a'];
  }
  if (cfg.bgGradPreset) state.bgGradPreset = cfg.bgGradPreset;
  renderBgStopEditor();
  if (cfg.textColor && document.getElementById('text-color')) document.getElementById('text-color').value = cfg.textColor;
  if (cfg.radius !== undefined && document.getElementById('corner-radius')) document.getElementById('corner-radius').value = cfg.radius;
  if (cfg.paddingRight !== undefined && document.getElementById('padding-horizontal')) document.getElementById('padding-horizontal').value = cfg.paddingRight;
  if (cfg.diskDiameter !== undefined && document.getElementById('disk-size-slider')) document.getElementById('disk-size-slider').value = cfg.diskDiameter;
  if (cfg.userLogoScale !== undefined && document.getElementById('icon-scale-slider')) document.getElementById('icon-scale-slider').value = cfg.userLogoScale;

  if (cfg.useCustomLogoColor !== undefined && document.getElementById('custom-logo-color-toggle')) document.getElementById('custom-logo-color-toggle').checked = cfg.useCustomLogoColor;
  if (cfg.useLogoStroke !== undefined && document.getElementById('logo-stroke-toggle')) document.getElementById('logo-stroke-toggle').checked = cfg.useLogoStroke;
  if (cfg.logoStrokeColor && document.getElementById('logo-stroke-color')) document.getElementById('logo-stroke-color').value = cfg.logoStrokeColor;
  if (cfg.logoStrokeWidth !== undefined && document.getElementById('logo-stroke-width')) document.getElementById('logo-stroke-width').value = cfg.logoStrokeWidth;

  if (cfg.useLogoShadow !== undefined && document.getElementById('logo-shadow-toggle')) document.getElementById('logo-shadow-toggle').checked = cfg.useLogoShadow;
  if (cfg.logoShadowColor && document.getElementById('logo-shadow-color')) document.getElementById('logo-shadow-color').value = cfg.logoShadowColor;
  if (cfg.logoShadowBlur !== undefined && document.getElementById('logo-shadow-blur')) document.getElementById('logo-shadow-blur').value = cfg.logoShadowBlur;

  if (cfg.useTextGrad !== undefined && document.getElementById('text-grad-toggle')) document.getElementById('text-grad-toggle').checked = cfg.useTextGrad;
  if (cfg.textGradTop && document.getElementById('text-grad-top')) document.getElementById('text-grad-top').value = cfg.textGradTop;
  if (cfg.textGradBot && document.getElementById('text-grad-bot')) document.getElementById('text-grad-bot').value = cfg.textGradBot;
  if (cfg.useTextStroke !== undefined && document.getElementById('text-stroke-toggle')) document.getElementById('text-stroke-toggle').checked = cfg.useTextStroke;
  if (cfg.textStrokeColor && document.getElementById('text-stroke-color')) document.getElementById('text-stroke-color').value = cfg.textStrokeColor;
  if (cfg.textStrokeWidth !== undefined && document.getElementById('text-stroke-width')) document.getElementById('text-stroke-width').value = cfg.textStrokeWidth;
  if (cfg.subtitleColor && document.getElementById('subtitle-color')) document.getElementById('subtitle-color').value = cfg.subtitleColor;
  if (cfg.useTextShadow !== undefined && document.getElementById('text-shadow-toggle')) document.getElementById('text-shadow-toggle').checked = cfg.useTextShadow;
  if (cfg.textShadowColor && document.getElementById('text-shadow-color')) document.getElementById('text-shadow-color').value = cfg.textShadowColor;
  if (cfg.textShadowBlur !== undefined && document.getElementById('text-shadow-blur')) document.getElementById('text-shadow-blur').value = cfg.textShadowBlur;

  renderBadge();
}

function saveConfigToLocalStorage() {
  try {
    const config = getBadgeConfig();
    localStorage.setItem('devin_badge_config', JSON.stringify(config));
    showToast('Saved preset to browser memory!');
  } catch (err) {
    showToast('Failed to save config!');
  }
}

function loadConfigFromLocalStorage() {
  try {
    const raw = localStorage.getItem('devin_badge_config');
    if (!raw) {
      showToast('No saved preset found in browser memory!');
      return;
    }
    const config = JSON.parse(raw);
    applyBadgeConfig(config);
    showToast('Loaded preset from browser memory!');
  } catch (err) {
    showToast('Failed to load saved config!');
  }
}

function exportConfigJSON() {
  try {
    const config = getBadgeConfig();
    const jsonStr = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devin_badge_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported config JSON file!');
  } catch (err) {
    showToast('Failed to export JSON!');
  }
}

function importConfigJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const config = JSON.parse(evt.target.result);
      applyBadgeConfig(config);
      showToast('Imported config JSON file!');
    } catch (err) {
      showToast('Invalid JSON config file!');
    }
  };
  reader.readAsText(file);
}
