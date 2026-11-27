'use client';
import dynamic from 'next/dynamic';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { type ReactNode } from 'react';

const SearchDialog = dynamic(() => import('@/components/search'), {
  ssr: false,
});

export function Provider({ children }: { children: ReactNode }) {
  // Static search: the dialog downloads the pre-built index from /api/search
  // once and searches in the browser. Without this, Fumadocs uses its default
  // fetch search (/api/search?query=…), which a static route cannot answer.
  return <RootProvider search={{ SearchDialog } as any}>{children}</RootProvider>;
}
