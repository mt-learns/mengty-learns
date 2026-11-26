'use client';

import type { Node, NodeProps } from '@xyflow/react';

export interface GroupNodeData extends Record<string, unknown> {
  label: string;
  width: number;
  height: number;
}

export type FlowGroupNode = Node<GroupNodeData, 'group'>;

/**
 * Frosted material-thin group container for architectural boundaries (hexagon, rings, layers).
 */
export function GroupNode({ data }: NodeProps<FlowGroupNode>) {
  return (
    <div
      style={{ width: data.width, height: data.height }}
      className="pointer-events-none rounded-panel border border-border/70 material-thin px-3 pt-2"
    >
      <span className="block truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {data.label}
      </span>
    </div>
  );
}
