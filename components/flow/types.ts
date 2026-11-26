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

export const FlowNodeSchema = z.object({
  id: z.string().min(1, 'Node id is required'),
  label: z.string().min(1, 'Node label is required'),
  subtitle: z.string().optional(),
  icon: z.enum(FLOW_ICON_NAMES).optional(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
});

export type FlowNode = z.infer<typeof FlowNodeSchema>;

export const FlowStepSchema = z.object({
  edge: z.string().min(1, 'Step edge is required'),
  text: z.string().min(1, 'Step text is required'),
  kind: FlowEdgeKindSchema.default('request'),
});

export type FlowStep = z.input<typeof FlowStepSchema>;
export type ParsedFlowStep = z.infer<typeof FlowStepSchema>;

export const FlowPropsSchema = z
  .object({
    id: z.string().min(1, 'Flow id is required'),
    title: z.string().optional(),
    nodes: z.array(FlowNodeSchema).min(2, 'Flow requires at least 2 nodes'),
    steps: z.array(FlowStepSchema).min(1, 'Flow requires at least 1 step'),
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

    for (let i = 0; i < data.steps.length; i++) {
      const step = data.steps[i];
      const parts = step.edge.split('->').map((part) => part.trim());
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['steps', i, 'edge'],
          message: `Invalid edge "${step.edge}" in step ${i + 1}. Expected "from->to".`,
        });
        continue;
      }

      const [fromId, toId] = parts;
      if (!nodeIds.has(fromId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['steps', i, 'edge'],
          message: `Unknown node id "${fromId}" in step ${i + 1} edge "${step.edge}".`,
        });
      }
      if (!nodeIds.has(toId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['steps', i, 'edge'],
          message: `Unknown node id "${toId}" in step ${i + 1} edge "${step.edge}".`,
        });
      }
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
