'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { isStandaloneMode } from '@/lib/pwa-install';

/**
 * Visible only in standalone PWA mode on docs pages so iOS users never get
 * stranded on deep pages without a browser Back button (R6).
 */
export function StandaloneBackBar() {
  const [standalone, setStandalone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setStandalone(isStandaloneMode());
  }, []);

  if (!standalone) return null;

  return (
    <div className="mb-3 flex items-center justify-between gap-2 border-b pb-2">
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push('/docs/');
          }
        }}
        className="inline-flex min-h-tap items-center gap-1.5 rounded-control px-2.5 text-subheadline font-medium text-foreground transition-colors hover:bg-secondary"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
        <span>Back</span>
      </button>
      <Link
        href="/docs/"
        className="inline-flex min-h-tap items-center gap-1.5 rounded-control px-2.5 text-subheadline text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <BookOpen className="size-4" strokeWidth={1.75} aria-hidden="true" />
        <span>All docs</span>
      </Link>
    </div>
  );
}
