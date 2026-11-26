import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface ProsConsProps {
  pros: string[];
  cons: string[];
}

/**
 * Renders side-by-side Pros and Cons cards for a concept or pattern.
 */
export function ProsCons({ pros, cons }: ProsConsProps) {
  return (
    <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-panel border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2 text-subheadline font-headline text-primary">
          <CheckCircle2 className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>Pros</span>
        </div>
        <ul className="m-0 list-none space-y-2 p-0 text-subheadline text-card-foreground">
          {pros.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-panel border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2 text-subheadline font-headline text-destructive">
          <AlertCircle className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>Cons</span>
        </div>
        <ul className="m-0 list-none space-y-2 p-0 text-subheadline text-card-foreground">
          {cons.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
