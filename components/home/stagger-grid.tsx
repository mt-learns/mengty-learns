'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from './use-reduced-motion';

/**
 * Wraps a list/grid so its direct `<li>` children reveal once with a 40ms
 * staggered fade/rise when scrolled into view. Server-rendered content stays
 * visible when JS is disabled or `prefers-reduced-motion: reduce` is active.
 */
export function StaggerGrid({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLUListElement | null>(null);
  const [state, setState] = useState<'idle' | 'armed' | 'revealed'>('idle');

  useEffect(() => {
    if (reducedMotion) {
      setState('idle');
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    setState('armed');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setState('revealed');
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <ul
      ref={ref}
      data-stagger={reducedMotion ? 'off' : state}
      className={cn('mt-stagger-grid', className)}
    >
      {children}
    </ul>
  );
}
