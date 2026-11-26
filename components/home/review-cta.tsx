'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CardRef {
  id: string;
}

/**
 * "Today's review" button. The due count needs localStorage, so it appears
 * after hydration in a slot whose width is reserved from the start (no shift).
 */
export function ReviewCta({ className }: { className?: string }) {
  const [due, setDue] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/cards.json')
      .then((response) => (response.ok ? (response.json() as Promise<CardRef[]>) : []))
      .then((cards) => {
        if (cancelled) return;
        let state: Record<string, { due?: string }> = {};
        try {
          state = JSON.parse(localStorage.getItem('mt-review-v1') || '{}');
        } catch {
          state = {};
        }
        const now = Date.now();
        setDue(cards.filter((card) => !state[card.id]?.due || new Date(state[card.id].due!).getTime() <= now).length);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/review"
      className={cn(
        'inline-flex min-h-tap items-center justify-center gap-3 whitespace-nowrap rounded-control border border-border-strong bg-card px-6 text-headline text-foreground transition-colors hover:bg-accent motion-reduce:transition-none',
        className
      )}
    >
      Today&apos;s review
      <span
        aria-live="polite"
        className={cn(
          'inline-flex min-w-[5.5rem] justify-center rounded-pill bg-highlight-soft px-2.5 py-0.5 text-footnote font-semibold tabular-nums text-highlight-text',
          due === null && 'invisible'
        )}
      >
        {due === null ? '00 cards due' : `${due} ${due === 1 ? 'card' : 'cards'} due`}
      </span>
    </Link>
  );
}
