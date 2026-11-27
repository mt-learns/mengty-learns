'use client';

import { RotateCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from './use-reduced-motion';

interface DemoRememberProps {
  question: string;
  answer: string;
  title: string;
}

/**
 * Interactive "Remember" demo: a keyboard-accessible flashcard that flips in
 * 3D (`rotateY`) between question and answer on tap/click or hover, and peeks
 * once when scrolled into view. Respects `prefers-reduced-motion`.
 */
export function DemoRemember({ question, answer, title }: DemoRememberProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const peekTimerRef = useRef<number | null>(null);
  const hasPlayedRef = useRef(false);
  const [flipped, setFlipped] = useState(false);

  const clearPeek = useCallback(() => {
    if (peekTimerRef.current !== null) {
      window.clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (reducedMotion || hasPlayedRef.current) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasPlayedRef.current) {
          hasPlayedRef.current = true;
          observer.disconnect();
          setFlipped(true);
          peekTimerRef.current = window.setTimeout(() => {
            setFlipped(false);
          }, 1400);
        }
      },
      { threshold: 0.45 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearPeek();
    };
  }, [reducedMotion, clearPeek]);

  const handleToggle = () => {
    clearPeek();
    setFlipped((prev) => !prev);
  };

  const handleMouseEnter = () => {
    clearPeek();
    setFlipped(true);
  };

  const handleMouseLeave = () => {
    clearPeek();
    setFlipped(false);
  };

  return (
    <div
      ref={rootRef}
      className="mt-5"
      style={reducedMotion ? undefined : { perspective: '1000px' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={flipped}
        className="group relative grid w-full cursor-pointer rounded-panel text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        style={
          reducedMotion
            ? undefined
            : {
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 480ms var(--ease-ios)',
              }
        }
      >
        {/* Front: Question */}
        <span
          className={cn(
            'col-start-1 row-start-1 flex flex-col justify-between rounded-panel border border-border bg-grouped p-4',
            reducedMotion && flipped && 'invisible',
          )}
          style={reducedMotion ? undefined : { backfaceVisibility: 'hidden' }}
        >
          <span className="text-subheadline font-medium leading-snug text-foreground">
            {question}
          </span>
          <span className="mt-3 flex items-center justify-between gap-2 text-footnote text-label-tertiary">
            <span>Flashcard from {title}</span>
            <span className="inline-flex items-center gap-1 text-primary">
              <RotateCw className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              Flip
            </span>
          </span>
        </span>

        {/* Back: Answer */}
        <span
          className={cn(
            'col-start-1 row-start-1 flex flex-col justify-between rounded-panel border border-primary/40 bg-primary-soft/60 p-4',
            reducedMotion && !flipped && 'invisible',
          )}
          style={
            reducedMotion
              ? undefined
              : {
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }
          }
        >
          <span className="font-reading text-subheadline leading-relaxed text-foreground">
            {answer}
          </span>
          <span className="mt-3 flex items-center justify-between gap-2 text-footnote text-primary">
            <span className="font-medium">Answer</span>
            <RotateCw className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          </span>
        </span>
      </button>

      <div className="sr-only" aria-live="polite">
        {flipped ? `Answer: ${answer}` : ''}
      </div>
    </div>
  );
}
