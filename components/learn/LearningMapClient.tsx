'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LearningMapItem {
  url: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  kind: string;
}

const STORAGE_KEY = 'mt-completed-v1';

const LEVEL_LABEL: Record<LearningMapItem['level'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/**
 * Client island for LearningMap: reads `mt-completed-v1` from localStorage
 * after mount without shifting any layout dimensions.
 */
export function LearningMapClient({ items }: { items: LearningMapItem[] }) {
  const [completed, setCompleted] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    try {
      setCompleted(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch {
      setCompleted({});
    }
  }, []);

  const doneCount = completed ? items.filter((item) => Boolean(completed[item.url])).length : 0;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-footnote font-medium text-muted-foreground">
          {items.length} {items.length === 1 ? 'page' : 'pages'} · beginner to advanced
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-pill bg-primary-soft px-2.5 py-0.5 text-footnote font-medium tabular-nums text-primary',
            completed === null && 'invisible',
          )}
        >
          {doneCount} / {items.length} done
        </span>
      </div>

      <div className="rounded-panel bg-grouped p-3 sm:p-4">
        <ol className="relative space-y-2.5">
          {items.map((item, idx) => {
            const isDone = Boolean(completed?.[item.url]);
            const isLast = idx === items.length - 1;
            return (
              <li key={item.url} className="relative flex items-stretch gap-3">
                {/* Vertical SVG rail + node marker */}
                <div className="relative flex w-7 shrink-0 flex-col items-center" aria-hidden="true">
                  <svg
                    viewBox="0 0 28 28"
                    width={28}
                    height={28}
                    className={cn(
                      'relative z-10 mt-2.5 shrink-0 transition-colors duration-150',
                      isDone ? 'text-primary' : 'text-border-strong',
                    )}
                  >
                    <circle
                      cx="14"
                      cy="14"
                      r="12"
                      fill={isDone ? 'var(--primary)' : 'var(--card)'}
                      stroke={isDone ? 'var(--primary)' : 'var(--border-strong)'}
                      strokeWidth="2"
                    />
                  </svg>
                  <span
                    className={cn(
                      'pointer-events-none absolute top-2.5 z-20 flex size-7 items-center justify-center text-caption-1 font-bold tabular-nums',
                      isDone ? 'text-primary-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {isDone ? (
                      <Check className="size-4" strokeWidth={2.25} aria-hidden="true" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </span>
                  {!isLast && (
                    <svg
                      className="w-0.5 flex-1 text-border-strong"
                      preserveAspectRatio="none"
                      viewBox="0 0 2 24"
                      aria-hidden="true"
                    >
                      <line
                        x1="1"
                        y1="0"
                        x2="1"
                        y2="24"
                        stroke={isDone ? 'var(--primary)' : 'var(--border-strong)'}
                        strokeWidth="2"
                        strokeDasharray={isDone ? undefined : '4 3'}
                      />
                    </svg>
                  )}
                </div>

                {/* Clickable page node */}
                <Link
                  href={item.url}
                  prefetch={false}
                  className={cn(
                    'group flex min-h-tap flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-panel border px-3.5 py-2.5 no-underline transition-colors duration-150',
                    isDone
                      ? 'border-primary/40 bg-primary-soft/40 hover:border-primary'
                      : 'border-border bg-card hover:border-primary/50',
                  )}
                >
                  <span className="text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary">
                    {item.title}
                  </span>
                  <span className="flex items-center gap-2 text-caption-1 text-muted-foreground">
                    <span>{LEVEL_LABEL[item.level]}</span>
                    {isDone && (
                      <span className="rounded-pill bg-primary-soft px-2 py-0.5 font-medium text-primary">
                        Done
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
