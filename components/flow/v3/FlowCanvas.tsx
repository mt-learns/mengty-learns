'use client';

import '@xyflow/react/dist/base.css';
import './flow.css';

import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FIT_PADDING,
  MIN_READABLE_ZOOM,
} from '../../diagram/layout';
import type {
  FlowGroup,
  FlowLayoutMode,
  FlowNode,
  ParsedFlowStep,
} from '../types';
import { GroupNode } from './GroupNode';
import { IosNode } from './IosNode';
import { StepEdge } from './StepEdge';
import { computeFlowGraph } from './layout';

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
  activeStepIndex: number;
  reducedMotion: boolean;
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
  activeStepIndex,
  reducedMotion,
  onControlsReady,
  onLayoutChange,
}: FlowCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useContainerWidth(containerRef);
  const reactFlow = useReactFlow();

  const graph = useMemo(
    () =>
      computeFlowGraph({
        nodes,
        steps,
        groups,
        layoutMode,
        containerWidth,
        activeStepIndex,
        reducedMotion,
      }),
    [
      nodes,
      steps,
      groups,
      layoutMode,
      containerWidth,
      activeStepIndex,
      reducedMotion,
    ],
  );

  const { panMode, canvasHeight, direction, bounds } = graph.layout;

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

  // Fit on mount, container resize, and variant change — never on step change (§3.1, §3.4)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (panMode) {
        const scaledW = bounds.width * MIN_READABLE_ZOOM;
        const xOffset =
          scaledW < containerWidth
            ? Math.round((containerWidth - scaledW) / 2)
            : 16;
        const scaledH = bounds.height * MIN_READABLE_ZOOM;
        const yOffset =
          scaledH < canvasHeight
            ? Math.round((canvasHeight - scaledH) / 2)
            : 16;
        reactFlow.setViewport(
          { x: xOffset, y: yOffset, zoom: MIN_READABLE_ZOOM },
          { duration: 0 },
        );
      } else {
        reactFlow.fitView({
          padding: FIT_PADDING,
          minZoom: MIN_READABLE_ZOOM,
          duration: 0,
        });
      }
    });
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
        fitView={!panMode}
        fitViewOptions={{ padding: FIT_PADDING, minZoom: MIN_READABLE_ZOOM }}
        proOptions={{ hideAttribution: true }}
      />
      {panMode && (
        <div className="pointer-events-none absolute right-2.5 bottom-2.5 rounded-pill border border-border bg-card/90 px-2.5 py-1 text-caption-1 font-medium text-muted-foreground shadow-xs">
          Drag to see more →
        </div>
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
