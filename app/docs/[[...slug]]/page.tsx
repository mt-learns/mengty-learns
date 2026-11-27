import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getPageImageUrl, gitConfig } from '@/lib/shared';
import { OutdatedBanner } from '@/components/learn/OutdatedBanner';
import { PageFooter } from '@/components/learn/PageFooter';
import { MarkDone } from '@/components/learn/MarkDone';
import { FiveMinuteToggle } from '@/components/learn/FiveMinuteToggle';
import { Illustration } from '@/components/illustrations';
import { StandaloneBackBar } from '@/components/pwa/standalone-ui';
import { computeReadingMinutes } from '@/lib/reading-time';

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  const page = source.getPage(resolvedParams.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = `/llms.mdx${page.url}.md`;
  const readingMinutes = computeReadingMinutes(page.path);

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        container: {
          role: 'navigation',
          'aria-label': 'On this page',
        },
      }}
    >
      <StandaloneBackBar />
      <OutdatedBanner verified={page.data.verified} status={page.data.status} />
      <div className="flex flex-col items-start gap-4 mb-2 sm:flex-row sm:justify-between">
        <div>
          <DocsTitle>{page.data.title}</DocsTitle>
          <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
        </div>
        <MarkDone slug={page.url} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground my-2">
        {page.data.level && (
          <span className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 font-medium capitalize">
            {page.data.level}
          </span>
        )}
        {page.data.cefr && (
          <span className="inline-flex items-center rounded-full bg-highlight-soft text-highlight-text px-2.5 py-0.5 font-semibold">
            CEFR {page.data.cefr}
          </span>
        )}
        <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 font-medium tabular-nums">
          {readingMinutes} min read
        </span>
        <span className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 font-medium capitalize">
          {page.data.kind ?? page.data.type ?? 'note'}
        </span>
        {page.data.tested_with && Object.keys(page.data.tested_with).length > 0 && (
          <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 font-medium">
            Tested with {Object.entries(page.data.tested_with).map(([k, v]) => `${k} ${v}`).join(', ')}
          </span>
        )}
        {page.data.updated && (
          <span className="inline-flex items-center text-muted-foreground px-1 py-0.5">
            Updated {new Date(page.data.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
      </div>
      <div className="flex flex-row flex-wrap gap-2 items-center border-b pb-6" data-print="hide">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${encodeURI(page.path)}`}
        />
        <FiveMinuteToggle />
      </div>
      {page.data.kind === 'lab' && (
        <div className="my-6 flex justify-center sm:justify-start">
          <Illustration name="lab-header" size={256} className="w-52 h-auto" decorative />
        </div>
      )}
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      {page.data.cards && page.data.cards.length > 0 && (
        <section
          aria-label="Flashcards"
          data-five-min="keep"
          data-print="cards"
          className="mt-8 rounded-card border border-border bg-card p-5"
        >
          <h2 className="font-sans text-headline font-semibold text-foreground">
            Flashcards ({page.data.cards.length})
          </h2>
          <ul className="mt-3 space-y-2.5">
            {page.data.cards.map((card, i) => (
              <li
                key={i}
                className="rounded-panel border border-border bg-grouped p-3.5 text-subheadline [break-inside:avoid]"
              >
                <p className="font-sans font-semibold text-foreground">{card.q}</p>
                <p className="mt-1 font-reading text-muted-foreground">{card.a}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <PageFooter related={page.data.related} sources={page.data.sources} slug={page.url} />
    </DocsPage>
  );
}

// Only the slugs from generateStaticParams exist; anything else is a static 404
// instead of an on-demand render in the Worker.
export const dynamicParams = false;

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const page = source.getPage(resolvedParams.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
