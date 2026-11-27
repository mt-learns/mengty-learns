'use client';

import { Suspense, lazy } from 'react';
import type { DecisionTreeNode } from './DecisionTree';

const LazyChooser = lazy(() => import('./DecisionTreeChooser'));

function ChooserFallback({
  title,
  startNode,
}: {
  title: string;
  startNode?: DecisionTreeNode;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-sans text-headline font-semibold text-foreground">{title}</div>
      </div>
      {startNode && (
        <div className="rounded-panel border border-border bg-grouped p-4">
          <p className="font-reading text-callout font-semibold text-foreground">
            {startNode.question ?? startNode.label}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {startNode.yes && (
              <span className="inline-flex min-h-tap items-center justify-center rounded-control bg-primary px-5 font-sans text-footnote font-semibold text-primary-foreground">
                Yes
              </span>
            )}
            {startNode.no && (
              <span className="inline-flex min-h-tap items-center justify-center rounded-control border border-border-strong bg-card px-5 font-sans text-footnote font-semibold text-foreground">
                No
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function DecisionTreeLazy({
  title = 'Decision guide',
  start,
  nodes,
}: {
  title?: string;
  start: string;
  nodes: DecisionTreeNode[];
}) {
  const startNode = nodes.find((n) => n.id === start) ?? nodes[0];
  return (
    <Suspense fallback={<ChooserFallback title={title} startNode={startNode} />}>
      <LazyChooser title={title} start={start} nodes={nodes} />
    </Suspense>
  );
}
