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

  // 1. Default badge ("Create on / Badgeworks", FontAwesome "b") -> SVG
  const svg = await generateBadge();
  assert(svg.startsWith('<svg'), 'SVG starts with <svg');
  assert(svg.includes('width="'), 'SVG has width');
  assert(svg.includes('</svg>'), 'SVG closes');
  writeFileSync(join(outDir, 'default_badgeworks.svg'), svg);
  console.log('✓ default (Badgeworks) SVG', svg.match(/width="(\d+)"/)[0]);

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
{
  const { readFile } = await import('node:fs/promises');
  const { generateBadge, generateBadgePng, normalizeConfig } = await import('../src/index.js');
  for (const [style, height] of [['cozy',56], ['compact',40], ['cozy-minimal',56], ['compact-minimal',40]]) {
    const svg = await generateBadge({ style, presetKey: 'youtube', topText: 'Watch us on', bottomText: 'YouTube' });
    assert(svg.match(/^<svg[^>]* height="(\d+)"/)[1] === String(height), `${style} has the upstream height`);
    assert(svg.includes('f22f21'), `${style} uses the upstream YouTube logo`);
    const png = await generateBadgePng({ style, presetKey: 'youtube' });
    assert(png.readUInt32BE(20) === height * 3, `${style} PNG has the correct height`);
    const original = await readFile(new URL(`../assets/devins-badges/${style}/social/youtube-plural_vector.svg`, import.meta.url), 'utf8');
    assert(await generateBadge({ style, officialBadge: 'social/youtube-plural' }) === original, `${style} original SVG is unchanged`);
    if (style === 'compact') assert(svg.includes('>Watch us on</text>') && svg.includes('>YouTube</text>'), 'Compact includes both labels');
  }
  const svg = await generateBadge({ useTextGrad: true, useSubtitleGrad: true, titleGradientPreset: 'rainbow',
    textGradients: { subtitle: { angle: 90, stops: [{ color: '#123456', offset: 0 }, { color: '#abcdef', offset: 100 }] } } });
  assert(svg.includes('#8b00ff') && svg.includes('#abcdef'), 'Independent gradients and Rainbow preset render');
  assert(normalizeConfig({ faPack: 'fa-brands', faIconName: 'github' }).faIconName === 'github', 'Explicit icon name wins over the default');
  console.log('Upstream geometry, exact presets, gradients, and icon config passed.');
}
