'use client';

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import {
  Box,
  Boxes,
  Database,
  GitBranch,
  Layers,
  ListOrdered,
  Network,
  Play,
  Server,
  User,
  X,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type {
  FlowIconName,
  FlowNodeCategory,
  FlowNodeVariant,
} from '../types';

const ICON_MAP: Record<FlowIconName, typeof Server> = {
  user: User,
  gateway: Network,
  service: Server,
  pod: Box,
  db: Database,
  queue: ListOrdered,
  git: GitBranch,
  ci: Play,
  class: Boxes,
  interface: Layers,
};

const CATEGORY_STYLE: Record<FlowNodeCategory, { bg: string; fg: string }> = {
  client: { bg: 'var(--flow-cat-client-bg)', fg: 'var(--flow-cat-client-fg)' },
  edge: { bg: 'var(--flow-cat-edge-bg)', fg: 'var(--flow-cat-edge-fg)' },
  service: { bg: 'var(--flow-cat-service-bg)', fg: 'var(--flow-cat-service-fg)' },
  data: { bg: 'var(--flow-cat-data-bg)', fg: 'var(--flow-cat-data-fg)' },
  external: { bg: 'var(--flow-cat-external-bg)', fg: 'var(--flow-cat-external-fg)' },
};

export interface IosNodeData extends Record<string, unknown> {
  label: string;
  subtitle?: string;
  icon: FlowIconName;
  category: FlowNodeCategory;
  variant: FlowNodeVariant;
  isActive: boolean;
  isOverview: boolean;
  isError: boolean;
  width: number;
  height: number;
}

export type IosFlowNode = Node<IosNodeData, 'ios'>;

const HIDDEN_HANDLE =
  '!opacity-0 !pointer-events-none !w-1 !h-1 !min-w-0 !min-h-0 !border-0 !bg-transparent';

/**
 * iOS app-icon style node for React Flow: 36px tinted squircle + 2-line wrap label (no ellipsis).
 * Never applies opacity to the node element so text always stays >= 4.5:1 contrast.
 */
export function IosNode({ data }: NodeProps<IosFlowNode>) {
  const Icon = ICON_MAP[data.icon] ?? Server;
  const tint = CATEGORY_STYLE[data.category] ?? CATEGORY_STYLE.service;
  const isDimmed = !data.isOverview && !data.isActive;
  const isProblem = data.variant === 'problem';

  return (
    <div
      style={{ width: data.width, minHeight: data.height }}
      className={cn(
        'relative flex items-center gap-2.5 rounded-panel px-3 py-2',
        'transition-[transform,box-shadow,background-color,border-color] duration-200 ease-[var(--ease-ios)]',
        'motion-reduce:transition-none motion-reduce:transform-none',
        isDimmed
          ? 'border border-border bg-card/85 shadow-none'
          : 'border border-border bg-card shadow-xs',
        isProblem && 'border-dashed border-[var(--border-strong)]',
        data.isActive && [
          'scale-[1.02] motion-reduce:scale-100 shadow-sm ring-2',
          data.isError
            ? 'bg-destructive/8 ring-destructive'
            : 'bg-primary/8 ring-primary',
        ],
      )}
    >
      <Handle id="top-target" type="target" position={Position.Top} className={HIDDEN_HANDLE} />
      <Handle id="top-source" type="source" position={Position.Top} className={HIDDEN_HANDLE} />
      <Handle id="right-target" type="target" position={Position.Right} className={HIDDEN_HANDLE} />
      <Handle id="right-source" type="source" position={Position.Right} className={HIDDEN_HANDLE} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} className={HIDDEN_HANDLE} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} className={HIDDEN_HANDLE} />
      <Handle id="left-target" type="target" position={Position.Left} className={HIDDEN_HANDLE} />
      <Handle id="left-source" type="source" position={Position.Left} className={HIDDEN_HANDLE} />

      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
          isDimmed && 'saturate-50',
        )}
        style={{ backgroundColor: tint.bg, color: tint.fg }}
        aria-hidden="true"
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 break-words text-[15px] font-semibold leading-[1.2] text-foreground">
          {data.label}
        </div>
        {data.subtitle && (
          <div className="mt-0.5 line-clamp-1 break-words text-[13px] font-normal leading-tight text-muted-foreground">
            {data.subtitle}
          </div>
        )}
      </div>

      {isProblem && (
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-pill border border-[var(--border-strong)] bg-secondary text-foreground"
          aria-label="Problem"
        >
          <X className="h-3 w-3" strokeWidth={2.5} />
        </span>
      )}
    </div>
  );
}
