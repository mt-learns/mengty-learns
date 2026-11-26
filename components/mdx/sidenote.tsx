import { type ReactNode } from 'react';

export function Sidenote({ children }: { children: ReactNode }) {
  return (
    <aside className="my-4 p-4 rounded-panel bg-muted text-muted-foreground border border-border text-callout leading-[1.55]">
      {children}
    </aside>
  );
}

export function Gotcha({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 p-4 rounded-panel bg-destructive-soft text-destructive-text border border-destructive/20 text-callout leading-[1.55]">
      <span className="font-sans font-bold block mb-1">Gotcha:</span>
      {children}
    </div>
  );
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 p-4 rounded-panel bg-success-soft text-success-text border border-success/25 text-callout leading-[1.55]">
      <span className="font-sans font-bold block mb-1">Tip:</span>
      {children}
    </div>
  );
}

export function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-6">
      <img src={src} alt={alt} className="rounded-card border w-full object-cover" />
      {caption && <figcaption className="text-center text-footnote text-muted-foreground mt-2">{caption}</figcaption>}
    </figure>
  );
}
