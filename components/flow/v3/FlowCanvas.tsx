'use client';

import '@xyflow/react/dist/base.css';
import './flow.css';

import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { useEffect, useMemo, useState } from 'react';
import type { FlowGroup, FlowNode, ParsedFlowStep } from '../types';
import { GroupNode } from './GroupNode';
import { IosNode } from './IosNode';
import { StepEdge } from './StepEdge';
import { MOBILE_BREAKPOINT, computeFlowGraph } from './layout';

export interface FlowCanvasControls {
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
}

export interface FlowCanvasProps {
  flowKey: string;
  nodes: FlowNode[];
  steps: ParsedFlowStep[];
  groups?: FlowGroup[];
  activeStepIndex: number;
  reducedMotion: boolean;
  onControlsReady?: (controls: FlowCanvasControls | null) => void;
}

const NODE_TYPES = {
  ios: IosNode,
  group: GroupNode,
};

const EDGE_TYPES = {
  step: StepEdge,
};

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
}

function FlowCanvasInner({
  flowKey,
  nodes,
  steps,
  groups,
  activeStepIndex,
  reducedMotion,
  onControlsReady,
}: FlowCanvasProps) {
  const isMobile = useIsMobile();
  const reactFlow = useReactFlow();

  const graph = useMemo(
    () =>
      computeFlowGraph({
        nodes,
        steps,
        groups,
        isMobile,
        activeStepIndex,
        reducedMotion,
      }),
    [nodes, steps, groups, isMobile, activeStepIndex, reducedMotion],
  );

  useEffect(() => {
    onControlsReady?.({
      zoomIn: () => reactFlow.zoomIn({ duration: reducedMotion ? 0 : 200 }),
      zoomOut: () => reactFlow.zoomOut({ duration: reducedMotion ? 0 : 200 }),
      fitView: () =>
        reactFlow.fitView({
          padding: 0.16,
          duration: reducedMotion ? 0 : 240,
        }),
    });
    return () => onControlsReady?.(null);
  }, [reactFlow, reducedMotion, onControlsReady]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      reactFlow.fitView({
        padding: 0.16,
        duration: reducedMotion ? 0 : 240,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [reactFlow, flowKey, isMobile, reducedMotion]);

  return (
    <div
      className="flow-v3-canvas h-full w-full"
      onDoubleClick={() =>
        reactFlow.fitView({
          padding: 0.16,
          duration: reducedMotion ? 0 : 240,
        })
      }
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
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        panOnDrag={true}
        minZoom={0.4}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.16 }}
        proOptions={{ hideAttribution: true }}
      />
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
