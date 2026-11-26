import { type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface RelationItem {
  name: string;
  summary: string;
  href?: string;
}

export interface RelationsProps {
  items: RelationItem[];
  children?: ReactNode;
}

/**
 * Lists related patterns or concepts in an iOS grouped-list container.
 */
export function Relations({ items, children }: RelationsProps) {
  return (
    <div className="my-6 space-y-3">
      <div className="overflow-hidden rounded-panel border border-border bg-card divide-y divide-border">
        {items.map((item) => {
          const content = (
            <div className="flex min-h-tap items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <div className="text-subheadline font-headline text-foreground">
                  {item.name}
                </div>
                <p className="m-0 mt-0.5 text-footnote text-muted-foreground">
                  {item.summary}
                </p>
              </div>
              {item.href && (
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
          );

          if (item.href) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="block no-underline transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {content}
              </Link>
            );
          }

          return <div key={item.name}>{content}</div>;
        })}
      </div>
      {children}
    </div>
  );
}
