// Fails when any App Router route would render on demand in the Worker.
// Every route must be prerendered (in prerender-manifest `routes`) or be a
// dynamic segment whose params are fixed at build time (`fallback: false`,
// i.e. generateStaticParams + dynamicParams = false). Run after `next build`.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] ?? '.next');
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

const appRoutes = Object.values(read('app-path-routes-manifest.json'));
const { routes, dynamicRoutes } = read('prerender-manifest.json');

const notStatic = appRoutes.filter((route) => {
  if (route in routes) return false;
  const dyn = dynamicRoutes[route];
  return !(dyn && dyn.fallback === false);
});

const prerendered = Object.keys(routes).length;
if (notStatic.length) {
  console.error(`check-static-routes: ${notStatic.length} route(s) are not static:`);
  for (const r of notStatic) console.error(`  ${r} (${r in dynamicRoutes ? `fallback=${dynamicRoutes[r].fallback}` : 'dynamic'})`);
  process.exit(1);
}
console.log(`check-static-routes: ${appRoutes.length} routes, all static (${prerendered} prerendered paths)`);
