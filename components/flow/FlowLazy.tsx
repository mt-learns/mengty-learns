'use client';

import { Player } from './v3/Player';
import type { ParsedFlowProps } from './types';

/**
 * Client wrapper for Flow v3. The lightweight Player shell + static SVG skeleton
 * + <details> step list are SSR'd, while @xyflow/react + @dagrejs/dagre are
 * dynamically imported only when scrolled into view.
 */
export function FlowLazy(props: ParsedFlowProps) {
  return <Player {...props} />;
}
