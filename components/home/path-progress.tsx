'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** "x / N done" from localStorage; the slot is reserved and stays invisible until hydrated. */
export function PathProgress({ urls }: { urls: string[] }) {
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    let completed: Record<string, unknown> = {};
    try {
      completed = JSON.parse(localStorage.getItem('mt-completed-v1') || '{}');
    } catch {
      completed = {};
    }
    setDone(urls.filter((url) => completed[url]).length);
  }, [urls]);

  const ratio = done !== null && urls.length > 0 ? Math.min(1, done / urls.length) : 0;

  return (
    <span
      className={cn(
        'relative inline-flex overflow-hidden rounded-pill bg-primary-soft px-2.5 py-0.5 text-footnote font-medium tabular-nums text-primary',
        done === null && 'invisible',
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 origin-left bg-primary/15 transition-transform duration-500 ease-[var(--ease-ios)] motion-reduce:transition-none"
        style={{ transform: `scaleX(${ratio})` }}
      />
      <span className="relative">
        {done ?? 0} / {urls.length} done
      </span>
    </span>
  );
}
