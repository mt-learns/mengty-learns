import { computeDiagramLayout } from '../diagram/layout';
import type {
  PrecomputedLayoutsByVariant,
  SerializedLayout,
} from '../diagram/layout-types';
import { FlowLazy } from './FlowLazy';
import {
  parseFlowProps,
  type FlowDirection,
  type FlowGroup,
  type FlowLayoutMode,
  type FlowNode,
  type FlowProps,
  type ParsedFlowStep,
} from './types';
import { buildEdgeBuckets } from './v3/graph';

const PRECOMPUTE_WIDTHS = [265, 288, 320, 360, 480, 640, 720, 960, 1024, 1136, 1280] as const;

function precomputeVariantLayouts(
  nodes: FlowNode[],
  steps: ParsedFlowStep[],
  groups: FlowGroup[],
  layout: FlowLayoutMode,
  direction?: FlowDirection,
): SerializedLayout[] {
  const edgeInputs = Array.from(buildEdgeBuckets(steps).values()).map((b) => ({
    from: b.from,
    to: b.to,
    kind: b.kind,
    label: b.label,
  }));

  const results: SerializedLayout[] = [];
  for (const w of PRECOMPUTE_WIDTHS) {
    const computed = computeDiagramLayout({
      nodes,
      edges: edgeInputs,
      groups,
      layout,
      direction,
      containerWidth: w,
    });
    const prev = results[results.length - 1];
    const sameAsPrev =
      prev &&
      prev.direction === computed.direction &&
      prev.compact === computed.compact &&
      prev.stacked === computed.stacked &&
      prev.bounds.width === computed.bounds.width &&
      prev.bounds.height === computed.bounds.height &&
      prev.nodeWidth === computed.nodeWidth;
    if (!sameAsPrev) {
      results.push({
        minWidth: results.length === 0 ? 0 : w,
        direction: computed.direction,
        compact: computed.compact,
        stacked: computed.stacked,
        nodes: Object.fromEntries(computed.nodes.entries()),
        groups: computed.groups,
        edges: computed.edges,
        bounds: computed.bounds,
        nodeWidth: computed.nodeWidth,
      });
    }
  }
  return results;
}

/**
 * Server Component entry point for <Flow> in MDX.
 * Validates flow data with Zod and precomputes responsive dagre layouts at build time
 * so the lazy client bundle never ships dagre.
 */
export function FlowServer(props: FlowProps) {
  const parsed = parseFlowProps(props);
  const precomputedLayouts: PrecomputedLayoutsByVariant = {};

  if (parsed.variants && parsed.variants.length > 0) {
    for (const v of parsed.variants) {
      precomputedLayouts[v.id] = precomputeVariantLayouts(
        v.nodes,
        v.steps,
        v.groups ?? [],
        v.layout ?? parsed.layout,
        v.direction ?? parsed.direction,
      );
    }
  } else {
    precomputedLayouts.default = precomputeVariantLayouts(
      parsed.nodes ?? [],
      parsed.steps ?? [],
      parsed.groups ?? [],
      parsed.layout,
      parsed.direction,
    );
  }

  return <FlowLazy {...parsed} precomputedLayouts={precomputedLayouts} />;
}
