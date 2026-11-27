import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const docsDir = path.join('content', 'docs');
const cards = [];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.mdx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(content);
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
