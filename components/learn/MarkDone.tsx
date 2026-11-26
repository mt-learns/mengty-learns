'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MarkDone({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('mt-completed-v1') || '{}');
    if (completed[slug]) {
      setDone(true);
    }
  }, [slug]);

  const toggle = () => {
    const completed = JSON.parse(localStorage.getItem('mt-completed-v1') || '{}');
    if (done) {
      delete completed[slug];
      setDone(false);
    } else {
      completed[slug] = true;
      setDone(true);
    }
    localStorage.setItem('mt-completed-v1', JSON.stringify(completed));
  };

  return (
    <Button
      variant={done ? 'default' : 'outline'}
      onClick={toggle}
      className="min-h-tap rounded-control"
    >
      {done ? (
        <span className="inline-flex items-center gap-1.5">
          <Check className="size-4" strokeWidth={1.75} aria-hidden="true" />
          <span>Completed</span>
        </span>
      ) : (
        'Mark as done'
      )}
    </Button>
  );
}
