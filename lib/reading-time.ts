import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');

/**
 * Compute estimated reading time in minutes at build time from the raw MDX file.
 * Strips YAML frontmatter and JSX/HTML tags, then divides word count by 200 wpm.
 */
export function computeReadingMinutes(pagePath: string): number {
  try {
    const raw = fs.readFileSync(path.join(DOCS_DIR, pagePath), 'utf8');
    const withoutFrontmatter = raw.replace(/^---[\s\S]*?---\s*/, '');
    const withoutTags = withoutFrontmatter
      .replace(/<[^>]+>/g, ' ')
      .replace(/```[\s\S]*?```/g, (block) => block.replace(/[`{}()[\]]/g, ' '));
    const words = withoutTags.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  } catch {
    return 1;
  }
}
