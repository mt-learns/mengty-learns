import { z } from 'zod';

export const FLOW_ICON_NAMES = [
  'user',
  'gateway',
  'service',
  'pod',
  'db',
  'queue',
  'git',
  'ci',
  'class',
  'interface',
] as const;

export type FlowIconName = (typeof FLOW_ICON_NAMES)[number];

export const FlowEdgeKindSchema = z.enum(['request', 'response', 'error']);
export type FlowEdgeKind = z.infer<typeof FlowEdgeKindSchema>;

export const FLOW_NODE_CATEGORIES = [
  'client',
  'edge',
  'network',
  'service',
  'data',
  'external',
  'abstraction',
  'concrete',
] as const;

export const FlowNodeCategorySchema = z.enum(FLOW_NODE_CATEGORIES);
export type FlowNodeCategory = z.infer<typeof FlowNodeCategorySchema>;

export const FlowNodeVariantSchema = z.enum(['default', 'problem']);
export type FlowNodeVariant = z.infer<typeof FlowNodeVariantSchema>;

export const FlowLayoutModeSchema = z.enum(['flow', 'tree']);
export type FlowLayoutMode = z.infer<typeof FlowLayoutModeSchema>;

export const FlowNodeSchema = z.object({
  id: z.string().min(1, 'Node id is required'),
  label: z.string().min(1, 'Node label is required'),
  subtitle: z.string().optional(),
  icon: z.enum(FLOW_ICON_NAMES).optional(),
  category: FlowNodeCategorySchema.optional(),
  rank: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
  variant: FlowNodeVariantSchema.optional(),
});

export type FlowNode = z.input<typeof FlowNodeSchema>;
export type ParsedFlowNode = z.infer<typeof FlowNodeSchema>;

/**
 * Resolves the visual category tint for a node, falling back from its icon.
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

export const FlowGroupSchema = z.object({
  id: z.string().min(1, 'Group id is required'),
  label: z.string().min(1, 'Group label is required'),
  nodeIds: z.array(z.string().min(1)).min(1, 'Group requires at least 1 nodeId'),
});

export type FlowGroup = z.input<typeof FlowGroupSchema>;
export type ParsedFlowGroup = z.infer<typeof FlowGroupSchema>;

export const FlowStepSchema = z.object({
  edge: z.string().min(1, 'Step edge is required'),
  title: z.string().optional(),
  text: z.string().min(1, 'Step text is required'),
  kind: FlowEdgeKindSchema.default('request'),
  label: z.string().max(12, 'Edge label must be <= 12 characters').optional(),
});

export type FlowStep = z.input<typeof FlowStepSchema>;
export type ParsedFlowStep = z.infer<typeof FlowStepSchema>;

export const DiagramEdgeSchema = z.object({
  from: z.string().min(1, 'Edge source is required'),
  to: z.string().min(1, 'Edge target is required'),
  kind: FlowEdgeKindSchema.default('request'),
  label: z.string().max(12, 'Edge label must be <= 12 characters').optional(),
  dashed: z.boolean().optional(),
});

export type DiagramEdge = z.input<typeof DiagramEdgeSchema>;
export type ParsedDiagramEdge = z.infer<typeof DiagramEdgeSchema>;

export const FlowVariantSchema = z.object({
  id: z.string().min(1, 'Variant id is required'),
  label: z.string().min(1, 'Variant label is required'),
  layout: FlowLayoutModeSchema.optional(),
  nodes: z
    .array(FlowNodeSchema)
    .min(2, 'Variant requires at least 2 nodes')
    .max(7, 'Variant allows at most 7 nodes per view'),
  steps: z
    .array(FlowStepSchema)
    .min(1, 'Variant requires at least 1 step')
    .max(8, 'Variant allows at most 8 steps'),
  groups: z.array(FlowGroupSchema).optional(),
});

export type FlowVariant = z.input<typeof FlowVariantSchema>;
export type ParsedFlowVariant = z.infer<typeof FlowVariantSchema>;

function warnLongLabels(nodes: ParsedFlowNode[], contextId: string) {
  for (const node of nodes) {
    if (node.label.length > 18) {
      console.warn(
        `[diagram-rules] Node "${node.id}" in "${contextId}" has label "${node.label}" (${node.label.length} chars > 18). Move detail to subtitle.`,
      );
    }
  }
}

function validateGroups(
  groups: ParsedFlowGroup[] | undefined,
  nodeIds: Set<string>,
  basePath: (string | number)[],
  ctx: z.RefinementCtx,
) {
  if (!groups) return;
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    for (let j = 0; j < group.nodeIds.length; j++) {
      const nid = group.nodeIds[j];
      if (!nodeIds.has(nid)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [...basePath, 'groups', i, 'nodeIds', j],
          message: `Unknown node id "${nid}" in group "${group.id}".`,
        });
      }
    }
  }
}

function validateNodesAndSteps(
  nodes: ParsedFlowNode[],
  steps: ParsedFlowStep[],
  groups: ParsedFlowGroup[] | undefined,
  basePath: (string | number)[],
  ctx: z.RefinementCtx,
) {
  const nodeIds = new Set<string>();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (nodeIds.has(node.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [...basePath, 'nodes', i, 'id'],
        message: `Duplicate node id "${node.id}"`,
      });
    }
    nodeIds.add(node.id);
  }

  validateGroups(groups, nodeIds, basePath, ctx);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const parts = step.edge.split('->').map((part) => part.trim());
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [...basePath, 'steps', i, 'edge'],
        message: `Invalid edge "${step.edge}" in step ${i + 1}. Expected "from->to".`,
      });
      continue;
    }

    const [fromId, toId] = parts;
    if (!nodeIds.has(fromId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [...basePath, 'steps', i, 'edge'],
        message: `Unknown node id "${fromId}" in step ${i + 1} edge "${step.edge}".`,
      });
    }
    if (!nodeIds.has(toId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [...basePath, 'steps', i, 'edge'],
        message: `Unknown node id "${toId}" in step ${i + 1} edge "${step.edge}".`,
      });
    }
  }
}

export const FlowPropsSchema = z
  .object({
    id: z.string().min(1, 'Flow id is required'),
    title: z.string().optional(),
    layout: FlowLayoutModeSchema.default('flow'),
    nodes: z
      .array(FlowNodeSchema)
      .min(2, 'Flow requires at least 2 nodes')
      .max(7, 'Flow allows at most 7 nodes per view')
      .optional(),
    steps: z
      .array(FlowStepSchema)
      .min(1, 'Flow requires at least 1 step')
      .max(8, 'Flow allows at most 8 steps')
      .optional(),
    groups: z.array(FlowGroupSchema).optional(),
    variants: z
      .array(FlowVariantSchema)
      .min(1, 'Flow requires at least 1 variant')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.variants && data.variants.length > 0) {
      const variantIds = new Set<string>();
      const variantLabels = new Set<string>();

      for (let i = 0; i < data.variants.length; i++) {
        const variant = data.variants[i];
        if (variantIds.has(variant.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['variants', i, 'id'],
            message: `Duplicate variant id "${variant.id}"`,
          });
        }
        variantIds.add(variant.id);

        if (variantLabels.has(variant.label)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['variants', i, 'label'],
            message: `Duplicate variant label "${variant.label}"`,
          });
        }
        variantLabels.add(variant.label);

        validateNodesAndSteps(
          variant.nodes,
          variant.steps,
          variant.groups,
          ['variants', i],
          ctx,
        );
      }
      return;
    }

    if (!data.nodes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nodes'],
        message: 'Flow requires either nodes/steps or variants',
      });
    }
    if (!data.steps) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['steps'],
        message: 'Flow requires either nodes/steps or variants',
      });
    }
    if (data.nodes && data.steps) {
      validateNodesAndSteps(data.nodes, data.steps, data.groups, [], ctx);
    }
  });

export type FlowProps = z.input<typeof FlowPropsSchema>;
export type ParsedFlowProps = z.infer<typeof FlowPropsSchema>;

/**
 * Validates Flow props and throws a ZodError on invalid or unknown node references.
 */
export function parseFlowProps(props: FlowProps): ParsedFlowProps {
  const parsed = FlowPropsSchema.parse(props);
  if (parsed.variants) {
    for (const v of parsed.variants) {
      warnLongLabels(v.nodes, `${parsed.id}:${v.id}`);
    }
  } else if (parsed.nodes) {
    warnLongLabels(parsed.nodes, parsed.id);
  }
  return parsed;
}

export const DiagramPropsSchema = z
  .object({
    id: z.string().min(1, 'Diagram id is required'),
    title: z.string().optional(),
    caption: z.string().optional(),
    ariaLabel: z.string().optional(),
    layout: FlowLayoutModeSchema.default('flow'),
    nodes: z
      .array(FlowNodeSchema)
      .min(2, 'Diagram requires at least 2 nodes')
      .max(7, 'Diagram allows at most 7 nodes per view'),
    edges: z.array(DiagramEdgeSchema),
    groups: z.array(FlowGroupSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const nodeIds = new Set<string>();
    for (let i = 0; i < data.nodes.length; i++) {
      const node = data.nodes[i];
      if (nodeIds.has(node.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['nodes', i, 'id'],
          message: `Duplicate node id "${node.id}"`,
        });
      }
      nodeIds.add(node.id);
    }

    validateGroups(data.groups, nodeIds, [], ctx);

    for (let i = 0; i < data.edges.length; i++) {
      const edge = data.edges[i];
      if (!nodeIds.has(edge.from)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['edges', i, 'from'],
          message: `Unknown node id "${edge.from}" in edge ${i + 1}.`,
        });
      }
      if (!nodeIds.has(edge.to)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['edges', i, 'to'],
          message: `Unknown node id "${edge.to}" in edge ${i + 1}.`,
        });
      }
    }
  });

export type DiagramProps = z.input<typeof DiagramPropsSchema>;
export type ParsedDiagramProps = z.infer<typeof DiagramPropsSchema>;

/**
 * Validates static Diagram props at build time.
 */
export function parseDiagramProps(props: DiagramProps): ParsedDiagramProps {
  const parsed = DiagramPropsSchema.parse(props);
  warnLongLabels(parsed.nodes, parsed.id);
  return parsed;
}
