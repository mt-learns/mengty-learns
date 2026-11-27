'use client';

import '@xyflow/react/dist/base.css';
import '../../diagram/diagram.css';
import './flow.css';

import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';
import {
  FIT_PADDING,
  MIN_READABLE_ZOOM,
  type SerializedLayout,
} from '../../diagram/layout-types';
import type {
  FlowDirection,
  FlowGroup,
  FlowLayoutMode,
  FlowNode,
  ParsedFlowStep,
} from '../types';
import { GroupNode } from './GroupNode';
import { IosNode } from './IosNode';
import { StepEdge } from './StepEdge';
import { buildFlowGraphFromPrecomputed, type ClientFlowGraph } from './graph';

export interface FlowCanvasControls {
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
}

export interface FlowCanvasLayoutMeta {
  canvasHeight: number;
  panMode: boolean;
}

export interface FlowCanvasProps {
  flowKey: string;
  nodes: FlowNode[];
  steps: ParsedFlowStep[];
  groups?: FlowGroup[];
  layoutMode?: FlowLayoutMode;
  direction?: FlowDirection;
  activeStepIndex: number;
  reducedMotion: boolean;
  precomputed?: SerializedLayout[];
  onControlsReady?: (controls: FlowCanvasControls | null) => void;
  onLayoutChange?: (meta: FlowCanvasLayoutMeta) => void;
}

const NODE_TYPES = {
  ios: IosNode,
  group: GroupNode,
};

const EDGE_TYPES = {
  step: StepEdge,
};

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState<number>(360);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const next = Math.round(el.getBoundingClientRect().width);
      if (next > 0) {
        setWidth((prev) => (Math.abs(prev - next) >= 2 ? next : prev));
      }
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(measure, 80);
    });
    observer.observe(el);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref]);

  return width;
}

function FlowCanvasInner({
  flowKey,
  nodes,
  steps,
  groups,
  layoutMode = 'flow',
  direction: preferredDirection,
  activeStepIndex,
  reducedMotion,
  precomputed,
  onControlsReady,
  onLayoutChange,
}: FlowCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useContainerWidth(containerRef);
  const reactFlow = useReactFlow();
  const [fallbackGraph, setFallbackGraph] = useState<ClientFlowGraph | null>(null);

  useEffect(() => {
    if (precomputed) return;
    let cancelled = false;
    import('./layout').then(({ computeFlowGraph }) => {
      if (cancelled) return;
      const res = computeFlowGraph({
        nodes,
        steps,
        groups,
        layoutMode,
        direction: preferredDirection,
        containerWidth,
        activeStepIndex,
        reducedMotion,
      });
      setFallbackGraph({
        nodes: res.nodes,
        edges: res.edges,
        direction: res.layout.direction,
        bounds: res.layout.bounds,
        zoom: res.layout.zoom,
        panMode: res.layout.panMode,
        canvasHeight: res.layout.canvasHeight,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [
    precomputed,
    nodes,
    steps,
    groups,
    layoutMode,
    preferredDirection,
    containerWidth,
    activeStepIndex,
    reducedMotion,
  ]);

  const graph = useMemo<ClientFlowGraph>(() => {
    if (precomputed) {
      return buildFlowGraphFromPrecomputed({
        nodes,
        steps,
        precomputed,
        containerWidth,
        activeStepIndex,
        reducedMotion,
      });
    }
    return (
      fallbackGraph ?? {
        nodes: [],
        edges: [],
        direction: 'TB',
        bounds: { width: 320, height: 240 },
        zoom: 1,
        panMode: false,
        canvasHeight: 240,
      }
    );
  }, [
    precomputed,
    fallbackGraph,
    nodes,
    steps,
    containerWidth,
    activeStepIndex,
    reducedMotion,
  ]);

  const { panMode, canvasHeight, direction, bounds, zoom } = graph;
  // §3.3a: pan hint only on MEASURED overflow, never when everything fits.
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);
  const [overflowSide, setOverflowSide] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    onLayoutChange?.({ canvasHeight, panMode });
  }, [canvasHeight, panMode, onLayoutChange]);

  useEffect(() => {
    onControlsReady?.({
      zoomIn: () => reactFlow.zoomIn({ duration: reducedMotion ? 0 : 200 }),
      zoomOut: () => reactFlow.zoomOut({ duration: reducedMotion ? 0 : 200 }),
      fitView: () =>
        reactFlow.fitView({
          padding: FIT_PADDING,
          duration: reducedMotion ? 0 : 200,
        }),
    });
    return () => onControlsReady?.(null);
  }, [reactFlow, reducedMotion, onControlsReady]);

  // Measure actual rendered overflow (§3.3a): only show pan hint when content really exceeds the canvas.
  const measureOverflow = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const canvas = el.querySelector<HTMLElement>('.react-flow');
    const vpEl = el.querySelector<HTMLElement>('.react-flow__viewport');
    if (!canvas || !vpEl) return;
    const cRect = canvas.getBoundingClientRect();
    const nodes = [...el.querySelectorAll<HTMLElement>('.react-flow__node')];
    let rightOverflow = 0;
    let leftOverflow = 0;
    for (const n of nodes) {
      const r = n.getBoundingClientRect();
      rightOverflow = Math.max(rightOverflow, r.right - cRect.right);
      leftOverflow = Math.max(leftOverflow, cRect.left - r.left);
    }
    const overflowRight = rightOverflow > 1;
    const overflowLeft = leftOverflow > 1;
    setHasHorizontalOverflow(overflowRight || overflowLeft);
    setOverflowSide(overflowRight ? 'right' : overflowLeft ? 'left' : null);
  }, []);

  // Fit on mount, container resize, and variant change — never on step change (§3.1, §3.4).
  // Center directly on computed bounds × zoom so we never clip the top node or race with fitView.
  useEffect(() => {
    const applyCenteredViewport = () => {
      const scaledW = bounds.width * zoom;
      const scaledH = bounds.height * zoom;
      const xOffset = panMode
        ? scaledW < containerWidth
          ? Math.round((containerWidth - scaledW) / 2)
          : 12
        : Math.round((containerWidth - scaledW) / 2);
      const yOffset = panMode
        ? scaledH < canvasHeight
          ? Math.round((canvasHeight - scaledH) / 2)
          : 12
        : Math.round((canvasHeight - scaledH) / 2);
      reactFlow.setViewport(
        { x: xOffset, y: yOffset, zoom },
        { duration: 0 },
      );
      requestAnimationFrame(() => measureOverflow());
    };

    const frame = requestAnimationFrame(applyCenteredViewport);
    return () => cancelAnimationFrame(frame);
  }, [
    reactFlow,
    flowKey,
    containerWidth,
    direction,
    panMode,
    canvasHeight,
    bounds.width,
    bounds.height,
    zoom,
    measureOverflow,
  ]);

  return (
    <div
      ref={containerRef}
      className="flow-v3-canvas relative h-full w-full"
      onDoubleClick={() => {
        if (!panMode) {
          reactFlow.fitView({
            padding: FIT_PADDING,
            minZoom: MIN_READABLE_ZOOM,
            duration: reducedMotion ? 0 : 200,
          });
        }
      }}
    >
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        preventScrolling={false}
        zoomOnPinch={panMode}
        zoomOnDoubleClick={false}
        panOnDrag={panMode}
        minZoom={MIN_READABLE_ZOOM}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        onMoveEnd={measureOverflow}
      />
      {hasHorizontalOverflow && (
        <>
          {/* fade edge on the overflowing side (§3.3a) */}
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-y-0 w-8',
              overflowSide === 'left'
                ? 'left-0 bg-gradient-to-r from-grouped to-transparent'
                : 'right-0 bg-gradient-to-l from-grouped to-transparent',
            )}
          />
          <div className="pointer-events-none absolute right-2.5 bottom-2.5 rounded-pill border border-border bg-card/90 px-2.5 py-1 text-caption-1 font-medium text-muted-foreground shadow-xs">
            Drag to see more →
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Read-only React Flow presentation canvas, dynamically imported on demand.
 */
export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
