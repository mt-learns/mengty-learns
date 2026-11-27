/* global self, caches, fetch, Response, URL, setTimeout, clearTimeout */
// Mengty Learns Service Worker (P1: hand-written, dependency-free, versioned caches).

const CACHE_PREFIX = 'mt-';
const MEDIA_EXT_RE = /\.(?:png|jpe?g|webp|gif|svg|ico|woff2?|ttf|eot|avif)$/i;

let currentVersion = '0.2.0';

function cacheNames(version) {
  const base = `${CACHE_PREFIX}${version}-`;
  return {
    precache: `${base}precache`,
    static: `${base}static`,
    pages: `${base}pages`,
    media: `${base}media`,
    data: `${base}data`,
  };
}

function classifyRequest(request) {
  if (request.method !== 'GET') return { strategy: 'bypass' };
  const parsed = new URL(request.url);
  if (parsed.origin !== self.location.origin) return { strategy: 'bypass' };

  const { pathname, searchParams } = parsed;
  if (pathname === '/sw.js' || pathname === '/sw-manifest.json') {
    return { strategy: 'network-only' };
  }
  if (pathname.startsWith('/_next/static/')) {
    return { strategy: 'cache-first', cache: 'static' };
  }
  if (pathname === '/cards.json') {
    return { strategy: 'stale-while-revalidate', cache: 'data' };
  }
  if (pathname === '/api/search' || pathname === '/api/search/') {
    return { strategy: 'network-first', cache: 'data', timeoutMs: 3000 };
  }
  const isRsc =
    searchParams.has('_rsc') ||
    request.headers.get('rsc') === '1' ||
    pathname.includes('__next');
  if (isRsc) {
    return { strategy: 'network-first', cache: 'pages', timeoutMs: 3000, maxEntries: 80 };
  }
  const accept = request.headers.get('accept') || '';
  if (
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    accept.includes('text/html')
  ) {
    return {
      strategy: 'network-first',
      cache: 'pages',
      timeoutMs: 3000,
      maxEntries: 80,
      fallback: '/offline/',
    };
  }
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/illustrations/') ||
    pathname.startsWith('/screenshots/') ||
    pathname.startsWith('/og/') ||
    MEDIA_EXT_RE.test(pathname)
  ) {
    return { strategy: 'cache-first', cache: 'media', maxEntries: 120 };
  }
  return { strategy: 'network-first', cache: 'pages', timeoutMs: 3000, maxEntries: 80 };
}

async function loadManifest() {
  const res = await fetch('/sw-manifest.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch sw-manifest.json: ${res.status}`);
  return res.json();
}

async function resolveVersion() {
  try {
    const manifest = await loadManifest();
    if (manifest && manifest.version) {
      currentVersion = manifest.version;
    }
    return manifest;
  } catch {
    return { version: currentVersion, precache: [] };
  }
}

async function pruneCache(cacheName, maxEntries) {
  if (!maxEntries) return;
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const excess = keys.length - maxEntries;
  if (excess > 0) {
    await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
  }
}

async function putInCache(cacheName, request, response, maxEntries) {
  if (!response || !response.ok) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  if (maxEntries) await pruneCache(cacheName, maxEntries);
}

function fetchWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
    fetch(request).then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const manifest = await resolveVersion();
      const names = cacheNames(manifest.version || currentVersion);
      const cache = await caches.open(names.precache);
      const urls = Array.isArray(manifest.precache) ? manifest.precache : [];
      await Promise.allSettled(
        urls.map(async (url) => {
          const res = await fetch(url, { cache: 'reload' });
          if (res.ok) await cache.put(url, res);
        }),
      );
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await resolveVersion();
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith(CACHE_PREFIX) &&
              !key.startsWith(`${CACHE_PREFIX}${currentVersion}-`),
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const rule = classifyRequest(event.request);
  if (rule.strategy === 'bypass' || rule.strategy === 'network-only') return;

  const names = cacheNames(currentVersion);
  const targetCache = names[rule.cache || 'pages'];

  if (rule.strategy === 'cache-first') {
    event.respondWith(
      (async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        const res = await fetch(event.request);
        event.waitUntil(putInCache(targetCache, event.request, res, rule.maxEntries));
        return res;
      })(),
    );
    return;
  }

  if (rule.strategy === 'stale-while-revalidate') {
    event.respondWith(
      (async () => {
        const cached = await caches.match(event.request);
        const networkPromise = fetch(event.request)
          .then(async (res) => {
            await putInCache(targetCache, event.request, res, rule.maxEntries);
            return res;
          })
          .catch(() => null);
        if (cached) {
          event.waitUntil(networkPromise);
          return cached;
        }
        const res = await networkPromise;
        return res || new Response('Offline', { status: 503, statusText: 'Offline' });
      })(),
    );
    return;
  }

  // network-first
  event.respondWith(
    (async () => {
      try {
        const res = await fetchWithTimeout(event.request, rule.timeoutMs || 3000);
        if (res.ok) {
          event.waitUntil(putInCache(targetCache, event.request, res, rule.maxEntries));
        }
        return res;
      } catch {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (rule.fallback) {
          const offline = await caches.match(rule.fallback);
          if (offline) return offline;
        }
        return new Response('Offline', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    })(),
  );
});
