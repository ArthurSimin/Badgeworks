const workspaceHistory = [];
let workspaceHistoryIndex = -1;
let restoringWorkspaceHistory = false;
const brandPalettesKey = 'badgeworks_brand_palettes';
const paletteFields = [
  'bgStops', 'bgGradPreset', 'textGradients', 'textColor', 'subtitleColor', 'logoColor',
  'diskColor', 'textStrokeColor', 'textShadowColor', 'logoStrokeColor', 'logoShadowColor',
  'useTextGrad', 'useSubtitleGrad', 'useCustomLogoColor', 'useLogoGrad', 'useLogoStroke', 'useLogoStrokeGrad',
  'borderMode', 'borderColor', 'borderWidth', 'borderOpacity'
];

function updateHistoryButtons() {
  document.getElementById('undo-edit').disabled = workspaceHistoryIndex <= 0;
  document.getElementById('redo-edit').disabled = workspaceHistoryIndex >= workspaceHistory.length - 1;
}

function recordWorkspaceHistory() {
  if (restoringWorkspaceHistory) return;
  const snapshot = JSON.stringify(getBadgeConfig());
  if (snapshot === workspaceHistory[workspaceHistoryIndex]) return;
  workspaceHistory.splice(workspaceHistoryIndex + 1);
  workspaceHistory.push(snapshot);
  if (workspaceHistory.length > 50) workspaceHistory.shift();
  workspaceHistoryIndex = workspaceHistory.length - 1;
  updateHistoryButtons();
}

function moveWorkspaceHistory(delta) {
  const index = workspaceHistoryIndex + delta;
  if (index < 0 || index >= workspaceHistory.length) return;
  restoringWorkspaceHistory = true;
  try {
    applyBadgeConfig(JSON.parse(workspaceHistory[index]));
    workspaceHistoryIndex = index;
  } finally {
    restoringWorkspaceHistory = false;
    updateHistoryButtons();
  }
}

function setupWorkspace() {
  document.getElementById('undo-edit').addEventListener('click', () => moveWorkspaceHistory(-1));
  document.getElementById('redo-edit').addEventListener('click', () => moveWorkspaceHistory(1));
  document.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey
      || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const key = event.key.toLowerCase();
    if (key !== 'z' && key !== 'y') return;
    event.preventDefault();
    moveWorkspaceHistory(key === 'y' || event.shiftKey ? 1 : -1);
  });
  setupBrandPalettes();
  document.getElementById('batch-form').addEventListener('submit', exportBadgeBatch);
}

function setupBrandPalettes() {
  const list = document.getElementById('palette-list');
  const nameInput = document.getElementById('palette-name');
  const apply = document.getElementById('palette-apply');
  const remove = document.getElementById('palette-delete');
  let palettes = new Map();
  try {
    palettes = new Map(JSON.parse(localStorage.getItem(brandPalettesKey) || '[]'));
  } catch {
    // Editing and exports remain available when browser storage is disabled.
  }

  const sync = (selected = '') => {
    list.replaceChildren(new Option('Choose a saved palette', ''));
    for (const name of palettes.keys()) list.add(new Option(name, name));
    list.value = selected;
    apply.disabled = !list.value;
    remove.disabled = !list.value;
  };
  const storePalettes = next => {
    try {
      localStorage.setItem(brandPalettesKey, JSON.stringify([...next]));
      palettes = next;
      return true;
    } catch {
      showToast('Could not save changes to brand palettes.', 'error');
      return false;
    }
  };

  list.addEventListener('change', () => sync(list.value));
  document.getElementById('palette-save').addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      showToast('Enter a name for your palette.', 'error');
      return;
    }
    const config = getBadgeConfig();
    const palette = structuredClone(Object.fromEntries(paletteFields.map(key => [key, config[key]])));
    if (storePalettes(new Map(palettes).set(name, palette))) {
      sync(name);
      showToast('Brand palette saved.');
    }
  });
  apply.addEventListener('click', () => {
    const palette = palettes.get(list.value);
    if (palette) applyBadgeConfig({ ...getBadgeConfig(), ...structuredClone(palette) });
  });
  remove.addEventListener('click', () => {
    const next = new Map(palettes);
    next.delete(list.value);
    if (storePalettes(next)) sync();
  });
  sync();
}

function renderBadgeBorder(style, width, height, radius, config = getBadgeConfig()) {
  const mode = config.borderMode;
  const custom = mode === 'solid' || mode === 'gradient';
  const thickness = custom ? boundedInput(config.borderWidth, 0, 12, 2.1) : BADGE_LAYOUTS[style].border;
  const opacity = custom ? boundedInput(config.borderOpacity, 0, 100, 100) / 100 : 0.15;
  if (mode === 'transparent' || !thickness || !opacity) return { definitions: '', markup: '' };
  const id = `badge-border-${style}`;
  const definitions = mode === 'gradient'
    ? buildTextGradient(id, config.textGradients.border, { x: 0, y: 0, width, height }) : '';
  const color = mode === 'gradient' ? `url(#${id})` : custom ? config.borderColor : '#fff';
  const inset = thickness / 2;
  const markup = `<rect width="${svgNumber(width - thickness)}" height="${svgNumber(height - thickness)}" x="${inset}" y="${inset}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${thickness}" rx="${svgNumber(Math.max(0, radius - inset))}"/>`;
  return { definitions, markup };
}

function boundedInput(value, min, max, fallback) {
  const number = value === '' ? NaN : Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

async function exportBadgeBatch(event) {
  event.preventDefault();
  if (state.officialBadge) return;
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  if (button.disabled) return;
  const status = document.getElementById('batch-status');
  const currentTop = document.getElementById('top-text').value;
  const format = document.getElementById('batch-format').value;
  const lines = document.getElementById('batch-labels').value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const rows = lines.map(line => {
    const divider = line.indexOf('|');
    return divider === -1 ? { top: currentTop, bottom: line }
      : { top: line.slice(0, divider).trim(), bottom: line.slice(divider + 1).trim() };
  });
  if (!rows.length || rows.length > 100 || rows.some(row => !row.bottom)) {
    status.textContent = 'Enter 1–100 lines with a title on each line.';
    return;
  }

  button.disabled = true;
  status.textContent = 'Generating badges…';
  try {
    // Prepare every render before awaiting so edits during export cannot mix settings.
    const prepared = rows.map(row => generateBadgeForStyle(state.style, row));
    const markup = await Promise.all(prepared.map(resolveBadgeExport));
    const files = [];
    const names = new Set();
    for (const [index, row] of rows.entries()) {
      const base = row.bottom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'badge';
      let name = base;
      for (let suffix = 2; names.has(name); suffix++) name = `${base}-${suffix}`;
      names.add(name);
      const svg = markup[index];
      if (format !== 'png') files.push({ name: `${name}.svg`, contents: svg });
      if (format !== 'svg') {
        const png = await rasterizeSvg(svg);
        const bytes = Uint8Array.from(atob(png.split(',')[1]), character => character.charCodeAt(0));
        files.push({ name: `${name}.png`, contents: bytes });
      }
      status.textContent = `Prepared ${index + 1} of ${rows.length} badges.`;
    }
    downloadFile(zipFiles(files), 'badgeworks-batch.zip', 'application/zip');
    status.textContent = `Downloaded ${files.length} ${files.length === 1 ? 'file' : 'files'}.`;
  } catch {
    status.textContent = 'Could not export the batch. Try again.';
  } finally {
    button.disabled = false;
  }
}
