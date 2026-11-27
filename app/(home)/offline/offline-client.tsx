'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function formatDocPath(urlPath: string): string {
  return urlPath
    .replace(/^\/docs\//, '')
    .replace(/\/$/, '')
    .split('/')
    .map((seg) => seg.replace(/-/g, ' '))
    .join(' / ');
}

export function OfflineClient() {
  const [cachedDocs, setCachedDocs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof caches === 'undefined') return;
    let cancelled = false;
    (async () => {
      try {
        const keys = await caches.keys();
        const pageCaches = keys.filter((k) => k.startsWith('mt-') && k.endsWith('-pages'));
        const urls = new Set<string>();
        for (const name of pageCaches) {
          const cache = await caches.open(name);
          const reqs = await cache.keys();
          for (const req of reqs) {
            const u = new URL(req.url);
            if (
              u.pathname.startsWith('/docs/') &&
              !u.searchParams.has('_rsc') &&
              !u.pathname.includes('__next')
            ) {
              urls.add(u.pathname);
            }
          }
        }
        if (!cancelled) {
          setCachedDocs([...urls].sort().slice(0, 20));
        }
      } catch {
        // Ignore cache inspection errors.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.location.reload()}
          className="min-h-tap rounded-control"
        >
          <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden="true" />
          <span>Try again</span>
        </Button>
      </div>

      {cachedDocs.length > 0 && (
        <section aria-labelledby="cached-pages-heading" className="rounded-card border bg-card p-6 space-y-3">
          <h2 id="cached-pages-heading" className="text-headline font-semibold">
            Available offline on this device
          </h2>
          <ul className="divide-y divide-border">
            {cachedDocs.map((pathname) => (
              <li key={pathname}>
                <Link
                  href={pathname}
                  className="flex min-h-tap items-center py-2 text-subheadline text-link underline-offset-4 hover:underline capitalize"
                >
                  {formatDocPath(pathname) || 'Docs home'}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
