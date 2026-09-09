import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  generateBadge,
  generateBadgePng,
  resolvePreset,
  listIcons,
  OFFICIAL_BRAND_ICONS
} from '../src/index.js';

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'out');

function assert(cond, msg) {
  if (!cond) throw new Error('ASSERT FAILED: ' + msg);
}

async function main() {
  assert(listIcons().includes('github'), 'listIcons contains github');

  // 1. Default preset badge (github) -> SVG
  const svg = await generateBadge({ topText: 'Available on', bottomText: 'GitHub' });
  assert(svg.startsWith('<svg'), 'SVG starts with <svg');
  assert(svg.includes('width="'), 'SVG has width');
  assert(svg.includes('</svg>'), 'SVG closes');
  writeFileSync(join(outDir, 'github_cozy.svg'), svg);
  console.log('✓ github cozy SVG', svg.match(/width="(\d+)"/)[0]);

  // 2. Every preset + every style should render without throwing
  for (const key of listIcons()) {
    const brand = OFFICIAL_BRAND_ICONS[key];
    const info = { presetKey: key, iconMode: 'preset', topText: 'Made with', bottomText: key };
    for (const style of ['cozy', 'compact', 'cozy-minimal', 'compact-minimal']) {
      const s = await generateBadge({ ...info, style });
      assert(s.startsWith('<svg') && s.endsWith('</svg>'), `${key}/${style} SVG`);
    }
    // Only generate PNG for a few to keep the test fast
    if (['github', 'python', 'discord', 'react', 'rust', 'vscode'].includes(key)) {
      const png = await generateBadgePng({ ...info, style: 'cozy' });
      assert(Buffer.isBuffer(png) && png.length > 100, `${key} PNG buffer`);
      assert(png.slice(1, 4).toString() === 'PNG', `${key} PNG magic bytes`);
    }
  }
  console.log('✓ all', listIcons().length, 'presets render SVG (spot-checked PNG for path + custom-svg icons)');

  // 3. logoPosition right + none
  const right = await generateBadge({ bottomText: 'Right logo', logoPosition: 'right' });
  assert(right.includes('<svg'), 'right-mode SVG');
  writeFileSync(join(outDir, 'right.svg'), right);

  const none = await generateBadge({ topText: 'Just ', bottomText: 'Text', logoPosition: 'none' });
  assert(!none.includes('<!-- Official Brand'), 'no-logo has no icon');
  writeFileSync(join(outDir, 'textonly.svg'), none);

  // 4. Logo FX: disk, stroke (without disk), shadow + gradient text
  const fancy = await generateBadge({
    topText: 'Fx test',
    bottomText: 'Shadows',
    useTextGrad: true,
    useTextShadow: true,
    useLogoStroke: true,
    logoStrokeColor: '#61dafb'
  });
  assert(fancy.includes('feGaussianBlur'), 'text shadow filter present');
  assert(fancy.includes('feConvolveMatrix'), 'logo stroke filter present');
  assert(fancy.includes('url(#'), 'filter referenced');
  writeFileSync(join(outDir, 'fancy.svg'), fancy);

  const disk = await generateBadge({ showDisk: true, diskColor: '#ffffff', bottomText: 'Disk' });
  assert(disk.includes('<circle'), 'disk circle present');
  writeFileSync(join(outDir, 'disk.svg'), disk);
  const fancyPng = await generateBadgePng({ ...resolvePreset('discord') });
  assert(fancyPng.length > 100, 'discord preset PNG');
  writeFileSync(join(outDir, 'discord.png'), fancyPng);

  // 5. config passthrough: custom bgStops + radius
  const custom = await generateBadge({ bgStops: ['#ff0000', '#0000ff'], radius: 16, bottomText: 'Custom' });
  assert(custom.includes('#ff0000') && custom.includes('rx="16"'), 'custom bg + radius');
  writeFileSync(join(outDir, 'custom.svg'), custom);

  console.log('\nAll smoke tests passed. Outputs written to', outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});