import { resolveNodeCategory } from '../../diagram/category';
import {
  computeDiagramLayout,
  type ComputedDiagramLayout,
  type LayoutEdgeInput,
} from '../../diagram/layout';
import type {
  FlowEdgeKind,
  FlowGroup,
  FlowLayoutMode,
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

export interface ComputedFlowGraph {
  nodes: Array<FlowGroupNode | IosFlowNode>;
  edges: FlowStepEdge[];
  layout: ComputedDiagramLayout;
}

/**
 * Builds React Flow nodes, group panels, and step edges using the shared dagre layout engine.
 */
export function computeFlowGraph({
  nodes,
  steps,
  groups = [],
  layoutMode = 'flow',
  containerWidth,
  activeStepIndex,
  reducedMotion,
}: {
  nodes: FlowNode[];
  steps: ParsedFlowStep[];
  groups?: FlowGroup[];
  layoutMode?: FlowLayoutMode;
  containerWidth: number;
  activeStepIndex: number;
  reducedMotion: boolean;
}): ComputedFlowGraph {
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

  const edgeInputs: LayoutEdgeInput[] = Array.from(edgeBuckets.values()).map(
    (b) => ({
      from: b.from,
      to: b.to,
      kind: b.kind,
      label: b.label,
    }),
  );

  const computed = computeDiagramLayout({
    nodes,
    edges: edgeInputs,
    groups,
    layout: layoutMode,
    containerWidth,
  });

  const isOverview = activeStepIndex < 0;
  const activeStep = !isOverview ? steps[activeStepIndex] : undefined;
  const activeEndpoints = activeStep ? parseStepEdge(activeStep.edge) : null;
  const activeNodeIds = new Set<string>(
    activeEndpoints ? [activeEndpoints.from, activeEndpoints.to] : [],
  );

  const groupNodes: FlowGroupNode[] = computed.groups.map((group, idx) => ({
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
    const box = computed.nodes.get(node.id)!;
    return {
      id: node.id,
      type: 'ios',
      position: { x: box.x, y: box.y },
      draggable: false,
      selectable: false,
      data: {
        label: node.label,
        subtitle: node.subtitle,
        icon: node.icon ?? 'service',
        category: resolveNodeCategory(node),
        variant: node.variant ?? 'default',
        compact: computed.compact,
        isActive: activeNodeIds.has(node.id),
        isOverview,
        isError: activeStep?.kind === 'error',
        width: box.width,
        height: box.height,
      },
    };
  });

  const flowEdges: FlowStepEdge[] = computed.edges.map((route) => {
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
        direction: computed.direction,
        skipLaneCoord: route.skipLaneCoord,
        labelBox: route.labelBox,
        compact: computed.compact,
        isOverview,
      },
    };
  });

  return {
    nodes: [...groupNodes, ...flowNodes],
    edges: flowEdges,
    layout: computed,
  };
}
