'use client';

import { useState, useEffect } from 'react';
import { Flame, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createEmptyCard, Rating, fsrs, generatorParameters } from 'ts-fsrs';

interface CardItem {
  id: string;
  slug: string;
  title: string;
  q: string;
  a: string;
}

export function ReviewClient({ cards }: { cards: CardItem[] }) {
  const [reviewState, setReviewState] = useState<Record<string, any>>({});
  const [dueCards, setDueCards] = useState<CardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [jsonInput, setJsonInput] = useState('');

  const f = fsrs(generatorParameters({}));

  useEffect(() => {
    const saved = localStorage.getItem('mt-review-v1');
    const state = saved ? JSON.parse(saved) : {};
    setReviewState(state);

    const now = new Date().getTime();
    const due = cards.filter((c) => {
      const cardState = state[c.id];
      if (!cardState) return true;
      return new Date(cardState.due).getTime() <= now;
    });
    setDueCards(due);

    const savedStreak = localStorage.getItem('mt-streak-v1');
    if (savedStreak) setStreak(parseInt(savedStreak, 10));
  }, [cards]);

  const handleGrade = (rating: number) => {
    const cardItem = dueCards[currentIndex];
    const now = new Date();
    const existing = reviewState[cardItem.id];

    const fsrsCard = existing ? existing : createEmptyCard(now);
    const scheduling = f.repeat(fsrsCard, now);
    const updatedCard = (scheduling as unknown as Record<number, any>)[rating].card;

    const newState = {
      ...reviewState,
      [cardItem.id]: updatedCard,
    };
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
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.state) {
        setReviewState(parsed.state);
        localStorage.setItem('mt-review-v1', JSON.stringify(parsed.state));
      }
      if (typeof parsed.streak === 'number') {
        setStreak(parsed.streak);
        localStorage.setItem('mt-streak-v1', parsed.streak.toString());
      }
      alert('Imported successfully!');
    } catch (e) {
      alert('Invalid JSON');
    }
  };

  const currentCard = dueCards[currentIndex];

  return (
    <div className="space-y-8">
      <div className="flex gap-4 items-center bg-card p-4 rounded-card border">
        <div>
          <span className="text-subheadline text-muted-foreground block">Due Today</span>
          <span className="text-2xl font-bold font-headline">{dueCards.length - currentIndex}</span>
        </div>
        <div className="border-l pl-4">
          <span className="text-subheadline text-muted-foreground block">Streak</span>
          <span className="inline-flex items-center gap-1.5 text-2xl font-bold font-headline">
            <Flame className="size-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span>{streak}</span>
          </span>
        </div>
      </div>

      {currentCard && currentIndex < dueCards.length ? (
        <div className="rounded-card border bg-card p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Card {currentIndex + 1} of {dueCards.length}</span>
            <span className="capitalize">{currentCard.slug.split('/')[0]}</span>
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
              <Button variant="destructive" onClick={() => handleGrade(Rating.Again)} className="min-h-tap rounded-control">
                Again
              </Button>
              <Button variant="outline" onClick={() => handleGrade(Rating.Hard)} className="min-h-tap rounded-control">
                Hard
              </Button>
              <Button variant="secondary" onClick={() => handleGrade(Rating.Good)} className="min-h-tap rounded-control">
                Good
              </Button>
              <Button onClick={() => handleGrade(Rating.Easy)} className="min-h-tap rounded-control bg-primary text-primary-foreground">
                Easy
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-card border bg-card p-12 text-center space-y-4">
          <h2 className="inline-flex items-center justify-center gap-2 text-2xl font-bold font-headline">
            <PartyPopper className="size-6 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span>All caught up!</span>
          </h2>
          <p className="text-muted-foreground">You have no more flashcards due for review right now.</p>
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
      </div>
    </div>
  );
}
