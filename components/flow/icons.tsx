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
import type { FlowIconName } from './types';

const ICON_MAP = {
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
} as const;

/**
 * Renders the lucide icon for a Flow node inside an SVG group.
 */
export function FlowNodeIcon({
  name = 'service',
  x,
  y,
  size = 16,
}: {
  name?: FlowIconName;
  x: number;
  y: number;
  size?: number;
}) {
  const Icon = ICON_MAP[name];
  return (
    <Icon
      x={x}
      y={y}
      width={size}
      height={size}
      strokeWidth={2}
      aria-hidden="true"
    />
  );
}
