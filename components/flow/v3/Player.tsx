'use client';

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Link2,
  Maximize2,
  Minus,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RotateCcw,
} from 'lucide-react';
import {
  Component,
  lazy,
  type ReactNode,
  Suspense,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { SegmentedControl } from '../../ios/segmented-control';
import { cn } from '../../../lib/utils';
import { FlowSkeleton } from '../FlowSkeleton';
import {
  buildFlowDeepLinkRelative,
  buildFlowDeepLinkUrl,
  parseFlowDeepLink,
} from '../deep-link';
import type {
  FlowDirection,
  FlowGroup,
  FlowLayoutMode,
  FlowNode,
  ParsedFlowProps,
  ParsedFlowStep,
} from '../types';
import type { PrecomputedLayoutsByVariant } from '../../diagram/layout-types';
import type { FlowCanvasControls, FlowCanvasLayoutMeta } from './FlowCanvas';

const STEP_INTERVAL_MS = 2200;

// React.lazy (not next/dynamic) so Next does not inject a <link rel="preload">
// for the @xyflow/react chunk into the initial HTML. The chunk is fetched only
// when `shouldLoadCanvas` flips true on viewport intersection.
const LazyFlowCanvas = lazy(() =>
  import('./FlowCanvas').then((mod) => ({ default: mod.FlowCanvas })),
);

function subscribeReducedMotion(callback: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
}

function getStepHeadline(step: ParsedFlowStep, index: number): string {
  if (step.title && step.title.trim().length > 0) return step.title.trim();
  const words = step.text.trim().split(/\s+/);
  if (words.length <= 6) return step.text.trim();
  return `${words.slice(0, 6).join(' ')}…` || `Step ${index + 1}`;
}

class FlowCanvasErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Flow v3 iOS player card with Overview start state, step dots, Play/Replay,
 * server-rendered <details> step list, variant SegmentedControl, and lazy React Flow canvas.
 */
export function Player({
  id,
  title,
  layout: propLayout = 'flow',
  direction: propDirection,
  nodes: propNodes,
  steps: propSteps,
  groups: propGroups,
  variants,
  precomputedLayouts,
}: ParsedFlowProps & { precomputedLayouts?: PrecomputedLayoutsByVariant }) {
  const hasVariants = Boolean(variants && variants.length > 0);
  const [activeVariantId, setActiveVariantId] = useState<string>(
    () => variants?.[0]?.id ?? '',
  );

  const activeVariant = useMemo(() => {
    if (!variants || variants.length === 0) return null;
    return variants.find((v) => v.id === activeVariantId) ?? variants[0];
  }, [variants, activeVariantId]);

  const nodes: FlowNode[] = useMemo(
    () => activeVariant?.nodes ?? propNodes ?? [],
    [activeVariant, propNodes],
  );
  const groups: FlowGroup[] = useMemo(
    () => activeVariant?.groups ?? propGroups ?? [],
    [activeVariant, propGroups],
  );
  const steps: ParsedFlowStep[] = useMemo(
    () => activeVariant?.steps ?? propSteps ?? [],
    [activeVariant, propSteps],
  );
  const layoutMode: FlowLayoutMode = activeVariant?.layout ?? propLayout;
  const preferredDirection: FlowDirection | undefined = activeVariant?.direction ?? propDirection;

  // -1 = Overview start state, 0..steps.length-1 = active step
  const [stepIndex, setStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shouldLoadCanvas, setShouldLoadCanvas] = useState<boolean>(false);
  const [layoutMeta, setLayoutMeta] = useState<FlowCanvasLayoutMeta>({
    canvasHeight: 320,
    panMode: false,
  });

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasControlsRef = useRef<FlowCanvasControls | null>(null);
  const [hasCanvasControls, setHasCanvasControls] = useState<boolean>(false);
  const hasMountedDeepLinkRef = useRef<boolean>(false);
  const reducedMotion = usePrefersReducedMotion();

  const handleControlsReady = useCallback((controls: FlowCanvasControls | null) => {
    canvasControlsRef.current = controls;
    setHasCanvasControls(controls !== null);
  }, []);

  const handleLayoutChange = useCallback((meta: FlowCanvasLayoutMeta) => {
    setLayoutMeta((prev) =>
      prev.canvasHeight === meta.canvasHeight && prev.panMode === meta.panMode
        ? prev
        : meta,
    );
  }, []);

  // Lazy-load React Flow + dagre only when the diagram enters the viewport
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoadCanvas(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadCanvas(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Read deep link (?flow=<id>&step=<n>) on mount
  useEffect(() => {
    if (hasMountedDeepLinkRef.current) return;
    hasMountedDeepLinkRef.current = true;
    const parsed = parseFlowDeepLink(window.location.search, id, steps.length);
    if (parsed !== null) {
      setStepIndex(parsed);
    }
  }, [id, steps.length]);

  const syncDeepLink = useCallback(
    (nextIndex: number) => {
      if (typeof window === 'undefined' || nextIndex < 0) return;
      const nextUrl = buildFlowDeepLinkRelative(
        window.location.pathname,
        window.location.search,
        window.location.hash,
        id,
        nextIndex,
      );
      window.history.replaceState(null, '', nextUrl);
    },
    [id],
  );

  const goToStep = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(-1, Math.min(steps.length - 1, nextIndex));
      setStepIndex(clamped);
      setIsPlaying(false);
      if (clamped >= 0) {
        syncDeepLink(clamped);
      }
    },
    [steps.length, syncDeepLink],
  );

  const handleVariantChange = useCallback(
    (label: string) => {
      if (!variants) return;
      const next = variants.find((v) => v.label === label);
      if (!next || next.id === activeVariant?.id) return;

      setIsPlaying(false);
      setActiveVariantId(next.id);
      if (stepIndex >= 0 && next.steps.length === steps.length) {
        syncDeepLink(stepIndex);
      } else {
        setStepIndex(-1);
      }
    },
    [variants, activeVariant?.id, stepIndex, steps.length, syncDeepLink],
  );

  // Fixed ~2.2s autoplay timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (stepIndex + 1 >= steps.length) {
        setIsPlaying(false);
        return;
      }
      const next = stepIndex + 1;
      setStepIndex(next);
      syncDeepLink(next);
    }, STEP_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, steps.length, syncDeepLink]);

  const isAtEnd = steps.length > 0 && stepIndex === steps.length - 1;
  const isOverview = stepIndex < 0;

  const handlePrimaryAction = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (isOverview || isAtEnd) {
      setStepIndex(0);
      syncDeepLink(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(true);
  }, [isPlaying, isOverview, isAtEnd, syncDeepLink]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToStep(stepIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToStep(stepIndex - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToStep(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToStep(steps.length - 1);
      } else if (e.key === ' ') {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'BUTTON' || target.tagName === 'SUMMARY')) {
          return;
        }
        e.preventDefault();
        handlePrimaryAction();
      }
    },
    [goToStep, stepIndex, steps.length, handlePrimaryAction],
  );

  const handleCopyLink = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const targetStep = stepIndex >= 0 ? stepIndex : 0;
    const url = buildFlowDeepLinkUrl(window.location.href, id, targetStep);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setMenuOpen(false);
      }, 1200);
    } catch {
      setMenuOpen(false);
    }
  }, [id, stepIndex]);

  const activeStep = !isOverview ? steps[stepIndex] : undefined;
  const activeHeadline = activeStep ? getStepHeadline(activeStep, stepIndex) : '';
  const liveAnnouncement = isOverview
    ? `Overview of ${title ?? id}. ${steps.length} steps.`
    : `Step ${stepIndex + 1} of ${steps.length}: ${activeHeadline}. ${activeStep?.text ?? ''}`;

  return (
    <section
      id={`flow-${id}`}
      tabIndex={0}
      role="region"
      aria-label={title ?? `Process flow ${id}`}
      onKeyDown={handleKeyDown}
      className="my-6 rounded-card bg-card p-4 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
    >
      {hasVariants && variants && (
        <div className="mb-3 [&>div]:w-full sm:[&>div]:w-auto [&>div>button]:flex-1 sm:[&>div>button]:flex-initial">
          <SegmentedControl
            items={variants.map((v) => v.label)}
            active={activeVariant?.label ?? variants[0].label}
            onChange={handleVariantChange}
          />
        </div>
      )}

      {/* Header: title + quiet zoom + overflow menu */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="m-0 truncate text-headline font-semibold text-foreground">
          {title ?? 'Process Flow'}
        </h3>

        <div className="relative flex shrink-0 items-center gap-1">
          {layoutMeta.panMode && (
            <>
              <button
                type="button"
                onClick={() => canvasControlsRef.current?.zoomOut()}
                disabled={!hasCanvasControls}
                aria-label="Zoom out"
                className="inline-flex h-8 w-8 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => canvasControlsRef.current?.zoomIn()}
                disabled={!hasCanvasControls}
                aria-label="Zoom in"
                className="inline-flex h-8 w-8 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => canvasControlsRef.current?.fitView()}
                disabled={!hasCanvasControls}
                aria-label="Fit diagram to view"
                className="inline-flex h-8 w-8 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Flow options"
            aria-expanded={menuOpen}
            className="inline-flex h-8 w-8 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute top-10 right-0 z-30 min-w-40 rounded-panel bg-popover p-1 shadow-lg ring-1 ring-border"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleCopyLink}
                className="flex min-h-tap w-full items-center gap-2 rounded-control px-3 py-2 text-left text-subheadline text-foreground transition-colors hover:bg-secondary"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{copied ? 'Copied link' : 'Copy link'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasContainerRef}
        style={{ height: layoutMeta.canvasHeight }}
        className="relative w-full overflow-hidden rounded-panel bg-grouped"
      >
        {shouldLoadCanvas ? (
          <FlowCanvasErrorBoundary
            fallback={
              <div className="relative h-full w-full">
                <FlowSkeleton nodes={nodes} steps={steps} title={title} />
                <p className="absolute bottom-2 left-3 rounded-pill border bg-card/90 px-2.5 py-1 text-caption-1 text-muted-foreground">
                  Interactive flow unavailable offline — showing static diagram.
                </p>
              </div>
            }
          >
            <Suspense fallback={<FlowSkeleton nodes={nodes} steps={steps} title={title} />}>
              <LazyFlowCanvas
                flowKey={`${id}-${activeVariant?.id ?? 'default'}`}
                nodes={nodes}
                steps={steps}
                groups={groups}
                layoutMode={layoutMode}
                direction={preferredDirection}
                activeStepIndex={stepIndex}
                reducedMotion={reducedMotion}
                precomputed={precomputedLayouts?.[activeVariant?.id ?? 'default']}
                onControlsReady={handleControlsReady}
                onLayoutChange={handleLayoutChange}
              />
            </Suspense>
          </FlowCanvasErrorBoundary>
        ) : (
          <FlowSkeleton nodes={nodes} steps={steps} title={title} />
        )}
      </div>

      {/* Step caption (Overview or active step) */}
      <div className="mt-4 min-h-[3.5rem]" aria-live="polite" aria-atomic="true">
        <span className="sr-only">{liveAnnouncement}</span>
        {isOverview ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-pill bg-secondary px-2 py-0.5 text-caption-1 font-semibold text-secondary-foreground">
                Overview
              </span>
              <span className="text-headline font-semibold text-foreground">
                {steps.length} steps in this flow
              </span>
            </div>
            <p className="mt-1 mb-0 text-subheadline text-muted-foreground">
              Press Start or tap any step dot to trace the path.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex h-6 min-w-6 items-center justify-center rounded-pill px-2 text-caption-1 font-semibold tabular-nums',
                  activeStep?.kind === 'error'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-primary text-primary-foreground',
                )}
              >
                {stepIndex + 1}
              </span>
              <span className="text-headline font-semibold text-foreground">
                {activeHeadline}
              </span>
            </div>
            <p className="mt-1 mb-0 text-subheadline text-muted-foreground">
              {activeStep?.text}
            </p>
          </div>
        )}
      </div>

      {/* Controls: ‹  dots  ›   +   Start / Play / Pause / Replay */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            onClick={() => goToStep(stepIndex - 1)}
            disabled={isOverview}
            aria-label="Previous step"
            className="inline-flex min-h-tap min-w-[44px] items-center justify-center rounded-control text-foreground transition-colors hover:bg-secondary disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1 overflow-x-auto px-1" role="group" aria-label="Step dots">
            {steps.map((step, idx) => {
              const isCurrent = idx === stepIndex;
              const isVisited = stepIndex >= 0 && idx < stepIndex;
              return (
                <button
                  key={`${step.edge}-${idx}`}
                  type="button"
                  onClick={() => goToStep(idx)}
                  aria-label={`Go to step ${idx + 1}: ${getStepHeadline(step, idx)}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className="inline-flex min-h-tap min-w-[24px] items-center justify-center px-1"
                >
                  <span
                    className={cn(
                      'block h-2 rounded-pill transition-all duration-200 ease-[var(--ease-ios)] motion-reduce:transition-none',
                      isCurrent
                        ? step.kind === 'error'
                          ? 'w-5 bg-destructive'
                          : 'w-5 bg-primary'
                        : isVisited
                          ? 'w-2 bg-primary/50'
                          : 'w-2 bg-muted-foreground/30',
                    )}
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => goToStep(stepIndex + 1)}
            disabled={isAtEnd}
            aria-label="Next step"
            className="inline-flex min-h-tap min-w-[44px] items-center justify-center rounded-control text-foreground transition-colors hover:bg-secondary disabled:opacity-35"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handlePrimaryAction}
          aria-label={
            isPlaying
              ? 'Pause'
              : isOverview
                ? 'Start'
                : isAtEnd
                  ? 'Replay'
                  : 'Play'
          }
          className="inline-flex min-h-tap shrink-0 items-center gap-1.5 rounded-pill bg-primary px-4 text-subheadline font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </>
          ) : isOverview ? (
            <>
              <span>Start</span>
              <Play className="h-3.5 w-3.5 fill-current" />
            </>
          ) : isAtEnd ? (
            <>
              <RotateCcw className="h-4 w-4" />
              <span>Replay</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Play</span>
            </>
          )}
        </button>
      </div>

      {/* Server-rendered <details> grouped list */}
      <details className="mt-3 group">
        <summary className="inline-flex min-h-tap cursor-pointer list-none items-center gap-1.5 text-subheadline font-medium text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
          <span className="inline-block transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none">
            ▸
          </span>
          <span>All steps ({steps.length})</span>
        </summary>

        <ol className="m-0 mt-2 list-none divide-y divide-separator overflow-hidden rounded-panel bg-grouped p-0">
          {steps.map((step, idx) => {
            const isCurrent = idx === stepIndex;
            const headline = getStepHeadline(step, idx);
            return (
              <li key={`${step.edge}-${idx}`} className="m-0 p-0">
                <button
                  type="button"
                  onClick={() => goToStep(idx)}
                  className={cn(
                    'flex min-h-tap w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-secondary/70',
                    isCurrent && 'bg-secondary',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-pill px-1.5 text-[11px] font-semibold tabular-nums',
                      isCurrent
                        ? step.kind === 'error'
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground',
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-subheadline font-semibold text-foreground">
                      {headline}
                    </span>
                    <span className="block text-footnote text-muted-foreground">
                      {step.text}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </details>
    </section>
  );
}
