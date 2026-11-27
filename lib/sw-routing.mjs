/* global URL */
/**
 * Pure service worker cache-routing and cache-naming logic.
 * Tested in Vitest (lib/sw-routing.test.ts) and mirrored in public/sw.js.
 */

export const CACHE_PREFIX = 'mt-';

/**
 * @param {string} version
 */
export function cacheNames(version) {
  const base = `${CACHE_PREFIX}${version}-`;
  return {
    prefix: base,
    precache: `${base}precache`,
    static: `${base}static`,
    pages: `${base}pages`,
    media: `${base}media`,
    data: `${base}data`,
  };
}

/**
 * Returns true if a cache name belongs to this app (`mt-*`) and is from an older version.
 * @param {string} cacheName
 * @param {string} currentVersion
 */
export function isLegacyCache(cacheName, currentVersion) {
  if (!cacheName.startsWith(CACHE_PREFIX)) return false;
  return !cacheName.startsWith(`${CACHE_PREFIX}${currentVersion}-`);
}

const MEDIA_EXT_RE = /\.(?:png|jpe?g|webp|gif|svg|ico|woff2?|ttf|eot|avif)$/i;

/**
 * Classify a fetch request into a caching strategy.
 *
 * @param {{
 *   url: string;
 *   method?: string;
 *   mode?: string;
 *   destination?: string;
 *   headers?: Record<string, string>;
 * }} req
 * @param {string} origin
 * @returns {{
 *   strategy: 'bypass' | 'network-only' | 'cache-first' | 'network-first' | 'stale-while-revalidate';
 *   cache?: 'static' | 'pages' | 'media' | 'data';
 *   timeoutMs?: number;
 *   maxEntries?: number;
 *   fallback?: string;
 * }}
 */
export function classifyRequest(req, origin) {
  if ((req.method || 'GET').toUpperCase() !== 'GET') {
    return { strategy: 'bypass' };
  }

  let parsed;
  try {
    parsed = new URL(req.url, origin);
  } catch {
    return { strategy: 'bypass' };
  }

  if (parsed.origin !== origin) {
    return { strategy: 'bypass' };
  }

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

  const headers = req.headers || {};
  const isRsc =
    searchParams.has('_rsc') ||
    headers['rsc'] === '1' ||
    pathname.includes('__next');
  if (isRsc) {
    return { strategy: 'network-first', cache: 'pages', timeoutMs: 3000, maxEntries: 80 };
  }

  const accept = headers['accept'] || '';
  const isNavigation =
    req.mode === 'navigate' ||
    req.destination === 'document' ||
    accept.includes('text/html');
  if (isNavigation) {
    return {
      strategy: 'network-first',
      cache: 'pages',
      timeoutMs: 3000,
      maxEntries: 80,
      fallback: '/offline/',
    };
  }

  if (
    req.destination === 'image' ||
    req.destination === 'font' ||
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
