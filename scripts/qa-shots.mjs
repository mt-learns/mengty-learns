/* global fetch, setTimeout, document, getComputedStyle */
// Screenshots of the static export in light and dark at several widths, plus an
// edge-alignment report for the shared container.
//   pnpm build && node scripts/qa-shots.mjs [--out dir] [--routes /,/docs/] [--widths 360,1280]
// Serves out/ itself on a free port. Needs Playwright's Chromium (`pnpm exec playwright install chromium`).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { chromium } from 'playwright';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const outDir = path.resolve(arg('out', '.shots'));
const routes = arg('routes', '/,/docs/,/docs/design/bridge/,/review/,/radar/,/this-page-does-not-exist/').split(',');
const widths = arg('widths', '360,768,1280,1920').split(',').map(Number);
const themes = arg('themes', 'light,dark').split(',');
const fullPage = !process.argv.includes('--viewport-only');

const freePort = () =>
  new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

const port = await freePort();
const server = spawn(process.execPath, [path.resolve('node_modules/serve/build/main.js'), 'out', '-l', String(port), '--no-request-logging'], {
  stdio: 'ignore',
});
const base = `http://127.0.0.1:${port}`;
for (let i = 0; i < 50; i++) {
  try {
    await fetch(base);
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 200));
  }
}

const slug = (route) => (route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '_'));

// Elements whose content box must share the same left/right edges: the
// Fumadocs home nav row and every <Container> (data-edge), footer included.
const EDGE_SELECTORS = ["#nd-nav [class~='max-w-(--fd-layout-width)']", '[data-edge]'];

const browser = await chromium.launch();
const report = [];
try {
  fs.mkdirSync(outDir, { recursive: true });
  for (const theme of themes) {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        colorScheme: theme,
        reducedMotion: 'reduce',
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      for (const route of routes) {
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await page.waitForTimeout(300);
        const file = path.join(outDir, `${slug(route)}-${width}-${theme}.png`);
        await page.screenshot({ path: file, fullPage });
        const edges = await page.evaluate((selectors) => {
          const seen = new Set();
          const out = [];
          for (const sel of selectors) {
            for (const el of document.querySelectorAll(sel)) {
              if (seen.has(el)) continue;
              seen.add(el);
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              const cs = getComputedStyle(el);
              out.push({
                name: el.closest('#nd-nav') ? 'nav' : el.closest('footer') ? 'footer' : el.tagName.toLowerCase(),
                left: Math.round(r.left + parseFloat(cs.paddingLeft)),
                right: Math.round(r.right - parseFloat(cs.paddingRight)),
              });
            }
          }
          return out;
        }, EDGE_SELECTORS);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        report.push({ route, width, theme, file: path.relative(process.cwd(), file), edges, overflow });
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}

let misaligned = 0;
for (const r of report) {
  const lefts = new Set(r.edges.map((e) => e.left));
  const rights = new Set(r.edges.map((e) => e.right));
  const aligned = lefts.size <= 1 && rights.size <= 1;
  if (!aligned) misaligned++;
  const edgeText = r.edges.length ? `${r.edges.length} edges ${aligned ? 'aligned' : 'MISALIGNED ' + JSON.stringify(r.edges)}` : 'no edge markers';
  console.log(`${r.route.padEnd(28)} ${String(r.width).padStart(4)} ${r.theme.padEnd(5)} overflow-x ${r.overflow}px  ${edgeText}`);
}
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
if (misaligned) process.exitCode = 1;
