'use client';

import { useEffect } from 'react';

export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((reg) => {
        registration = reg;
      })
      .catch(() => {
        // Registration can fail in private/in-app browsers; the site still works normally.
      });

    const checkUpdate = () => {
      registration?.update().catch(() => {});
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkUpdate();
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}
