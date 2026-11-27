'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';

export function Template({
  title = 'Template',
  text,
  children,
}: {
  title?: string;
  text?: string;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  async function handleCopy() {
    const content = text ?? bodyRef.current?.innerText ?? '';
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  }

  return (
    <section
      aria-label={title}
      className="not-prose my-5 overflow-hidden rounded-card border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-grouped px-4 py-2.5">
        <span className="font-sans text-footnote font-semibold text-foreground">{title}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${title}`}
          className="inline-flex min-h-tap items-center gap-1.5 rounded-control border border-border-strong bg-card px-3 text-footnote font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {copied ? (
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
      </div>
      <div
        ref={bodyRef}
        className="whitespace-pre-wrap px-4 py-3.5 font-reading text-callout leading-[1.6] text-foreground"
      >
        {text ?? children}
      </div>
    </section>
  );
}
