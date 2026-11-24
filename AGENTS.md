# AGENTS.md

## Overview
Badgeworks is a zero-build, dependency-free web app (plain HTML/CSS/JS). To run or test it, open `index.html` in a browser — there is no `package.json`, bundler, server, test suite, lint config, or CI. All logic runs in the browser DOM (`document`, `DOMParser`, `<canvas>`), so `app.js` cannot execute under plain Node.

## File map
- `index.html` and `index.css` — editor markup, controls, and styling.
- `app.js` — shared preview and export renderer, template metrics, editor controls, and settings.
- `presets.js` — official catalog selection, original logo extraction, and preset customization.
- `zip.js` — ZIP downloads for all-style exports and issue attachments.

### Reference data: do NOT wire these into the app
`badge_catalog.json`, `badge_data.js`, `official_icons_db.json`, `official_svgs.json`, `new_icons.json` were scraped from the official `intergrav/devins-badges` repo. They are **not referenced anywhere** by `index.html`/`app.js`, and `badge_data.js` points at `assets/...` paths that don't exist in this repo. Treat these historical files as read-only. The live catalog is generated from the pinned upstream SVG package into `assets/devins-badges/`.

## Badge styles and icons
- Cozy and Cozy Minimal are 56 px high. Compact and Compact Minimal are 40 px high. Minimal badges are square. The standard logo frames are 40 px for Cozy and 28 px for Compact.
- The default type is Inter Medium at 16 px for Cozy subtitles and 17 px for Compact subtitles. Titles use Inter Extra Bold at 17 px. Compact places both labels on one line.
- Original previews and SVG exports use the upstream files byte for byte. `loadOfficialLogo` isolates the original art for custom badges. The shared renderer positions logos with `BADGE_LAYOUTS` in `app.js`.
- Use `python scripts/sync-official-badges.py --check` to verify original SVGs and reference coverage. Additional editor-only icons live in `EXTRA_PRESET_ICONS`.

## Gotchas
- The original catalog and generated badge typography work offline. Font Awesome and theSVG lookups, optional interface fonts, and issue submission use the network.
- The "request new badge" flow uploads 4 PNG previews to the Imgur API with a hardcoded `Client-ID 546c25a59c58ad7` (`app.js`), then opens a prefilled GitHub issue on `intensed-dev/devinsbadges-customs`.
- Save/Load presets persist config to `localStorage` under key `devin_badge_config`.
- FontAwesome icon mode renders a `<!-- FA_ICON_SLOT -->` placeholder, resolved asynchronously once the CDN path data arrives — preserve this placeholder mechanism if reworking that path.
- SVG and PNG export use the same badge renderer. PNG exports rasterize its output at 3× scale.
- `test_vscode.svg` is a throwaway sample output, not a fixture.