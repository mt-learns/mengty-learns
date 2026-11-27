// Generates public/sw-manifest.json with the app version, build ID, and shell precache list.
// Run after `next build`: node scripts/build-sw.mjs
import fs from 'node:fs';
import path from 'node:path';

export function buildSwManifest({
  rootDir = process.cwd(),
  outFile = path.join(rootDir, 'public', 'sw-manifest.json'),
} = {}) {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const nextDir = path.join(rootDir, '.next');
  const buildIdPath = path.join(nextDir, 'BUILD_ID');
  const buildId = fs.existsSync(buildIdPath)
    ? fs.readFileSync(buildIdPath, 'utf8').trim()
    : 'dev';

  const version = `${pkg.version}-${buildId}`;

  const precache = [
    '/',
    '/review/',
    '/cards.json',
    '/manifest.webmanifest',
    '/favicon.svg',
    '/icon-192.png',
    '/icon-512.png',
    '/apple-touch-icon.png',
  ];

  // Include /offline/ once the route exists in the build (or app/offline/page.tsx).
  const offlineAppRoute = path.join(rootDir, 'app', 'offline', 'page.tsx');
  const offlineStaticHtml = path.join(nextDir, 'server', 'app', 'offline.html');
  if (fs.existsSync(offlineAppRoute) || fs.existsSync(offlineStaticHtml)) {
    precache.splice(1, 0, '/offline/');
  }

  // Precache core shell CSS, self-hosted fonts, and small JS chunks from .next/static/
  // while leaving heavy lazy chunks (e.g. @xyflow/react, orama) to runtime caching (R14).
  const staticDir = path.join(nextDir, 'static');
  if (fs.existsSync(staticDir)) {
    const MAX_PRECACHE_JS_BYTES = 160 * 1024;
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        const rel = path.relative(nextDir, full).replace(/\\/g, '/');
        const ext = path.extname(entry.name);
        if (ext === '.css' || ext === '.woff2') {
          precache.push(`/_next/${rel}`);
        } else if (ext === '.js') {
          const stat = fs.statSync(full);
          if (stat.size <= MAX_PRECACHE_JS_BYTES) {
            precache.push(`/_next/${rel}`);
          }
        }
      }
    };
    walk(staticDir);
  }

  const manifest = {
    version,
    generatedAt: new Date().toISOString(),
    precache: [...new Set(precache)],
  };

  fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('build-sw.mjs')) {
  const manifest = buildSwManifest();
  console.log(`build-sw: version=${manifest.version}, precache=${manifest.precache.length} entries`);
}
