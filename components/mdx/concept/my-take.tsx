import { type ReactNode } from 'react';
import { MessageSquareQuote } from 'lucide-react';

export interface MyTakeProps {
  children: ReactNode;
  title?: string;
}

/**
 * Separates personal opinions and practical takeaways from documented facts.
 */
export function MyTake({ children, title = 'My take' }: MyTakeProps) {
  return (
    <aside
      aria-label={title}
      className="my-6 rounded-panel border border-border bg-muted/60 p-4 text-subheadline text-foreground"
    >
      <div className="mb-1.5 flex items-center gap-2 font-headline text-foreground">
        <MessageSquareQuote className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
        <span>{title}</span>
      </div>
      <div className="text-muted-foreground [&>p]:my-1.5 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
