'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './use-reduced-motion';

const DURATION_MS = 900;

/**
 * Counts up from 0 to `value` once when scrolled into view.
 * Server-renders `value` with reserved `ch` width and `tabular-nums` so
 * there is no layout shift and JS-disabled or reduced-motion visitors see
 * the final number immediately.
 */
export function CountUp({ value }: { value: number }) {
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement | null>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion || value <= 0 || hasPlayedRef.current) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    let rafId = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasPlayedRef.current) return;
        hasPlayedRef.current = true;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / DURATION_MS);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * value));
          if (progress < 1) {
            rafId = requestAnimationFrame(tick);
          }
        };
        setDisplay(0);
        rafId = requestAnimationFrame(tick);
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, reducedMotion]);

  const shown = reducedMotion ? value : display;

  return (
    <span
      ref={ref}
      className="inline-block tabular-nums"
      style={{ minWidth: `${String(value).length}ch` }}
    >
      {shown}
    </span>
  );
}
