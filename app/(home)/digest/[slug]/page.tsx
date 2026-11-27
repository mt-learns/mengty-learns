import { Container } from '@/components/layout/container';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { LargeTitle } from '@/components/ios/large-title';
import { GroupedList } from '@/components/ios/grouped-list';
import { getMDXComponents } from '@/components/mdx';
import { digestSource, getPublishedDigests } from '@/lib/source';

// Only the slugs from generateStaticParams exist; anything else is a static 404
// instead of an on-demand render in the Worker. Drafts are not built in
// production (they still render in `pnpm dev`, with the draft banner).
export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedDigests().map((page) => ({
    slug: page.slugs[0],
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = digestSource.getPage([slug]);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.summary,
  };
}

export default async function DigestEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = digestSource.getPage([slug]);
  if (!page) notFound();

  const MDX = page.data.body;
  const items = page.data.items ?? [];

  return (
    <Container className="py-12 md:py-16"><div className="max-w-screen-md">
      <div className="mb-6">
        <Link
          href="/digest"
          className="inline-flex items-center gap-1.5 min-h-tap text-footnote font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-control"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
          <span>All Digests</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-footnote tabular-nums text-muted-foreground">{page.data.date}</span>
        {page.data.status === 'draft' && (
          <span className="inline-flex items-center rounded-pill bg-secondary px-2.5 py-0.5 text-caption-1 font-medium text-secondary-foreground">
            Draft
          </span>
        )}
      </div>

      <LargeTitle subtitle={page.data.summary}>{page.data.title}</LargeTitle>

      {items.length > 0 && (
        <section className="mb-10">
          <GroupedList header={`Items (${items.length})`}>
            {items.map((item) => (
              <div key={item.url} className="flex flex-col gap-1.5 px-4 py-3 min-h-tap">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-body font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-control w-fit"
                >
                  <span>{item.title}</span>
                  <ExternalLink className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                </a>
                <p className="font-reading text-subheadline text-muted-foreground">{item.why}</p>
                <p className="font-reading text-footnote text-muted-foreground">
                  <span className="font-medium text-foreground">Action:</span> {item.action}
                </p>
              </div>
            ))}
          </GroupedList>
        </section>
      )}

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <MDX components={getMDXComponents()} />
      </article>
    </div></Container>
  );
}
