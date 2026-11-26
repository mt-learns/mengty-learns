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
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { FlowIconName, FlowNodeCategory } from '../types';

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
  isActive: boolean;
  isOverview: boolean;
  isError: boolean;
  width: number;
}

export type IosFlowNode = Node<IosNodeData, 'ios'>;

const HIDDEN_HANDLE =
  '!opacity-0 !pointer-events-none !w-1 !h-1 !min-w-0 !min-h-0 !border-0 !bg-transparent';

/**
 * iOS app-icon style node for React Flow: 44px tinted squircle + 15px semibold label.
 */
export function IosNode({ data }: NodeProps<IosFlowNode>) {
  const Icon = ICON_MAP[data.icon] ?? Server;
  const tint = CATEGORY_STYLE[data.category] ?? CATEGORY_STYLE.service;
  const isDimmed = !data.isOverview && !data.isActive;

  return (
    <div
      style={{ width: data.width }}
      className={cn(
        'flex items-center gap-2.5 rounded-panel bg-card px-2.5 py-2 shadow-xs',
        'transition-[transform,opacity,box-shadow] duration-300 ease-[var(--ease-ios)]',
        'motion-reduce:transition-none motion-reduce:transform-none',
        data.isActive && [
          'scale-[1.04] motion-reduce:scale-100 shadow-md ring-2',
          data.isError ? 'ring-destructive/50' : 'ring-primary/45',
        ],
        isDimmed ? 'opacity-55' : 'opacity-100',
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
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]"
        style={{ backgroundColor: tint.bg, color: tint.fg }}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold leading-tight text-foreground">
          {data.label}
        </div>
        {data.subtitle && (
          <div className="mt-0.5 truncate text-[13px] leading-tight text-muted-foreground">
            {data.subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
