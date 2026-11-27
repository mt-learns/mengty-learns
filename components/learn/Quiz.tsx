'use client';

import { useState, useEffect } from 'react';

interface QuizProps {
  questions: {
    question: string;
    options: {
      label: string;
      description: string;
      correct?: boolean;
    }[];
  }[];
}

export function Quiz({ questions }: QuizProps) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const handleSelect = (qIdx: number, optIdx: number) => {
    setSelected((prev) => ({ ...prev, [qIdx]: optIdx }));
    setRevealed((prev) => ({ ...prev, [qIdx]: true }));
  };

  return (
    <div className="my-6 rounded-card border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-bold font-headline mb-4">Check Yourself</h3>
      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={i} className="space-y-3">
            <p className="font-reading font-semibold text-body">{i + 1}. {q.question}</p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, j) => {
                const isSelected = selected[i] === j;
                const isRevealed = revealed[i];
                let borderClass = 'border-border';
                if (isRevealed) {
                  if (opt.correct) borderClass = 'border-primary bg-primary/5 text-primary';
                  else if (isSelected) borderClass = 'border-destructive bg-destructive/5 text-destructive';
                }

                return (
                  <button
                    key={j}
                    onClick={() => handleSelect(i, j)}
                    className={`font-reading text-left p-3 rounded-panel border transition-all motion-reduce:transition-none ${borderClass} hover:border-primary/50 min-h-tap`}
                  >
                    <span className="font-semibold block mb-0.5">{opt.label}</span>
                    <span className="text-muted-foreground text-subheadline">{opt.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
