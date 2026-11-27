import type { ReactNode } from 'react';
import { CopyButtonLazy } from './CopyButtonLazy';

export function Template({
  title = 'Template',
  text,
  children,
}: {
  title?: string;
  text?: string;
  children?: ReactNode;
}) {
  const copyText = text ?? (typeof children === 'string' ? children : '');

  return (
    <section
      aria-label={title}
      className="not-prose my-5 overflow-hidden rounded-card border border-border bg-card"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-grouped px-4 py-2.5">
        <span className="font-sans text-footnote font-semibold text-foreground">{title}</span>
        {copyText && <CopyButtonLazy text={copyText} ariaLabel={`Copy ${title}`} />}
      </div>
      <div className="whitespace-pre-wrap px-4 py-3.5 font-reading text-callout leading-[1.6] text-foreground">
        {text ?? children}
      </div>
    </section>
  );
}
