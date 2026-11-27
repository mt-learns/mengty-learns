'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyButton({
  text,
  ariaLabel,
}: {
  text: string;
  ariaLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      className="inline-flex min-h-tap shrink-0 items-center gap-1.5 self-start rounded-control border border-border-strong bg-card px-3 text-footnote font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
  );
}
