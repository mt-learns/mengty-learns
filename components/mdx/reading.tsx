import type { ReactNode } from 'react';
import { BookOpen, BookmarkCheck, Check, MessageSquare, Target, Volume2, X } from 'lucide-react';
import { Diagram } from '../diagram/Diagram';
import type { DiagramProps } from '../diagram/types';

export function YouWillLearn({
  title = 'You will learn',
  items,
  children,
}: {
  title?: string;
  items?: string[];
  children?: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="not-prose my-5 rounded-panel border border-border bg-card p-5"
    >
      <div className="mb-3 flex items-center gap-2 font-sans text-headline font-semibold text-foreground">
        <Target className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
        <span>{title}</span>
      </div>
      {items && items.length > 0 ? (
        <ul className="space-y-2 font-reading text-callout leading-[1.55] text-foreground">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check className="mt-1 size-4 shrink-0 text-primary" strokeWidth={2} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="font-reading text-callout leading-[1.55] text-foreground">{children}</div>
      )}
    </section>
  );
}

export function OnePicture(props: DiagramProps) {
  return (
    <div data-five-min="keep" className="my-6">
      <Diagram {...props} />
    </div>
  );
}

export type KeyTakeawayItem =
  | string
  | {
      point: string;
      detail?: string;
      card?: { q: string; a: string };
    };

export function KeyTakeaways({
  title = 'Key takeaways',
  items,
}: {
  title?: string;
  items: KeyTakeawayItem[];
}) {
  return (
    <section
      data-five-min="keep"
      aria-label={title}
      className="not-prose my-6 rounded-panel border border-primary/25 bg-primary-soft/35 p-5"
    >
      <div className="mb-3 flex items-center gap-2 font-sans text-headline font-semibold text-foreground">
        <BookmarkCheck className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
        <span>{title}</span>
      </div>
      <ol className="space-y-2.5 font-reading text-callout leading-[1.55] text-foreground">
        {items.map((item, idx) => {
          const point = typeof item === 'string' ? item : item.point;
          const detail = typeof item === 'string' ? undefined : item.detail;
          return (
            <li key={`${idx}-${point}`} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-caption-2 font-bold tabular-nums text-primary-foreground">
                {idx + 1}
              </span>
              <span>
                <strong className="font-semibold">{point}</strong>
                {detail ? <span className="text-muted-foreground"> — {detail}</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function Rule({
  title = 'Rule',
  formula,
  children,
}: {
  title?: string;
  formula?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="not-prose my-5 rounded-panel border border-primary/30 bg-card p-5"
    >
      <div className="mb-2 flex items-center gap-2 font-sans text-headline font-semibold text-foreground">
        <BookOpen className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
        <span>{title}</span>
      </div>
      {formula && (
        <p className="mb-3 inline-block rounded-control border border-border bg-code px-3 py-1.5 font-mono text-[15px] text-foreground">
          {formula}
        </p>
      )}
      <div className="font-reading text-callout leading-[1.55] text-foreground">{children}</div>
    </section>
  );
}

export function Example({
  wrong,
  right,
  reason,
}: {
  wrong?: string;
  right: string;
  reason?: string;
}) {
  return (
    <div className="not-prose my-3 overflow-hidden rounded-panel border border-border bg-card">
      {wrong && (
        <div className="flex items-start gap-2.5 border-b border-border bg-destructive-soft/55 px-4 py-2.5 text-destructive-text">
          <X className="mt-1 size-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          <div className="font-reading text-callout leading-[1.5]">
            <span className="mr-1.5 font-sans text-footnote font-semibold uppercase tracking-wide">Avoid:</span>
            <span>{wrong}</span>
          </div>
        </div>
      )}
      <div className="flex items-start gap-2.5 bg-success-soft/60 px-4 py-2.5 text-success-text">
        <Check className="mt-1 size-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
        <div className="font-reading text-callout leading-[1.5]">
          <span className="mr-1.5 font-sans text-footnote font-semibold uppercase tracking-wide">Use:</span>
          <span>{right}</span>
        </div>
      </div>
      {reason && (
        <div className="border-t border-border bg-card px-4 py-2 font-reading text-subheadline text-muted-foreground">
          <span className="mr-1 font-sans text-footnote font-semibold text-foreground">Why:</span>
          {reason}
        </div>
      )}
    </div>
  );
}

export function Say({
  word,
  ipa,
  sound,
  note,
  children,
}: {
  word: string;
  ipa?: string;
  sound?: string;
  note?: string;
  children?: ReactNode;
}) {
  return (
    <div className="not-prose my-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-panel border border-border bg-muted/50 px-4 py-3">
      <span className="inline-flex items-center gap-1.5 font-sans text-headline font-semibold text-foreground">
        <Volume2 className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
        <span>{word}</span>
      </span>
      {ipa && <span className="font-mono text-subheadline text-primary">{ipa}</span>}
      {sound && <span className="font-reading text-subheadline text-foreground">{sound}</span>}
      {(note || children) && (
        <span className="w-full font-reading text-subheadline text-muted-foreground">
          {note}
          {children}
        </span>
      )}
    </div>
  );
}

export interface DialogueLine {
  speaker: string;
  text: string;
  note?: string;
}

export function Dialogue({
  title,
  speakers,
  lines,
}: {
  title?: string;
  speakers?: string[];
  lines: DialogueLine[];
}) {
  const speakerOrder = speakers && speakers.length > 0
    ? speakers
    : Array.from(new Set(lines.map((l) => l.speaker)));

  return (
    <section
      aria-label={title ?? 'Dialogue'}
      className="not-prose my-5 rounded-card border border-border bg-card p-5"
    >
      {title && (
        <div className="mb-3 flex items-center gap-2 font-sans text-headline font-semibold text-foreground">
          <MessageSquare className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
          <span>{title}</span>
        </div>
      )}
      <dl className="space-y-3">
        {lines.map((line, idx) => {
          const sIdx = speakerOrder.indexOf(line.speaker);
          const badgeClass =
            sIdx === 0
              ? 'bg-primary-soft text-primary'
              : sIdx === 1
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-highlight-soft text-highlight-text';
          return (
            <div key={`${idx}-${line.speaker}`} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
              <dt className="shrink-0">
                <span className={`inline-flex rounded-pill px-2.5 py-0.5 font-sans text-footnote font-semibold ${badgeClass}`}>
                  {line.speaker}
                </span>
              </dt>
              <dd className="font-reading text-callout leading-[1.55] text-foreground">
                <p>{line.text}</p>
                {line.note && (
                  <p className="mt-0.5 text-footnote text-muted-foreground">{line.note}</p>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
