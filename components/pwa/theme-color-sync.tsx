'use client';

import { useEffect } from 'react';

/**
 * Syncs `<meta name="theme-color">` whenever the `.dark` class on `<html>`
 * changes, so standalone status bars update on in-app theme toggle (R5).
 * Deferred past initial hydration via requestIdleCallback to avoid <head>
 * mutations during TBT/LCP.
 */
export function ThemeColorSync() {
  useEffect(() => {
    let observer: MutationObserver | undefined;
    let idleHandle: number | undefined;
    let usedIdle = false;

    const sync = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const color = isDark ? '#0E1013' : '#FAFAF8';
      let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
      if (meta && meta.content === color) return;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.content = color;
    };

    const start = () => {
      sync();
      observer = new MutationObserver(sync);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    };

    if (typeof window.requestIdleCallback === 'function') {
      usedIdle = true;
      idleHandle = window.requestIdleCallback(start, { timeout: 2000 });
    } else {
      idleHandle = globalThis.setTimeout(start, 100) as unknown as number;
    }

    return () => {
      if (idleHandle !== undefined) {
        if (usedIdle) window.cancelIdleCallback(idleHandle);
        else globalThis.clearTimeout(idleHandle);
      }
      observer?.disconnect();
    };
  }, []);

  return null;
}
