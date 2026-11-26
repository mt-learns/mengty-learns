// Next 16's static export writes segment prefetch payloads as nested folders
// (out/__next.(home)/__PAGE__.txt), while the client router requests the
// dot-joined name (/__next.(home).__PAGE__.txt). A plain static host then
// answers 404 and the browser logs console errors on every page. This copies
// each nested payload to its flat name next to the folder. Run after `next build`.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'out');
let copied = 0;

/** Copy every .txt under `dir` (a __next.* folder) to `parent/<name>.<sub>.<file>`. */
function flatten(dir, name, parent) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const joined = `${name}.${entry.name}`;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) flatten(full, joined, parent);
    else if (entry.name.endsWith('.txt')) {
      const target = path.join(parent, joined);
      if (!fs.existsSync(target)) {
        fs.copyFileSync(full, target);
        copied++;
      }
    }
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith('__next.')) flatten(full, entry.name, dir);
    else if (entry.name !== '_next') walk(full);
  }
}

if (!fs.existsSync(root)) {
  console.error(`No ${root}; run next build first`);
  process.exit(1);
}
walk(root);
console.log(`flatten-rsc: wrote ${copied} prefetch payload(s)`);
