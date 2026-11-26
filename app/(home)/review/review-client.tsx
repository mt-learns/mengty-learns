'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Flame, PartyPopper } from 'lucide-react';
import { Illustration } from '@/components/illustrations';
import { Button } from '@/components/ui/button';

interface CardItem {
  id: string;
  slug: string;
  title: string;
  q: string;
  a: string;
}

const RATING = { Again: 1, Hard: 2, Good: 3, Easy: 4 } as const;

const SECTION_LABELS: Record<string, string> = {
  foundations: 'Foundations',
  containers: 'Containers',
  kubernetes: 'Kubernetes',
  iac: 'IaC',
  'ci-cd': 'CI/CD',
  gitops: 'GitOps',
  design: 'Design',
  architecture: 'Architecture',
  security: 'Security',
};

function sectionLabel(slug: string) {
  const key = slug.split('/')[0];
  return SECTION_LABELS[key] ?? key.replace(/-/g, ' ');
}

function dueFrom(cards: CardItem[], state: Record<string, any>) {
  const now = Date.now();
  return cards.filter((card) => {
    const cardState = state[card.id];
    return !cardState || new Date(cardState.due).getTime() <= now;
  });
}

let fsrsModule: Promise<typeof import('ts-fsrs')> | null = null;
function loadFsrs() {
  fsrsModule ??= import('ts-fsrs');
  return fsrsModule;
}

export function ReviewClient() {
  const [reviewState, setReviewState] = useState<Record<string, any>>({});
  const [cards, setCards] = useState<CardItem[]>([]);
  const [dueCards, setDueCards] = useState<CardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mt-review-v1');
    const state = saved ? JSON.parse(saved) : {};
    setReviewState(state);

    const savedStreak = localStorage.getItem('mt-streak-v1');
    if (savedStreak) setStreak(parseInt(savedStreak, 10));

    let cancelled = false;

    fetch('/cards.json')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<CardItem[]>;
      })
      .then((data) => {
        if (cancelled) return;
        setCards(data);
        setDueCards(dueFrom(data, state));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleGrade = async (rating: number) => {
    const cardItem = dueCards[currentIndex];
    if (!cardItem) return;

    const { createEmptyCard, fsrs, generatorParameters } = await loadFsrs();
    const scheduler = fsrs(generatorParameters({}));
    const now = new Date();
    const existing = reviewState[cardItem.id];
    const fsrsCard = existing ? existing : createEmptyCard(now);
    const scheduling = scheduler.repeat(fsrsCard, now);
    const updatedCard = (scheduling as unknown as Record<number, any>)[rating].card;

    const newState = { ...reviewState, [cardItem.id]: updatedCard };
    setReviewState(newState);
    localStorage.setItem('mt-review-v1', JSON.stringify(newState));

    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('mt-streak-v1', newStreak.toString());

    setShowAnswer(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const exportJson = () => {
    const data = JSON.stringify({ state: reviewState, streak });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mt-review-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.state) {
        setReviewState(parsed.state);
        localStorage.setItem('mt-review-v1', JSON.stringify(parsed.state));
        setDueCards(dueFrom(cards, parsed.state));
      }
      if (typeof parsed.streak === 'number') {
        setStreak(parsed.streak);
        localStorage.setItem('mt-streak-v1', parsed.streak.toString());
      }
      setImportStatus({
        kind: 'success',
        message: 'Backup imported. Your review schedule and streak were restored.',
      });
    } catch {
      setImportStatus({
        kind: 'error',
        message:
          'That is not a valid backup. Paste the JSON file you exported from this page.',
      });
    }
  };

  const currentCard = dueCards[currentIndex];

  return (
    <div className="space-y-8">
      <div className="flex gap-4 items-center bg-card p-4 rounded-card border">
        <div>
          <span className="text-subheadline text-muted-foreground block">Due Today</span>
          <span className="text-2xl font-bold font-headline">
            {Math.max(dueCards.length - currentIndex, 0)}
          </span>
        </div>
        <div className="border-l pl-4">
          <span className="text-subheadline text-muted-foreground block">Streak</span>
          <span className="inline-flex items-center gap-1.5 text-2xl font-bold font-headline">
            <Flame className="size-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span>{streak}</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div
          className="rounded-card border bg-card p-8 shadow-sm space-y-4"
          aria-busy="true"
          aria-live="polite"
        >
          <span className="sr-only">Loading your flashcards…</span>
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="h-11 w-full rounded-control bg-muted" />
        </div>
      ) : loadError ? (
        <div
          role="alert"
          className="rounded-card border border-destructive/25 bg-destructive-soft p-6 text-subheadline text-destructive-text"
        >
          <p className="font-headline">Could not load your flashcards.</p>
          <p className="mt-1 text-muted-foreground">
            The card data failed to load. Check your connection and reload the page.
          </p>
        </div>
      ) : currentCard && currentIndex < dueCards.length ? (
        <div className="rounded-card border bg-card p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>
              Card {currentIndex + 1} of {dueCards.length}
            </span>
            <span>{sectionLabel(currentCard.slug)}</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold font-headline">{currentCard.q}</h2>
            {showAnswer ? (
              <div className="p-4 rounded-panel bg-muted text-body whitespace-pre-wrap border">
                {currentCard.a}
              </div>
            ) : (
              <Button onClick={() => setShowAnswer(true)} className="min-h-tap rounded-control w-full">
                Show Answer
              </Button>
            )}
          </div>

          {showAnswer && (
            <div className="grid grid-cols-4 gap-2 pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => handleGrade(RATING.Again)}
                className="min-h-tap rounded-control"
              >
                Again
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGrade(RATING.Hard)}
                className="min-h-tap rounded-control"
              >
                Hard
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleGrade(RATING.Good)}
                className="min-h-tap rounded-control"
              >
                Good
              </Button>
              <Button
                onClick={() => handleGrade(RATING.Easy)}
                className="min-h-tap rounded-control bg-primary text-primary-foreground"
              >
                Easy
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-card border bg-card p-12 text-center space-y-4">
          <Illustration name="review-empty" size={256} className="mx-auto w-56 h-auto" decorative />
          <h2 className="inline-flex items-center justify-center gap-2 text-2xl font-bold font-headline">
            <PartyPopper className="size-6 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span>All caught up!</span>
          </h2>
          <p className="text-muted-foreground">
            You have no more flashcards due for review right now.
          </p>
        </div>
      )}

      <div className="rounded-card border bg-card p-6 space-y-4">
        <h2 className="text-lg font-bold font-headline">Backup & Restore</h2>
        <div className="flex gap-4">
          <Button onClick={exportJson} variant="outline" className="min-h-tap rounded-control">
            Export JSON
          </Button>
        </div>
        <div className="space-y-2">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste backup JSON here to import..."
            className="w-full h-24 p-3 rounded-panel border bg-field text-subheadline"
          />
          <Button onClick={importJson} variant="outline" className="min-h-tap rounded-control">
            Import JSON
          </Button>
        </div>
        {importStatus && (
          <div
            role={importStatus.kind === 'error' ? 'alert' : 'status'}
            aria-live={importStatus.kind === 'error' ? 'assertive' : 'polite'}
            className={`flex items-start gap-2 rounded-panel border p-3 text-subheadline ${
              importStatus.kind === 'success'
                ? 'border-success/25 bg-success-soft text-success-text'
                : 'border-destructive/25 bg-destructive-soft text-destructive-text'
            }`}
          >
            {importStatus.kind === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
