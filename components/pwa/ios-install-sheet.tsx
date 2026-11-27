'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function IosInstallSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="w-full max-w-md space-y-4 rounded-card border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="ios-install-title" className="text-headline font-semibold text-foreground">
            Install on iPhone or iPad
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install instructions"
            className="inline-flex min-h-tap min-w-[44px] items-center justify-center rounded-control text-muted-foreground hover:bg-secondary"
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        <ol className="list-decimal space-y-2 pl-5 text-subheadline text-foreground">
          <li>
            Tap the <strong>Share</strong> button in Safari’s toolbar.
          </li>
          <li>
            Scroll down and tap <strong>Add to Home Screen</strong>.
          </li>
          <li>
            Tap <strong>Add</strong> to open Mengty Learns in its own app window.
          </li>
        </ol>
        <p className="rounded-panel border bg-muted p-3 text-caption-1 text-muted-foreground">
          Note: iOS keeps home-screen app storage separate from Safari. Export your progress on{' '}
          <strong>/review</strong> before switching, then import it inside the installed app.
        </p>
        <Button type="button" onClick={onClose} className="min-h-tap w-full rounded-control">
          Got it
        </Button>
      </div>
    </div>
  );
}
