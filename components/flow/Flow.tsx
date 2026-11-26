'use client';

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { animate } from 'motion/mini';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { computeEdgePath, parseEdge } from './edges';
import { FlowNodeIcon } from './icons';
import { getCanvasDimensions, getNodePosition } from './layout';
import { type FlowEdgeKind, type FlowProps } from './types';

const SPEED_OPTIONS = [0.5, 1, 2] as const;
type PlaybackSpeed = (typeof SPEED_OPTIONS)[number];

const BASE_STEP_MS = 1800;
const IOS_EASE = [0.32, 0.72, 0, 1] as const;

const emptySubscribe = () => () => {};

function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

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

function getEdgeStroke(kind: FlowEdgeKind): string {
  return kind === 'error' ? 'var(--destructive)' : 'var(--primary)';
}

function getMarkerId(flowId: string, kind: FlowEdgeKind): string {
  return `${flowId}-arrow-${kind}`;
}

/**
 * Interactive step-by-step SVG process flow diagram with keyboard navigation,
 * reduced-motion support, and an always-visible ordered step list fallback.
 */
export function Flow({ id, title, nodes, steps: rawSteps }: FlowProps) {
  const steps = useMemo(
    () => rawSteps.map((s) => ({ ...s, kind: s.kind ?? ('request' as const) })),
    [rawSteps],
  );

  const isHydrated = useHydrated();
  const prefersReducedMotion = usePrefersReducedMotion();
  const dotRef = useRef<SVGCircleElement | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const clampedStep = Math.min(activeStep, steps.length - 1);
  const currentStep = steps[clampedStep];

  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  );

  const dimensions = useMemo(() => getCanvasDimensions(nodes), [nodes]);

  // Precompute unique directed edge geometries, curving bidirectional pairs so they don't overlap.
  const edgeGeometries = useMemo(() => {
    const directedKeys = new Set(
      steps.map((s) => {
        const { from, to } = parseEdge(s.edge);
        return `${from}->${to}`;
      }),
    );

    const map = new Map<
      string,
      { key: string; from: string; to: string; kind: FlowEdgeKind; d: string }
    >();

    for (const step of steps) {
      const { from, to } = parseEdge(step.edge);
      const dirKey = `${from}->${to}`;
      const renderKey = `${dirKey}::${step.kind}`;
      if (map.has(renderKey)) continue;

      const fromNode = nodeMap.get(from);
      const toNode = nodeMap.get(to);
      if (!fromNode || !toNode) continue;

      const hasReverse = directedKeys.has(`${to}->${from}`);
      const geometry = computeEdgePath(fromNode, toNode, hasReverse ? 20 : 0);

      map.set(renderKey, {
        key: renderKey,
        from,
        to,
        kind: step.kind,
        d: geometry.d,
      });
    }

    return Array.from(map.values());
  }, [steps, nodeMap]);

  const activeParsedEdge = useMemo(
    () => parseEdge(currentStep.edge),
    [currentStep.edge],
  );

  const activeEdgeKey = `${activeParsedEdge.from}->${activeParsedEdge.to}::${currentStep.kind}`;
  const activeGeometry = edgeGeometries.find((e) => e.key === activeEdgeKey);

  useEffect(() => {
    if (!isPlaying) return;
    if (clampedStep >= steps.length - 1) {
      return;
    }

    const timeout = setTimeout(() => {
      setActiveStep((prev) => {
        const next = prev + 1;
        if (next >= steps.length - 1) {
          setIsPlaying(false);
        }
        return Math.min(next, steps.length - 1);
      });
    }, BASE_STEP_MS / speed);

    return () => clearTimeout(timeout);
  }, [isPlaying, clampedStep, steps.length, speed]);

  const goPrev = useCallback(() => {
    setIsPlaying(false);
    setActiveStep((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setIsPlaying(false);
    setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && clampedStep >= steps.length - 1) {
        setActiveStep(0);
      }
      return !prev;
    });
  }, [clampedStep, steps.length]);

  const replay = useCallback(() => {
    setActiveStep(0);
    setIsPlaying(true);
  }, []);

  const selectStep = useCallback((index: number) => {
    setIsPlaying(false);
    setActiveStep(index);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectStep(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectStep(steps.length - 1);
    } else if (event.key === ' ' && event.target === event.currentTarget) {
      event.preventDefault();
      togglePlay();
    }
  };

  const dotDuration = Math.max(0.35, 0.9 / speed);

  useEffect(() => {
    const dot = dotRef.current;
    if (!isHydrated || prefersReducedMotion || !dot || !activeGeometry) return;
    if (typeof dot.animate !== 'function') return;

    const controls = animate(
      dot,
      { offsetDistance: ['0%', '100%'] },
      { duration: dotDuration, ease: IOS_EASE },
    );

    return () => controls.stop();
  }, [isHydrated, prefersReducedMotion, activeGeometry, clampedStep, dotDuration]);

  return (
    <section
      tabIndex={0}
      role="region"
      aria-label={title ?? `Process flow diagram: ${id}`}
      onKeyDown={handleKeyDown}
      className="my-6 rounded-card border border-border bg-card p-4 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
    >
        {title && (
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="m-0 text-headline text-foreground">{title}</h3>
            <span className="text-caption-1 text-muted-foreground">
              Use ← → keys
            </span>
          </div>
        )}

        <div className="overflow-x-auto rounded-panel border border-border bg-grouped/60 p-2">
          <svg
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="block h-auto w-full min-w-[300px]"
            role="img"
            aria-label={title ?? `Flow diagram ${id}`}
          >
            <defs>
              {(['request', 'response', 'error'] as const).map((kind) => (
                <marker
                  key={kind}
                  id={getMarkerId(id, kind)}
                  viewBox="0 0 10 10"
                  refX="8.5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path
                    d="M 1 1.5 L 8.5 5 L 1 8.5 z"
                    fill={getEdgeStroke(kind)}
                  />
                </marker>
              ))}
            </defs>

            {/* Edges */}
            <g>
              {edgeGeometries.map((edge) => {
                const isActive = edge.key === activeEdgeKey;
                const opacity = !isHydrated || isActive ? 1 : 0.4;
                const stroke = getEdgeStroke(edge.kind);

                return (
                  <path
                    key={edge.key}
                    d={edge.d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={isActive ? 2.5 : 2}
                    strokeDasharray={edge.kind === 'response' ? '6 4' : undefined}
                    markerEnd={`url(#${getMarkerId(id, edge.kind)})`}
                    style={{
                      opacity,
                      transition: prefersReducedMotion
                        ? 'none'
                        : 'opacity 250ms var(--ease-ios)',
                    }}
                  />
                );
              })}
            </g>

            {/* Travelling dot */}
            {isHydrated && !prefersReducedMotion && activeGeometry && (
              <circle
                ref={dotRef}
                key={`${clampedStep}-${activeGeometry.key}`}
                r={5}
                fill={getEdgeStroke(currentStep.kind)}
                style={{
                  offsetPath: `path("${activeGeometry.d}")`,
                  offsetDistance: '0%',
                }}
              />
            )}

            {/* Nodes */}
            <g>
              {nodes.map((node) => {
                const pos = getNodePosition(node);
                const isActiveNode =
                  node.id === activeParsedEdge.from ||
                  node.id === activeParsedEdge.to;
                const opacity = !isHydrated || isActiveNode ? 1 : 0.4;
                const stroke =
                  isHydrated && isActiveNode
                    ? currentStep.kind === 'error'
                      ? 'var(--destructive)'
                      : 'var(--primary)'
                    : 'var(--border)';

                return (
                  <g
                    key={node.id}
                    style={{
                      opacity,
                      transition: prefersReducedMotion
                        ? 'none'
                        : 'opacity 250ms var(--ease-ios)',
                    }}
                  >
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={pos.width}
                      height={pos.height}
                      rx={16}
                      fill="var(--card)"
                      stroke={stroke}
                      strokeWidth={isHydrated && isActiveNode ? 2 : 1.25}
                    />
                    <rect
                      x={pos.x + 12}
                      y={pos.y + 16}
                      width={32}
                      height={32}
                      rx={10}
                      fill="var(--muted)"
                    />
                    <g color="var(--primary)">
                      <FlowNodeIcon
                        name={node.icon}
                        x={pos.x + 20}
                        y={pos.y + 24}
                        size={16}
                      />
                    </g>
                    <text
                      x={pos.x + 54}
                      y={node.subtitle ? pos.y + 29 : pos.y + 36}
                      fill="var(--foreground)"
                      fontSize="13"
                      fontWeight="600"
                    >
                      {node.label}
                    </text>
                    {node.subtitle && (
                      <text
                        x={pos.x + 54}
                        y={pos.y + 45}
                        fill="var(--muted-foreground)"
                        fontSize="11"
                      >
                        {node.subtitle}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Caption with aria-live */}
        <div
          aria-live="polite"
          className="mt-3 rounded-panel border border-border bg-muted/50 px-4 py-3"
        >
          <div className="mb-1 flex flex-wrap items-center gap-2 text-caption-1 font-headline">
            <span className="text-primary">
              Step {clampedStep + 1} / {steps.length}
            </span>
            {currentStep.kind !== 'request' && (
              <span
                className={
                  currentStep.kind === 'error'
                    ? 'rounded-pill bg-destructive/10 px-2 py-0.5 text-destructive capitalize'
                    : 'rounded-pill bg-primary/10 px-2 py-0.5 text-primary capitalize'
                }
              >
                {currentStep.kind}
              </span>
            )}
          </div>
          <p className="m-0 text-subheadline text-foreground">
            {currentStep.text}
          </p>
        </div>

        {/* Controls */}
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goPrev}
                disabled={clampedStep === 0}
                aria-label="Previous step"
                className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-control border border-border bg-secondary px-3 text-secondary-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="inline-flex min-h-tap items-center justify-center gap-1.5 rounded-control bg-primary px-4 text-footnote font-headline text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {isPlaying ? (
                  <>
                    <Pause className="size-4" aria-hidden="true" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="size-4" aria-hidden="true" />
                    <span>Play</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={clampedStep === steps.length - 1}
                aria-label="Next step"
                className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-control border border-border bg-secondary px-3 text-secondary-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={replay}
                aria-label="Replay"
                className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-control border border-border bg-secondary px-3 text-secondary-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div
              className="flex items-center gap-1 rounded-control border border-border bg-secondary p-1"
              role="group"
              aria-label="Playback speed"
            >
              {SPEED_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSpeed(option)}
                  aria-pressed={speed === option}
                  className={
                    speed === option
                      ? 'min-h-8 rounded-lg bg-card px-2.5 text-caption-1 font-headline text-foreground shadow-xs'
                      : 'min-h-8 rounded-lg px-2.5 text-caption-1 text-muted-foreground hover:text-foreground'
                  }
                >
                  {option}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={steps.length - 1}
              step={1}
              value={clampedStep}
              onChange={(e) => selectStep(Number(e.target.value))}
              aria-label="Step scrubber"
              className="h-2 w-full cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Always-visible ordered list of steps */}
        <ol className="mt-4 mb-0 list-none space-y-1.5 border-t border-border pt-3 pl-0">
          {steps.map((step, index) => {
            const isActive = index === clampedStep;
            return (
              <li key={`${step.edge}-${index}`} className="m-0">
                <button
                  type="button"
                  onClick={() => selectStep(index)}
                  aria-current={isActive ? 'step' : undefined}
                  className={
                    isActive
                      ? 'flex min-h-tap w-full items-start gap-2.5 rounded-control bg-primary/10 px-3 py-2 text-left text-footnote text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                      : 'flex min-h-tap w-full items-start gap-2.5 rounded-control px-3 py-2 text-left text-footnote text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  }
                >
                  <span
                    className={
                      isActive
                        ? 'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-caption-2 font-headline text-primary-foreground'
                        : 'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-caption-2 font-headline text-muted-foreground'
                    }
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-mono text-caption-1 text-muted-foreground mr-2">
                      {step.edge}
                    </span>
                    <span>{step.text}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
  );
}
