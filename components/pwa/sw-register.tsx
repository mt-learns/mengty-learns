'use client';

import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const LazyUpdateToast = lazy(() =>
  import('./update-toast').then((mod) => ({ default: mod.UpdateToast })),
);

const CHUNK_RELOAD_KEY = 'mt-chunk-reload-v1';
const CHUNK_RELOAD_COOLDOWN_MS = 30_000;
const FIRST_VISIT_REGISTER_DELAY_MS = 4500;

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
    let registered = false;

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

    // Register only after `load` and past the initial interactive/TBT window:
    // the install step precaches ~80 URLs, which must not compete with LCP/TBT.
    const register = () => {
      if (registered) return;
      registered = true;
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
    };

    let idleHandle: number | undefined;
    let delayTimer: ReturnType<typeof setTimeout> | undefined;
    let usedIdleCallback = false;

    const triggerIdleRegister = () => {
      if (registered) return;
      if (typeof window.requestIdleCallback === 'function') {
        usedIdleCallback = true;
        idleHandle = window.requestIdleCallback(() => register(), { timeout: 2000 });
      } else {
        register();
      }
    };

    const scheduleRegister = () => {
      if (navigator.serviceWorker.controller) {
        // Already controlled by an active SW: only checking for updates, so idle is enough.
        triggerIdleRegister();
        return;
      }
      // First visit: wait for first user interaction or a quiet delay after load
      // so the 80-URL precache never competes with initial hydration / TBT.
      const onInteract = () => {
        if (delayTimer !== undefined) clearTimeout(delayTimer);
        window.removeEventListener('pointerdown', onInteract);
        window.removeEventListener('keydown', onInteract);
        triggerIdleRegister();
      };
      window.addEventListener('pointerdown', onInteract, { once: true, passive: true });
      window.addEventListener('keydown', onInteract, { once: true, passive: true });
      delayTimer = globalThis.setTimeout(() => {
        window.removeEventListener('pointerdown', onInteract);
        window.removeEventListener('keydown', onInteract);
        triggerIdleRegister();
      }, FIRST_VISIT_REGISTER_DELAY_MS);
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
      if (delayTimer !== undefined) globalThis.clearTimeout(delayTimer);
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

  return (
    <Suspense fallback={null}>
      <LazyUpdateToast
        onReload={() => waitingWorker.postMessage({ type: 'SKIP_WAITING' })}
        onDismiss={() => setDismissed(true)}
      />
    </Suspense>
  );
}
