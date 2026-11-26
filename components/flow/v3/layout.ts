import dagre from '@dagrejs/dagre';
import {
  resolveNodeCategory,
  type FlowEdgeKind,
  type FlowGroup,
  type FlowNode,
  type ParsedFlowStep,
} from '../types';
import type { FlowGroupNode } from './GroupNode';
import type { IosFlowNode } from './IosNode';
import type { FlowStepEdge } from './StepEdge';

export const MOBILE_BREAKPOINT = 640;

export const DESKTOP_CELL_X = 232;
export const DESKTOP_CELL_Y = 128;
export const DESKTOP_NODE_W = 176;
export const DESKTOP_NODE_H = 64;

export const MOBILE_NODE_W = 160;
export const MOBILE_NODE_H = 60;

const GROUP_PAD_X = 22;
const GROUP_PAD_TOP = 34;
const GROUP_PAD_BOTTOM = 18;

export interface FlowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function parseStepEdge(edge: string): { from: string; to: string } {
  const parts = edge.split('->').map((p) => p.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid edge "${edge}". Expected "from->to".`);
  }
  return { from: parts[0], to: parts[1] };
}

/**
 * Computes desktop grid positions from hand-placed (x, y) coordinates.
 */
export function computeDesktopPositions(
  nodes: FlowNode[],
): Map<string, FlowPosition> {
  const map = new Map<string, FlowPosition>();
  for (const node of nodes) {
    map.set(node.id, {
      x: node.x * DESKTOP_CELL_X,
      y: node.y * DESKTOP_CELL_Y,
      width: DESKTOP_NODE_W,
      height: DESKTOP_NODE_H,
    });
  }
  return map;
}

/**
 * Computes top-to-bottom dagre positions for narrow (< 640px) viewports.
 */
export function computeMobileDagrePositions(
  nodes: FlowNode[],
  steps: ParsedFlowStep[],
): Map<string, FlowPosition> {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB',
    nodesep: 32,
    ranksep: 64,
    marginx: 12,
    marginy: 12,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.id, { width: MOBILE_NODE_W, height: MOBILE_NODE_H });
  }

  const seen = new Set<string>();
  for (const step of steps) {
    const { from, to } = parseStepEdge(step.edge);
    if (from === to) continue;
    // Use forward edges to establish the primary top->bottom hierarchy
    const key = `${from}->${to}`;
    const reverseKey = `${to}->${from}`;
    if (step.kind === 'response' && seen.has(reverseKey)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    g.setEdge(from, to);
  }

  dagre.layout(g);

  const map = new Map<string, FlowPosition>();
  for (const node of nodes) {
    const layoutNode = g.node(node.id);
    map.set(node.id, {
      x: Math.round(layoutNode.x - MOBILE_NODE_W / 2),
      y: Math.round(layoutNode.y - MOBILE_NODE_H / 2),
      width: MOBILE_NODE_W,
      height: MOBILE_NODE_H,
    });
  }
  return map;
}

function pickHandles(
  fromPos: FlowPosition,
  toPos: FlowPosition,
  kind: FlowEdgeKind,
  isMobile: boolean,
): { sourceHandle: string; targetHandle: string } {
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;

  if (isMobile) {
    if (kind === 'response' || dy < -20) {
      return { sourceHandle: 'right-source', targetHandle: 'right-target' };
    }
    if (Math.abs(dy) < 20 && Math.abs(dx) > 20) {
      return dx > 0
        ? { sourceHandle: 'right-source', targetHandle: 'left-target' }
        : { sourceHandle: 'left-source', targetHandle: 'right-target' };
    }
    return { sourceHandle: 'bottom-source', targetHandle: 'top-target' };
  }

  // Desktop: separate return/response edges along bottom so forward + return don't overlap
  if (kind === 'response' && dx < -10 && Math.abs(dy) < 40) {
    return { sourceHandle: 'bottom-source', targetHandle: 'bottom-target' };
  }
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: 'right-source', targetHandle: 'left-target' }
      : { sourceHandle: 'left-source', targetHandle: 'right-target' };
  }
  return dy >= 0
    ? { sourceHandle: 'bottom-source', targetHandle: 'top-target' }
    : { sourceHandle: 'top-source', targetHandle: 'bottom-target' };
}

export interface ComputedFlowGraph {
  nodes: Array<FlowGroupNode | IosFlowNode>;
  edges: FlowStepEdge[];
}

/**
 * Builds React Flow nodes, group panels, and step edges for the active step and viewport mode.
 */
export function computeFlowGraph({
  nodes,
  steps,
  groups = [],
  isMobile,
  activeStepIndex,
  reducedMotion,
}: {
  nodes: FlowNode[];
  steps: ParsedFlowStep[];
  groups?: FlowGroup[];
  isMobile: boolean;
  activeStepIndex: number;
  reducedMotion: boolean;
}): ComputedFlowGraph {
  const positions = isMobile
    ? computeMobileDagrePositions(nodes, steps)
    : computeDesktopPositions(nodes);

  const isOverview = activeStepIndex < 0;
  const activeStep = !isOverview ? steps[activeStepIndex] : undefined;
  const activeEndpoints = activeStep ? parseStepEdge(activeStep.edge) : null;
  const activeNodeIds = new Set<string>(
    activeEndpoints ? [activeEndpoints.from, activeEndpoints.to] : [],
  );

  // Build group nodes behind regular nodes
  const groupNodes: FlowGroupNode[] = groups.map((group, idx) => {
    const padExtra = groups.length > 1 && idx === 0 ? 8 : 0;
    if (!isMobile) {
      const gw = group.width ?? 1;
      const gh = group.height ?? 1;
      const x = group.x * DESKTOP_CELL_X - GROUP_PAD_X - padExtra;
      const y = group.y * DESKTOP_CELL_Y - GROUP_PAD_TOP - padExtra;
      const width =
        (gw - 1) * DESKTOP_CELL_X + DESKTOP_NODE_W + (GROUP_PAD_X + padExtra) * 2;
      const height =
        (gh - 1) * DESKTOP_CELL_Y +
        DESKTOP_NODE_H +
        GROUP_PAD_TOP +
        GROUP_PAD_BOTTOM +
        padExtra * 2;

      return {
        id: `group-${group.id}`,
        type: 'group',
        position: { x, y },
        draggable: false,
        selectable: false,
        zIndex: -10 + idx,
        data: { label: group.label, width, height },
      };
    }

    // Mobile: wrap the nodes whose grid coordinates fall inside this group
    const gw = group.width ?? 1;
    const gh = group.height ?? 1;
    const memberPositions = nodes
      .filter(
        (n) =>
          n.x >= group.x &&
          n.x < group.x + gw &&
          n.y >= group.y &&
          n.y < group.y + gh,
      )
      .map((n) => positions.get(n.id))
      .filter((p): p is FlowPosition => Boolean(p));

    if (memberPositions.length === 0) {
      return {
        id: `group-${group.id}`,
        type: 'group',
        position: { x: 0, y: 0 },
        draggable: false,
        selectable: false,
        zIndex: -10 + idx,
        data: { label: group.label, width: MOBILE_NODE_W + 32, height: MOBILE_NODE_H + 48 },
      };
    }

    const minX = Math.min(...memberPositions.map((p) => p.x));
    const minY = Math.min(...memberPositions.map((p) => p.y));
    const maxX = Math.max(...memberPositions.map((p) => p.x + p.width));
    const maxY = Math.max(...memberPositions.map((p) => p.y + p.height));

    const padX = 16 + padExtra;
    const padTop = 30 + padExtra;
    const padBottom = 14 + padExtra;

    return {
      id: `group-${group.id}`,
      type: 'group',
      position: { x: minX - padX, y: minY - padTop },
      draggable: false,
      selectable: false,
      zIndex: -10 + idx,
      data: {
        label: group.label,
        width: maxX - minX + padX * 2,
        height: maxY - minY + padTop + padBottom,
      },
    };
  });

  const flowNodes: IosFlowNode[] = nodes.map((node) => {
    const pos = positions.get(node.id)!;
    return {
      id: node.id,
      type: 'ios',
      position: { x: pos.x, y: pos.y },
      draggable: false,
      selectable: false,
      data: {
        label: node.label,
        subtitle: node.subtitle,
        icon: node.icon ?? 'service',
        category: resolveNodeCategory(node),
        isActive: activeNodeIds.has(node.id),
        isOverview,
        isError: activeStep?.kind === 'error',
        width: pos.width,
      },
    };
  });

  // Group steps by (from, to, kind) so forward and return edges remain distinct
  const edgeBuckets = new Map<
    string,
    {
      from: string;
      to: string;
      kind: FlowEdgeKind;
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
    } else {
      edgeBuckets.set(key, { from, to, kind, stepIndices: [idx] });
    }
  });

  const flowEdges: FlowStepEdge[] = Array.from(edgeBuckets.entries()).map(
    ([key, bucket]) => {
      const fromPos = positions.get(bucket.from)!;
      const toPos = positions.get(bucket.to)!;
      const { sourceHandle, targetHandle } = pickHandles(
        fromPos,
        toPos,
        bucket.kind,
        isMobile,
      );

      const isActive =
        !isOverview && bucket.stepIndices.includes(activeStepIndex);
      const isVisited =
        !isOverview &&
        !isActive &&
        bucket.stepIndices.some((idx) => idx < activeStepIndex);

      return {
        id: key,
        type: 'step',
        source: bucket.from,
        target: bucket.to,
        sourceHandle,
        targetHandle,
        zIndex: isActive ? 20 : isVisited ? 10 : 0,
        data: {
          stepNumbers: bucket.stepIndices.map((idx) => idx + 1),
          activeStepNumber: isActive ? activeStepIndex + 1 : null,
          isActive,
          isVisited,
          kind: bucket.kind,
          reducedMotion,
        },
      };
    },
  );

  return {
    nodes: [...groupNodes, ...flowNodes],
    edges: flowEdges,
  };
}
