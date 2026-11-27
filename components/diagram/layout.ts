import dagre from '@dagrejs/dagre';
import type {
  FlowEdgeKind,
  FlowGroup,
  FlowLayoutMode,
  FlowNode,
} from './types';

export const LR_CONTAINER_BREAKPOINT = 720;
export const NO_PAN_CONTAINER_MIN = 640;
export const STACKED_TREE_MAX_WIDTH = 480;
export const FIT_PADDING = 0.12;
export const MIN_READABLE_ZOOM = 0.94; // 15px * 0.94 = 14.1px >= 14px; compact (14px) requires zoom >= 1
export const MIN_CANVAS_HEIGHT = 240;
export const MAX_CANVAS_HEIGHT = 560;

export const NODE_MIN_WIDTH = 160;
export const NODE_MAX_WIDTH = 240;
export const NODE_HEIGHT_SINGLE = 64;
export const NODE_HEIGHT_DOUBLE = 80;

export const COMPACT_NODE_MIN_WIDTH = 112;
export const COMPACT_NODE_MAX_WIDTH = 160;
export const COMPACT_NODE_HEIGHT_SINGLE = 52;
export const COMPACT_NODE_HEIGHT_DOUBLE = 58;

export const RANK_GAP = 72;
export const NODE_GAP = 40;
export const COMPACT_RANK_GAP = 52;
export const COMPACT_NODE_GAP = 12;
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
  isStackedEdge: boolean;
  isStraight: boolean;
  /** Dedicated lane coordinate (Y in LR, X in TB) when skipping intermediate ranks (§5.9). */
  skipLaneCoord?: number;
  /**
   * §6.3 edge label pill, placed by `placeEdgeLabels` (top-left corner, layout units).
   * Absent when the edge has no label or no collision-free spot exists; the step text
   * then carries the meaning and the pill is not drawn.
   */
  labelBox?: LabelBox;
}

export interface LabelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComputedDiagramLayout {
  direction: LayoutDirection;
  compact: boolean;
  stacked: boolean;
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
 * Splits a label into unbreakable word/camelCase tokens (matching <wbr> breaks).
 */
export function splitLabelTokens(label: string): string[] {
  return label
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Computes the uniform node width and per-node line count (1 or 2)
 * so labels never truncate with an ellipsis or break mid-word.
 */
export function computeNodeDimensions(
  nodes: FlowNode[],
  compact = false,
  maxWidthOverride?: number,
): {
  nodeWidth: number;
  nodeLines: Map<string, 1 | 2>;
} {
  const minW = compact ? COMPACT_NODE_MIN_WIDTH : NODE_MIN_WIDTH;
  const maxW = Math.min(
    compact ? COMPACT_NODE_MAX_WIDTH : NODE_MAX_WIDTH,
    maxWidthOverride ?? Infinity,
  );
  const fontSize = compact ? 14 : 15;
  // Normal: 36px icon + 10px gap + 24px pad + 10px safety = 80
  // Compact: 28px icon + 6px gap + 16px pad + 4px safety = 54
  const chromeWidth = compact ? 54 : 80;
  let maxIdeal = minW;
  let minWordWidth = minW;

  for (const node of nodes) {
    const labelW = estimateTextWidth(node.label, fontSize, true);
    const subW =
      !compact && node.subtitle ? estimateTextWidth(node.subtitle, 13, false) : 0;
    const problemExtra = node.variant === 'problem' ? (compact ? 16 : 20) : 0;
    const ideal = Math.ceil(Math.max(labelW, subW) + chromeWidth + problemExtra);
    if (ideal > maxIdeal) {
      maxIdeal = ideal;
    }
    for (const token of splitLabelTokens(node.label)) {
      const tokenNeeded = Math.ceil(
        estimateTextWidth(token, fontSize, true) + chromeWidth + problemExtra,
      );
      if (tokenNeeded > minWordWidth) {
        minWordWidth = tokenNeeded;
      }
    }
  }

  const nodeWidth = Math.max(
    minW,
    minWordWidth,
    Math.min(maxW, maxIdeal),
  );
  const nodeLines = new Map<string, 1 | 2>();

  for (const node of nodes) {
    const problemExtra = node.variant === 'problem' ? (compact ? 16 : 20) : 0;
    const availableTextW = nodeWidth - chromeWidth - problemExtra + 6;
    const labelW = estimateTextWidth(node.label, fontSize, true);
    const needsTwoLines = labelW > availableTextW || node.label.includes('\n');
    nodeLines.set(node.id, needsTwoLines ? 2 : 1);
  }

  return { nodeWidth, nodeLines };
}

function normalizePass(
  rawNodes: Map<string, NodeBox>,
  groups: FlowGroup[],
  groupPad: number,
  groupPadTop: number,
): {
  nodeMap: Map<string, NodeBox>;
  groupBoxes: GroupBox[];
  bounds: { width: number; height: number };
} {
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

    groupBoxById.set(group.id, {
      id: group.id,
      label: group.label,
      x: minX - groupPad,
      y: minY - groupPadTop,
      width: maxX - minX + groupPad * 2,
      height: maxY - minY + groupPadTop + groupPad,
    });
  }

  const groupBoxes = groups
    .map((gItem) => groupBoxById.get(gItem.id))
    .filter((b): b is GroupBox => Boolean(b));

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

function runDagrePass(
  nodes: FlowNode[],
  edges: LayoutEdgeInput[],
  groups: FlowGroup[],
  direction: LayoutDirection,
  layoutMode: FlowLayoutMode,
  compact: boolean,
  wrapMaxPerRow: number | null,
  nodeWidth: number,
  nodeLines: Map<string, 1 | 2>,
  minRankGap = 0,
): {
  nodeMap: Map<string, NodeBox>;
  groupBoxes: GroupBox[];
  bounds: { width: number; height: number };
} {
  const rankGap = Math.max(compact ? COMPACT_RANK_GAP : RANK_GAP, minRankGap);
  const baseNodeGap = compact ? COMPACT_NODE_GAP : NODE_GAP;
  const hasDisjointGroups = groups.length > 1;
  const effectiveNodesep = hasDisjointGroups
    ? Math.max(baseNodeGap, GROUP_PAD + GROUP_PAD_TOP + 16)
    : baseNodeGap;

  const g = new dagre.graphlib.Graph({ multigraph: false, compound: false });
  g.setGraph({
    rankdir: direction,
    nodesep: effectiveNodesep,
    ranksep: rankGap,
    marginx: 0,
    marginy: 0,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const sortedNodes = [...nodes].sort(
    (a, b) => (a.rank ?? 0) - (b.rank ?? 0) || (a.order ?? 0) - (b.order ?? 0),
  );
  const nodeById = new Map(sortedNodes.map((n) => [n.id, n]));

  const singleH = compact ? COMPACT_NODE_HEIGHT_SINGLE : NODE_HEIGHT_SINGLE;
  const doubleH = compact ? COMPACT_NODE_HEIGHT_DOUBLE : NODE_HEIGHT_DOUBLE;

  for (const node of sortedNodes) {
    const lines = nodeLines.get(node.id) ?? 1;
    const height = lines === 2 ? doubleH : singleH;
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
    const height = lines === 2 ? doubleH : singleH;
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

  // §3.3(c): Wrap wide ranks into rows of wrapMaxPerRow in TB mode
  if (wrapMaxPerRow !== null && direction === 'TB') {
    const ranks = new Map<number, NodeBox[]>();
    for (const box of rawNodes.values()) {
      const key = Math.round(box.cy);
      const list = ranks.get(key) ?? [];
      list.push(box);
      ranks.set(key, list);
    }

    const sortedRankKeys = [...ranks.keys()].sort((a, b) => a - b);
    let cumulativeYShift = 0;

    for (const rk of sortedRankKeys) {
      const rowBoxes = ranks.get(rk)!.sort((a, b) => a.cx - b.cx);
      for (const b of rowBoxes) {
        b.y += cumulativeYShift;
        b.cy += cumulativeYShift;
      }

      if (rowBoxes.length > wrapMaxPerRow) {
        const numRows = Math.ceil(rowBoxes.length / wrapMaxPerRow);
        const wrapRowGap = hasDisjointGroups ? GROUP_PAD + GROUP_PAD_TOP + 16 : 28;
        const rowStride = Math.max(...rowBoxes.map((b) => b.height)) + wrapRowGap;
        const firstRowCount = Math.min(wrapMaxPerRow, rowBoxes.length);
        const firstRowSpan = firstRowCount * nodeWidth + (firstRowCount - 1) * baseNodeGap;
        const startX = -firstRowSpan / 2;

        for (let idx = 0; idx < rowBoxes.length; idx++) {
          const r = Math.floor(idx / wrapMaxPerRow);
          const c = idx % wrapMaxPerRow;
          const b = rowBoxes[idx];
          const rowItems = Math.min(wrapMaxPerRow, rowBoxes.length - r * wrapMaxPerRow);
          const rowSpan = rowItems * nodeWidth + (rowItems - 1) * baseNodeGap;
          const rowStartX = -rowSpan / 2;
          b.x = (r === 0 ? startX : rowStartX) + c * (nodeWidth + baseNodeGap);
          b.cx = b.x + b.width / 2;
          b.y += r * rowStride;
          b.cy += r * rowStride;
        }
        cumulativeYShift += (numRows - 1) * rowStride;
      } else {
        const rowSpan = rowBoxes.length * nodeWidth + (rowBoxes.length - 1) * baseNodeGap;
        const rowStartX = -rowSpan / 2;
        for (let idx = 0; idx < rowBoxes.length; idx++) {
          const b = rowBoxes[idx];
          b.x = rowStartX + idx * (nodeWidth + baseNodeGap);
          b.cx = b.x + b.width / 2;
        }
      }
    }

    // Re-center parents over their children after wrapping
    const childrenByParent = new Map<string, string[]>();
    for (const edge of edges) {
      if (edge.from === edge.to) continue;
      const list = childrenByParent.get(edge.from) ?? [];
      if (!list.includes(edge.to)) list.push(edge.to);
      childrenByParent.set(edge.from, list);
    }

    const byYDesc = [...rawNodes.values()].sort((a, b) => b.cy - a.cy);
    for (const parentBox of byYDesc) {
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
          Math.abs(avgCx - other.cx) < (parentBox.width + other.width) / 2 + baseNodeGap - 1,
      );
      if (!wouldOverlap) {
        parentBox.cx = avgCx;
        parentBox.x = avgCx - parentBox.width / 2;
      }
    }
  } else if (layoutMode === 'tree' && direction === 'TB') {
    const childrenByParent = new Map<string, string[]>();
    for (const edge of edges) {
      if (edge.from === edge.to) continue;
      const list = childrenByParent.get(edge.from) ?? [];
      if (!list.includes(edge.to)) list.push(edge.to);
      childrenByParent.set(edge.from, list);
    }

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
          Math.abs(avgCx - other.cx) < (parentBox.width + other.width) / 2 + baseNodeGap - 1,
      );
      if (!wouldOverlap) {
        parentBox.cx = avgCx;
        parentBox.x = avgCx - parentBox.width / 2;
      }
    }
  }

  return normalizePass(rawNodes, groups, GROUP_PAD, GROUP_PAD_TOP);
}

/**
 * §3.3(d): Indented stacked list layout for trees and class diagrams at < 480px.
 */
function runStackedTreePass(
  nodes: FlowNode[],
  edges: LayoutEdgeInput[],
  groups: FlowGroup[],
  compact: boolean,
  nodeWidth: number,
  nodeLines: Map<string, 1 | 2>,
): {
  nodeMap: Map<string, NodeBox>;
  groupBoxes: GroupBox[];
  bounds: { width: number; height: number };
} {
  const sortedNodes = [...nodes].sort(
    (a, b) => (a.rank ?? 0) - (b.rank ?? 0) || (a.order ?? 0) - (b.order ?? 0),
  );
  const childrenMap = new Map<string, string[]>();
  const hasParent = new Set<string>();

  for (const edge of edges) {
    if (edge.from === edge.to) continue;
    const list = childrenMap.get(edge.from) ?? [];
    if (!list.includes(edge.to)) list.push(edge.to);
    childrenMap.set(edge.from, list);
    hasParent.add(edge.to);
  }

  const roots = sortedNodes.filter((n) => !hasParent.has(n.id));
  const ordered: { node: FlowNode; depth: number }[] = [];
  const visited = new Set<string>();

  function dfs(node: FlowNode, depth: number) {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    ordered.push({ node, depth });
    const kids = childrenMap.get(node.id) ?? [];
    for (const kidId of kids) {
      const kid = sortedNodes.find((n) => n.id === kidId);
      if (kid) dfs(kid, depth + 1);
    }
  }

  for (const r of roots) dfs(r, 0);
  for (const n of sortedNodes) {
    if (!visited.has(n.id)) dfs(n, n.rank ?? 0);
  }

  const singleH = compact ? COMPACT_NODE_HEIGHT_SINGLE : NODE_HEIGHT_SINGLE;
  const doubleH = compact ? COMPACT_NODE_HEIGHT_DOUBLE : NODE_HEIGHT_DOUBLE;
  const indentStep = 24;
  const rowGap = 16;

  const rawNodes = new Map<string, NodeBox>();
  let curY = 0;

  for (const { node, depth } of ordered) {
    const lines = nodeLines.get(node.id) ?? 1;
    const height = lines === 2 ? doubleH : singleH;
    const x = depth * indentStep;
    rawNodes.set(node.id, {
      id: node.id,
      x,
      y: curY,
      width: nodeWidth,
      height,
      cx: x + nodeWidth / 2,
      cy: curY + height / 2,
      lines,
    });
    curY += height + rowGap;
  }

  return normalizePass(rawNodes, groups, GROUP_PAD, GROUP_PAD_TOP);
}

function buildEdgeRoutes(
  edges: LayoutEdgeInput[],
  nodeMap: Map<string, NodeBox>,
  direction: LayoutDirection,
  layoutMode: FlowLayoutMode,
  stacked: boolean,
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
    const isTreeEdge = layoutMode === 'tree' && !stacked;

    let sourceHandle: EdgeRoute['sourceHandle'];
    let targetHandle: EdgeRoute['targetHandle'];
    let offsetX = 0;
    let offsetY = 0;

    const dx = toBox.cx - fromBox.cx;
    const dy = toBox.cy - fromBox.cy;

    if (stacked) {
      sourceHandle = 'bottom-source';
      targetHandle = 'left-target';
    } else if (isTreeEdge) {
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
      !stacked &&
      !hasReverse &&
      ((direction === 'LR' && Math.abs(dy) < 1) ||
        (direction === 'TB' && Math.abs(dx) < 1));

      // §5.9: Detect if this edge crosses over any intermediate node between source and target.
    // A node only blocks when it sits strictly in the gap between source and target AND
    // crosses the source/target centre line â€” same-rank siblings are not blocking.
    let skipLaneCoord: number | undefined;
    if (!isTreeEdge && !stacked) {
      const allBoxes = [...nodeMap.values()];
      const eps = 0.5;
      if (direction === 'LR') {
        // source right edge -> target left edge horizontal gap
        const gapLeft = Math.min(fromBox.x + fromBox.width, toBox.x + toBox.width);
        const gapRight = Math.max(fromBox.x, toBox.x);
        const crossY = [fromBox.cy, toBox.cy];
        const blocking = allBoxes.filter(
          (b) =>
            b.id !== fromBox.id &&
            b.id !== toBox.id &&
            b.x + b.width > gapLeft + eps &&
            b.x < gapRight - eps &&
            crossY.some((cy) => b.y + b.height > cy + eps && b.y < cy - eps),
        );
        if (blocking.length > 0) {
          const maxBlockingBottom = Math.max(
            ...blocking.map((b) => b.y + b.height),
            toBox.y + toBox.height,
          );
          skipLaneCoord = maxBlockingBottom + 24;
        }
      } else {
        // source bottom edge -> target top edge vertical gap
        const gapTop = Math.min(fromBox.y + fromBox.height, toBox.y + toBox.height);
        const gapBottom = Math.max(fromBox.y, toBox.y);
        const crossX = [fromBox.cx, toBox.cx];
        const blocking = allBoxes.filter(
          (b) =>
            b.id !== fromBox.id &&
            b.id !== toBox.id &&
            b.y + b.height > gapTop + eps &&
            b.y < gapBottom - eps &&
            crossX.some((cx) => b.x + b.width > cx + eps && b.x < cx - eps),
        );
        if (blocking.length > 0) {
          if (fromBox.cx < toBox.cx) {
            const verticalNeighbors = allBoxes.filter(
              (b) =>
                b.id !== fromBox.id &&
                b.id !== toBox.id &&
                b.y + b.height > gapTop + eps &&
                b.y < gapBottom - eps,
            );
            const minLeft = Math.min(...verticalNeighbors.map((b) => b.x), toBox.x);
            const leftLane = minLeft - 28;
            if (leftLane >= 0) {
              skipLaneCoord = leftLane;
            }
          }
          if (skipLaneCoord === undefined) {
            const maxBlockingRight = Math.max(
              ...blocking.map((b) => b.x + b.width),
              toBox.x + toBox.width,
            );
            skipLaneCoord = maxBlockingRight + 24;
          }
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
      isStackedEdge: stacked,
      isStraight,
      skipLaneCoord,
    });
  }

  return routes;
}

/**
 * Computes the complete responsive layout for both <Flow> and <Diagram>
 * implementing the §3.3 fit-before-pan ladder:
 *   (a) direction (LR >= 720, else TB)
 *   (b) compact node variant (128-160px)
 *   (c) wrap wide ranks into rows of N
 *   (d) stacked list layout for trees at < 480px
 */
export function computeDiagramLayout({
  nodes,
  edges,
  groups = [],
  layout = 'flow',
  containerWidth,
  clampHeight = true,
  stepBadges = true,
}: {
  nodes: FlowNode[];
  edges: LayoutEdgeInput[];
  groups?: FlowGroup[];
  layout?: FlowLayoutMode;
  containerWidth: number;
  clampHeight?: boolean;
  /** <Flow> draws a step badge on the active edge; a static <Diagram> never does. */
  stepBadges?: boolean;
}): ComputedDiagramLayout {
  const safeWidth = Math.max(240, containerWidth);
  const isTree = layout === 'tree';

  const computeFitZoom = (b: { width: number; height: number }) => {
    const xPad = safeWidth < 480 ? 12 : Math.round(b.width * FIT_PADDING);
    const yPad = safeWidth < 480 ? 24 : Math.round(b.height * FIT_PADDING);
    const xZoom = b.width > 0 ? (safeWidth - xPad) / b.width : 1;
    const yZoom =
      clampHeight && b.height > 0 ? (MAX_CANVAS_HEIGHT - yPad) / b.height : 1;
    return Math.min(1, xZoom, yZoom);
  };
  type Pass = ReturnType<typeof runDagrePass>;

  // Route edges and expand bounds for skip-rank lanes (§5.9), exactly as rendered.
  const applySkipLanes = (
    p: Pass,
    dir: LayoutDirection,
    stk: boolean,
  ): { edgeRoutes: EdgeRoute[]; finalBounds: { width: number; height: number } } => {
    const edgeRoutes = buildEdgeRoutes(edges, p.nodeMap, dir, layout, stk);
    let finalBounds = p.bounds;
    for (const route of edgeRoutes) {
      if (route.skipLaneCoord !== undefined) {
        if (dir === 'LR') {
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
    return { edgeRoutes, finalBounds };
  };

  // Fit is evaluated against FINAL rendered bounds (nodes + skip lanes + groups), §3.3.
  const finalFitFor = (p: Pass, dir: LayoutDirection, stk: boolean) =>
    computeFitZoom(applySkipLanes(p, dir, stk).finalBounds);
  const minZoomFor = (isCompact: boolean) => (isCompact ? 1 : MIN_READABLE_ZOOM);
  const fitsAtReadable = (p: Pass, dir: LayoutDirection, stk: boolean, isCompact = false) =>
    finalFitFor(p, dir, stk) >= minZoomFor(isCompact);

  // §6.3: in LR an edge label sits on the horizontal run between two ranks, so the
  // rank gap must hold the widest pill plus clearance on both sides.
  const labelRankGap = edges.reduce(
    (gap, e) => (e.label
        ? Math.max(gap, edgeLabelSize(e.label).width + 4 * EDGE_LABEL_CLEARANCE)
        : gap),
    0,
  );

  // ---- §3.3 fit-before-pan ladder ------------------------------------------
  // (a) choose the LR/TB direction that fits best
  let compact = false;
  let stacked = false;
  let dims = computeNodeDimensions(nodes, false);

  const runDagre = (
    dir: LayoutDirection,
    compactMode: boolean,
    wrapMaxPerRow: number | null,
    d: { nodeWidth: number; nodeLines: Map<string, 1 | 2> },
  ): Pass =>
    runDagrePass(
      nodes,
      edges,
      groups,
      dir,
      layout,
      compactMode,
      wrapMaxPerRow,
      d.nodeWidth,
      d.nodeLines,
      dir === 'LR' ? labelRankGap : 0,
    );

  let direction: LayoutDirection = isTree
    ? 'TB'
    : safeWidth >= LR_CONTAINER_BREAKPOINT
      ? 'LR'
      : 'TB';

  let pass = runDagre(direction, false, null, dims);

  // (a) re-check the alternate direction; keep whichever fits best
  if (!fitsAtReadable(pass, direction, stacked) && !isTree) {
    const altDir: LayoutDirection = direction === 'LR' ? 'TB' : 'LR';
    const altPass = runDagre(altDir, false, null, dims);
    if (finalFitFor(altPass, altDir, stacked) > finalFitFor(pass, direction, stacked)) {
      direction = altDir;
      pass = altPass;
    }
  }

  // (b) compact node variant (128-160px, 28px icon, 14px label) if still < 0.87
  if (!fitsAtReadable(pass, direction, stacked)) {
    compact = true;
    const maxCompactForTwo = safeWidth < 480 ? Math.floor((safeWidth - 64 - COMPACT_NODE_GAP) / 2) : COMPACT_NODE_MAX_WIDTH;
    dims = computeNodeDimensions(nodes, true, Math.max(COMPACT_NODE_MIN_WIDTH, maxCompactForTwo));
    pass = runDagre(direction, true, null, dims);

    // re-check direction choice with compact nodes
    if (!fitsAtReadable(pass, direction, stacked, true) && !isTree) {
      const altDir: LayoutDirection = direction === 'LR' ? 'TB' : 'LR';
      const altPass = runDagre(altDir, true, null, dims);
      if (finalFitFor(altPass, altDir, stacked) > finalFitFor(pass, direction, stacked)) {
        direction = altDir;
        pass = altPass;
      }
    }
  }

  // (c) wrap wide ranks into rows of N; siblings under a tree bus wrap onto a second row
  if (!fitsAtReadable(pass, direction, stacked, compact)) {
    const nodeGap = compact ? COMPACT_NODE_GAP : NODE_GAP;
    const maxPerRowCap = Math.max(
      1,
      Math.floor(
        (safeWidth - (safeWidth < 480 ? 12 : Math.round(safeWidth * FIT_PADDING)) + nodeGap) / (dims.nodeWidth + nodeGap),
      ),
    );
    // try wrapping, reducing N until it fits (single column always fits at any width >= 320)
    const minN = !isTree && clampHeight && maxPerRowCap >= 2 ? 2 : 1;
    for (let n = Math.min(maxPerRowCap, nodes.length - 1); n >= minN; n--) {
      const wrapped = runDagre('TB', compact, n, dims);
      if (fitsAtReadable(wrapped, 'TB', stacked, compact)) {
        direction = 'TB';
        pass = wrapped;
        break;
      }
      // keep the narrowest variant as fallback
      if (wrapped.bounds.width < pass.bounds.width) {
        direction = 'TB';
        pass = wrapped;
      }
    }
  }

  // (d) stacked indented-list layout for trees and class diagrams under 480px
  if (!fitsAtReadable(pass, direction, stacked, compact) && isTree && safeWidth < STACKED_TREE_MAX_WIDTH) {
    stacked = true;
    direction = 'TB';

    const normalDims = computeNodeDimensions(nodes, false);
    const stackedNormal = runStackedTreePass(nodes, edges, groups, false, normalDims.nodeWidth, normalDims.nodeLines);
    const compactDims = computeNodeDimensions(nodes, true);
    const stackedCompact = runStackedTreePass(nodes, edges, groups, true, compactDims.nodeWidth, compactDims.nodeLines);

    if (fitsAtReadable(stackedNormal, 'TB', true, false)) {
      compact = false;
      dims = normalDims;
      pass = stackedNormal;
    } else {
      compact = true;
      dims = compactDims;
      pass = stackedCompact;
    }
  }

  // ---- edge routing (may expand bounds for skip-rank lanes, §5.9) ----------
  const { edgeRoutes, finalBounds: routedBounds } = applySkipLanes(pass, direction, stacked);

  // §6.3: place label pills. They prefer the node bounds, but may use the margin the
  // fit leaves at a readable zoom; the bounds then grow to include them (§3.1).
  const labelZoom = minZoomFor(compact);
  const maxW =
    safeWidth < 480 ? (safeWidth - 12) / labelZoom : (safeWidth - 1) / (labelZoom + FIT_PADDING);
  const maxH = !clampHeight
    ? Infinity
    : safeWidth < 480
      ? (MAX_CANVAS_HEIGHT - 24) / labelZoom
      : (MAX_CANVAS_HEIGHT - 1) / (labelZoom + FIT_PADDING);
  const slackX = Math.max(0, Math.floor((maxW - routedBounds.width) / 2) - 1);
  const slackY = Number.isFinite(maxH)
    ? Math.max(0, Math.floor((maxH - routedBounds.height) / 2) - 1)
    : 48;
  placeEdgeLabels(
    edgeRoutes,
    pass.nodeMap,
    pass.groupBoxes,
    direction,
    routedBounds,
    compact,
    { x: slackX, y: slackY },
    stepBadges,
  );
  const finalBounds = includeLabelBoxes(pass, edgeRoutes, direction, routedBounds);

  // Re-fit AFTER skip-lane expansion so nothing is clipped (§3.1/§3.3).
  // If the expanded bounds no longer fit at readable zoom, drop to pan (never at >= 640px).
  const finalFitZoom = computeFitZoom(finalBounds);
  const reqZoom = minZoomFor(compact);
  const canFit = finalFitZoom >= reqZoom;

  // §3.3: pan is the last resort and never allowed when container >= 640px wide
  const panMode = !canFit && safeWidth < NO_PAN_CONTAINER_MIN;

  // canFit -> render at fitZoom (>=reqZoom, <=1); otherwise readable pan zoom
  const zoom = canFit ? Math.max(reqZoom, finalFitZoom) : reqZoom;

  const yPad = safeWidth < 480 ? 24 : Math.round(finalBounds.height * FIT_PADDING);
  const rawHeight = finalBounds.height * zoom + yPad;
  const canvasHeight = clampHeight
    ? Math.round(Math.max(MIN_CANVAS_HEIGHT, Math.min(MAX_CANVAS_HEIGHT, rawHeight)))
    : Math.round(Math.max(MIN_CANVAS_HEIGHT, rawHeight));

  return {
    direction,
    compact,
    stacked,
    nodes: pass.nodeMap,
    groups: pass.groupBoxes,
    edges: edgeRoutes,
    bounds: finalBounds,
    zoom,
    panMode,
    canvasHeight,
    nodeWidth: dims.nodeWidth,
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
 * Builds an orthogonal left-side elbow path for stacked list trees (§3.3d).
 */
export function buildStackedTreePath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  parentBox: NodeBox,
): { path: string; labelX: number; labelY: number } {
  const stemX = parentBox.x + 12;
  const r = Math.min(EDGE_RADIUS, Math.abs(tx - stemX), Math.abs(ty - sy) / 2);
  const path = [
    `M ${stemX} ${sy}`,
    `L ${stemX} ${ty - r}`,
    `Q ${stemX} ${ty} ${stemX + r} ${ty}`,
    `L ${tx} ${ty}`,
  ].join(' ');
  return {
    path,
    labelX: (stemX + tx) / 2,
    labelY: ty,
  };
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
  const r = Math.min(
    EDGE_RADIUS,
    Math.abs(tx - sx) / 2,
    Math.abs(busY - sy),
    Math.abs(ty - busY),
  );
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

// ---- §6.3 edge label placement ------------------------------------------------

/** 12px / 500 pill: 8px side padding + 1px border; 12px line + 2px vertical padding + 1px border. */
export const EDGE_LABEL_FONT_SIZE = 12;
export const EDGE_LABEL_HEIGHT = 18;
const EDGE_LABEL_CHROME_X = 18;
/** Clearance between a pill and the line it labels, and between a pill and any obstacle. */
const EDGE_LABEL_LINE_GAP = 4;
const EDGE_LABEL_CLEARANCE = 2;
export const STEP_BADGE_SIZE = 22;
export const STEP_BADGE_OFFSET = 14;

export function edgeLabelSize(text: string): { width: number; height: number } {
  return {
    width: Math.ceil(estimateTextWidth(text, EDGE_LABEL_FONT_SIZE, true) + EDGE_LABEL_CHROME_X),
    height: EDGE_LABEL_HEIGHT,
  };
}

type Pt = { x: number; y: number };

/**
 * Orthogonal polyline (corners unrounded) and badge anchor for an edge, matching
 * the path builders the renderers draw with.
 */
export function edgeGeometry(
  route: EdgeRoute,
  nodeMap: Map<string, NodeBox>,
  direction: LayoutDirection,
): { points: Pt[]; labelX: number; labelY: number } | null {
  const fromBox = nodeMap.get(route.from);
  const toBox = nodeMap.get(route.to);
  if (!fromBox || !toBox) return null;
  const s = getHandleCoords(fromBox, route.sourceHandle, route.offsetX, route.offsetY);
  const t = getHandleCoords(toBox, route.targetHandle, route.offsetX, route.offsetY);

  if (route.isStackedEdge) {
    const g = buildStackedTreePath(s.x, s.y, t.x, t.y, fromBox);
    const stemX = fromBox.x + 12;
    return { points: [{ x: stemX, y: s.y }, { x: stemX, y: t.y }, t], labelX: g.labelX, labelY: g.labelY };
  }
  if (route.skipLaneCoord !== undefined) {
    const g = buildSkipRankPath(s.x, s.y, t.x, t.y, direction, route.skipLaneCoord);
    const lane = route.skipLaneCoord;
    if (direction === 'LR') {
      const outDir = t.x >= s.x ? 1 : -1;
      const x1 = s.x + outDir * 18;
      const x2 = t.x - outDir * 18;
      return {
        points: [s, { x: x1, y: s.y }, { x: x1, y: lane }, { x: x2, y: lane }, { x: x2, y: t.y }, t],
        labelX: g.labelX,
        labelY: g.labelY,
      };
    }
    const outDir = t.y >= s.y ? 1 : -1;
    const y1 = s.y + outDir * 18;
    const y2 = t.y - outDir * 18;
    return {
      points: [s, { x: s.x, y: y1 }, { x: lane, y: y1 }, { x: lane, y: y2 }, { x: t.x, y: y2 }, t],
      labelX: g.labelX,
      labelY: g.labelY,
    };
  }

  const g = route.isTreeEdge
    ? buildTreeBusPath(s.x, s.y, t.x, t.y)
    : buildSmoothStepSvgPath(s.x, s.y, t.x, t.y, route.sourceHandle, route.targetHandle);
  const horizontal = (h: string) => h.startsWith('left') || h.startsWith('right');
  const srcH = !route.isTreeEdge && horizontal(route.sourceHandle);
  const tgtH = !route.isTreeEdge && horizontal(route.targetHandle);
  let points: Pt[];
  if (srcH && tgtH) {
    const midX = (s.x + t.x) / 2;
    points = Math.abs(s.y - t.y) < 0.5 ? [s, t] : [s, { x: midX, y: s.y }, { x: midX, y: t.y }, t];
  } else if (!srcH && !tgtH) {
    const busY = Math.round((s.y + t.y) / 2);
    points = Math.abs(s.x - t.x) < 0.5 ? [s, t] : [s, { x: s.x, y: busY }, { x: t.x, y: busY }, t];
  } else if (srcH) {
    points = [s, { x: t.x, y: s.y }, t];
  } else {
    points = [s, { x: s.x, y: t.y }, t];
  }
  return { points, labelX: g.labelX, labelY: g.labelY };
}

/** The 22px step badge rect for an edge (§6.2: 14px above in LR, right in TB). */
export function stepBadgeRect(labelX: number, labelY: number, direction: LayoutDirection): LabelBox {
  const cx = labelX + (direction === 'LR' ? 0 : STEP_BADGE_OFFSET);
  const cy = labelY + (direction === 'LR' ? -STEP_BADGE_OFFSET : 0);
  const r = STEP_BADGE_SIZE / 2;
  return { x: cx - r, y: cy - r, width: STEP_BADGE_SIZE, height: STEP_BADGE_SIZE };
}

function boxesOverlap(a: LabelBox, b: LabelBox, clearance: number): boolean {
  return (
    a.x < b.x + b.width + clearance &&
    a.x + a.width + clearance > b.x &&
    a.y < b.y + b.height + clearance &&
    a.y + a.height + clearance > b.y
  );
}

function segmentHitsBox(p: Pt, q: Pt, b: LabelBox): boolean {
  const minX = Math.min(p.x, q.x);
  const maxX = Math.max(p.x, q.x);
  const minY = Math.min(p.y, q.y);
  const maxY = Math.max(p.y, q.y);
  return maxX > b.x && minX < b.x + b.width && maxY > b.y && minY < b.y + b.height;
}

/**
 * §6.3 + DIAGRAM-RULES §2.6/§3.1: places every edge label pill so that it never
 * overlaps a node, a group label, a step badge or another pill, and stays inside
 * the given bounds plus `slack` (the caller grows the bounds to include it, so the
 * pill is inside the canvas at whatever zoom the fit picks).
 *
 * Candidates sit beside (or on) each segment of the edge's own path, nearest the
 * badge anchor first, on the side opposite the badge first. A first pass also
 * keeps clear of other edges' lines; a second pass allows crossing them. A label
 * with no valid spot gets no `labelBox` and is not drawn: the step text names it.
 */
export function placeEdgeLabels(
  routes: EdgeRoute[],
  nodeMap: Map<string, NodeBox>,
  groups: GroupBox[],
  direction: LayoutDirection,
  bounds: { width: number; height: number },
  compact = false,
  slack: { x: number; y: number } = { x: 0, y: 0 },
  stepBadges = true,
): void {
  const geoms = new Map(routes.map((r) => [r.key, edgeGeometry(r, nodeMap, direction)]));
  const fixed: LabelBox[] = [
    ...nodeMap.values(),
    ...groups.map((g) => ({ x: g.x, y: g.y, width: g.width, height: GROUP_LABEL_HEIGHT })),
  ];
  const badges = new Map<string, LabelBox>();
  for (const [key, geom] of geoms) {
    if (geom) badges.set(key, stepBadgeRect(geom.labelX, geom.labelY, direction));
  }
  const placed: LabelBox[] = [];

  for (const route of routes) {
    delete route.labelBox;
    const geom = geoms.get(route.key);
    if (!route.label || !geom) continue;
    const { width, height } = edgeLabelSize(route.label);

    const segments: Array<{ p: Pt; q: Pt; len: number; vertical: boolean }> = [];
    for (let i = 0; i < geom.points.length - 1; i++) {
      const p = geom.points[i];
      const q = geom.points[i + 1];
      const len = Math.abs(q.x - p.x) + Math.abs(q.y - p.y);
      if (len < 1) continue;
      segments.push({ p, q, len, vertical: Math.abs(q.x - p.x) < 0.5 });
    }
    // Segments nearest the badge anchor first, then longer ones.
    const anchor = { x: geom.labelX, y: geom.labelY };
    const distTo = (sg: (typeof segments)[number]) => {
      const cx = Math.max(Math.min(anchor.x, Math.max(sg.p.x, sg.q.x)), Math.min(sg.p.x, sg.q.x));
      const cy = Math.max(Math.min(anchor.y, Math.max(sg.p.y, sg.q.y)), Math.min(sg.p.y, sg.q.y));
      return Math.abs(cx - anchor.x) + Math.abs(cy - anchor.y);
    };
    segments.sort((a, b) => distTo(a) - distTo(b) || b.len - a.len);

    const candidates: LabelBox[] = [];
    for (const sg of segments) {
      // Along-segment positions: fractions from the middle out, plus the two spots
      // snapped against the segment's ends (just clear of the nodes it joins).
      const half = (sg.vertical ? height : width) / 2 + EDGE_LABEL_CLEARANCE + 0.5;
      const fractions = [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9];
      if (sg.len > 2 * half) fractions.push(half / sg.len, 1 - half / sg.len);
      for (const t of fractions) {
        const px = sg.p.x + (sg.q.x - sg.p.x) * t;
        const py = sg.p.y + (sg.q.y - sg.p.y) * t;
        // Beside the line, on it, then one ring out: past the 22px badge.
        const far = STEP_BADGE_OFFSET + STEP_BADGE_SIZE / 2 + EDGE_LABEL_CLEARANCE + 1;
        const centers: Pt[] = sg.vertical
          ? [
              // The TB badge sits right of the line, so the pill prefers the left.
              { x: px - EDGE_LABEL_LINE_GAP - width / 2, y: py },
              { x: px + EDGE_LABEL_LINE_GAP + width / 2, y: py },
              { x: px, y: py },
              { x: px - far - width / 2, y: py },
              { x: px + far + width / 2, y: py },
            ]
          : [
              // The LR badge sits above the line, so the pill prefers below.
              { x: px, y: py + EDGE_LABEL_LINE_GAP + height / 2 },
              { x: px, y: py - EDGE_LABEL_LINE_GAP - height / 2 },
              { x: px, y: py },
              { x: px, y: py + far + height / 2 },
              { x: px, y: py - far - height / 2 },
            ];
        for (const c of centers) {
          candidates.push({
            x: Math.round((c.x - width / 2) * 10) / 10,
            y: Math.round((c.y - height / 2) * 10) / 10,
            width,
            height,
          });
        }
      }
    }

    // Full layouts show every pill next to whichever badge is active, so all badges
    // are obstacles. Compact layouts show only the active edge's pill (FlowCanvas),
    // so only the edge's own badge is.
    const badgeObstacles = !stepBadges
      ? []
      : compact
      ? [badges.get(route.key)].filter((b): b is LabelBox => Boolean(b))
      : [...badges.values()];
    const within = (b: LabelBox, sx: number, sy: number) =>
      b.x >= -sx &&
      b.y >= -sy &&
      b.x + b.width <= bounds.width + sx &&
      b.y + b.height <= bounds.height + sy;
    const free = (b: LabelBox) =>
      !fixed.some((o) => boxesOverlap(b, o, EDGE_LABEL_CLEARANCE)) &&
      !badgeObstacles.some((o) => boxesOverlap(b, o, EDGE_LABEL_CLEARANCE)) &&
      !placed.some((o) => boxesOverlap(b, o, EDGE_LABEL_CLEARANCE));
    const clearOfOtherLines = (b: LabelBox) => {
      for (const [key, other] of geoms) {
        if (key === route.key || !other) continue;
        for (let i = 0; i < other.points.length - 1; i++) {
          if (segmentHitsBox(other.points[i], other.points[i + 1], b)) return false;
        }
      }
      return true;
    };

    // Inside the node bounds first, then in the fit margin; clear of other lines first.
    const chosen =
      candidates.find((b) => within(b, 0, 0) && free(b) && clearOfOtherLines(b)) ??
      candidates.find((b) => within(b, 0, 0) && free(b)) ??
      candidates.find((b) => within(b, slack.x, slack.y) && free(b) && clearOfOtherLines(b)) ??
      candidates.find((b) => within(b, slack.x, slack.y) && free(b));
    if (chosen) {
      route.labelBox = chosen;
      placed.push(chosen);
    }
  }
}


/**
 * Grows the bounds to include every placed label pill, translating nodes, groups,
 * skip lanes and pills when a pill sits left of or above the origin.
 */
function includeLabelBoxes(
  pass: { nodeMap: Map<string, NodeBox>; groupBoxes: GroupBox[] },
  routes: EdgeRoute[],
  direction: LayoutDirection,
  bounds: { width: number; height: number },
): { width: number; height: number } {
  let minX = 0;
  let minY = 0;
  let maxX = bounds.width;
  let maxY = bounds.height;
  for (const r of routes) {
    if (!r.labelBox) continue;
    minX = Math.min(minX, r.labelBox.x);
    minY = Math.min(minY, r.labelBox.y);
    maxX = Math.max(maxX, r.labelBox.x + r.labelBox.width);
    maxY = Math.max(maxY, r.labelBox.y + r.labelBox.height);
  }
  const dx = Math.ceil(-minX);
  const dy = Math.ceil(-minY);
  if (dx > 0 || dy > 0) {
    for (const box of pass.nodeMap.values()) {
      box.x += dx;
      box.cx += dx;
      box.y += dy;
      box.cy += dy;
    }
    for (const g of pass.groupBoxes) {
      g.x += dx;
      g.y += dy;
    }
    for (const r of routes) {
      if (r.labelBox) r.labelBox = { ...r.labelBox, x: r.labelBox.x + dx, y: r.labelBox.y + dy };
      if (r.skipLaneCoord !== undefined) r.skipLaneCoord += direction === 'LR' ? dy : dx;
    }
  }
  return { width: Math.ceil(maxX + dx), height: Math.ceil(maxY + dy) };
}
