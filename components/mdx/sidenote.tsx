import { type ReactNode } from 'react';

export function Sidenote({ children }: { children: ReactNode }) {
  return (
    <aside className="my-4 p-4 rounded-panel bg-muted text-muted-foreground border-l-4 border-primary text-sm">
      {children}
    </aside>
  );
}

export function Gotcha({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 p-4 rounded-panel bg-destructive/10 text-destructive border border-destructive/20 text-sm">
      <span className="font-bold block mb-1">Gotcha:</span>
      {children}
    </div>
  );
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 p-4 rounded-panel bg-success/10 text-success border border-success/20 text-sm">
      <span className="font-bold block mb-1">Tip:</span>
      {children}
    </div>
  );
}

export function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-6">
      <img src={src} alt={alt} className="rounded-card border w-full object-cover" />
      {caption && <figcaption className="text-center text-xs text-muted-foreground mt-2">{caption}</figcaption>}
    </figure>
  );
}
