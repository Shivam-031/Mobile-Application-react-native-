/**
 * One-shot icon rasterizer.
 *
 * Reads `assets/icon.svg` (master, 1024×1024) and emits:
 *   - Android: mipmap-{m,h,xh,xxh,xxxh}dpi/ic_launcher.png + ic_launcher_round.png
 *   - Android: drawable/ic_launcher_foreground.png + ic_launcher_background.png
 *              (for the Adaptive Icon, see mipmap-anydpi-v26/ic_launcher.xml)
 *   - iOS:     ios/GreenYatraIndia/Images.xcassets/AppIcon.appiconset/App-Icon-*.png
 *   - Web:     admin/public/icon.svg  (copy of master — Next.js metadata picks it up)
 *
 * Run with: `node scripts/generate-icon.js`
 * Re-run any time the SVG is tweaked; output is deterministic.
 *
 * Note: ic_launcher_round.png is the same square content — Android applies
 * a circular mask. No need to bake the circle into the PNG.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SVG_PATH = path.join(ROOT, '..', 'assets', 'icon.svg');
const ANDROID_RES = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');
const IOS_APPICONSET = path.join(ROOT, 'ios', 'GreenYatraIndia', 'Images.xcassets', 'AppIcon.appiconset');
const ADMIN_PUBLIC = path.join(ROOT, '..', 'admin', 'public');

// Android density buckets (px sizes for the launcher icon).
const ANDROID_BUCKETS = [
  { name: 'mdpi',    size: 48 },
  { name: 'hdpi',    size: 72 },
  { name: 'xhdpi',   size: 96 },
  { name: 'xxhdpi',  size: 144 },
  { name: 'xxxhdpi', size: 192 },
];

// iOS app icon sizes (points → pixels at 1x/2x/3x). Production iOS apps
// ship one 1024×1024 PNG with no transparency, but including the legacy
// per-slot sizes keeps things working under Xcode auto-generated catalogs.
const IOS_SLOTS = [
  { idiom: 'iphone',         size: '20x20',   scale: '2x', px: 40  },
  { idiom: 'iphone',         size: '20x20',   scale: '3x', px: 60  },
  { idiom: 'iphone',         size: '29x29',   scale: '2x', px: 58  },
  { idiom: 'iphone',         size: '29x29',   scale: '3x', px: 87  },
  { idiom: 'iphone',         size: '40x40',   scale: '2x', px: 80  },
  { idiom: 'iphone',         size: '40x40',   scale: '3x', px: 120 },
  { idiom: 'iphone',         size: '60x60',   scale: '2x', px: 120 },
  { idiom: 'iphone',         size: '60x60',   scale: '3x', px: 180 },
  { idiom: 'ipad',           size: '20x20',   scale: '1x', px: 20  },
  { idiom: 'ipad',           size: '20x20',   scale: '2x', px: 40  },
  { idiom: 'ipad',           size: '29x29',   scale: '1x', px: 29  },
  { idiom: 'ipad',           size: '29x29',   scale: '2x', px: 58  },
  { idiom: 'ipad',           size: '40x40',   scale: '1x', px: 40  },
  { idiom: 'ipad',           size: '40x40',   scale: '2x', px: 80  },
  { idiom: 'ipad',           size: '76x76',   scale: '2x', px: 152 },
  { idiom: 'ipad',           size: '83.5x83.5', scale: '2x', px: 167 },
  { idiom: 'ios-marketing', size: '1024x1024', scale: '1x', px: 1024 },
];

async function rasterize(svgBuf, size, transparent = false) {
  return sharp(svgBuf, { density: 384 })  // 384 DPI → crisp downsample at any size
    .resize(size, size, { fit: 'cover', kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer({ resolveWithObject: true })
    .then(({ data }) => {
      // For Android legacy mipmaps we want the rounded white tile to show
      // (icon lives on the launcher background, not a transparent overlay).
      // For the Adaptive Icon FOREGROUND we need the SVG with the white
      // background REMOVED, so the OS can tint/clip it cleanly. Caller
      // decides which to use.
      return data;
    });
}

async function rasterizeTransparent(svgBuf, size) {
  // Strip the white <rect> background from a deep-clone SVG, then rasterize
  // at the requested size with no alpha matting. Used for Android's
  // ic_launcher_foreground.png.
  const svgStr = svgBuf.toString('utf8')
    .replace(/<rect[^>]*id="bg"[^>]*\/>/, '')
    .replace(/<rect x="0" y="0" width="1024" height="1024"[^>]*\/>/, '');
  return sharp(Buffer.from(svgStr), { density: 384 })
    .resize(size, size, { fit: 'cover', kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error(`❌ SVG not found at ${SVG_PATH}`);
    process.exit(1);
  }
  const svg = fs.readFileSync(SVG_PATH);
  console.log(`📐 Loaded ${path.basename(SVG_PATH)} (${svg.length} bytes)`);

  // ── Android legacy mipmaps (square + round variants share the same PNG)
  for (const { name, size } of ANDROID_BUCKETS) {
    const dir = path.join(ANDROID_RES, `mipmap-${name}`);
    fs.mkdirSync(dir, { recursive: true });
    const buf = await rasterize(svg, size);
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), buf);
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), buf);
    console.log(`  ✓ mipmap-${name}/ic_launcher{,_round}.png  (${size}×${size})`);
  }

  // ── Android Adaptive Icon assets
  // Foreground: 432×432 living inside a 108×108 safe zone on a 432×432 canvas.
  // We resize the SVG to 432 (whole icon), then mask/inset isn't required —
  // Android's adaptive-icon engine handles cropping + safe-zone.
  const fgDir = path.join(ANDROID_RES, 'drawable');
  fs.mkdirSync(fgDir, { recursive: true });
  const fgBuf = await rasterizeTransparent(svg, 432);
  fs.writeFileSync(path.join(fgDir, 'ic_launcher_foreground.png'), fgBuf);
  // Background: solid white tile (matches the SVG bg color).
  const bgDir = path.join(ANDROID_RES, 'drawable');
  const bgBuf = await sharp({
    create: { width: 432, height: 432, channels: 4, background: '#FFFFFF' },
  }).png().toBuffer();
  fs.writeFileSync(path.join(bgDir, 'ic_launcher_background.png'), bgBuf);
  console.log('  ✓ drawable/ic_launcher_{foreground,background}.png  (432×432)');

  // ── iOS AppIcon
  fs.mkdirSync(IOS_APPICONSET, { recursive: true });
  const iosContents = [];
  for (const slot of IOS_SLOTS) {
    const buf = await rasterize(svg, slot.px);
    const file = `App-Icon-${slot.size}@${slot.scale}-${slot.idiom}.png`;
    fs.writeFileSync(path.join(IOS_APPICONSET, file), buf);
    iosContents.push({
      filename: file,
      idiom: slot.idiom,
      size: slot.size,
      scale: slot.scale,
    });
  }
  // Write Contents.json so Xcode picks the slots up.
  const contentsJson = { images: iosContents, info: { version: 1, author: 'generate-icon.js' } };
  fs.writeFileSync(
    path.join(IOS_APPICONSET, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2) + '\n',
  );
  console.log(`  ✓ ios/.../AppIcon.appiconset/  (${IOS_SLOTS.length} variants)`);

  // ── Admin web favicon (SVG, modern browsers).
  fs.mkdirSync(ADMIN_PUBLIC, { recursive: true });
  fs.copyFileSync(SVG_PATH, path.join(ADMIN_PUBLIC, 'icon.svg'));
  // Also write a 32×32 PNG fallback for legacy browsers / Slack previews.
  const tiny = await rasterize(svg, 32);
  fs.writeFileSync(path.join(ADMIN_PUBLIC, 'favicon.ico.png'), tiny);
  console.log('  ✓ admin/public/icon.svg  + favicon.ico.png');

  console.log('\n✅ Done. Restart `npx react-native run-android` (or rebuild iOS) to see it.');
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});