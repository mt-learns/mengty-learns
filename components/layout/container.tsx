import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * The one page container (REDESIGN-PLAN section 5): nav, every home section and
 * the footer share these edges. `data-edge` lets scripts/qa-shots.mjs check it.
 */
export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div data-edge="" className={cn('mx-auto w-full max-w-[1200px] px-6 md:px-8', className)} {...props} />;
}
