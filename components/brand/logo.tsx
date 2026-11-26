import { cn } from '@/lib/utils';

/**
 * The "mt" monogram (master: design/logo/mark.svg). A lowercase m whose second shoulder runs on as the
 * t's crossbar, and an amber dot for progress. Stroke-based on a 128 grid, so it stays crisp at any size.
 * Colours come from --primary and --highlight, so it follows the theme. Min size 16px; see DESIGN.md "Logo".
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" fill="none" aria-hidden="true" className={cn('size-7 shrink-0', className)}>
      <path
        d="M16 104V64A16 16 0 0 1 48 64V104M48 64A16 16 0 0 1 64 48H88M80 24V92A12 12 0 0 0 92 104"
        stroke="var(--primary)"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={116} cy={48} r={9} fill="var(--highlight)" />
    </svg>
  );
}
