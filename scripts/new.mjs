import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const kind = args[0]; // note or concept
const targetPath = args[1]; // section/slug

if (!kind || !targetPath) {
  console.error('Usage: pnpm new <kind> <section>/<slug>');
  process.exit(1);
}

const templateMap = {
  concept: 'concept.mdx',
  lesson: 'lesson.mdx',
  note: 'note.mdx',
};
const templateName = templateMap[kind] ?? 'note.mdx';
const templatePath = path.join('content', '_templates', templateName);

if (!fs.existsSync(templatePath)) {
  console.error(`Template not found: ${templatePath}`);
  process.exit(1);
}

const parts = targetPath.split('/');
const section = parts[0];
const slug = parts.slice(1).join('/');

if (!section || !slug) {
  console.error('Invalid target path. Use <section>/<slug>');
  process.exit(1);
}

const destDir = path.join('content', 'docs', section);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const destFile = path.join(destDir, `${slug}.mdx`);
if (fs.existsSync(destFile)) {
  console.error(`File already exists: ${destFile}`);
  process.exit(1);
}

const title = slug
  .split('-')
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ');
const description = `Learn about ${title.toLowerCase()}.`;
const date = new Date().toISOString().split('T')[0];

let content = fs.readFileSync(templatePath, 'utf8');
content = content
  .replaceAll('{{title}}', title)
  .replaceAll('{{description}}', description)
  .replaceAll('{{date}}', date)
  .replaceAll('{{slug}}', slug);

fs.writeFileSync(destFile, content);
console.log(`Created new page at ${destFile}`);
