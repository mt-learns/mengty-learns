'use client';

import { useState } from 'react';
import { Tile, SectionIcon } from '@/components/ios/tile';
import { SegmentedControl } from '@/components/ios/segmented-control';

type Project = {
  title: string;
  description: string;
  tags: string[];
  url: string;
  github: string;
};

export function ProjectsFilter({ topics, projects }: { topics: string[]; projects: Project[] }) {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.tags.includes(filter));

  return (
    <>
      <div className="mb-8">
        <SegmentedControl items={topics} active={filter} onChange={setFilter} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((p) => (
          <Tile
            key={p.title}
            title={p.title}
            description={p.description}
            href={p.url}
            badge={p.tags[0]}
            icon={<SectionIcon name="project" />}
          />
        ))}
      </div>
      <noscript>
        <div className="mt-6 text-sm text-muted-foreground">Topic filter requires JavaScript. Showing all projects.</div>
      </noscript>
    </>
  );
}