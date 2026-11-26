/* global document, window, getComputedStyle */
// Screenshots of the site in light and dark at several widths, plus an
// edge-alignment report for the shared container.
//   pnpm preview   (in another terminal: Worker preview on :8787)
//   node scripts/qa-shots.mjs [--url http://localhost:8787] [--out dir] [--routes /,/docs/] [--widths 360,1280]
// Needs Playwright's Chromium (`pnpm exec playwright install chromium`).
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { waitForQaTarget } from './lib/qa-target.mjs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const outDir = path.resolve(arg('out', '.shots'));
const routes = arg('routes', '/,/docs/,/docs/design/bridge/,/review/,/radar/,/digest/rss.xml,/this-page-does-not-exist/').split(',');
const widths = arg('widths', '360,768,1280,1920').split(',').map(Number);
const themes = arg('themes', 'light,dark').split(',');
const fullPage = !process.argv.includes('--viewport-only');

const base = await waitForQaTarget();

const slug = (route) => (route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/[/.]/g, '_'));

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
        // Scroll every <Flow> region into view so IntersectionObserver mounts React Flow
        const flowRegions = page.locator('section[id^="flow-"]');
        const flowCount = await flowRegions.count();
        for (let i = 0; i < flowCount; i++) {
          const region = flowRegions.nth(i);
          await region.scrollIntoViewIfNeeded();
          await region.locator('.react-flow__node').first().waitFor({ timeout: 5000 }).catch(() => {});
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(350);
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
