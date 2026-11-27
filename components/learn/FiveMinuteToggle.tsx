'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'mt-five-min-v1';

function markTldrElements() {
  const prose = document.querySelector('#nd-page .prose, main .prose');
  if (!prose) return false;

  let hasKeep = prose.querySelector('[data-five-min="keep"]') !== null;
  const children = Array.from(prose.children);
  let inTldr = false;

  for (const el of children) {
    if (el.tagName === 'H2') {
      const text = (el.textContent ?? '').trim().toLowerCase();
      if (text === 'tl;dr' || text === 'tldr' || text.startsWith('tl;dr')) {
        inTldr = true;
        el.setAttribute('data-five-min', 'keep');
        hasKeep = true;
        continue;
      } else {
        inTldr = false;
      }
    }
    if (inTldr) {
      el.setAttribute('data-five-min', 'keep');
      hasKeep = true;
    }
  }
  return hasKeep;
}

export function FiveMinuteToggle() {
  const [enabled, setEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) === '1';
      setEnabled(saved);
    } catch {
      // ignore storage errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (enabled) {
      const hasSummary = markTldrElements();
      if (hasSummary) {
        document.documentElement.setAttribute('data-five-min-mode', 'on');
      } else {
        document.documentElement.removeAttribute('data-five-min-mode');
      }
    } else {
      document.documentElement.removeAttribute('data-five-min-mode');
    }
    return () => {
      document.documentElement.removeAttribute('data-five-min-mode');
    };
  }, [enabled, hydrated]);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors',
        enabled
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-border bg-secondary/50 text-secondary-foreground hover:bg-accent',
      )}
    >
      <Clock className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      <span>5-min version</span>
    </button>
  );
}
