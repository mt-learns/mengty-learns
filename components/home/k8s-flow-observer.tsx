'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePrefersReducedMotion } from './use-reduced-motion';

/**
 * Autoplays the embedded <Flow> once when it reaches 50% viewport visibility,
 * and pauses it when it leaves the viewport. Respects `prefers-reduced-motion`.
 */
export function K8sFlowObserver({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const hasAutoplayedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !hasAutoplayedRef.current) {
          hasAutoplayedRef.current = true;
          const startBtn = el.querySelector<HTMLButtonElement>('button[aria-label="Start"]');
          startBtn?.click();
        } else if (!entry.isIntersecting) {
          const pauseBtn = el.querySelector<HTMLButtonElement>('button[aria-label="Pause"]');
          pauseBtn?.click();
        }
      },
      { threshold: [0, 0.5] },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return <div ref={ref}>{children}</div>;
}
