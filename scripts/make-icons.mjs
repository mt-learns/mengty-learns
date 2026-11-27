// Generates PWA icons, public/apple-touch-icon.png, and public/og.png from the "mt" monogram.
//   node scripts/make-icons.mjs
// The path data matches design/logo/mark.svg and components/brand/logo.tsx (128 grid, stroke 16).
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const appleIconPath = path.join(publicDir, 'apple-touch-icon.png');
const ogPngPath = path.join(publicDir, 'og.png');

const PAPER = '#FAFAF8';
const INK = '#1C1917';
const MUTED = '#57534E';
const JADE = '#0F766E';
const AMBER = '#B45309';
const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif";

/** The mark, drawn into a square of `size` px at (x, y) via a nested viewBox (no transforms). */
const mark = (x, y, size, strokeColor = JADE, dotColor = AMBER) => `
  <svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 128 128" fill="none">
    <path d="M16 104V64A16 16 0 0 1 48 64V104M48 64A16 16 0 0 1 64 48H88M80 24V92A12 12 0 0 0 92 104"
      stroke="${strokeColor}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="116" cy="48" r="9" fill="${dotColor}" />
  </svg>`;

// 180x180 apple-touch-icon: solid paper tile (no alpha; iOS fills transparency with black),
// mark at 120px = 30px safe padding.
const appleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="${PAPER}" />
  ${mark(30, 30, 120)}
</svg>`;

await sharp(Buffer.from(appleSvg)).removeAlpha().png().toFile(appleIconPath);
console.log(`Generated ${path.relative(process.cwd(), appleIconPath)}`);

// Standard ("any") and maskable icons (192, 512).
// Maskable safe zone is the central 80% diameter circle; placing the mark at 60% size
// centered (20% inset on each side) keeps every stroke and the amber dot well inside.
for (const size of [192, 512]) {
  const anyPad = Math.round(size * 0.14);
  const anyMark = size - anyPad * 2;
  const anySvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="${PAPER}" />
  ${mark(anyPad, anyPad, anyMark)}
</svg>`;
  const anyPath = path.join(publicDir, `icon-${size}.png`);
  await sharp(Buffer.from(anySvg)).png().toFile(anyPath);
  console.log(`Generated ${path.relative(process.cwd(), anyPath)}`);

  const maskPad = Math.round(size * 0.2);
  const maskMark = size - maskPad * 2;
  const maskSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${PAPER}" />
  ${mark(maskPad, maskPad, maskMark)}
</svg>`;
  const maskPath = path.join(publicDir, `icon-maskable-${size}.png`);
  await sharp(Buffer.from(maskSvg)).removeAlpha().png().toFile(maskPath);
  console.log(`Generated ${path.relative(process.cwd(), maskPath)}`);

  // Monochrome icon for Android themed icons: opaque foreground on transparent background inside safe zone.
  const monoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${mark(maskPad, maskPad, maskMark, '#000000', '#000000')}
</svg>`;
  const monoPath = path.join(publicDir, `icon-monochrome-${size}.png`);
  await sharp(Buffer.from(monoSvg)).png().toFile(monoPath);
  console.log(`Generated ${path.relative(process.cwd(), monoPath)}`);
}

// 1200x630 OpenGraph / Twitter card on the Ink & Jade paper: lockup, hero line, domain.
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <rect width="1200" height="630" fill="${PAPER}" />
  ${mark(96, 88, 96)}
  <text x="212" y="149" fill="${INK}" font-family="${FONT}" font-size="40" font-weight="600" letter-spacing="-0.8">Mengty Learns</text>
  <text x="96" y="342" fill="${INK}" font-family="${FONT}" font-size="76" font-weight="700" letter-spacing="-1.5">See how infrastructure</text>
  <text x="96" y="430" fill="${INK}" font-family="${FONT}" font-size="76" font-weight="700" letter-spacing="-1.5">really works.</text>
  <text x="96" y="534" fill="${MUTED}" font-family="${FONT}" font-size="28" font-weight="400">DevOps · Architecture · Security</text>
  <text x="1104" y="534" text-anchor="end" fill="${JADE}" font-family="${FONT}" font-size="28" font-weight="600">learn.limmengty.com</text>
</svg>`;

await sharp(Buffer.from(ogSvg)).png().toFile(ogPngPath);
console.log(`Generated ${path.relative(process.cwd(), ogPngPath)}`);
