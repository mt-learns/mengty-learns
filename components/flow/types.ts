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
  'service',
  'data',
  'external',
] as const;

export const FlowNodeCategorySchema = z.enum(FLOW_NODE_CATEGORIES);
export type FlowNodeCategory = z.infer<typeof FlowNodeCategorySchema>;

export const FlowNodeSchema = z.object({
  id: z.string().min(1, 'Node id is required'),
  label: z.string().min(1, 'Node label is required'),
  subtitle: z.string().optional(),
  icon: z.enum(FLOW_ICON_NAMES).optional(),
  category: FlowNodeCategorySchema.optional(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
});

export type FlowNode = z.infer<typeof FlowNodeSchema>;

/**
 * Resolves the visual category tint for a node, falling back from its icon.
 */
export function resolveNodeCategory(node: Pick<FlowNode, 'category' | 'icon'>): FlowNodeCategory {
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
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().min(1).default(1),
  height: z.number().int().min(1).default(1),
});

export type FlowGroup = z.input<typeof FlowGroupSchema>;
export type ParsedFlowGroup = z.infer<typeof FlowGroupSchema>;

export const FlowStepSchema = z.object({
  edge: z.string().min(1, 'Step edge is required'),
  title: z.string().optional(),
  text: z.string().min(1, 'Step text is required'),
  kind: FlowEdgeKindSchema.default('request'),
});

export type FlowStep = z.input<typeof FlowStepSchema>;
export type ParsedFlowStep = z.infer<typeof FlowStepSchema>;

export const FlowVariantSchema = z.object({
  id: z.string().min(1, 'Variant id is required'),
  label: z.string().min(1, 'Variant label is required'),
  nodes: z.array(FlowNodeSchema).min(2, 'Variant requires at least 2 nodes'),
  steps: z.array(FlowStepSchema).min(1, 'Variant requires at least 1 step'),
  groups: z.array(FlowGroupSchema).optional(),
});

export type FlowVariant = z.input<typeof FlowVariantSchema>;
export type ParsedFlowVariant = z.infer<typeof FlowVariantSchema>;

function validateNodesAndSteps(
  nodes: FlowNode[],
  steps: ParsedFlowStep[],
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
    nodes: z.array(FlowNodeSchema).min(2, 'Flow requires at least 2 nodes').optional(),
    steps: z.array(FlowStepSchema).min(1, 'Flow requires at least 1 step').optional(),
    groups: z.array(FlowGroupSchema).optional(),
    variants: z.array(FlowVariantSchema).min(1, 'Flow requires at least 1 variant').optional(),
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

        validateNodesAndSteps(variant.nodes, variant.steps, ['variants', i], ctx);
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
      validateNodesAndSteps(data.nodes, data.steps, [], ctx);
    }
  });

export type FlowProps = z.input<typeof FlowPropsSchema>;
export type ParsedFlowProps = z.infer<typeof FlowPropsSchema>;

/**
 * Validates Flow props and throws a ZodError on invalid or unknown node references.
 */
export function parseFlowProps(props: FlowProps): ParsedFlowProps {
  return FlowPropsSchema.parse(props);
}
