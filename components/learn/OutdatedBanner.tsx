import { AlertTriangle } from 'lucide-react';

export function OutdatedBanner({ verified, status }: { verified?: string; status?: string }) {
  const isOutdated = status === 'outdated' || (verified && new Date().getTime() - new Date(verified).getTime() > 365 * 24 * 60 * 60 * 1000);

  if (!isOutdated) return null;

  return (
    <div className="mb-6 p-4 rounded-panel bg-destructive-soft text-destructive-text border border-destructive/20 flex items-center gap-3 text-sm">
      <AlertTriangle className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="font-bold">May be outdated:</span>
      <span>This note was last verified over a year ago or marked as outdated. Commands or behaviors may have changed.</span>
    </div>
  );
}
