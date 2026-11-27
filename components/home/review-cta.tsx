'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CardRef {
  id: string;
}

type ReviewStatus =
  | { kind: 'loading' }
  | { kind: 'first-time' }
  | { kind: 'returning'; due: number };

/**
 * Review CTA button. Reads `mt-review-v1` from localStorage after hydration:
 * first-time visitors see "Start your first review"; returning visitors see
 * "Today's review" with their due count. Width is reserved to avoid layout shift.
 */
export function ReviewCta({ className }: { className?: string }) {
  const [status, setStatus] = useState<ReviewStatus>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let state: Record<string, { due?: string }> = {};
    try {
      state = JSON.parse(localStorage.getItem('mt-review-v1') || '{}');
    } catch {
      state = {};
    }

    if (Object.keys(state).length === 0) {
      setStatus({ kind: 'first-time' });
      return;
    }

    fetch('/cards.json')
      .then((response) => (response.ok ? (response.json() as Promise<CardRef[]>) : []))
      .then((cards) => {
        if (cancelled) return;
        const now = Date.now();
        const due = cards.filter(
          (card) => !state[card.id]?.due || new Date(state[card.id].due!).getTime() <= now,
        ).length;
        setStatus({ kind: 'returning', due });
      })
      .catch(() => {
        if (!cancelled) setStatus({ kind: 'first-time' });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/review"
      className={cn(
        'inline-grid min-h-tap items-center justify-items-center whitespace-nowrap rounded-control border border-border-strong bg-card px-6 text-headline text-foreground transition-colors hover:bg-accent motion-reduce:transition-none',
        className,
      )}
    >
      {/* Reserved width spacer so neither state causes layout shift */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 inline-flex items-center gap-3">
        <span>Today&apos;s review</span>
        <span className="inline-flex min-w-[5.5rem] justify-center rounded-pill px-2.5 py-0.5 text-footnote font-semibold tabular-nums">
          000 cards due
        </span>
      </span>

      <span
        aria-live="polite"
        className={cn(
          'col-start-1 row-start-1 inline-flex items-center gap-3',
          status.kind === 'loading' && 'invisible',
        )}
      >
        {status.kind === 'returning' ? (
          <>
            <span>Today&apos;s review</span>
            <span className="inline-flex min-w-[5.5rem] justify-center rounded-pill bg-highlight-soft px-2.5 py-0.5 text-footnote font-semibold tabular-nums text-highlight-text">
              {status.due} {status.due === 1 ? 'card' : 'cards'} due
            </span>
          </>
        ) : (
          <span>Start your first review</span>
        )}
      </span>
    </Link>
  );
}
