import { CopyButtonLazy } from './CopyButtonLazy';

export interface PatternItem {
  pattern: string;
  example?: string;
  note?: string;
}

export function PatternBank({
  title = 'Sentence patterns',
  patterns,
}: {
  title?: string;
  patterns: PatternItem[];
}) {
  return (
    <section
      aria-label={title}
      className="not-prose my-5 rounded-card border border-border bg-card p-5"
    >
      <h3 className="mb-3 font-sans text-headline font-semibold text-foreground">{title}</h3>
      <ul className="space-y-3">
        {patterns.map((item, idx) => (
          <li
            key={`${idx}-${item.pattern}`}
            className="flex flex-col gap-2 rounded-panel border border-border bg-grouped p-3.5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="font-reading text-callout font-medium leading-[1.55] text-foreground">
                {item.pattern}
              </p>
              {item.example && (
                <p className="mt-1 font-reading text-subheadline text-muted-foreground">
                  Example: <span className="text-foreground">{item.example}</span>
                </p>
              )}
              {item.note && (
                <p className="mt-0.5 font-sans text-footnote text-muted-foreground">{item.note}</p>
              )}
            </div>
            <CopyButtonLazy text={item.pattern} ariaLabel={`Copy pattern: ${item.pattern}`} />
          </li>
        ))}
      </ul>
    </section>
  );
}
