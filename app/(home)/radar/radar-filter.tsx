'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { GroupedList } from '@/components/ios/grouped-list';
import { SegmentedControl } from '@/components/ios/segmented-control';

export type RadarRing = 'adopt' | 'trial' | 'assess' | 'hold';
export type RadarQuadrant = 'tools' | 'platforms' | 'techniques' | 'languages';

export interface RadarEntryItem {
  slug: string;
  title: string;
  ring: RadarRing;
  quadrant: RadarQuadrant;
  what: string;
  why: string;
  action: string;
  updated: string;
  sources: { title: string; url: string }[];
  related: { slug: string; title: string; url: string }[];
}

const QUADRANTS = ['All', 'Tools', 'Platforms', 'Techniques', 'Languages'] as const;

const RING_ORDER: RadarRing[] = ['adopt', 'trial', 'assess', 'hold'];

const RING_META: Record<RadarRing, { label: string; description: string }> = {
  adopt: {
    label: 'Adopt',
    description: 'Default choices I use in production and recommend.',
  },
  trial: {
    label: 'Trial',
    description: 'Worth pursuing in labs or low-risk projects to build confidence.',
  },
  assess: {
    label: 'Assess',
    description: 'Worth exploring to understand where it fits.',
  },
  hold: {
    label: 'Hold',
    description: 'Avoid for new work; phase out where practical.',
  },
};

export function RadarFilter({ entries }: { entries: RadarEntryItem[] }) {
  const [quadrant, setQuadrant] = useState<string>('All');

  const filtered =
    quadrant === 'All'
      ? entries
      : entries.filter((entry) => entry.quadrant === quadrant.toLowerCase());

  const hasAny = filtered.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <SegmentedControl
        items={[...QUADRANTS]}
        active={quadrant}
        onChange={setQuadrant}
      />

      {!hasAny ? (
        <div className="rounded-card border border-border bg-card p-8 text-center text-subheadline text-muted-foreground">
          No radar entries in this quadrant yet.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {RING_ORDER.map((ring) => {
            const items = filtered.filter((entry) => entry.ring === ring);
            if (items.length === 0) return null;

            return (
              <GroupedList
                key={ring}
                header={`${RING_META[ring].label} (${items.length})`}
                footer={RING_META[ring].description}
              >
                {items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex flex-col gap-2 px-4 py-3 min-h-tap"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <h3 className="text-body font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <span className="inline-flex items-center rounded-pill bg-secondary px-2.5 py-0.5 text-caption-1 font-medium text-secondary-foreground capitalize">
                          {item.quadrant}
                        </span>
                      </div>
                      <span className="text-caption-1 text-label-tertiary">
                        {item.updated}
                      </span>
                    </div>

                    <p className="text-subheadline text-muted-foreground">
                      <span className="text-foreground">{item.what}</span> — {item.why}
                    </p>
                    <p className="text-footnote text-muted-foreground">
                      <span className="font-medium text-foreground">Action:</span> {item.action}
                    </p>

                    {(item.related.length > 0 || item.sources.length > 0) && (
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {item.related.map((rel) => (
                          <Link
                            key={rel.slug}
                            href={rel.url}
                            className="inline-flex items-center gap-1 min-h-tap sm:min-h-0 text-footnote font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-control"
                          >
                            <span>Note: {rel.title}</span>
                            <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
                          </Link>
                        ))}
                        {item.sources.map((src) => (
                          <a
                            key={src.url}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 min-h-tap sm:min-h-0 text-footnote text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-control"
                          >
                            <span>{src.title}</span>
                            <ExternalLink className="size-4" strokeWidth={1.75} aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </GroupedList>
            );
          })}
        </div>
      )}

      <noscript>
        <p className="text-footnote text-muted-foreground">
          Quadrant filtering requires JavaScript. Showing all radar entries.
        </p>
      </noscript>
    </div>
  );
}
