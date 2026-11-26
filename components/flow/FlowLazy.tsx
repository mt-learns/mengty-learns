'use client';

import dynamic from 'next/dynamic';
import type { FlowProps } from './types';

const FlowClient = dynamic(
  () => import('./Flow').then((mod) => mod.Flow),
  { ssr: true },
);

/**
 * Code-split wrapper so Flow + motion are only loaded on pages that render <Flow>.
 */
export function FlowLazy(props: FlowProps) {
  return <FlowClient {...props} />;
}
