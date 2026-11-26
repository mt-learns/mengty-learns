import type { FlowNode, FlowNodeCategory } from './types';

/**
 * Resolves the visual category tint for a node, falling back from its icon.
 * Kept in a zod-free module so client bundles never pull in zod.
 */
export function resolveNodeCategory(
  node: Pick<FlowNode, 'category' | 'icon'>,
): FlowNodeCategory {
  if (node.category) return node.category;
  switch (node.icon) {
    case 'user':
      return 'client';
    case 'gateway':
      return 'edge';
    case 'db':
    case 'queue':
      return 'data';
    case 'git':
    case 'ci':
      return 'external';
    default:
      return 'service';
  }
}
