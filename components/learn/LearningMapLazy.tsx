'use client';

import { Suspense, lazy } from 'react';
import type { LearningMapItem } from './LearningMapClient';

const LazyLearningMapClient = lazy(() => import('./LearningMapClient'));

function LearningMapFallback({ items }: { items: LearningMapItem[] }) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-footnote font-medium text-muted-foreground">
          {items.length} {items.length === 1 ? 'page' : 'pages'} · beginner to advanced
        </span>
      </div>
      <div className="rounded-panel bg-grouped p-3 sm:p-4">
        <ol className="space-y-2.5">
          {items.map((item) => (
            <li
              key={item.url}
              className="flex min-h-tap items-center justify-between rounded-panel border border-border bg-card px-3.5 py-2.5"
            >
              <span className="text-[15px] font-semibold text-foreground">{item.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function LearningMapLazy({ items }: { items: LearningMapItem[] }) {
  return (
    <Suspense fallback={<LearningMapFallback items={items} />}>
      <LazyLearningMapClient items={items} />
    </Suspense>
  );
}
