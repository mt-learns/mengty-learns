'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react';
import {
  EDGE_RADIUS,
  buildSkipRankPath,
  buildTreeBusPath,
  type LayoutDirection,
} from '../../diagram/layout-types';
import { cn } from '../../../lib/utils';
import type { FlowEdgeKind } from '../types';

export interface StepEdgeData extends Record<string, unknown> {
  activeStepNumber: number | null;
  isActive: boolean;
  isVisited: boolean;
  kind: FlowEdgeKind;
  label?: string;
  reducedMotion: boolean;
  offsetX: number;
  offsetY: number;
  isTreeEdge: boolean;
  direction: LayoutDirection;
  skipLaneCoord?: number;
}

export type FlowStepEdge = Edge<StepEdgeData, 'step'>;

function getEdgeStrokeColor(
  isActive: boolean,
  isVisited: boolean,
  kind: FlowEdgeKind,
): string {
  const base = kind === 'error' ? 'var(--destructive)' : 'var(--primary)';
  if (isActive) return base;
  if (isVisited) return `color-mix(in oklab, ${base} 55%, transparent)`;
  return 'var(--border-strong)';
}

/**
 * Custom React Flow edge with smoothstep/elbow routing, ±10px parallel offsets,
 * single active step badge, and optional edge label pill.
 */
export function StepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<FlowStepEdge>) {
  const isActive = data?.isActive ?? false;
  const isVisited = data?.isVisited ?? false;
  const kind = data?.kind ?? 'request';
  const reducedMotion = data?.reducedMotion ?? false;
  const activeStepNumber = data?.activeStepNumber ?? null;
  const offsetX = data?.offsetX ?? 0;
  const offsetY = data?.offsetY ?? 0;
  const isTreeEdge = data?.isTreeEdge ?? false;
  const direction = data?.direction ?? 'LR';
  const skipLaneCoord = data?.skipLaneCoord;

  const sx = sourceX + offsetX;
  const sy = sourceY + offsetY;
  const tx = targetX + offsetX;
  const ty = targetY + offsetY;

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (isTreeEdge) {
    const bus = buildTreeBusPath(sx, sy, tx, ty);
    edgePath = bus.path;
    labelX = bus.labelX;
    labelY = bus.labelY;
  } else if (skipLaneCoord !== undefined) {
    const skip = buildSkipRankPath(sx, sy, tx, ty, direction, skipLaneCoord);
    edgePath = skip.path;
    labelX = skip.labelX;
    labelY = skip.labelY;
  } else {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX: sx,
      sourceY: sy,
      sourcePosition,
      targetX: tx,
      targetY: ty,
      targetPosition,
      borderRadius: EDGE_RADIUS,
    });
  }

  const stroke = getEdgeStrokeColor(isActive, isVisited, kind);
  const strokeWidth = isActive ? 2.5 : isVisited ? 2 : 1.5;
  const markerId = `flow-arrow-${id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  // §6.2: Offset badge 14px perpendicular to the line (above for LR, right for TB)
  const badgeOffsetX = direction === 'LR' ? 0 : 14;
  const badgeOffsetY = direction === 'LR' ? -14 : 0;

  // §6.3: Edge label pill on opposite side to the badge
  const pillOffsetX = -badgeOffsetX;
  const pillOffsetY = -badgeOffsetY;

  return (
    <>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="14"
          refY="5"
          markerWidth="10"
          markerHeight="10"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 1 1.5 L 9.5 5 L 1 8.5 z" fill={stroke} />
        </marker>
      </defs>

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={`url(#${markerId})`}
        style={{
          stroke,
          strokeWidth,
          strokeDasharray: kind === 'response' ? '6 4' : undefined,
        }}
      />

      {isActive && !reducedMotion && (
        <circle r={4} fill={stroke} className="pointer-events-none">
          <animateMotion
            dur="0.6s"
            calcMode="spline"
            keyTimes="0;1"
            keySplines="0.32 0.72 0 1"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}

      {isActive && activeStepNumber !== null && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX + badgeOffsetX}px, ${labelY + badgeOffsetY}px)`,
            }}
            className={cn(
              'nodrag nopan pointer-events-none absolute flex h-[22px] w-[22px] items-center justify-center rounded-pill text-[12px] font-bold leading-none tabular-nums shadow-xs',
              kind === 'error'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-primary text-primary-foreground',
            )}
          >
            {activeStepNumber}
          </div>
        </EdgeLabelRenderer>
      )}

      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX + pillOffsetX}px, ${labelY + pillOffsetY}px)`,
            }}
            className="nodrag nopan pointer-events-none absolute rounded-pill border border-border bg-card px-2 py-0.5 text-[12px] font-medium leading-none text-foreground shadow-xs"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
