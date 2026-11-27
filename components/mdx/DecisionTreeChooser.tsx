'use client';

import { useState } from 'react';
import { GitFork, RotateCcw } from 'lucide-react';
import type { DecisionTreeNode } from './DecisionTree';

export default function DecisionTreeChooser({
  title = 'Decision guide',
  start,
  nodes,
}: {
  title?: string;
  start: string;
  nodes: DecisionTreeNode[];
}) {
  const [history, setHistory] = useState<{ nodeId: string; choice?: 'Yes' | 'No' }[]>([
    { nodeId: start },
  ]);

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const currentEntry = history[history.length - 1];
  const current = byId.get(currentEntry?.nodeId ?? start) ?? nodes[0];

  function choose(branch: 'yes' | 'no', targetId: string) {
    setHistory((prev) => [
      ...prev.slice(0, -1),
      { ...prev[prev.length - 1], choice: branch === 'yes' ? 'Yes' : 'No' },
      { nodeId: targetId },
    ]);
  }

  function reset() {
    setHistory([{ nodeId: start }]);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-sans text-headline font-semibold text-foreground">
          <GitFork className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
          <span>{title}</span>
        </div>
        {history.length > 1 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-tap items-center gap-1.5 rounded-control border border-border-strong bg-background px-3 text-footnote font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <RotateCcw className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>Start over</span>
          </button>
        )}
      </div>

      {current && (
        <div className="rounded-panel border border-border bg-grouped p-4">
          {current.result ? (
            <div>
              <span className="inline-flex rounded-pill bg-primary-soft px-2.5 py-0.5 font-sans text-caption-1 font-semibold text-primary">
                Answer
              </span>
              <p className="mt-2 font-reading text-callout font-semibold text-foreground">
                {current.result}
              </p>
              {current.subtitle && (
                <p className="mt-1 font-reading text-subheadline text-muted-foreground">
                  {current.subtitle}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="font-reading text-callout font-semibold text-foreground">
                {current.question ?? current.label}
              </p>
              {current.subtitle && (
                <p className="mt-1 font-reading text-subheadline text-muted-foreground">
                  {current.subtitle}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {current.yes && (
                  <button
                    type="button"
                    onClick={() => choose('yes', current.yes!)}
                    className="inline-flex min-h-tap items-center justify-center rounded-control bg-primary px-5 font-sans text-footnote font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    Yes
                  </button>
                )}
                {current.no && (
                  <button
                    type="button"
                    onClick={() => choose('no', current.no!)}
                    className="inline-flex min-h-tap items-center justify-center rounded-control border border-border-strong bg-card px-5 font-sans text-footnote font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    No
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
