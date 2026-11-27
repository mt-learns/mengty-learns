'use client';

import { ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from './use-reduced-motion';

const NODES = ['User', 'Ingress', 'Service', 'Pod'] as const;
const STEP_MS = 340;

/**
 * Interactive "Read" demo: flow chips light up in sequence along the arrows
 * once on viewport entry, and replay on hover or focus.
 */
export function DemoRead() {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const hasPlayedRef = useRef(false);
  const playingRef = useRef(false);
  // -1 = settled/idle, 0..3 = active node index
  const [active, setActive] = useState<number>(-1);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const play = useCallback(() => {
    if (reducedMotion || playingRef.current) return;
    clearTimers();
    playingRef.current = true;
    setActive(0);

    for (let i = 1; i < NODES.length; i++) {
      timersRef.current.push(
        window.setTimeout(() => setActive(i), i * STEP_MS),
      );
    }
    timersRef.current.push(
      window.setTimeout(() => {
        setActive(-1);
        playingRef.current = false;
      }, NODES.length * STEP_MS + 300),
    );
  }, [reducedMotion, clearTimers]);

  useEffect(() => {
    if (reducedMotion || hasPlayedRef.current) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasPlayedRef.current) {
          hasPlayedRef.current = true;
          observer.disconnect();
          play();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, [reducedMotion, play, clearTimers]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      onMouseEnter={play}
      onFocus={play}
      className="mt-5 flex flex-wrap items-center gap-1 rounded-panel bg-grouped p-4 text-caption-1 font-medium"
    >
      {NODES.map((node, i) => {
        const isCurrent = active === i;
        const isVisited = active > i;
        return (
          <span key={node} className="inline-flex items-center gap-1">
            {i > 0 && (
              <ArrowRight
                className={cn(
                  'size-4 shrink-0 transition-colors duration-200 ease-[var(--ease-ios)] motion-reduce:transition-none',
                  isCurrent || isVisited ? 'text-primary' : 'text-muted-foreground/60',
                )}
                strokeWidth={1.75}
              />
            )}
            <span
              className={cn(
                'rounded-control border px-2 py-1 transition-[transform,background-color,border-color,color] duration-200 ease-[var(--ease-ios)] motion-reduce:transition-none',
                isCurrent
                  ? 'scale-105 border-primary bg-primary-soft text-primary motion-reduce:scale-100'
                  : isVisited
                    ? 'border-primary/40 bg-card text-foreground'
                    : 'border-border bg-card text-foreground',
              )}
            >
              {node}
            </span>
          </span>
        );
      })}
    </div>
  );
}
