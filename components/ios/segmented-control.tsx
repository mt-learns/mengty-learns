'use client';
import { useState } from 'react';

export function SegmentedControl({ items, active, onChange }: { items: string[]; active: string; onChange: (item: string) => void }) {
  return (
    <div className="inline-flex p-1 rounded-control bg-secondary text-secondary-foreground" data-slot="tabs-list" data-variant="default">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${active === item ? 'bg-background text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          data-slot="tabs-trigger"
          data-state={active === item ? 'active' : 'inactive'}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
