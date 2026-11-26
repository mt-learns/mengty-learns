/* global fetch, setTimeout */
// axe-core scan of the static export, light and dark, same routes as the CI
// quality job plus /radar and the 404. Exits 1 on any serious/critical issue.
//   pnpm build && node scripts/qa-axe.mjs
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const routes = ['/', '/docs/', '/docs/design/bridge/', '/review/', '/radar/', '/this-page-does-not-exist/'];

const port = await new Promise((resolve) => {
  const srv = net.createServer();
  srv.listen(0, () => {
    const { port: p } = srv.address();
    srv.close(() => resolve(p));
  });
});
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
  server.kill();
}
if (blocking) process.exitCode = 1;
