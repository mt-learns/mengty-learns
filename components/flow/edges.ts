import { getNodePosition } from './layout';
import type { FlowNode } from './types';

export interface ParsedEdge {
  from: string;
  to: string;
}

export interface EdgeGeometry {
  d: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

/**
 * Parses an edge string of the form "from->to" into node IDs.
 */
export function parseEdge(edge: string): ParsedEdge {
  const parts = edge.split('->').map((part) => part.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid edge format "${edge}". Expected "from->to".`);
  }
  return { from: parts[0], to: parts[1] };
}

/**
 * Computes an SVG path connecting the borders of two nodes.
 * Accepts an optional curveOffset so bidirectional or parallel edges do not overlap.
 */
export function computeEdgePath(
  fromNode: Pick<FlowNode, 'x' | 'y'>,
  toNode: Pick<FlowNode, 'x' | 'y'>,
  curveOffset = 0,
): EdgeGeometry {
  const fromPos = getNodePosition(fromNode);
  const toPos = getNodePosition(toNode);

  const dx = toPos.cx - fromPos.cx;
  const dy = toPos.cy - fromPos.cy;

  let startX = fromPos.cx;
  let startY = fromPos.cy;
  let endX = toPos.cx;
  let endY = toPos.cy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const signX = dx >= 0 ? 1 : -1;
    startX = fromPos.cx + (signX * fromPos.width) / 2;
    endX = toPos.cx - (signX * toPos.width) / 2;
  } else {
    const signY = dy >= 0 ? 1 : -1;
    startY = fromPos.cy + (signY * fromPos.height) / 2;
    endY = toPos.cy - (signY * toPos.height) / 2;
  }

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  if (curveOffset === 0) {
    return {
      d: `M ${startX} ${startY} L ${endX} ${endY}`,
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
    };
  }

  // Offset control point perpendicular to the segment so return paths stay distinct.
  const segDx = endX - startX;
  const segDy = endY - startY;
  const len = Math.hypot(segDx, segDy) || 1;
  const nx = -segDy / len;
  const ny = segDx / len;

  const ctrlX = midX + nx * curveOffset;
  const ctrlY = midY + ny * curveOffset;

  return {
    d: `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`,
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
  };
}
