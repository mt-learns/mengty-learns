'use client';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import type { SharedProps } from 'fumadocs-ui/components/dialog/search';

// React.lazy (not next/dynamic) so Next does not preload the search/orama chunk
// on initial page load; only mounted after the user opens search (Ctrl+K or click).
const SearchDialogInner = lazy(() => import('@/components/search'));

function LazySearchDialog(props: SharedProps) {
  const [hasOpened, setHasOpened] = useState(props.open);
  const { open, onOpenChange } = props;

  useEffect(() => {
    if (open) setHasOpened(true);
  }, [open]);

  useEffect(() => {
    if (hasOpened) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-search], [data-search-full]')) {
        setHasOpened(true);
        onOpenChange(true);
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasOpened, onOpenChange]);

  if (!hasOpened) return null;

  return (
    <Suspense fallback={null}>
      <SearchDialogInner {...props} />
    </Suspense>
  );
}

export function Provider({ children }: { children: ReactNode }) {
  // Static search: the dialog downloads the pre-built index from /api/search
  // once and searches in the browser. Without this, Fumadocs uses its default
  // fetch search (/api/search?query=…), which a static route cannot answer.
  return <RootProvider search={{ SearchDialog: LazySearchDialog } as any}>{children}</RootProvider>;
}
