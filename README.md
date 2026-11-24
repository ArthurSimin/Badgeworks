<h1 align="center">Badgeworks</h1>

<p align="center">
  <img alt="github" height="56" src="https://cdn.jsdelivr.net/npm/@intergrav/devins-badges@3/assets/cozy/available/github_vector.svg">
  <img alt="git" height="56" src="https://cdn.jsdelivr.net/npm/@intergrav/devins-badges@3/assets/cozy/available/git_vector.svg">
  <img alt="generic" height="56" src="https://cdn.jsdelivr.net/npm/@intergrav/devins-badges@3/assets/cozy/documentation/generic_vector.svg">
  <img alt="website" height="56" src="https://cdn.jsdelivr.net/npm/@intergrav/devins-badges@3/assets/cozy/documentation/website_vector.svg">
  <img height="56" src="devin_google_antigravity_badge.svg" />
  <img height="56" src="devin_opencode_badge.svg" />
  <img height="56" src="devin_kiro_badge.svg" />
</p>


<p align="center">
  <strong>Browse the original Devin’s Badges catalog and build custom badges in your browser.</strong>
</p>

<p align="center">
  <a href="https://arthursimin.github.io/Badgeworks">Try the live website</a>
</p>

<p align="center">
  <i>This website is entirely made by AI. Please do not start a annoying discussion just because it's made with AI</i>
</p>

<p align="center">
<strong>Note:</strong> If updates don’t appear, perform a hard refresh (Ctrl + F5).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Badgeworks-Badgeworks-3388ff?style=for-the-badge&logo=github" alt="Badgeworks" />
</p>

## Features

- **Browse presets** searches 185 official badges in nine categories, including each badge’s Cozy, Compact, Cozy Minimal, and Compact Minimal variants. Preview and SVG export use the original files.
- **Customize** opens an editable preset with its original appearance. Text, color, padding, and background edits retain the untouched artwork.
- **Build custom badges** with the upstream template dimensions: 56 px Cozy and 40 px Compact, including the square Minimal versions. Choose icons from logos extracted from all 185 official presets, Font Awesome, theSVG, pasted SVG, or uploaded PNG, JPG, WebP, GIF, and SVG logos. Set independent title and subtitle gradients with any angle and multiple positioned color stops.
- **Export** as SVG, 3× PNG, or a ZIP with all four styles. Copy Markdown, HTML, or SVG markup from the preview panel.
- **Save** editor settings in your browser or export them as JSON.
- **Submit** a custom badge to [devinsbadges-customs](https://github.com/intensed-dev/devinsbadges-customs). Badgeworks prepares the GitHub issue draft and downloads its PNG and SVG attachments.

## Quick Start

You can use the live website [here!](https://arthursimin.github.io/Badgeworks/), or run it locally:

1. Clone or download this repository:

   ```bash
   git clone https://github.com/ArthurSimin/Badgeworks.git
   ```

2. Open [`index.html`](index.html) in any modern web browser. No Node.js or server setup required.

## Structure

- `index.html` and `index.css` contain the responsive editor.
- `app.js` handles editing, rendering, settings, and exports.
- `presets.js` handles catalog browsing and customization of original SVGs.
- `zip.js` writes the download archives.
- `assets/devins-badges/` contains the original SVGs from `@intergrav/devins-badges@3.3.1` and generated browser catalog data. The catalog and exports work offline when opening `index.html` directly. Remote icon providers and issue submission need a connection.

### Verify the official catalog

Run `python scripts/sync-official-badges.py --check` to compare every local SVG byte-for-byte against the pinned npm package and confirm coverage of all four reference pages. Run the script without `--check` to regenerate the catalog.

## License

Badgeworks is licensed under the MIT License. The bundled Devin’s Badges SVGs are licensed under [CC0 1.0](assets/devins-badges/CC0-1.0.txt). The embedded Inter font is distributed under the [SIL Open Font License](assets/fonts/Inter-OFL.txt).

## Credits

Based on the official [Devin's Badges](https://github.com/intergrav/devins-badges) project by intergrav.
