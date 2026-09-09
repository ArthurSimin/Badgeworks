# AGENTS.md — Badgeworks Core (stripped branch)

## Overview
This branch is a headless port of the Badgeworks badge generator. No GUI, no
browser DOM. One function turns a config object into SVG markup; another turns
that SVG into a PNG Buffer. Target runtime is Node.js ≥ 18 (Discord bots, etc.).

## File map
- `src/index.js` — the whole library: config normalization, SVG renderer,
  filter builders, text measurement, FontAwesome/theSVG fetch, SVG→PNG.
- `src/icons.js` — preset icon data (`OFFICIAL_BRAND_ICONS`) + background
  gradient presets (`BG_GRADIENT_PRESETS`). Auto-generated from the web app's
  `app.js` (see below) — do not edit by hand.
- `test/smoke.mjs` — smoke test (`npm test`). Writes samples to `test/out/`.
- `package.json` — `badgeworks-core`, ESM (`"type": "module"`), sole dependency
  `@resvg/resvg-js`.

## Rendering parity
`renderBadgeSvg` in `src/index.js` is a direct port of `generateBadgeForStyle`
from the browser app (the export path), minus all `document`/`getElementById`
reads, which are replaced by the normalized config. Keep the port in sync with
the app's geometry and FX logic. The filter builders (`buildLogoFxFilter`,
`buildStrokeSilFilter`, `buildGradStrokeLayer`, `strokeDiskKernel`) and the SVG
string templates are intentionally byte-for-byte copies of the app equivalents
so exported SVG stays identical.

## Regenerating `src/icons.js`
`src/icons.js` is extracted from `app.js` on `main`. If presets change, re-run
the extractor (top-level `const OFFICIAL_BRAND_ICONS = {…};` and
`const BG_GRADIENT_PRESETS = {…};` blocks). Add new presets to `app.js` on
`main`, then regenerate here and re-commit.

## Gotchas
- **IDs must be unique per badge**: the renderer suffixes filter/gradient ids
  with a per-call counter (`badge-b1-bg`, etc.) so multiple badges can be
  embedded in one SVG/HTML document without colliding.
- **Measurement is headless**: `measureText` uses an Inter-calibrated estimate;
  pass `config.measureText` for exact metrics. PNG width and SVG width use the
  same estimate, so they stay consistent.
- **PNG needs `@resvg/resvg-js`**. SVG generation works with zero dependencies.
  `resvg-js` supports the common filter primitives used here, but its text
  rendering falls back to a system sans unless Inter is registered.
- FontAwesome (`fa-…`) and theSVG (`thesvgSlug`) modes require network access
  (`fetch`). Presets are fully offline.