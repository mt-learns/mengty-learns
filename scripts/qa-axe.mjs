// axe-core scan of the site, light and dark, same routes as the CI
// quality job plus /radar, /digest and the 404. Exits 1 on any serious/critical issue.
//   pnpm preview   (in another terminal: Worker preview on :8787)
//   node scripts/qa-axe.mjs [--url http://localhost:8787]
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';
import { waitForQaTarget } from './lib/qa-target.mjs';

const routes = ['/', '/docs/', '/docs/design/bridge/', '/review/', '/radar/', '/digest/', '/this-page-does-not-exist/'];

const base = await waitForQaTarget();

const browser = await chromium.launch();
let blocking = 0;
try {
  for (const colorScheme of ['light', 'dark']) {
    for (const route of routes) {
      const context = await browser.newContext({ colorScheme });
      const page = await context.newPage();
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      blocking += serious.length;
      const others = results.violations.filter((v) => !serious.includes(v)).map((v) => `${v.id} (${v.impact})`);
      console.log(
        `${colorScheme.padEnd(5)} ${route.padEnd(28)} ${results.violations.length} violations, ${serious.length} serious/critical${others.length ? `; other: ${others.join(', ')}` : ''}`
      );
      for (const v of serious) {
        console.log(`      [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes) ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}
if (blocking) process.exitCode = 1;
