import type { Metadata } from 'next';
import { LargeTitle } from '@/components/ios/tile';
import { radarSource, source } from '@/lib/source';
import { RadarFilter, type RadarEntryItem } from './radar-filter';

export const metadata: Metadata = {
  title: 'Tech Radar',
  description: 'Personal technology radar: Adopt, Trial, Assess, and Hold.',
};

export default function RadarPage() {
  const entries: RadarEntryItem[] = radarSource
    .getPages()
    .map((entry) => {
      const relatedLinks = (entry.data.related ?? []).flatMap((slug) => {
        const doc = source.getPage(slug.split('/'));
        return doc ? [{ slug, title: doc.data.title, url: doc.url }] : [];
      });

      return {
        slug: entry.slugs.join('/'),
        title: entry.data.title,
        ring: entry.data.ring,
        quadrant: entry.data.quadrant,
        what: entry.data.what,
        why: entry.data.why,
        action: entry.data.action,
        updated: entry.data.updated,
        sources: entry.data.sources ?? [],
        related: relatedLinks,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="container max-w-screen-xl px-4 py-12">
      <LargeTitle subtitle="Tools, platforms, techniques, and languages I actively track — grouped by ring.">
        Tech Radar
      </LargeTitle>
      <RadarFilter entries={entries} />
    </div>
  );
}
