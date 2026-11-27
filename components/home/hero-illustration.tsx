'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { usePrefersReducedMotion } from './use-reduced-motion';

const MAX_TILT_DEG = 3.5;

/**
 * Wraps the hero desk illustration with a subtle idle float (paused offscreen)
 * and a pointer-driven desktop tilt (<= 4deg, disabled on touch and reduced motion).
 */
export function HeroIllustration({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);
  const [tilt, setTilt] = useState<{ rx: number; ry: number; active: boolean }>({
    rx: 0,
    ry: 0,
    active: false,
  });

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({
      rx: Number((-ny * MAX_TILT_DEG).toFixed(2)),
      ry: Number((nx * MAX_TILT_DEG).toFixed(2)),
      active: true,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0, active: false });
  };

  const transform =
    reducedMotion || (!tilt.active && tilt.rx === 0 && tilt.ry === 0)
      ? undefined
      : `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`;

  return (
    <div
      ref={rootRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform,
        transition: reducedMotion
          ? undefined
          : tilt.active
            ? 'transform 120ms cubic-bezier(0.32, 0.72, 0, 1)'
            : 'transform 380ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
      className="flex justify-center lg:justify-end"
    >
      <div className={!reducedMotion && inView ? 'mt-hero-float' : undefined}>
        {children}
      </div>
    </div>
  );
}
