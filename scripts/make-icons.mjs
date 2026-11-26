import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const faviconSvgPath = path.join(publicDir, 'favicon.svg');
const appleIconPath = path.join(publicDir, 'apple-touch-icon.png');
const ogPngPath = path.join(publicDir, 'og.png');

if (!fs.existsSync(faviconSvgPath)) {
  throw new Error(`Missing ${faviconSvgPath}`);
}

const faviconSvg = fs.readFileSync(faviconSvgPath);

// 180x180 apple-touch-icon PNG generated from favicon.svg
await sharp(faviconSvg, { density: 300 })
  .resize(180, 180)
  .png()
  .toFile(appleIconPath);

console.log(`Generated ${path.relative(process.cwd(), appleIconPath)}`);

// 1200x630 default OpenGraph / Twitter social card PNG
const ogSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <rect width="1200" height="630" fill="#FAFAF8" />
  <rect x="48" y="48" width="1104" height="534" rx="32" fill="#FFFFFF" stroke="#E7E5E4" stroke-width="2" />
  <g transform="translate(108, 120)">
    <path d="M48 3C74.6 3 93 21.4 93 48C93 74.6 74.6 93 48 93C21.4 93 3 74.6 3 48C3 21.4 21.4 3 48 3Z" fill="#0F766E" />
    <path d="M20.25 66V30H28.125L38.625 48.375L49.125 30H57V66H49.5V43.125L40.875 58.125H36.375L27.75 43.125V66H20.25ZM62.25 37.125V30H80.25V37.125H75V66H67.5V37.125H62.25Z" fill="#FFFFFF" />
  </g>
  <text x="108" y="300" fill="#1C1917" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="700" letter-spacing="-1.5">
    Mengty Learns
  </text>
  <text x="108" y="368" fill="#57534E" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="400">
    See how infrastructure really works.
  </text>
  <text x="108" y="510" fill="#0F766E" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600">
    mengtylearns.com
  </text>
</svg>
`);

await sharp(ogSvg)
  .resize(1200, 630)
  .png()
  .toFile(ogPngPath);

console.log(`Generated ${path.relative(process.cwd(), ogPngPath)}`);
