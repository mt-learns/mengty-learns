import { type ReactNode } from 'react';
import { Target } from 'lucide-react';

export interface IntentProps {
  children: ReactNode;
  title?: string;
}

/**
 * Highlights the core 2-3 line TL;DR intent at the top of a concept page.
 */
export function Intent({ children, title = 'TL;DR' }: IntentProps) {
  return (
    <section
      aria-label={title}
      className="my-6 rounded-panel border border-primary/25 bg-primary/5 p-5"
    >
      <div className="mb-2 flex items-center gap-2 text-subheadline font-headline text-primary">
        <Target className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span>{title}</span>
      </div>
      <div className="text-body text-foreground [&>p]:my-0">{children}</div>
    </section>
  );
}
