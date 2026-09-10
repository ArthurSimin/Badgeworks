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
- **Measurement is pixel-parity with the browser**: text is measured with a real
  2D canvas (`@napi-rs/canvas`) using the bundled Inter TTFs (`fonts/`), the
  same as the app's `ctx.measureText()` on Inter. A heuristic fallback runs if
  the canvas backend is unavailable. Pass `config.measureText` to override.
- **PNG needs `@resvg/resvg-js`**, which is wired to the same bundled Inter
  fonts (`fontFiles` + `defaultFontFamily: 'Inter'`) so PNG text matches SVG.
  SVG generation works without a native canvas (heuristic fallback).
- FontAwesome (`fa-…`) and theSVG (`thesvgSlug`) modes require network access
  (`fetch`). Presets are fully offline.