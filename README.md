# Badgeworks Core (stripped)

A headless, dependency-light port of [Badgeworks](https://arthursimin.github.io/Badgeworks) — the devins-badges style badge generator — with **no GUI and no browser**. It renders the exact same badges from a plain JavaScript config object, so you can drop it into a Discord bot (or any Node.js ≥ 18 app) and produce SVG/PNG badges on the fly.

> This is the `stripped` branch. The browser UI lives on `main`; this branch exposes only the rendering engine.

## Install

```bash
npm install github:ArthurSimin/Badgeworks#stripped
# or, for local development, point at the folder / a git submodule
```

The only runtime dependency is [`@resvg/resvg-js`](https://github.com/yisibl/resvg-js), used to rasterize SVG → PNG. SVG generation itself is pure JavaScript (no DOM, no canvas).

## Quick start

```js
import { generateBadge, generateBadgePng } from 'badgeworks-core';

// SVG string
const svg = await generateBadge({
  topText: 'Available on',
  bottomText: 'GitHub',
  presetKey: 'github'
});

// PNG Buffer (3x resolution by default) — ready for a Discord attachment
const png = await generateBadgePng({
  topText: 'Built with',
  bottomText: 'Python',
  presetKey: 'python'
});
```

### Sending a badge from a Discord bot

```js
// discord.js v14
import { AttachmentBuilder } from 'discord.js';
import { generateBadgePng } from 'badgeworks-core';

const png = await generateBadgePng({
  topText: 'Join our',
  bottomText: 'Discord',
  presetKey: 'discord'
});

await channel.send({
  files: [new AttachmentBuilder(png, { name: 'badge.png' })]
});
```

## API

### `generateBadge(config)` → `Promise<string>`

Resolves an SVG markup string. Preset / upload / raw modes resolve synchronously (wrapped in a promise); FontAwesome and theSVG modes fetch the icon over the network first.

### `generateBadgePng(config, options?)` → `Promise<Buffer>`

Renders the badge and returns PNG bytes. `options`:
- `scale` — output scale multiplier (default `3`).
- `resvg` — extra options merged into the `Resvg` constructor call (Inter is already wired up by default; override `resvg.font` only if you need something custom).

### `svgToPng(svg, options?)` → `Promise<Buffer>`

Rasterize an arbitrary SVG string to PNG.

### Helpers

- `normalizeConfig(config)` — returns the fully-resolved config with defaults applied.
- `resolvePreset('github')` — returns a ready-made config for common badges (`github`, `discord`, `python`, `react`, `vscode`, `pypi`).
- `listIcons()` — all preset icon keys.
- `OFFICIAL_BRAND_ICONS` / `BG_GRADIENT_PRESETS` — raw icon + gradient data.
- `measureText(text, fontSpec, customMeasure?)` — headless text measurement.

## Config reference

| Key | Default | Description |
| --- | --- | --- |
| `style` | `'cozy'` | `'cozy'` \| `'compact'` \| `'cozy-minimal'` \| `'compact-minimal'` |
| `topText` / `bottomText` | `''` | Badge title / subtitle |
| `iconMode` | `'preset'` | `'preset'` \| `'fontawesome'` \| `'thesvg'` \| `'upload'` \| `'raw'` |
| `logoPosition` | `'left'` | `'left'` \| `'right'` \| `'none'` |
| `presetKey` | `'github'` | One of `listIcons()` |
| `bgStops` | dark gradient | Array of 2–7 hex colors |
| `radius` / `paddingRight` | `8` / `8` | Corner radius / right padding |
| `showDisk` | `false` | White circle behind the logo |
| `diskColor` / `logoColor` / `textColor` / `subtitleColor` | … | Colors |
| `diskDiameter` / `userLogoScale` | `40` / `34` | Icon sizing |
| `useTextGrad` + `textGradTop`/`textGradBot` | off | Title/subtitle gradient |
| `useTextStroke` / `useTextShadow` + related | off | Text effects |
| `useCustomLogoColor` / `useLogoStroke` / `useLogoStrokeGrad` / `useLogoShadow` + related | off | Logo effects |
| `faIconClass` or `faPack` + `faIconName` | — | FontAwesome icon (network) |
| `thesvgSlug` / `thesvgVariant` | — | theSVG icon (network) |
| `imageDataUrl` / `rawSvgDataUrl` / `customSvgContent` | — | Upload / raw logo sources |
| `measureText` | — | Optional `(text, fontSpec) => number` override |

See [`src/index.js`](src/index.js) `DEFAULTS` for the complete list.

## Icon sources

- **Presets** (`preset`) — pure data (`src/icons.js`), fully offline: `github`, `python`, `vscode`, `discord`, `react`, `docker`, `deno`, `rust`, `git`, `gitlab`, `npm`, `pypi`, `spotify`, `steam`, `youtube`, `twitter`, `star`, `terminal`.
- **FontAwesome** (`fontawesome`) — fetched from the free CDN; needs network access in the bot.
- **theSVG** (`thesvg`) — fetched from [thesvg.org](https://thesvg.org); needs network access.
- **Upload / Raw** (`upload`, `raw`) — pass a data URL or inner SVG markup directly.

## Notes

- **Fonts**: the library bundles Inter (Regular / Medium / SemiBold / Bold, SIL OFL-1.1 — see [fonts/](fonts/)) and registers it with both the text-measurement canvas and `resvg-js`. PNG text and badge widths therefore match the website (which loads Inter from Google Fonts) 1:1, on any machine, with no system-font setup.
- **Measurement**: text is measured with a real 2D canvas (`@napi-rs/canvas`) using Inter, identical to the browser's `ctx.measureText()`. If `@napi-rs/canvas` is unavailable it falls back to an Inter-calibrated estimate; pass a custom `config.measureText` for exact metrics in that case.
- No `localStorage`, no Imgur upload, no GitHub-issue flow — those were web-app concerns and are gone.

## License

MIT. Based on [Devin's Badges](https://github.com/intergrav/devins-badges) by intergrav. The Inter font is © Rasmus Andersson (rsms), licensed under the [SIL Open Font License 1.1](fonts/LICENSE-Inter.txt).