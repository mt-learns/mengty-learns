import type { FlowGroup, FlowNode } from './types';

export const NODE_WIDTH = 140;
export const NODE_HEIGHT = 64;
export const CELL_X = 204;
export const CELL_Y = 112;
export const PADDING_X = 24;
export const PADDING_Y = 24;

export const GROUP_PAD_X = 14;
export const GROUP_PAD_TOP = 22;
export const GROUP_PAD_BOTTOM = 12;

export interface NodePosition {
  x: number;
  y: number;
  cx: number;
  cy: number;
  width: number;
  height: number;
}

export interface GroupBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

/**
 * Maps a node's grid coordinates (x, y) to SVG pixel coordinates and center point.
 */
export function getNodePosition(node: Pick<FlowNode, 'x' | 'y'>): NodePosition {
  const x = PADDING_X + node.x * CELL_X;
  const y = PADDING_Y + node.y * CELL_Y;

  return {
    x,
    y,
    cx: x + NODE_WIDTH / 2,
    cy: y + NODE_HEIGHT / 2,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  };
}

/**
 * Maps a group's grid origin and span to an SVG bounding box drawn behind nodes.
 */
export function getGroupBox(
  group: Pick<FlowGroup, 'x' | 'y' | 'width' | 'height'>,
): GroupBox {
  const cols = group.width ?? 1;
  const rows = group.height ?? 1;
  const startX = PADDING_X + group.x * CELL_X;
  const startY = PADDING_Y + group.y * CELL_Y;
  const endX = PADDING_X + (group.x + cols - 1) * CELL_X + NODE_WIDTH;
  const endY = PADDING_Y + (group.y + rows - 1) * CELL_Y + NODE_HEIGHT;

  return {
    x: startX - GROUP_PAD_X,
    y: startY - GROUP_PAD_TOP,
    width: endX - startX + GROUP_PAD_X * 2,
    height: endY - startY + GROUP_PAD_TOP + GROUP_PAD_BOTTOM,
  };
}

/**
 * Computes the overall SVG viewBox width and height for a set of grid nodes and optional groups.
 */
export function getCanvasDimensions(
  nodes: Pick<FlowNode, 'x' | 'y'>[],
  groups: Pick<FlowGroup, 'x' | 'y' | 'width' | 'height'>[] = [],
): CanvasDimensions {
  if (nodes.length === 0 && groups.length === 0) {
    return { width: PADDING_X * 2 + NODE_WIDTH, height: PADDING_Y * 2 + NODE_HEIGHT };
  }

  let width =
    nodes.length > 0
      ? PADDING_X * 2 + Math.max(...nodes.map((n) => n.x)) * CELL_X + NODE_WIDTH
      : 0;
  let height =
    nodes.length > 0
      ? PADDING_Y * 2 + Math.max(...nodes.map((n) => n.y)) * CELL_Y + NODE_HEIGHT
      : 0;

  for (const group of groups) {
    const box = getGroupBox(group);
    width = Math.max(width, box.x + box.width + GROUP_PAD_X);
    height = Math.max(height, box.y + box.height + GROUP_PAD_BOTTOM);
  }

  return { width, height };
}
