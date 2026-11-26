'use client';

import { type ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { source } from '@/lib/source';

export function SectionIcon({ name, className = 'h-6 w-6' }: { name: string; className?: string }) {
  const common = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const icons: Record<string, ReactNode> = {
    learn: <svg viewBox="0 0 24 24" {...common}><path d="M12 3l8 4-8 4-8-4 8-4z" /><path d="M4 11l8 4 8-4" /><path d="M4 15l8 4 8-4" /></svg>,
    containers: <svg viewBox="0 0 24 24" {...common}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M7 9h2v6H7zM11 9h2v6h-2zM15 9h2v6h-2z" /></svg>,
    kubernetes: <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="2.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></svg>,
    cicd: <svg viewBox="0 0 24 24" {...common}><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 6h7a3 3 0 0 1 3 3v1M16 18H9a3 3 0 0 1-3-3v-1" /></svg>,
    security: <svg viewBox="0 0 24 24" {...common}><path d="M12 3l7 3v5c0 5-3 7.5-7 10-4-2.5-7-5-7-10V6l7-3z" /><path d="M9.5 12.5l1.8 1.8 3.2-4" /></svg>,
    project: <svg viewBox="0 0 24 24" {...common}><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 15l2.5-3 2 2L16 9" /></svg>,
  };
  return icons[name] ?? icons.project;
}

export function MaterialNav({ children }: { children: ReactNode }) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 material-regular backdrop-blur-md">
      <div className="container flex h-14 max-w-screen-xl items-center justify-between px-4">
        {children}
      </div>
    </nav>
  );
}

export function Tile({ title, description, href, icon, badge, large, section, bareIcon }: { title: string; description: string; href: string; icon?: ReactNode; badge?: string; large?: boolean; section?: string; bareIcon?: boolean }) {
  const [progress, setProgress] = useState<string | null>(null);

  useEffect(() => {
    if (!section) return;
    const completed = JSON.parse(localStorage.getItem('mt-completed-v1') || '{}');
    const pages = source.getPages().filter((p) => p.url.startsWith(`/docs/${section}/`));
    const total = pages.length;
    const done = pages.filter((p) => completed[p.url]).length;
    if (total > 0) {
      setProgress(`${done} / ${total} done`);
    }
  }, [section]);

  return (
    <Link href={href} className={`group relative flex flex-col justify-between rounded-card border bg-card text-card-foreground shadow-sm transition-all motion-reduce:transition-none hover:shadow-md hover:border-primary/50 min-h-tap ${large ? 'p-8 md:min-h-56' : 'p-6'}`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          {bareIcon && icon ? (
            <div className="group-hover:scale-105 transition-transform motion-reduce:transition-none motion-reduce:transform-none">{icon}</div>
          ) : (
            <div className={`${large ? 'h-14 w-14 rounded-[18px]' : 'h-12 w-12 rounded-2xl'} bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform motion-reduce:transition-none motion-reduce:transform-none`}>
              {icon || <Sparkles className="size-5" strokeWidth={1.75} aria-hidden="true" />}
            </div>
          )}
          <div className="flex gap-2 items-center">
            {progress && <span className="px-2.5 py-0.5 rounded-pill text-xs font-medium bg-primary/10 text-primary">{progress}</span>}
            {badge && <span className="px-2.5 py-0.5 rounded-pill text-xs font-medium bg-secondary text-secondary-foreground">{badge}</span>}
          </div>
        </div>
        <h3 className={`${large ? 'text-2xl' : 'text-lg'} font-headline font-bold mb-1`}>{title}</h3>
        <p className={`${large ? 'text-base max-w-xl' : 'text-sm'} text-muted-foreground`}>{description}</p>
      </div>
    </Link>
  );
}

export function LargeTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-2">{children}</h1>
      {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
