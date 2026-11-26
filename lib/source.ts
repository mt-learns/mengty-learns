import { llms, loader } from 'fumadocs-core/source';
import { docsRoute } from './shared';
import { defineCollections, defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

const frontmatterSchema = pageSchema.extend({
  type: z.enum(['tutorial', 'how-to', 'reference', 'explanation']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string()).default([]),
  tested_with: z.record(z.string(), z.string()).optional(),
  status: z.enum(['draft', 'stable', 'outdated']).default('stable'),
  updated: z.string().optional(),
  verified: z.string().optional(),
  kind: z.enum(['note', 'concept', 'cheatsheet', 'lab', 'decision', 'postmortem', 'radar', 'digest']).default('note'),
  cards: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  related: z.array(z.string()).default([]),
  sources: z.array(z.object({ title: z.string(), url: z.string() })).default([]),
});

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
  // link to the files under `/llms.mdx`
  renderUrl: (item) => (/^\/.*\.(md|txt)$/.test(item.url) ? `/llms.mdx${item.url}` : item.url),
});

const radarSchema = pageSchema.extend({
  ring: z.enum(['adopt', 'trial', 'assess', 'hold']),
  quadrant: z.enum(['tools', 'platforms', 'techniques', 'languages']),
  what: z.string().min(1),
  why: z.string().min(1),
  action: z.string().min(1),
  updated: z.string().min(1),
  sources: z.array(z.object({ title: z.string().min(1), url: z.string().url() })).default([]),
  related: z.array(z.string()).default([]),
});

const radar = defineCollections({
  type: 'doc',
  dir: 'content/radar',
  schema: radarSchema,
});

export const radarSource = loader({
  baseUrl: '/radar',
  source: radar.toFumadocsSource(),
});
