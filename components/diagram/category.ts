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

/**
 * §4.3 category tints (tokens only, no hex): client gray, network blue, service indigo,
 * data green, external orange, abstraction purple, concrete teal. Tint on icon tile only.
 * Red/destructive is never a category tint — it is reserved for kind:'error'.
 */
export const CATEGORY_TOKENS: Record<FlowNodeCategory, { bg: string; fg: string }> = {
  client: { bg: 'var(--diagram-client-soft)', fg: 'var(--diagram-client)' },
  edge: { bg: 'var(--diagram-network-soft)', fg: 'var(--diagram-network)' },
  network: { bg: 'var(--diagram-network-soft)', fg: 'var(--diagram-network)' },
  service: { bg: 'var(--diagram-service-soft)', fg: 'var(--diagram-service)' },
  data: { bg: 'var(--diagram-data-soft)', fg: 'var(--diagram-data)' },
  external: { bg: 'var(--diagram-external-soft)', fg: 'var(--diagram-external)' },
  abstraction: { bg: 'var(--diagram-abstraction-soft)', fg: 'var(--diagram-abstraction)' },
  concrete: { bg: 'var(--diagram-concrete-soft)', fg: 'var(--diagram-concrete)' },
};
