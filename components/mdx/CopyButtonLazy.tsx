'use client';

import { Suspense, lazy } from 'react';

const LazyCopyButton = lazy(() => import('./CopyButton'));

function CopyButtonFallback({ ariaLabel }: { ariaLabel: string }) {
  return (
    <button
      type="button"
      disabled
      aria-label={ariaLabel}
      className="inline-flex min-h-tap shrink-0 items-center gap-1.5 self-start rounded-control border border-border-strong bg-card px-3 text-footnote font-medium text-foreground"
    >
      <span>Copy</span>
    </button>
  );
}

export function CopyButtonLazy({
  text,
  ariaLabel,
}: {
  text: string;
  ariaLabel: string;
}) {
  return (
    <Suspense fallback={<CopyButtonFallback ariaLabel={ariaLabel} />}>
      <LazyCopyButton text={text} ariaLabel={ariaLabel} />
    </Suspense>
  );
}
