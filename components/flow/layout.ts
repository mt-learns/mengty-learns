import type { FlowNode } from './types';

export const NODE_WIDTH = 140;
export const NODE_HEIGHT = 64;
export const CELL_X = 204;
export const CELL_Y = 112;
export const PADDING_X = 24;
export const PADDING_Y = 24;

export interface NodePosition {
  x: number;
  y: number;
  cx: number;
  cy: number;
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
 * Computes the overall SVG viewBox width and height for a set of grid nodes.
 */
export function getCanvasDimensions(nodes: Pick<FlowNode, 'x' | 'y'>[]): CanvasDimensions {
  if (nodes.length === 0) {
    return { width: PADDING_X * 2 + NODE_WIDTH, height: PADDING_Y * 2 + NODE_HEIGHT };
  }

  const maxX = Math.max(...nodes.map((n) => n.x));
  const maxY = Math.max(...nodes.map((n) => n.y));

  return {
    width: PADDING_X * 2 + maxX * CELL_X + NODE_WIDTH,
    height: PADDING_Y * 2 + maxY * CELL_Y + NODE_HEIGHT,
  };
}
