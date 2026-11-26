import { type ReactNode } from 'react';
import { Lightbulb } from 'lucide-react';

export interface AnalogyProps {
  children: ReactNode;
  title?: string;
}

/**
 * Presents a real-world analogy for an abstract concept.
 */
export function Analogy({ children, title = 'Real-world analogy' }: AnalogyProps) {
  return (
    <aside
      aria-label={title}
      className="my-6 rounded-panel border border-border bg-card p-5 text-card-foreground"
    >
      <div className="mb-2 flex items-center gap-2 text-subheadline font-headline text-foreground">
        <span className="inline-flex size-7 items-center justify-center rounded-control bg-primary/10 text-primary">
          <Lightbulb className="size-4 shrink-0" aria-hidden="true" />
        </span>
        <span>{title}</span>
      </div>
      <div className="text-callout text-muted-foreground [&>p]:my-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
