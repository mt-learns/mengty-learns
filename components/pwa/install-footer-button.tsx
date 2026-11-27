'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

const LazyInstallMenuButton = lazy(() =>
  import('./install-prompt').then((mod) => ({ default: mod.InstallMenuButton })),
);

/**
 * Tiny client island for the site footer: defers loading the install-prompt
 * module until after `load` + idle so it adds zero work to initial hydration,
 * while capturing any early `beforeinstallprompt` event.
 */
export function InstallFooterButton() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleHandle: number | undefined;
    let usedIdle = false;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      (window as Window & { __mtDeferredInstallPrompt?: Event }).__mtDeferredInstallPrompt = event;
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const arm = () => {
      if (typeof window.requestIdleCallback === 'function') {
        usedIdle = true;
        idleHandle = window.requestIdleCallback(() => setReady(true), { timeout: 3000 });
      } else {
        idleHandle = globalThis.setTimeout(() => setReady(true), 1000) as unknown as number;
      }
    };

    if (document.readyState === 'complete') {
      arm();
    } else {
      window.addEventListener('load', arm, { once: true });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('load', arm);
      if (idleHandle !== undefined) {
        if (usedIdle) window.cancelIdleCallback(idleHandle);
        else globalThis.clearTimeout(idleHandle);
      }
    };
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <LazyInstallMenuButton />
    </Suspense>
  );
}
