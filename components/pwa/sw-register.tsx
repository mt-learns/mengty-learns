'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CHUNK_RELOAD_KEY = 'mt-chunk-reload-v1';
const CHUNK_RELOAD_COOLDOWN_MS = 30_000;

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg =
    typeof err === 'string'
      ? err
      : err instanceof Error
        ? `${err.name}: ${err.message}`
        : String(err);
  return (
    msg.includes('ChunkLoadError') ||
    msg.includes('Loading chunk') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed')
  );
}

export function SwRegister() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const regRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let refreshing = false;

    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const trackInstalling = (worker: ServiceWorker | null) => {
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          setWaitingWorker(worker);
          setDismissed(false);
        }
      });
    };

    // Register only after `load` and an idle period: the install step precaches
    // ~80 URLs, which must not compete with the page's own LCP/TBT work.
    const register = () =>
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then((reg) => {
          regRef.current = reg;
          if (reg.waiting && navigator.serviceWorker.controller) {
            setWaitingWorker(reg.waiting);
          }
          if (reg.installing) {
            trackInstalling(reg.installing);
          }
          reg.addEventListener('updatefound', () => {
            trackInstalling(reg.installing);
          });
        })
        .catch(() => {
          // Registration can fail in private/in-app browsers; the site still works normally.
        });

    let idleHandle: number | undefined;
    let usedIdleCallback = false;
    const scheduleRegister = () => {
      if (typeof window.requestIdleCallback === 'function') {
        usedIdleCallback = true;
        idleHandle = window.requestIdleCallback(() => void register(), { timeout: 5000 });
      } else {
        idleHandle = globalThis.setTimeout(() => void register(), 3000) as unknown as number;
      }
    };
    if (document.readyState === 'complete') {
      scheduleRegister();
    } else {
      window.addEventListener('load', scheduleRegister, { once: true });
    }

    const checkUpdate = () => {
      regRef.current?.update().catch(() => {});
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkUpdate();
    };

    const tryReloadOnceForChunk = () => {
      if (!navigator.onLine) return;
      try {
        const prev = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || '0');
        if (prev && Date.now() - prev < CHUNK_RELOAD_COOLDOWN_MS) return;
        sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
      } catch {
        // Ignore sessionStorage errors.
      }
      regRef.current?.update().catch(() => {});
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error ?? event.message)) {
        tryReloadOnceForChunk();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        tryReloadOnceForChunk();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
      window.removeEventListener('load', scheduleRegister);
      if (idleHandle !== undefined) {
        if (usedIdleCallback) window.cancelIdleCallback(idleHandle);
        else globalThis.clearTimeout(idleHandle);
      }
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (!waitingWorker || dismissed) return null;

  const handleReload = () => {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  };

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
          onClick={handleReload}
          className="min-h-tap rounded-control px-3"
        >
          <RefreshCw className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span>Reload</span>
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss update notification"
          className="inline-flex min-h-tap min-w-[44px] items-center justify-center rounded-control text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
