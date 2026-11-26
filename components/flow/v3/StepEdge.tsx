'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react';
import { cn } from '../../../lib/utils';
import type { FlowEdgeKind } from '../types';

export interface StepEdgeData extends Record<string, unknown> {
  stepNumbers: number[];
  activeStepNumber: number | null;
  isActive: boolean;
  isVisited: boolean;
  kind: FlowEdgeKind;
  reducedMotion: boolean;
}

export type FlowStepEdge = Edge<StepEdgeData, 'step'>;

function getEdgeStrokeColor(
  isActive: boolean,
  isVisited: boolean,
  kind: FlowEdgeKind,
): string {
  const base = kind === 'error' ? 'var(--destructive)' : 'var(--primary)';
  if (isActive) return base;
  if (isVisited) return `color-mix(in oklab, ${base} 65%, transparent)`;
  return 'color-mix(in oklab, var(--muted-foreground) 40%, transparent)';
}

/**
 * Custom React Flow edge with step-number pill badge, visited/active/idle states,
 * dashed response styling, and an animated travelling dot on the active edge.
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
  const stepNumbers = data?.stepNumbers ?? [];

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  const stroke = getEdgeStrokeColor(isActive, isVisited, kind);
  const strokeWidth = isActive ? 2.5 : isVisited ? 2 : 1.5;
  const markerId = `flow-arrow-${id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  return (
    <>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill={stroke} />
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
          <animateMotion dur="1.4s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {stepNumbers.length > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            className={cn(
              'nodrag nopan pointer-events-none absolute rounded-pill px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums shadow-xs',
              isActive
                ? kind === 'error'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-primary text-primary-foreground'
                : isVisited
                  ? kind === 'error'
                    ? 'border border-destructive/30 bg-card text-destructive'
                    : 'border border-primary/30 bg-card text-primary'
                  : 'border border-border bg-card text-muted-foreground',
            )}
          >
            {stepNumbers.join('·')}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
