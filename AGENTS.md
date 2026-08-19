# AGENTS.md

## Overview
Badgeworks is a zero-build, dependency-free web app (plain HTML/CSS/JS). To run or test it, open `index.html` in a browser — there is no `package.json`, bundler, server, test suite, lint config, or CI. All logic runs in the browser DOM (`document`, `DOMParser`, `<canvas>`), so `app.js` cannot execute under plain Node.

## File map
- `index.html` — all UI markup and inline config; loads `index.css` then `app.js` (plus Font Awesome CSS from cdnjs).
- `app.js` — all logic: preset icon geometry (`OFFICIAL_BRAND_ICONS`, ~line 27), SVG rendering, SVG/PNG exports, save/load config persistence.
- `index.css` — all styling.

### Reference data: do NOT wire these into the app
`badge_catalog.json`, `badge_data.js`, `official_icons_db.json`, `official_svgs.json`, `new_icons.json` were scraped from the official `intergrav/devins-badges` repo. They are **not referenced anywhere** by `index.html`/`app.js`, and `badge_data.js` points at `assets/...` paths that don't exist in this repo. Treat them as read-only source material for porting icons into `OFFICIAL_BRAND_ICONS`.

## Adding a preset icon
Add an entry to `OFFICIAL_BRAND_ICONS` in `app.js`. Each icon is one of:
- `{ path: "<simple-icons 24x24 path data>", color, bgTop, bgBot, textX? }`
- `{ isCustomSvg: true, svg: "<path>/<svg>", color, bgTop, bgBot, textX? }`

For `isCustomSvg` icons, `svg` is authored on a 64px baseline and injected into the badge SVG; `noTint: true` opts out of the internal recolor (fill/stroke replacement) for mask- or stroke-based artwork — tinting still works via the alpha-based `badge-logo-fx` filter.

`scalable: true` on a custom-SVG preset (used by all of them: `github`, `python`, `react`, `rust`) opts it into the icon-size slider: its 64px artboard is scaled to `effectiveLogoSize` (slider × heightScale) and centered, exactly like a `path` vector icon. Scalable presets must NOT set `textX` — spacing derives from `leftPad + effectiveLogoSize + leftPad` so gaps stay a constant `leftPad` on both sides. `scalableBox: { x, y, w, h }` (github/python/react) gives the glyph's bounding box inside the 64px artboard so internal whitespace is cropped and the visible mark fills `effectiveLogoSize` (like a vector icon). `defaultScale` (github/python/react = 41) sets the icon-size slider when that preset is picked (pills, dropdown `onPresetSelect`, or startup) so the cropped glyph matches its pre-crop size; presets without it leave the slider untouched. Without a `scalableBox` (rust), the whole artboard is scaled uniformly and built-in padding is preserved, so glyph fill varies per icon. Without `scalable`, a custom SVG renders at the full artboard width regardless of the slider.

Logo additions must also respect `logoPosition` (`state.logoPosition`: `'left'` | `'right'` | `'none'`). Right mode is a true mirror of left mode via `logoBoxStart`/`logoBoxPad` (see `renderBadge` and `generateBadgeForStyle` — keep both in sync): the logo box (full artboard width for non-`scalable` custom SVGs drawn flush to the logo-side edge, else `effectiveLogoSize` padded by `leftPad`) is flipped to the right of the text so the text↔logo and logo↔outer-edge gaps match the left side exactly. `MAX_BADGE_WIDTH` (420) caps the badge; the logo then pins to the right edge.

Icons are scaled to badge height from a 64px baseline. Real dimensions: cozy = 64px, compact = 40px, cozy-minimal = 64x64, compact-minimal = 40x40 (README's "56px" claim is stale).

## Gotchas
- App is online-first: runtime pulls Google Fonts Inter (also injected into exported SVGs), Font Awesome SVG paths from `cdn.jsdelivr.net`, and Font Awesome CSS from cdnjs. Preview and export need network access.
- The "request new badge" flow uploads 4 PNG previews to the Imgur API with a hardcoded `Client-ID 546c25a59c58ad7` (`app.js`), then opens a prefilled GitHub issue on `intensed-dev/devinsbadges-customs`.
- Save/Load presets persist config to `localStorage` under key `devin_badge_config`.
- FontAwesome icon mode renders a `<!-- FA_ICON_SLOT -->` placeholder, resolved asynchronously once the CDN path data arrives — preserve this placeholder mechanism if reworking that path.
- PNG export re-renders the live SVG to `<canvas>` at 3x scale.
- `test_vscode.svg` is a throwaway sample output, not a fixture.