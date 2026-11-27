import { Container } from '@/components/layout/container';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { LargeTitle } from '@/components/ios/tile';
import { GroupedList, GroupedRow } from '@/components/ios/grouped-list';
import { getPublishedDigests } from '@/lib/source';

export const metadata: Metadata = {
  title: 'Digest',
  description: 'Biweekly 3–5 things that matter, in my own words, with source links.',
  alternates: {
    types: {
      'application/rss+xml': '/digest/rss.xml',
    },
  },
};

export default function DigestPage() {
  const digests = getPublishedDigests();

  return (
    <Container className="py-12 md:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <LargeTitle subtitle="Biweekly notes on 3–5 things that matter, in my own words.">
          Digest
        </LargeTitle>
        <Link
          href="/digest/rss.xml"
          className="inline-flex items-center gap-2 min-h-tap rounded-control border border-border bg-card px-4 py-2 text-footnote font-medium text-foreground hover:bg-muted transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Rss className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
          <span>RSS Feed</span>
        </Link>
      </div>

      {digests.length === 0 ? (
        <div className="rounded-card border border-border bg-card p-8 text-center">
          <p className="text-body font-medium text-foreground mb-1">No published digests yet</p>
          <p className="text-subheadline text-muted-foreground">
            Digests are published biweekly from the private RSS inbox. Subscribe via{' '}
            <Link href="/digest/rss.xml" className="text-link underline decoration-1 underline-offset-[3px] hover:text-link-hover">
              RSS
            </Link>{' '}
            or check the{' '}
            <Link href="/radar" className="text-link underline decoration-1 underline-offset-[3px] hover:text-link-hover">
              Tech Radar
            </Link>
            .
          </p>
        </div>
      ) : (
        <GroupedList header="All Digests (newest first)">
          {digests.map((digest) => (
            <GroupedRow
              key={digest.url}
              title={digest.data.title}
              description={digest.data.summary}
              href={digest.url}
              detail={digest.data.date}
            />
          ))}
        </GroupedList>
      )}
    </Container>
  );
}
