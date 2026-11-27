import type { FlowEdgeKind } from './types';

export const LR_CONTAINER_BREAKPOINT = 720;
export const NO_PAN_CONTAINER_MIN = 640;
export const STACKED_TREE_MAX_WIDTH = 480;
export const FIT_PADDING = 0.12;
export const MIN_READABLE_ZOOM = 0.94;
export const MIN_CANVAS_HEIGHT = 240;
export const MAX_CANVAS_HEIGHT = 560;

export const PARALLEL_EDGE_OFFSET = 10;
export const EDGE_RADIUS = 8;

export type LayoutDirection = 'LR' | 'TB';

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
  /** Reserved top strip height for the group label (28px for 1 line, +15px per wrapped line). */
  labelHeight?: number;
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
  skipLaneCoord?: number;
  /** §6.3 label pill box (top-left, layout units), placed collision-free at build time. */
  labelBox?: { x: number; y: number; width: number; height: number };
}

export interface SerializedLayout {
  minWidth: number;
  direction: LayoutDirection;
  compact: boolean;
  stacked: boolean;
  nodes: Record<string, NodeBox>;
  groups: GroupBox[];
  edges: EdgeRoute[];
  bounds: { width: number; height: number };
  nodeWidth: number;
}

export type PrecomputedLayoutsByVariant = Record<string, SerializedLayout[]>;

/**
 * Recomputes zoom, panMode, and canvasHeight for an exact containerWidth
 * from a precomputed SerializedLayout without needing dagre on the client.
 */
export function finalizeLayoutForWidth(
  layout: SerializedLayout,
  containerWidth: number,
  clampHeight = true,
): {
  zoom: number;
  panMode: boolean;
  canvasHeight: number;
} {
  const safeWidth = Math.max(240, containerWidth);
  const xPad = safeWidth < 480 ? 12 : Math.round(layout.bounds.width * FIT_PADDING);
  const yPad = safeWidth < 480 ? 24 : Math.round(layout.bounds.height * FIT_PADDING);
  const xZoom = layout.bounds.width > 0 ? (safeWidth - xPad) / layout.bounds.width : 1;
  const yZoom =
    clampHeight && layout.bounds.height > 0
      ? (MAX_CANVAS_HEIGHT - yPad) / layout.bounds.height
      : 1;
  const finalFitZoom = Math.min(1, xZoom, yZoom);
  const reqZoom = layout.compact ? 1 : MIN_READABLE_ZOOM;
  const canFit = finalFitZoom >= reqZoom;
  const panMode = !canFit && safeWidth < NO_PAN_CONTAINER_MIN;
  const zoom = canFit ? Math.max(reqZoom, finalFitZoom) : reqZoom;
  const rawHeight = layout.bounds.height * zoom + yPad;
  const canvasHeight = clampHeight
    ? Math.round(Math.max(MIN_CANVAS_HEIGHT, Math.min(MAX_CANVAS_HEIGHT, rawHeight)))
    : Math.round(Math.max(MIN_CANVAS_HEIGHT, rawHeight));
  return { zoom, panMode, canvasHeight };
}

/**
 * Picks the best precomputed layout for the measured containerWidth.
 */
export function selectPrecomputedLayout(
  layouts: SerializedLayout[],
  containerWidth: number,
): SerializedLayout {
  let chosen = layouts[0];
  for (const item of layouts) {
    if (item.minWidth <= containerWidth) {
      chosen = item;
    } else {
      break;
    }
  }
  return chosen;
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
  const laneDir = laneCoord >= sx ? 1 : -1;
  const y1 = sy + outDir * stepOut;
  const y2 = ty - outDir * stepOut;
  const midY = (y1 + y2) / 2;
  const path = [
    `M ${sx} ${sy}`,
    `L ${sx} ${y1 - outDir * r}`,
    `Q ${sx} ${y1} ${sx + laneDir * r} ${y1}`,
    `L ${laneCoord - laneDir * r} ${y1}`,
    `Q ${laneCoord} ${y1} ${laneCoord} ${y1 + outDir * r}`,
    `L ${laneCoord} ${y2 - outDir * r}`,
    `Q ${laneCoord} ${y2} ${laneCoord - laneDir * r} ${y2}`,
    `L ${tx + laneDir * r} ${y2}`,
    `Q ${tx} ${y2} ${tx} ${y2 + outDir * r}`,
    `L ${tx} ${ty}`,
  ].join(' ');
  return { path, labelX: laneCoord, labelY: midY };
}
