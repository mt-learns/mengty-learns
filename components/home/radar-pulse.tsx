'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from './use-reduced-motion';

/**
 * Pulses a radar ring count pill once when it scrolls into view.
 */
export function RadarPulse({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [pulsed, setPulsed] = useState(false);

  useEffect(() => {
    if (reducedMotion || pulsed) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPulsed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, pulsed]);

  return (
    <span ref={ref} className={cn(className, !reducedMotion && pulsed && 'mt-pulse-once')}>
      {children}
    </span>
  );
}
