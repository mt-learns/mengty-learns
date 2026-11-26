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
import { Illustration } from '@/components/illustrations';

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  const page = source.getPage(resolvedParams.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = `/llms.mdx${page.url}.md`;

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
      <OutdatedBanner verified={page.data.verified} status={page.data.status} />
      <div className="flex justify-between items-start gap-4 mb-2">
        <div>
          <DocsTitle>{page.data.title}</DocsTitle>
          <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
        </div>
        <MarkDone slug={page.url} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground my-2">
        {page.data.type && (
          <span className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 font-medium capitalize">
            {page.data.type}
          </span>
        )}
        {page.data.level && (
          <span className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 font-medium capitalize">
            {page.data.level}
          </span>
        )}
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
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${encodeURI(page.path)}`}
        />
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
      <PageFooter related={page.data.related} sources={page.data.sources} slug={page.url} />
    </DocsPage>
  );
}

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
