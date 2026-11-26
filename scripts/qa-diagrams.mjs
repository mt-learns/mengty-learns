/* global window, document */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'out');
const QA_DIR = path.join(ROOT, 'qa', 'diagrams');

const PAGES = [
  { slug: 'bridge', urlPath: '/docs/design/bridge/' },
  { slug: 'service-routing', urlPath: '/docs/kubernetes/service-routing/' },
  { slug: 'layered', urlPath: '/docs/architecture/layered/' },
  { slug: 'hexagonal', urlPath: '/docs/architecture/hexagonal/' },
  { slug: 'dependency-inversion', urlPath: '/docs/architecture/dependency-inversion/' },
  { slug: 'compare-styles', urlPath: '/docs/architecture/compare-styles/' },
  { slug: 'kitchen-sink', urlPath: '/docs/kitchen-sink/' },
];

const WIDTHS = [360, 768, 1280];
const THEMES = ['light', 'dark'];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function startStaticServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqPath = (req.url || '/').split('?')[0];
      let filePath = path.join(rootDir, decodeURIComponent(reqPath));
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else if (!fs.existsSync(filePath) && fs.existsSync(`${filePath}.html`)) {
        filePath = `${filePath}.html`;
      } else if (!fs.existsSync(filePath)) {
        filePath = path.join(rootDir, '404.html');
      }

      const ext = path.extname(filePath);
      res.writeHead(fs.existsSync(filePath) ? 200 : 404, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, port: addr.port });
    });
  });
}

async function capturePage(page, baseUrl, item, width, theme, suffix = '') {
  await page.setViewportSize({ width, height: 900 });
  await page.addInitScript((t) => {
    window.localStorage.setItem('theme', t);
  }, theme);

  await page.goto(`${baseUrl}${item.urlPath}`, { waitUntil: 'networkidle' });
  await page.evaluate((t) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(t);
    root.style.colorScheme = t;
    window.localStorage.setItem('theme', t);
  }, theme);

  // Scroll each diagram and flow into view to trigger lazy loading, then advance step 1 on flows
  const regions = page.locator('section[id^="flow-"], div[id^="diagram-"]');
  const count = await regions.count();
  for (let i = 0; i < count; i++) {
    const region = regions.nth(i);
    await region.scrollIntoViewIfNeeded();
    const id = await region.getAttribute('id');
    if (id && id.startsWith('flow-')) {
      await region.locator('.react-flow__node').first().waitFor({ timeout: 5000 }).catch(() => {});
      const nextBtn = region.getByRole('button', { name: 'Next step' });
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
      }
    }
  }

  await page.waitForTimeout(350);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);

  const fileName = `${item.slug}-${width}-${theme}${suffix}.png`;
  const outPath = path.join(QA_DIR, fileName);
  await page.screenshot({ path: outPath, fullPage: true });
  return fileName;
}

async function main() {
  console.log('Building static site...');
  const buildRes = spawnSync('pnpm', ['build'], {
    stdio: 'inherit',
    shell: true,
  });
  if (buildRes.status !== 0) {
    process.exit(buildRes.status ?? 1);
  }

  fs.mkdirSync(QA_DIR, { recursive: true });
  const { server, port } = await startStaticServer(OUT_DIR);
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Serving out/ at ${baseUrl}`);

  const browser = await chromium.launch();
  try {
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
        });
        const page = await context.newPage();
        for (const item of PAGES) {
          const file = await capturePage(page, baseUrl, item, width, theme);
          console.log(`Captured ${file}`);
        }
        await context.close();
      }
    }

    // Reduced-motion run (§9.4)
    for (const theme of THEMES) {
      const rmContext = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        colorScheme: theme,
        reducedMotion: 'reduce',
      });
      const rmPage = await rmContext.newPage();
      const file = await capturePage(
        rmPage,
        baseUrl,
        PAGES[0],
        1280,
        theme,
        '-reduced-motion',
      );
      console.log(`Captured ${file}`);
      await rmContext.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
