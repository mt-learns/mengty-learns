import { createElement } from 'react';
import { llms, loader } from 'fumadocs-core/source';
import { docsRoute } from './shared';
import { defineCollections, defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import {
  BookOpen,
  FileText,
  FlaskConical,
  Lightbulb,
  ListChecks,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import {
  SectionIcon,
  SECTION_ICON_NAMES,
  TrackIcon,
  TRACK_ICON_NAMES,
  type SectionIconName,
  type TrackIconName,
} from '@/components/illustrations';

const KIND_ICON_MAP: Record<string, typeof FileText> = {
  note: FileText,
  concept: Lightbulb,
  cheatsheet: ListChecks,
  lab: FlaskConical,
  decision: Scale,
  postmortem: ShieldAlert,
  lesson: BookOpen,
};

const frontmatterSchema = pageSchema.extend({
  type: z.enum(['tutorial', 'how-to', 'reference', 'explanation']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  cefr: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']).optional(),
  tags: z.array(z.string()).default([]),
  tested_with: z.record(z.string(), z.string()).optional(),
  status: z.enum(['draft', 'stable', 'outdated']).default('stable'),
  updated: z.string().optional(),
  verified: z.string().optional(),
  kind: z.enum(['note', 'concept', 'cheatsheet', 'lab', 'decision', 'postmortem', 'lesson', 'radar', 'digest']).default('note'),
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

const docsSource = docs.toFumadocsSource();
const filteredDocsSource =
  process.env.NODE_ENV === 'production'
    ? {
        ...docsSource,
        files: docsSource.files.filter(
          (file) => file.type !== 'page' || file.data.status !== 'draft'
        ),
      }
    : docsSource;

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: filteredDocsSource,
  icon(icon) {
    if (icon && (SECTION_ICON_NAMES as readonly string[]).includes(icon)) {
      return createElement(SectionIcon, {
        name: icon as SectionIconName,
        size: 24,
        decorative: true,
      });
    }
    if (icon && (TRACK_ICON_NAMES as readonly string[]).includes(icon)) {
      return createElement(TrackIcon, {
        name: icon as TrackIconName,
        size: 24,
        decorative: true,
      });
    }
  },
  plugins: [
    {
      name: 'kind-icons',
      transformPageTree: {
        file(node, filePath) {
          if (!filePath || node.icon) return node;
          const file = this.storage.read(filePath);
          if (!file || file.format !== 'page') return node;
          const kind = (file.data as { kind?: string }).kind ?? 'note';
          const Icon = KIND_ICON_MAP[kind];
          if (!Icon) return node;
          return {
            ...node,
            icon: createElement(Icon, {
              className: 'size-4 shrink-0 text-muted-foreground',
              strokeWidth: 1.75,
              'aria-hidden': true,
            }),
          };
        },
      },
    },
  ],
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

const digestSchema = pageSchema.extend({
  date: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(['draft', 'stable']).default('stable'),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        url: z.string().url(),
        why: z.string().min(1),
        action: z.string().min(1),
      })
    )
    .default([]),
});

const digest = defineCollections({
  type: 'doc',
  dir: 'content/digest',
  schema: digestSchema,
});

export const digestSource = loader({
  baseUrl: '/digest',
  source: digest.toFumadocsSource(),
});

export function getPublishedDigests() {
  return digestSource
    .getPages()
    .filter((entry) => process.env.NODE_ENV !== 'production' || entry.data.status !== 'draft')
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}
