import { ChevronRight } from 'lucide-react';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface GroupedListProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function GroupedList({ header, footer, children, className }: GroupedListProps) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <section className={cn('flex flex-col gap-1.5', className)}>
      {header && (
        <h2 className="px-4 text-footnote uppercase text-muted-foreground font-normal">
          {header}
        </h2>
      )}
      <div className="overflow-hidden rounded-card bg-card border border-border">
        <div className="flex flex-col">
          {rows.map((row, position) => (
            <Fragment key={position}>
              {position > 0 && <div className="ml-4 h-[0.5px] bg-border" />}
              {row}
            </Fragment>
          ))}
        </div>
      </div>
      {footer && (
        <p className="px-4 text-footnote text-muted-foreground">
          {footer}
        </p>
      )}
    </section>
  );
}

export interface GroupedRowProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  detail?: ReactNode;
  href?: string;
}

export function GroupedRow({ title, description, icon, detail, href }: GroupedRowProps) {
  const content = (
    <>
      {icon && (
        <div className="flex-shrink-0 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="flex flex-col flex-grow min-w-0">
        <div className="text-body text-foreground truncate font-normal">
          {title}
        </div>
        {description && (
          <div className="text-subheadline text-muted-foreground truncate">
            {description}
          </div>
        )}
      </div>
      {(detail || href) && (
        <div className="flex-shrink-0 flex items-center gap-1 text-muted-foreground ml-auto">
          {detail && <span className="text-body">{detail}</span>}
          {href && <ChevronRight className="size-4 opacity-30" />}
        </div>
      )}
    </>
  );

  const className = cn(
    'flex items-center gap-4 px-4 py-2.5 min-h-tap',
    href && 'hover:bg-muted/50 transition-colors'
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
