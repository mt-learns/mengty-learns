'use client';

import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isInAppBrowser, isIosSafari, isStandaloneMode } from '@/lib/pwa-install';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SESSIONS_KEY = 'mt-pwa-sessions-v1';
const SESSION_FLAG = 'mt-pwa-session-counted';
const DISMISSED_KEY = 'mt-pwa-install-dismissed-v1';

function useInstallState() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosSafari, setIosSafari] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent;
    if (isStandaloneMode() || isInAppBrowser(ua)) return;

    setEligible(true);
    setIosSafari(isIosSafari(ua, navigator.maxTouchPoints));

    try {
      if (localStorage.getItem(DISMISSED_KEY) === '1') {
        setDismissed(true);
      }
      if (!sessionStorage.getItem(SESSION_FLAG)) {
        const next = (parseInt(localStorage.getItem(SESSIONS_KEY) || '0', 10) || 0) + 1;
        localStorage.setItem(SESSIONS_KEY, String(next));
        sessionStorage.setItem(SESSION_FLAG, '1');
        setSessions(next);
      } else {
        setSessions(parseInt(localStorage.getItem(SESSIONS_KEY) || '0', 10) || 0);
      }
    } catch {
      // Ignore storage errors.
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setEligible(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Ignore storage errors.
    }
  };

  const triggerAndroidInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
      setEligible(false);
    }
  };

  return {
    eligible,
    iosSafari,
    canPromptAndroid: Boolean(deferredPrompt),
    sessions,
    dismissed,
    dismiss,
    triggerAndroidInstall,
  };
}

/** Compact "Install app" trigger for the site footer (shown only when installable). */
export function InstallMenuButton() {
  const { eligible, iosSafari, canPromptAndroid, triggerAndroidInstall } = useInstallState();
  const [showIosSheet, setShowIosSheet] = useState(false);

  if (!eligible || (!canPromptAndroid && !iosSafari)) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (canPromptAndroid) {
            void triggerAndroidInstall();
          } else {
            setShowIosSheet(true);
          }
        }}
        className="inline-flex min-h-tap items-center gap-1.5 text-subheadline text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline motion-reduce:transition-none"
      >
        <Download className="size-4" strokeWidth={1.75} aria-hidden="true" />
        <span>Install app</span>
      </button>

      {showIosSheet && <IosInstallSheet onClose={() => setShowIosSheet(false)} />}
    </>
  );
}

/** Shown on /review after 3 sessions (never on first visit, never in standalone/in-app). */
export function ReviewInstallBanner() {
  const {
    eligible,
    iosSafari,
    canPromptAndroid,
    sessions,
    dismissed,
    dismiss,
    triggerAndroidInstall,
  } = useInstallState();
  const [showIosSheet, setShowIosSheet] = useState(false);

  if (!eligible || dismissed || sessions < 3) return null;
  if (!canPromptAndroid && !iosSafari) return null;

  return (
    <div className="flex flex-col gap-3 rounded-card border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-headline font-semibold text-foreground">
          {iosSafari ? 'Add Mengty Learns to your Home Screen' : 'Install Mengty Learns'}
        </p>
        <p className="text-subheadline text-muted-foreground">
          {iosSafari
            ? 'Open flashcards full-screen and offline. Progress in Safari stays separate from the home-screen app — use Backup & Restore below to move it.'
            : 'Launch flashcards directly from your home screen and study offline.'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (canPromptAndroid) {
              void triggerAndroidInstall();
            } else {
              setShowIosSheet(true);
            }
          }}
          className="min-h-tap rounded-control px-4"
        >
          {iosSafari ? (
            <>
              <Share className="size-4" strokeWidth={1.75} aria-hidden="true" />
              <span>How to install</span>
            </>
          ) : (
            <>
              <Download className="size-4" strokeWidth={1.75} aria-hidden="true" />
              <span>Install app</span>
            </>
          )}
        </Button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install suggestion"
          className="inline-flex min-h-tap min-w-[44px] items-center justify-center rounded-control text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      {showIosSheet && <IosInstallSheet onClose={() => setShowIosSheet(false)} />}
    </div>
  );
}

function IosInstallSheet({ onClose }: { onClose: () => void }) {
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
