import dagre from '@dagrejs/dagre';
import type {
  FlowEdgeKind,
  FlowGroup,
  FlowLayoutMode,
  FlowNode,
} from './types';

export const LR_CONTAINER_BREAKPOINT = 720;
export const FIT_PADDING = 0.12;
export const MIN_READABLE_ZOOM = 0.87; // 15px * 0.87 = 13.05px >= 13px
export const MIN_CANVAS_HEIGHT = 240;
export const MAX_CANVAS_HEIGHT = 560;

export const NODE_MIN_WIDTH = 160;
export const NODE_MAX_WIDTH = 240;
export const NODE_HEIGHT_SINGLE = 64;
export const NODE_HEIGHT_DOUBLE = 80;

export const RANK_GAP = 72;
export const NODE_GAP = 40;
export const GROUP_PAD = 24;
export const GROUP_LABEL_HEIGHT = 28;
export const GROUP_PAD_TOP = GROUP_PAD + GROUP_LABEL_HEIGHT; // 52px
export const PARALLEL_EDGE_OFFSET = 10;
export const EDGE_RADIUS = 8;

export type LayoutDirection = 'LR' | 'TB';

export interface LayoutEdgeInput {
  from: string;
  to: string;
  kind: FlowEdgeKind;
  label?: string;
}

export interface NodeBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  lines: 1 | 2;
}

export interface GroupBox {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EdgeRoute {
  key: string;
  from: string;
  to: string;
  kind: FlowEdgeKind;
  label?: string;
  sourceHandle: 'top-source' | 'right-source' | 'bottom-source' | 'left-source';
  targetHandle: 'top-target' | 'right-target' | 'bottom-target' | 'left-target';
  offsetX: number;
  offsetY: number;
  isTreeEdge: boolean;
  isStraight: boolean;
  /** Dedicated lane coordinate (Y in LR, X in TB) when skipping intermediate ranks (§5.9). */
  skipLaneCoord?: number;
}

export interface ComputedDiagramLayout {
  direction: LayoutDirection;
  nodes: Map<string, NodeBox>;
  groups: GroupBox[];
  edges: EdgeRoute[];
  bounds: { width: number; height: number };
  zoom: number;
  panMode: boolean;
  canvasHeight: number;
  nodeWidth: number;
}

/**
 * Deterministic character-width estimator for Inter 15px/600 and 13px/400
 * so layout math is identical in Node (SSR/Vitest) and browser.
 */
export function estimateTextWidth(text: string, fontSize = 15, semibold = true): number {
  let units = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('ilIjtfr.,:;!| '.includes(ch)) {
      units += 0.34;
    } else if ('mwMW@%'.includes(ch)) {
      units += 0.84;
    } else if (ch >= 'A' && ch <= 'Z') {
      units += 0.66;
    } else {
      units += 0.54;
    }
  }
  const weightFactor = semibold ? 1.04 : 0.96;
  return units * fontSize * weightFactor;
}

/**
 * Computes the uniform node width (160–240px) and per-node line count (1 or 2)
 * so labels never truncate with an ellipsis.
 */
export function computeNodeDimensions(nodes: FlowNode[]): {
  nodeWidth: number;
  nodeLines: Map<string, 1 | 2>;
} {
  // 36px icon tile + 10px gap + 24px horizontal padding + 10px safety
  const chromeWidth = 80;
  let maxIdeal = NODE_MIN_WIDTH;

  for (const node of nodes) {
    const labelW = estimateTextWidth(node.label, 15, true);
    const subW = node.subtitle ? estimateTextWidth(node.subtitle, 13, false) : 0;
    const problemExtra = node.variant === 'problem' ? 20 : 0;
    const ideal = Math.ceil(Math.max(labelW, subW) + chromeWidth + problemExtra);
    if (ideal > maxIdeal) {
      maxIdeal = ideal;
    }
  }

  const nodeWidth = Math.max(NODE_MIN_WIDTH, Math.min(NODE_MAX_WIDTH, maxIdeal));
  const nodeLines = new Map<string, 1 | 2>();

  for (const node of nodes) {
    const problemExtra = node.variant === 'problem' ? 20 : 0;
    const availableTextW = nodeWidth - chromeWidth - problemExtra + 6;
    const labelW = estimateTextWidth(node.label, 15, true);
    const needsTwoLines = labelW > availableTextW || node.label.includes('\n');
    nodeLines.set(node.id, needsTwoLines ? 2 : 1);
  }

  return { nodeWidth, nodeLines };
}

function runDagrePass(
  nodes: FlowNode[],
  edges: LayoutEdgeInput[],
  groups: FlowGroup[],
  direction: LayoutDirection,
  layoutMode: FlowLayoutMode,
  nodeWidth: number,
  nodeLines: Map<string, 1 | 2>,
): {
  nodeMap: Map<string, NodeBox>;
  groupBoxes: GroupBox[];
  bounds: { width: number; height: number };
} {
  const g = new dagre.graphlib.Graph({ multigraph: false, compound: false });
  g.setGraph({
    rankdir: direction,
    nodesep: NODE_GAP,
    ranksep: RANK_GAP,
    marginx: 0,
    marginy: 0,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const sortedNodes = [...nodes].sort(
    (a, b) => (a.rank ?? 0) - (b.rank ?? 0) || (a.order ?? 0) - (b.order ?? 0),
  );

  const nodeById = new Map(sortedNodes.map((n) => [n.id, n]));

  for (const node of sortedNodes) {
    const lines = nodeLines.get(node.id) ?? 1;
    const height = lines === 2 ? NODE_HEIGHT_DOUBLE : NODE_HEIGHT_SINGLE;
    g.setNode(node.id, { width: nodeWidth, height });
  }

  const forwardPairs = new Set<string>();
  const connectedNodes = new Set<string>();

  for (const edge of edges) {
    if (edge.from === edge.to) continue;
    const pairKey = `${edge.from}->${edge.to}`;
    const reverseKey = `${edge.to}->${edge.from}`;

    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);
    const isRankReversed =
      fromNode?.rank !== undefined &&
      toNode?.rank !== undefined &&
      fromNode.rank > toNode.rank;

    if ((edge.kind === 'response' && forwardPairs.has(reverseKey)) || isRankReversed) {
      continue;
    }

    if (!forwardPairs.has(pairKey)) {
      forwardPairs.add(pairKey);
      connectedNodes.add(edge.from);
      connectedNodes.add(edge.to);
      const minlen =
        fromNode?.rank !== undefined && toNode?.rank !== undefined
          ? Math.max(1, toNode.rank - fromNode.rank)
          : 1;
      g.setEdge(edge.from, edge.to, { minlen });
    }
  }

  // Anchor disconnected nodes that have explicit rank hints so they align on their rank
  for (const node of sortedNodes) {
    if (connectedNodes.has(node.id)) continue;
    if (node.rank !== undefined && node.rank > 0) {
      const anchor = sortedNodes.find(
        (candidate) =>
          candidate.id !== node.id &&
          candidate.rank !== undefined &&
          candidate.rank < node.rank!,
      );
      if (anchor) {
        g.setEdge(anchor.id, node.id, {
          minlen: Math.max(1, node.rank - (anchor.rank ?? 0)),
          weight: 0,
        });
      }
    }
  }

  dagre.layout(g);

  const rawNodes = new Map<string, NodeBox>();
  for (const node of sortedNodes) {
    const pos = g.node(node.id);
    const lines = nodeLines.get(node.id) ?? 1;
    const height = lines === 2 ? NODE_HEIGHT_DOUBLE : NODE_HEIGHT_SINGLE;
    const x = pos.x - nodeWidth / 2;
    const y = pos.y - height / 2;
    rawNodes.set(node.id, {
      id: node.id,
      x,
      y,
      width: nodeWidth,
      height,
      cx: pos.x,
      cy: pos.y,
      lines,
    });
  }

  // Enforce tree parent centering over direct children when layout === 'tree'
  if (layoutMode === 'tree' && direction === 'TB') {
    const childrenByParent = new Map<string, string[]>();
    for (const edge of edges) {
      if (edge.from === edge.to) continue;
      const list = childrenByParent.get(edge.from) ?? [];
      if (!list.includes(edge.to)) list.push(edge.to);
      childrenByParent.set(edge.from, list);
    }

    // Bottom-up adjustment by rank
    const byY = [...rawNodes.values()].sort((a, b) => b.cy - a.cy);
    for (const parentBox of byY) {
      const children = childrenByParent.get(parentBox.id);
      if (!children || children.length === 0) continue;
      const childBoxes = children
        .map((cid) => rawNodes.get(cid))
        .filter((b): b is NodeBox => Boolean(b));
      if (childBoxes.length === 0) continue;

      const avgCx =
        childBoxes.reduce((sum, b) => sum + b.cx, 0) / childBoxes.length;
      const sameRankBoxes = [...rawNodes.values()].filter(
        (b) => b.id !== parentBox.id && Math.abs(b.cy - parentBox.cy) < 1,
      );
      const wouldOverlap = sameRankBoxes.some(
        (other) =>
          Math.abs(avgCx - other.cx) < (parentBox.width + other.width) / 2 + NODE_GAP - 1,
      );
      if (!wouldOverlap) {
        parentBox.cx = avgCx;
        parentBox.x = avgCx - parentBox.width / 2;
      }
    }
  }

  // Compute group boxes (innermost first so nested groups wrap cleanly without label overlap)
  const sortedGroups = [...groups].sort(
    (a, b) => a.nodeIds.length - b.nodeIds.length,
  );
  const groupBoxById = new Map<string, GroupBox>();

  for (const group of sortedGroups) {
    const memberSet = new Set(group.nodeIds);
    const memberRects: { x: number; y: number; width: number; height: number }[] = [];

    for (const nid of group.nodeIds) {
      const nb = rawNodes.get(nid);
      if (nb) memberRects.push(nb);
    }

    // Include strictly nested child groups so outer group labels never collide with inner labels
    for (const prev of sortedGroups) {
      if (prev.id === group.id) continue;
      const prevBox = groupBoxById.get(prev.id);
      if (!prevBox) continue;
      const isSubset =
        prev.nodeIds.length < group.nodeIds.length &&
        prev.nodeIds.every((id) => memberSet.has(id));
      if (isSubset) {
        memberRects.push(prevBox);
      }
    }

    if (memberRects.length === 0) continue;

    const minX = Math.min(...memberRects.map((r) => r.x));
    const minY = Math.min(...memberRects.map((r) => r.y));
    const maxX = Math.max(...memberRects.map((r) => r.x + r.width));
    const maxY = Math.max(...memberRects.map((r) => r.y + r.height));

    const box: GroupBox = {
      id: group.id,
      label: group.label,
      x: minX - GROUP_PAD,
      y: minY - GROUP_PAD_TOP,
      width: maxX - minX + GROUP_PAD * 2,
      height: maxY - minY + GROUP_PAD_TOP + GROUP_PAD,
    };
    groupBoxById.set(group.id, box);
  }

  const groupBoxes = groups
    .map((gItem) => groupBoxById.get(gItem.id))
    .filter((b): b is GroupBox => Boolean(b));

  // Normalize origin to (0, 0)
  const allRects = [...rawNodes.values(), ...groupBoxes];
  const originX = allRects.length > 0 ? Math.min(...allRects.map((r) => r.x)) : 0;
  const originY = allRects.length > 0 ? Math.min(...allRects.map((r) => r.y)) : 0;

  const nodeMap = new Map<string, NodeBox>();
  for (const [id, nb] of rawNodes.entries()) {
    const x = Math.round((nb.x - originX) * 10) / 10;
    const y = Math.round((nb.y - originY) * 10) / 10;
    nodeMap.set(id, {
      ...nb,
      x,
      y,
      cx: x + nb.width / 2,
      cy: y + nb.height / 2,
    });
  }

  const normalizedGroups = groupBoxes.map((gb) => ({
    ...gb,
    x: Math.round((gb.x - originX) * 10) / 10,
    y: Math.round((gb.y - originY) * 10) / 10,
  }));

  const normalizedRects = [...nodeMap.values(), ...normalizedGroups];
  const maxRight =
    normalizedRects.length > 0
      ? Math.max(...normalizedRects.map((r) => r.x + r.width))
      : 0;
  const maxBottom =
    normalizedRects.length > 0
      ? Math.max(...normalizedRects.map((r) => r.y + r.height))
      : 0;

  return {
    nodeMap,
    groupBoxes: normalizedGroups,
    bounds: { width: Math.ceil(maxRight), height: Math.ceil(maxBottom) },
  };
}

function buildEdgeRoutes(
  edges: LayoutEdgeInput[],
  nodeMap: Map<string, NodeBox>,
  direction: LayoutDirection,
  layoutMode: FlowLayoutMode,
): EdgeRoute[] {
  const pairSet = new Set(edges.map((e) => `${e.from}->${e.to}`));
  const seen = new Set<string>();
  const routes: EdgeRoute[] = [];

  for (const edge of edges) {
    const key = `${edge.from}->${edge.to}:${edge.kind}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const fromBox = nodeMap.get(edge.from);
    const toBox = nodeMap.get(edge.to);
    if (!fromBox || !toBox) continue;

    const hasReverse = pairSet.has(`${edge.to}->${edge.from}`);
    const isTreeEdge = layoutMode === 'tree';

    let sourceHandle: EdgeRoute['sourceHandle'];
    let targetHandle: EdgeRoute['targetHandle'];
    let offsetX = 0;
    let offsetY = 0;

    const dx = toBox.cx - fromBox.cx;
    const dy = toBox.cy - fromBox.cy;

    if (isTreeEdge) {
      sourceHandle = 'bottom-source';
      targetHandle = 'top-target';
    } else if (direction === 'LR') {
      if (Math.abs(dx) < 1) {
        sourceHandle = dy >= 0 ? 'bottom-source' : 'top-source';
        targetHandle = dy >= 0 ? 'top-target' : 'bottom-target';
      } else if (dx > 0) {
        sourceHandle = 'right-source';
        targetHandle = 'left-target';
      } else {
        sourceHandle = 'left-source';
        targetHandle = 'right-target';
      }

      if (hasReverse) {
        offsetY =
          edge.kind === 'response' ? PARALLEL_EDGE_OFFSET : -PARALLEL_EDGE_OFFSET;
      }
    } else {
      if (Math.abs(dy) < 1) {
        sourceHandle = dx >= 0 ? 'right-source' : 'left-source';
        targetHandle = dx >= 0 ? 'left-target' : 'right-target';
      } else if (dy > 0) {
        sourceHandle = 'bottom-source';
        targetHandle = 'top-target';
      } else {
        sourceHandle = 'top-source';
        targetHandle = 'bottom-target';
      }

      if (hasReverse) {
        offsetX =
          edge.kind === 'response' ? PARALLEL_EDGE_OFFSET : -PARALLEL_EDGE_OFFSET;
      }
    }

    const isStraight =
      !isTreeEdge &&
      !hasReverse &&
      ((direction === 'LR' && Math.abs(dy) < 1) ||
        (direction === 'TB' && Math.abs(dx) < 1));

    // §5.9: Detect if this edge crosses over any intermediate node between source and target
    let skipLaneCoord: number | undefined;
    if (!isTreeEdge) {
      const allBoxes = [...nodeMap.values()];
      if (direction === 'LR') {
        const minX = Math.min(fromBox.x + fromBox.width, toBox.x + toBox.width);
        const maxX = Math.max(fromBox.x, toBox.x);
        const minY = Math.min(fromBox.y, toBox.y);
        const maxY = Math.max(fromBox.y + fromBox.height, toBox.y + toBox.height);
        const blocking = allBoxes.filter(
          (b) =>
            b.id !== fromBox.id &&
            b.id !== toBox.id &&
            b.x + b.width > minX &&
            b.x < maxX &&
            b.y + b.height > minY - 12 &&
            b.y < maxY + 12,
        );
        if (blocking.length > 0) {
          const maxBlockingBottom = Math.max(
            ...blocking.map((b) => b.y + b.height),
            fromBox.y + fromBox.height,
            toBox.y + toBox.height,
          );
          skipLaneCoord = maxBlockingBottom + 32; // >= 24px clear (§5.9)
        }
      } else {
        const minY = Math.min(fromBox.y + fromBox.height, toBox.y + toBox.height);
        const maxY = Math.max(fromBox.y, toBox.y);
        const minX = Math.min(fromBox.x, toBox.x);
        const maxX = Math.max(fromBox.x + fromBox.width, toBox.x + toBox.width);
        const blocking = allBoxes.filter(
          (b) =>
            b.id !== fromBox.id &&
            b.id !== toBox.id &&
            b.y + b.height > minY &&
            b.y < maxY &&
            b.x + b.width > minX - 12 &&
            b.x < maxX + 12,
        );
        if (blocking.length > 0) {
          const maxBlockingRight = Math.max(
            ...blocking.map((b) => b.x + b.width),
            fromBox.x + fromBox.width,
            toBox.x + toBox.width,
          );
          skipLaneCoord = maxBlockingRight + 32; // >= 24px clear (§5.9)
        }
      }
    }

    routes.push({
      key,
      from: edge.from,
      to: edge.to,
      kind: edge.kind,
      label: edge.label,
      sourceHandle,
      targetHandle,
      offsetX,
      offsetY,
      isTreeEdge,
      isStraight,
      skipLaneCoord,
    });
  }

  return routes;
}

/**
 * Computes the complete responsive layout for both <Flow> and <Diagram>
 * per DIAGRAM-RULES §2–§5.
 */
export function computeDiagramLayout({
  nodes,
  edges,
  groups = [],
  layout = 'flow',
  containerWidth,
}: {
  nodes: FlowNode[];
  edges: LayoutEdgeInput[];
  groups?: FlowGroup[];
  layout?: FlowLayoutMode;
  containerWidth: number;
}): ComputedDiagramLayout {
  const safeWidth = Math.max(320, containerWidth);
  const { nodeWidth, nodeLines } = computeNodeDimensions(nodes);

  let direction: LayoutDirection =
    layout === 'tree'
      ? 'TB'
      : safeWidth >= LR_CONTAINER_BREAKPOINT
        ? 'LR'
        : 'TB';

  let pass = runDagrePass(
    nodes,
    edges,
    groups,
    direction,
    layout,
    nodeWidth,
    nodeLines,
  );

  const padFactor = 1 + FIT_PADDING * 2;
  let fitZoom =
    pass.bounds.width > 0
      ? Math.min(1, safeWidth / (pass.bounds.width * padFactor))
      : 1;

  // §3.3: If LR would shrink labels below 13px (zoom < 0.87), switch to TB first
  if (direction === 'LR' && fitZoom < MIN_READABLE_ZOOM && layout !== 'tree') {
    direction = 'TB';
    pass = runDagrePass(
      nodes,
      edges,
      groups,
      direction,
      layout,
      nodeWidth,
      nodeLines,
    );
    fitZoom =
      pass.bounds.width > 0
        ? Math.min(1, safeWidth / (pass.bounds.width * padFactor))
        : 1;
  }

  const panMode = fitZoom < MIN_READABLE_ZOOM;
  const zoom = panMode ? MIN_READABLE_ZOOM : fitZoom;
  const canvasHeight = Math.round(
    Math.max(
      MIN_CANVAS_HEIGHT,
      Math.min(MAX_CANVAS_HEIGHT, pass.bounds.height * zoom * padFactor),
    ),
  );

  const edgeRoutes = buildEdgeRoutes(edges, pass.nodeMap, direction, layout);

  // Expand bounds if any skip-rank lane extends beyond node bounds
  let finalBounds = pass.bounds;
  for (const route of edgeRoutes) {
    if (route.skipLaneCoord !== undefined) {
      if (direction === 'LR') {
        finalBounds = {
          width: finalBounds.width,
          height: Math.max(finalBounds.height, Math.ceil(route.skipLaneCoord + 16)),
        };
      } else {
        finalBounds = {
          width: Math.max(finalBounds.width, Math.ceil(route.skipLaneCoord + 16)),
          height: finalBounds.height,
        };
      }
    }
  }

  return {
    direction,
    nodes: pass.nodeMap,
    groups: pass.groupBoxes,
    edges: edgeRoutes,
    bounds: finalBounds,
    zoom,
    panMode,
    canvasHeight,
    nodeWidth,
  };
}

/**
 * Returns the anchor coordinates for a handle on a NodeBox.
 */
export function getHandleCoords(
  box: NodeBox,
  handle: EdgeRoute['sourceHandle'] | EdgeRoute['targetHandle'],
  offsetX = 0,
  offsetY = 0,
): { x: number; y: number } {
  switch (handle) {
    case 'top-source':
    case 'top-target':
      return { x: box.cx + offsetX, y: box.y };
    case 'right-source':
    case 'right-target':
      return { x: box.x + box.width, y: box.cy + offsetY };
    case 'bottom-source':
    case 'bottom-target':
      return { x: box.cx + offsetX, y: box.y + box.height };
    case 'left-source':
    case 'left-target':
      return { x: box.x, y: box.cy + offsetY };
  }
}

/**
 * Builds an orthogonal elbow/bus SVG path for tree connectors (§5.4).
 */
export function buildTreeBusPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
): { path: string; labelX: number; labelY: number } {
  const busY = Math.round((sy + ty) / 2);
  if (Math.abs(sx - tx) < 0.5) {
    return {
      path: `M ${sx} ${sy} L ${tx} ${ty}`,
      labelX: sx,
      labelY: busY,
    };
  }
  const r = Math.min(EDGE_RADIUS, Math.abs(tx - sx) / 2, Math.abs(busY - sy), Math.abs(ty - busY));
  const dirX = tx > sx ? 1 : -1;
  const dirY1 = busY >= sy ? 1 : -1;
  const dirY2 = ty >= busY ? 1 : -1;

  const path = [
    `M ${sx} ${sy}`,
    `L ${sx} ${busY - dirY1 * r}`,
    `Q ${sx} ${busY} ${sx + dirX * r} ${busY}`,
    `L ${tx - dirX * r} ${busY}`,
    `Q ${tx} ${busY} ${tx} ${busY + dirY2 * r}`,
    `L ${tx} ${ty}`,
  ].join(' ');

  return {
    path,
    labelX: (sx + tx) / 2,
    labelY: busY,
  };
}

/**
 * Builds a smoothstep orthogonal SVG path with 8px corner radius for static <Diagram> (§5.1).
 */
export function buildSmoothStepSvgPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  sourceHandle: EdgeRoute['sourceHandle'],
  targetHandle: EdgeRoute['targetHandle'],
): { path: string; labelX: number; labelY: number } {
  const isSourceHorizontal =
    sourceHandle === 'left-source' || sourceHandle === 'right-source';
  const isTargetHorizontal =
    targetHandle === 'left-target' || targetHandle === 'right-target';

  if (isSourceHorizontal && isTargetHorizontal) {
    if (Math.abs(sy - ty) < 0.5) {
      return { path: `M ${sx} ${sy} L ${tx} ${ty}`, labelX: (sx + tx) / 2, labelY: sy };
    }
    const midX = (sx + tx) / 2;
    const r = Math.min(EDGE_RADIUS, Math.abs(midX - sx), Math.abs(ty - sy) / 2);
    const dirX = midX >= sx ? 1 : -1;
    const dirY = ty >= sy ? 1 : -1;
    const path = [
      `M ${sx} ${sy}`,
      `L ${midX - dirX * r} ${sy}`,
      `Q ${midX} ${sy} ${midX} ${sy + dirY * r}`,
      `L ${midX} ${ty - dirY * r}`,
      `Q ${midX} ${ty} ${midX + dirX * r} ${ty}`,
      `L ${tx} ${ty}`,
    ].join(' ');
    return { path, labelX: midX, labelY: (sy + ty) / 2 };
  }

  if (!isSourceHorizontal && !isTargetHorizontal) {
    return buildTreeBusPath(sx, sy, tx, ty);
  }

  // L-bend when one is horizontal and one is vertical
  if (isSourceHorizontal) {
    const r = Math.min(EDGE_RADIUS, Math.abs(tx - sx), Math.abs(ty - sy));
    const dirX = tx >= sx ? 1 : -1;
    const dirY = ty >= sy ? 1 : -1;
    const path = [
      `M ${sx} ${sy}`,
      `L ${tx - dirX * r} ${sy}`,
      `Q ${tx} ${sy} ${tx} ${sy + dirY * r}`,
      `L ${tx} ${ty}`,
    ].join(' ');
    return { path, labelX: (sx + tx) / 2, labelY: sy };
  }

  const r = Math.min(EDGE_RADIUS, Math.abs(tx - sx), Math.abs(ty - sy));
  const dirX = tx >= sx ? 1 : -1;
  const dirY = ty >= sy ? 1 : -1;
  const path = [
    `M ${sx} ${sy}`,
    `L ${sx} ${ty - dirY * r}`,
    `Q ${sx} ${ty} ${sx + dirX * r} ${ty}`,
    `L ${tx} ${ty}`,
  ].join(' ');
  return { path, labelX: sx, labelY: (sy + ty) / 2 };
}

/**
 * Builds a dedicated orthogonal lane path for skip-rank edges (§5.9)
 * so the edge clears intermediate nodes by >= 24px and enters the target's side handle.
 */
export function buildSkipRankPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  direction: LayoutDirection,
  laneCoord: number,
): { path: string; labelX: number; labelY: number } {
  const stepOut = 18;
  const r = EDGE_RADIUS;

  if (direction === 'LR') {
    const outDir = tx >= sx ? 1 : -1;
    const x1 = sx + outDir * stepOut;
    const x2 = tx - outDir * stepOut;
    const midX = (x1 + x2) / 2;
    const path = [
      `M ${sx} ${sy}`,
      `L ${x1 - outDir * r} ${sy}`,
      `Q ${x1} ${sy} ${x1} ${sy + r}`,
      `L ${x1} ${laneCoord - r}`,
      `Q ${x1} ${laneCoord} ${x1 + outDir * r} ${laneCoord}`,
      `L ${x2 - outDir * r} ${laneCoord}`,
      `Q ${x2} ${laneCoord} ${x2} ${laneCoord - r}`,
      `L ${x2} ${ty + r}`,
      `Q ${x2} ${ty} ${x2 + outDir * r} ${ty}`,
      `L ${tx} ${ty}`,
    ].join(' ');
    return { path, labelX: midX, labelY: laneCoord };
  }

  const outDir = ty >= sy ? 1 : -1;
  const y1 = sy + outDir * stepOut;
  const y2 = ty - outDir * stepOut;
  const midY = (y1 + y2) / 2;
  const path = [
    `M ${sx} ${sy}`,
    `L ${sx} ${y1 - outDir * r}`,
    `Q ${sx} ${y1} ${sx + r} ${y1}`,
    `L ${laneCoord - r} ${y1}`,
    `Q ${laneCoord} ${y1} ${laneCoord} ${y1 + outDir * r}`,
    `L ${laneCoord} ${y2 - outDir * r}`,
    `Q ${laneCoord} ${y2} ${laneCoord - r} ${y2}`,
    `L ${tx + r} ${y2}`,
    `Q ${tx} ${y2} ${tx} ${y2 + outDir * r}`,
    `L ${tx} ${ty}`,
  ].join(' ');
  return { path, labelX: laneCoord, labelY: midY };
}
