import { describe, expect, it } from 'vitest';
import { cacheNames, classifyRequest, isLegacyCache } from './sw-routing.mjs';

const ORIGIN = 'https://learn.limmengty.com';

describe('sw-routing', () => {
  describe('cacheNames & isLegacyCache', () => {
    it('builds versioned cache names with mt-<version>- prefix', () => {
      const names = cacheNames('0.2.0-abc');
      expect(names.precache).toBe('mt-0.2.0-abc-precache');
      expect(names.static).toBe('mt-0.2.0-abc-static');
      expect(names.pages).toBe('mt-0.2.0-abc-pages');
      expect(names.media).toBe('mt-0.2.0-abc-media');
      expect(names.data).toBe('mt-0.2.0-abc-data');
    });

    it('identifies old mt-* caches for cleanup without touching unrelated caches', () => {
      expect(isLegacyCache('mt-0.1.0-pages', '0.2.0-abc')).toBe(true);
      expect(isLegacyCache('mt-0.2.0-abc-pages', '0.2.0-abc')).toBe(false);
      expect(isLegacyCache('other-app-cache', '0.2.0-abc')).toBe(false);
    });
  });

  describe('classifyRequest', () => {
    it('bypasses non-GET and cross-origin requests', () => {
      expect(classifyRequest({ url: `${ORIGIN}/review/`, method: 'POST' }, ORIGIN)).toEqual({
        strategy: 'bypass',
      });
      expect(classifyRequest({ url: 'https://example.com/a.png', method: 'GET' }, ORIGIN)).toEqual({
        strategy: 'bypass',
      });
    });

    it('never caches sw.js or sw-manifest.json', () => {
      expect(classifyRequest({ url: `${ORIGIN}/sw.js` }, ORIGIN)).toEqual({
        strategy: 'network-only',
      });
      expect(classifyRequest({ url: `${ORIGIN}/sw-manifest.json` }, ORIGIN)).toEqual({
        strategy: 'network-only',
      });
    });

    it('uses cache-first for /_next/static/* hashed assets', () => {
      expect(
        classifyRequest({ url: `${ORIGIN}/_next/static/chunks/main-123.js` }, ORIGIN),
      ).toEqual({ strategy: 'cache-first', cache: 'static' });
    });

    it('uses stale-while-revalidate for /cards.json', () => {
      expect(classifyRequest({ url: `${ORIGIN}/cards.json` }, ORIGIN)).toEqual({
        strategy: 'stale-while-revalidate',
        cache: 'data',
      });
    });

    it('uses network-first with 3s timeout and /offline/ fallback for HTML navigations', () => {
      expect(
        classifyRequest(
          { url: `${ORIGIN}/docs/design/bridge/`, mode: 'navigate', destination: 'document' },
          ORIGIN,
        ),
      ).toEqual({
        strategy: 'network-first',
        cache: 'pages',
        timeoutMs: 3000,
        maxEntries: 80,
        fallback: '/offline/',
      });
    });

    it('uses network-first for RSC payloads', () => {
      expect(
        classifyRequest({ url: `${ORIGIN}/docs/design/bridge/?_rsc=1abc` }, ORIGIN),
      ).toEqual({
        strategy: 'network-first',
        cache: 'pages',
        timeoutMs: 3000,
        maxEntries: 80,
      });
      expect(
        classifyRequest(
          { url: `${ORIGIN}/docs/design/bridge/`, headers: { rsc: '1' } },
          ORIGIN,
        ),
      ).toEqual({
        strategy: 'network-first',
        cache: 'pages',
        timeoutMs: 3000,
        maxEntries: 80,
      });
    });

    it('uses cache-first with LRU limit for images, SVGs and fonts', () => {
      expect(
        classifyRequest({ url: `${ORIGIN}/icon-192.png`, destination: 'image' }, ORIGIN),
      ).toEqual({ strategy: 'cache-first', cache: 'media', maxEntries: 120 });
      expect(
        classifyRequest({ url: `${ORIGIN}/illustrations/empty.svg` }, ORIGIN),
      ).toEqual({ strategy: 'cache-first', cache: 'media', maxEntries: 120 });
    });
  });
});
