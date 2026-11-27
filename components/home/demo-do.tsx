'use client';

import { Check } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from './use-reduced-motion';

const LINES = [
  'hadolint labs/*/Dockerfile',
  'tofu validate',
  'kubeconform -strict labs/*/k8s',
] as const;

const TOTAL_CHARS = LINES.reduce((sum, line) => sum + line.length, 0);
const CHAR_MS = 22;

/**
 * Interactive "Do" demo: terminal lines type out one by one with a blinking
 * cursor, then reveal a green "passed" check. Server-renders the final state
 * in a reserved grid cell so there is zero layout shift and JS-disabled or
 * reduced-motion visitors see everything immediately.
 */
export function DemoDo() {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const hasPlayedRef = useRef(false);
  const playingRef = useRef(false);

  const [typed, setTyped] = useState<number>(TOTAL_CHARS);
  const [passed, setPassed] = useState<boolean>(true);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (reducedMotion || playingRef.current) return;
    clearTimer();
    playingRef.current = true;
    let count = 0;
    setTyped(0);
    setPassed(false);

    timerRef.current = window.setInterval(() => {
      count += 1;
      setTyped(count);
      if (count >= TOTAL_CHARS) {
        clearTimer();
        setPassed(true);
        playingRef.current = false;
      }
    }, CHAR_MS);
  }, [reducedMotion, clearTimer]);

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
      clearTimer();
    };
  }, [reducedMotion, play, clearTimer]);

  const effectiveTyped = reducedMotion ? TOTAL_CHARS : typed;
  const effectivePassed = reducedMotion ? true : passed;

  let remaining = effectiveTyped;
  const visibleLines = LINES.map((line) => {
    const take = Math.max(0, Math.min(line.length, remaining));
    remaining -= line.length;
    return line.slice(0, take);
  });

  const activeLineIndex = visibleLines.findIndex(
    (slice, i) => slice.length < LINES[i].length || (i === LINES.length - 1 && !effectivePassed),
  );

  return (
    <div
      ref={rootRef}
      onMouseEnter={play}
      onFocus={play}
      className="mt-5 rounded-panel bg-code p-4 font-mono text-caption-1 leading-relaxed text-foreground"
    >
      <div className="grid">
        {/* Invisible static copy reserves exact height to prevent CLS */}
        <pre aria-hidden="true" className="invisible col-start-1 row-start-1 overflow-x-auto">
          <code>
            {LINES.map((line) => (
              <span key={line} className="block">
                <span>$ </span>
                {line}
              </span>
            ))}
          </code>
          <span className="mt-2 inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-caption-2">
            passed
          </span>
        </pre>

        {/* Live typed layer */}
        <pre
          aria-label="Checks CI runs on the labs"
          className="col-start-1 row-start-1 overflow-x-auto"
        >
          <code>
            {LINES.map((line, i) => {
              const slice = visibleLines[i];
              const showLine = i === 0 || visibleLines[i - 1].length === LINES[i - 1].length;
              const showCursor = !reducedMotion && !effectivePassed && activeLineIndex === i;
              return (
                <span key={line} className={cn('block', !showLine && 'opacity-0')}>
                  <span className="text-muted-foreground">$ </span>
                  {slice}
                  {showCursor && (
                    <span
                      aria-hidden="true"
                      className="mt-cursor-blink ml-0.5 inline-block h-[1.1em] w-[0.5ch] translate-y-[0.15em] bg-primary"
                    />
                  )}
                </span>
              );
            })}
          </code>
          <span
            className={cn(
              'mt-2 inline-flex items-center gap-1 rounded-pill bg-success-soft px-2 py-0.5 font-sans text-caption-2 font-semibold text-success-text motion-reduce:transition-none',
              effectivePassed
                ? 'opacity-100 scale-100 transition-[opacity,transform] duration-200 ease-[var(--ease-ios)]'
                : 'invisible opacity-0 scale-95 transition-none',
            )}
          >
            <Check className="size-3" strokeWidth={2.25} aria-hidden="true" />
            passed
          </span>
        </pre>
      </div>
    </div>
  );
}
