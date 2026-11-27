'use client';

import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpdateToastProps {
  onReload: () => void;
  onDismiss: () => void;
}

export function UpdateToast({ onReload, onDismiss }: UpdateToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 left-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-panel border bg-card p-3.5 shadow-lg sm:left-auto"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="min-w-0">
        <p className="text-subheadline font-semibold text-foreground">Update available</p>
        <p className="text-caption-1 text-muted-foreground">
          Reload to get the latest notes and fixes.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          onClick={onReload}
          className="min-h-tap rounded-control px-3"
        >
          <RefreshCw className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span>Reload</span>
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss update notification"
          className="inline-flex min-h-tap min-w-[44px] items-center justify-center rounded-control text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
