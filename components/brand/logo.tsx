import { cn } from '@/lib/utils';

/** The "MT" monogram (same drawing as public/favicon.svg), in the jade accent. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" aria-hidden="true" className={cn('size-7 shrink-0', className)}>
      <path
        fill="var(--primary)"
        d="M64 4C99.5 4 124 28.5 124 64C124 99.5 99.5 124 64 124C28.5 124 4 99.5 4 64C4 28.5 28.5 4 64 4Z"
      />
      <path
        fill="var(--primary-foreground)"
        d="M27 88V40H37.5L51.5 64.5L65.5 40H76V88H66V57.5L54.5 77.5H48.5L37 57.5V88H27ZM83 49.5V40H107V49.5H100V88H90V49.5H83Z"
      />
    </svg>
  );
}
