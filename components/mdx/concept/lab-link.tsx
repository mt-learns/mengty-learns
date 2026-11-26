import Link from 'next/link';
import { ExternalLink, FlaskConical } from 'lucide-react';

export interface LabLinkProps {
  name: string;
  href?: string;
  description?: string;
  command?: string;
}

/**
 * Links a concept or code section to its runnable hands-on lab directory.
 */
export function LabLink({ name, href, description, command }: LabLinkProps) {
  return (
    <div className="my-6 flex flex-col justify-between gap-3 rounded-panel border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
          <FlaskConical className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="text-subheadline font-headline text-foreground">
            Run it: <code className="font-mono text-footnote">labs/{name}</code>
          </div>
          {description && (
            <p className="m-0 mt-0.5 text-footnote text-muted-foreground">{description}</p>
          )}
          {command && (
            <pre className="mt-2 mb-0 overflow-x-auto rounded-control bg-muted px-3 py-1.5 font-mono text-caption-1 text-foreground">
              <code>{command}</code>
            </pre>
          )}
        </div>
      </div>

      {href && (
        <Link
          href={href}
          className="inline-flex min-h-tap shrink-0 items-center justify-center gap-1.5 rounded-control bg-primary px-4 py-2 text-footnote font-headline text-primary-foreground no-underline transition-opacity motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>Open lab</span>
          <ExternalLink className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
