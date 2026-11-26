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

  return (
    <span
      className={cn(
        'rounded-pill bg-primary-soft px-2.5 py-0.5 text-footnote font-medium tabular-nums text-primary',
        done === null && 'invisible'
      )}
    >
      {done ?? 0} / {urls.length} done
    </span>
  );
}
