import { type ReactNode } from 'react';
import { Ban, Check } from 'lucide-react';

export interface ChecklistProps {
  use?: string[];
  avoid?: string[];
  children?: ReactNode;
}

/**
 * Displays "When to use" and "When to avoid" guidance in a responsive two-column card layout.
 */
export function Checklist({ use = [], avoid = [], children }: ChecklistProps) {
  return (
    <div className="my-6 space-y-4">
      {(use.length > 0 || avoid.length > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {use.length > 0 && (
            <div className="rounded-panel border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2 text-subheadline font-headline text-primary">
                <Check className="size-4 shrink-0" aria-hidden="true" />
                <span>When to use</span>
              </div>
              <ul className="m-0 list-none space-y-2 p-0 text-subheadline text-card-foreground">
                {use.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check
                      className="mt-1 size-3.5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {avoid.length > 0 && (
            <div className="rounded-panel border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2 text-subheadline font-headline text-destructive">
                <Ban className="size-4 shrink-0" aria-hidden="true" />
                <span>When to avoid</span>
              </div>
              <ul className="m-0 list-none space-y-2 p-0 text-subheadline text-card-foreground">
                {avoid.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Ban
                      className="mt-1 size-3.5 shrink-0 text-destructive"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
