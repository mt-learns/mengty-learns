'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export interface PatternItem {
  pattern: string;
  example?: string;
  note?: string;
}

export function PatternBank({
  title = 'Sentence patterns',
  patterns,
}: {
  title?: string;
  patterns: PatternItem[];
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function copyPattern(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex((cur) => (cur === index ? null : cur)), 2000);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  }

  return (
    <section
      aria-label={title}
      className="not-prose my-5 rounded-card border border-border bg-card p-5"
    >
      <h3 className="mb-3 font-sans text-headline font-semibold text-foreground">{title}</h3>
      <ul className="space-y-3">
        {patterns.map((item, idx) => {
          const isCopied = copiedIndex === idx;
          return (
            <li
              key={`${idx}-${item.pattern}`}
              className="flex flex-col gap-2 rounded-panel border border-border bg-grouped p-3.5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-reading text-callout font-medium leading-[1.55] text-foreground">
                  {item.pattern}
                </p>
                {item.example && (
                  <p className="mt-1 font-reading text-subheadline text-muted-foreground">
                    Example: <span className="text-foreground">{item.example}</span>
                  </p>
                )}
                {item.note && (
                  <p className="mt-0.5 font-sans text-footnote text-muted-foreground">{item.note}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => copyPattern(item.pattern, idx)}
                aria-label={`Copy pattern: ${item.pattern}`}
                className="inline-flex min-h-tap shrink-0 items-center gap-1.5 self-start rounded-control border border-border-strong bg-card px-3 text-footnote font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {isCopied ? (
                  <>
                    <Check className="size-4 text-success" strokeWidth={2} aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
