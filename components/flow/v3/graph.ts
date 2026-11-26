import { resolveNodeCategory } from '../../diagram/category';
import {
  finalizeLayoutForWidth,
  selectPrecomputedLayout,
  type SerializedLayout,
} from '../../diagram/layout-types';
import type {
  FlowEdgeKind,
  FlowNode,
  ParsedFlowStep,
} from '../types';
import type { FlowGroupNode } from './GroupNode';
import type { IosFlowNode } from './IosNode';
import type { FlowStepEdge } from './StepEdge';

export function parseStepEdge(edge: string): { from: string; to: string } {
  const parts = edge.split('->').map((p) => p.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid edge "${edge}". Expected "from->to".`);
  }
  return { from: parts[0], to: parts[1] };
}

export function buildEdgeBuckets(steps: ParsedFlowStep[]) {
  const edgeBuckets = new Map<
    string,
    {
      from: string;
      to: string;
      kind: FlowEdgeKind;
      label?: string;
      stepIndices: number[];
    }
  >();

  steps.forEach((step, idx) => {
    const { from, to } = parseStepEdge(step.edge);
    const kind = step.kind ?? 'request';
    const key = `${from}->${to}:${kind}`;
    const existing = edgeBuckets.get(key);
    if (existing) {
      existing.stepIndices.push(idx);
      if (!existing.label && step.label) {
        existing.label = step.label;
      }
    } else {
      edgeBuckets.set(key, {
        from,
        to,
        kind,
        label: step.label,
        stepIndices: [idx],
      });
    }
  });

  return edgeBuckets;
}

export interface ClientFlowGraph {
  nodes: Array<FlowGroupNode | IosFlowNode>;
  edges: FlowStepEdge[];
  direction: 'LR' | 'TB';
  bounds: { width: number; height: number };
  zoom: number;
  panMode: boolean;
  canvasHeight: number;
}

/**
 * Builds React Flow nodes and edges from server-precomputed layouts without
 * importing dagre on the client.
 */
export function buildFlowGraphFromPrecomputed({
  nodes,
  steps,
  precomputed,
  containerWidth,
  activeStepIndex,
  reducedMotion,
}: {
  nodes: FlowNode[];
  steps: ParsedFlowStep[];
  precomputed: SerializedLayout[];
  containerWidth: number;
  activeStepIndex: number;
  reducedMotion: boolean;
}): ClientFlowGraph {
  const chosen = selectPrecomputedLayout(precomputed, containerWidth);
  const { zoom, panMode, canvasHeight } = finalizeLayoutForWidth(chosen, containerWidth);
  const edgeBuckets = buildEdgeBuckets(steps);

  const isOverview = activeStepIndex < 0;
  const activeStep = !isOverview ? steps[activeStepIndex] : undefined;
  const activeEndpoints = activeStep ? parseStepEdge(activeStep.edge) : null;
  const activeNodeIds = new Set<string>(
    activeEndpoints ? [activeEndpoints.from, activeEndpoints.to] : [],
  );

  const groupNodes: FlowGroupNode[] = chosen.groups.map((group, idx) => ({
    id: `group-${group.id}`,
    type: 'group',
    position: { x: group.x, y: group.y },
    draggable: false,
    selectable: false,
    zIndex: -10 + idx,
    data: {
      label: group.label,
      width: group.width,
      height: group.height,
    },
  }));

  const flowNodes: IosFlowNode[] = nodes.map((node) => {
    const box = chosen.nodes[node.id]!;
    return {
      id: node.id,
      type: 'ios',
      position: { x: box.x, y: box.y },
      width: box.width,
      height: box.height,
      draggable: false,
      selectable: false,
      data: {
        label: node.label,
        subtitle: node.subtitle,
        icon: node.icon ?? 'service',
        category: resolveNodeCategory(node),
        variant: node.variant ?? 'default',
        compact: chosen.compact,
        isActive: activeNodeIds.has(node.id),
        isOverview,
        isError: activeStep?.kind === 'error',
        width: box.width,
        height: box.height,
      },
    };
  });

  const flowEdges: FlowStepEdge[] = chosen.edges.map((route) => {
    const bucket = edgeBuckets.get(route.key)!;
    const isActive =
      !isOverview && bucket.stepIndices.includes(activeStepIndex);
    const isVisited =
      !isOverview &&
      !isActive &&
      bucket.stepIndices.some((idx) => idx < activeStepIndex);

    return {
      id: route.key,
      type: 'step',
      source: route.from,
      target: route.to,
      sourceHandle: route.sourceHandle,
      targetHandle: route.targetHandle,
      zIndex: isActive ? 20 : isVisited ? 10 : 0,
      data: {
        activeStepNumber: isActive ? activeStepIndex + 1 : null,
        isActive,
        isVisited,
        kind: route.kind,
        label: route.label,
        reducedMotion,
        offsetX: route.offsetX,
        offsetY: route.offsetY,
        isTreeEdge: route.isTreeEdge,
        direction: chosen.direction,
        skipLaneCoord: route.skipLaneCoord,
      },
    };
  });

  return {
    nodes: [...groupNodes, ...flowNodes],
    edges: flowEdges,
    direction: chosen.direction,
    bounds: chosen.bounds,
    zoom,
    panMode,
    canvasHeight,
  };
}
