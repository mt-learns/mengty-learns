'use client';
import { useState } from 'react';

export function SegmentedControl({ items, active, onChange }: { items: string[]; active: string; onChange: (item: string) => void }) {
  return (
    <div
      className="flex w-full flex-wrap gap-0.5 p-1 rounded-control bg-secondary text-secondary-foreground sm:inline-flex sm:w-auto"
      data-slot="tabs-list"
      data-variant="default"
    >
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`px-3 sm:px-4 py-1.5 rounded-md text-footnote sm:text-sm font-medium whitespace-nowrap transition-all motion-reduce:transition-none ${active === item ? 'bg-background text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          data-slot="tabs-trigger"
          data-state={active === item ? 'active' : 'inactive'}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
