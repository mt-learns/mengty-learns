import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import matter from 'gray-matter';

const docsDir = path.join('content', 'docs');
const cards = [];

function extractTakeawayCards(body, relativeSlug, title) {
  const regex = /<KeyTakeaways\b[^>]*\bitems=\{(\[[\s\S]*?\])\}[^>]*\/>/g;
  let match;
  let offset = 0;
  while ((match = regex.exec(body)) !== null) {
    try {
      const items = vm.runInNewContext(`(${match[1]})`, Object.create(null), { timeout: 100 });
      if (!Array.isArray(items)) continue;
      items.forEach((item, idx) => {
        if (typeof item === 'string') {
          cards.push({
            id: `${relativeSlug}-kt-${offset + idx}`,
            slug: relativeSlug,
            title,
            q: `Key takeaway #${offset + idx + 1} from ${title}`,
            a: item,
          });
        } else if (item && typeof item === 'object') {
          const q = item.card?.q ?? `Key takeaway #${offset + idx + 1} from ${title}`;
          const a = item.card?.a ?? (item.detail ? `${item.point} — ${item.detail}` : item.point);
          if (q && a) {
            cards.push({
              id: `${relativeSlug}-kt-${offset + idx}`,
              slug: relativeSlug,
              title,
              q,
              a,
            });
          }
        }
      });
      offset += items.length;
    } catch {
      // Skip malformed JSX literal
    }
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.mdx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const { data, content: body } = matter(content);
      if (data.status === 'draft') continue;
      const relativeSlug = path
        .relative(docsDir, fullPath)
        .replace(/\\.mdx$/, '')
        .replace(/\\/g, '/');

      if (data.cards && Array.isArray(data.cards)) {
        data.cards.forEach((c, idx) => {
          cards.push({
            id: `${relativeSlug}-${idx}`,
            slug: relativeSlug,
            title: data.title || relativeSlug,
            q: c.q,
            a: c.a,
          });
        });
      }
      extractTakeawayCards(body, relativeSlug, data.title || relativeSlug);
    }
  }
}

if (fs.existsSync(docsDir)) {
  walk(docsDir);
}

const publicDir = path.join('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'cards.json'), JSON.stringify(cards, null, 2));
fs.writeFileSync(path.join(publicDir, 'card-ids.json'), JSON.stringify(cards.map((c) => c.id)));
console.log(`Built ${cards.length} cards into public/cards.json`);
