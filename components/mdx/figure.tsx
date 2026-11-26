import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FigureProps {
  src?: string;
  srcDark?: string;
  alt: string;
  caption?: ReactNode;
  className?: string;
}

export function Figure({ src, srcDark, alt, caption, className }: FigureProps) {
  return (
    <figure className={cn('my-6 flex flex-col items-center gap-2', className)}>
      <div className="relative w-full overflow-hidden rounded-card border bg-card">
        {src && (
          <img
            src={src}
            alt={alt}
            className={cn(
              'w-full object-cover',
              srcDark ? 'dark:hidden' : 'block'
            )}
          />
        )}
        {srcDark && (
          <img
            src={srcDark}
            alt={alt}
            className="hidden w-full object-cover dark:block"
          />
        )}
      </div>
      {caption && (
        <figcaption className="text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
