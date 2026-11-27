import type { ReactNode } from 'react';

/** Page title block for app pages. Server component — no client JS. */
export function LargeTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-2">{children}</h1>
      {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
