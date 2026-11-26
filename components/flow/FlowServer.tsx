import { FlowLazy } from './FlowLazy';
import { parseFlowProps, type FlowProps } from './types';

/**
 * Server Component entry point for <Flow> in MDX.
 * Validates flow data with Zod at build time before passing it to the lazy client bundle.
 */
export function FlowServer(props: FlowProps) {
  const parsed = parseFlowProps(props);
  return <FlowLazy {...parsed} />;
}
