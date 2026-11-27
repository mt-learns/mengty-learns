import fs from 'node:fs';
import path from 'node:path';
import { source } from '@/lib/source';
import { LearningMapLazy } from './LearningMapLazy';
import type { LearningMapItem } from './LearningMapClient';

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

const LEVEL_RANK: Record<string, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

function readMetaOrder(section: string): string[] {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(DOCS_DIR, section, 'meta.json'), 'utf8'));
    return Array.isArray(meta.pages) ? meta.pages : [];
  } catch {
    return [];
  }
}

/**
 * Server component that builds the ordered beginner -> advanced path for a
 * section and delegates completion state to LearningMapClient.
 */
export function LearningMap({ section }: { section: string }) {
  const order = readMetaOrder(section);
  const pages = source
    .getPages()
    .filter((page) => page.slugs[0] === section && page.slugs.length > 1)
    .sort((a, b) => {
      const la = LEVEL_RANK[a.data.level ?? 'intermediate'] ?? 1;
      const lb = LEVEL_RANK[b.data.level ?? 'intermediate'] ?? 1;
      if (la !== lb) return la - lb;
      const ia = order.indexOf(a.slugs[1] ?? '');
      const ib = order.indexOf(b.slugs[1] ?? '');
      const ra = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
      const rb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
      return ra - rb || a.data.title.localeCompare(b.data.title);
    });

  const items: LearningMapItem[] = pages.map((page) => ({
    url: page.url,
    title: page.data.title,
    level: page.data.level ?? 'intermediate',
    kind: page.data.kind ?? 'note',
  }));

  return (
    <section aria-label={`${section} learning map`} className="not-prose my-6 rounded-card border border-border bg-card p-5">
      <h2 className="mb-1 font-sans text-title-3 font-semibold text-foreground">Learning map</h2>
      {items.length === 0 ? (
        <div className="mt-3 rounded-panel border border-dashed border-border bg-grouped p-5 text-subheadline text-muted-foreground">
          Lessons for this section are coming soon. Once published, they will appear here in beginner-to-advanced order.
        </div>
      ) : (
        <LearningMapLazy items={items} />
      )}
    </section>
  );
}
