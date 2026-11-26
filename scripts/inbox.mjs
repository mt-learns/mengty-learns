/* global fetch, AbortSignal */
import fs from 'node:fs';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';

const FEEDS_PATH = path.join('inbox', 'feeds.json');
const SEEN_PATH = path.join('inbox', 'seen.json');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const outIndex = args.indexOf('--out');
const outPath = outIndex !== -1 ? args[outIndex + 1] : null;
const limitIndex = args.indexOf('--limit');
const maxPerFeed = limitIndex !== -1 ? Number(args[limitIndex + 1]) || 5 : 5;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function extractText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node.trim();
  if (typeof node === 'object' && '#text' in node) return String(node['#text']).trim();
  return String(node).trim();
}

function extractAtomLink(linkNode) {
  const links = toArray(linkNode);
  const alternate = links.find((l) => l?.['@_rel'] === 'alternate' || !l?.['@_rel']);
  const target = alternate || links[0];
  if (!target) return '';
  if (typeof target === 'string') return target.trim();
  return target['@_href'] ? String(target['@_href']).trim() : '';
}

function parseXmlFeed(xmlText) {
  const parsed = parser.parse(xmlText);

  if (parsed?.rss?.channel?.item) {
    return toArray(parsed.rss.channel.item).map((item) => ({
      id: extractText(item.guid) || extractText(item.link),
      title: extractText(item.title),
      url: extractText(item.link),
      date: extractText(item.pubDate),
    }));
  }

  if (parsed?.feed?.entry) {
    return toArray(parsed.feed.entry).map((entry) => ({
      id: extractText(entry.id) || extractAtomLink(entry.link),
      title: extractText(entry.title),
      url: extractAtomLink(entry.link),
      date: extractText(entry.updated) || extractText(entry.published),
    }));
  }

  return [];
}

function parseCisaKevJson(jsonText) {
  const data = JSON.parse(jsonText);
  const vulns = Array.isArray(data?.vulnerabilities) ? data.vulnerabilities : [];
  return vulns.slice(0, maxPerFeed).map((v) => ({
    id: v.cveID,
    title: `${v.cveID}: ${v.vendorProject} ${v.product} — ${v.vulnerabilityName}`,
    url: `https://nvd.nist.gov/vuln/detail/${v.cveID}`,
    date: v.dateAdded || '',
  }));
}

async function fetchFeed(feed) {
  if (feed.verified === false) {
    return { feed, items: [], skipped: 'unverified' };
  }

  try {
    const res = await fetch(feed.url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'mengtylearns-inbox/1.0' },
    });
    if (!res.ok) {
      return { feed, items: [], error: `HTTP ${res.status}` };
    }
    const body = await res.text();
    const items = feed.type === 'json' ? parseCisaKevJson(body) : parseXmlFeed(body);
    return {
      feed,
      items: items.filter((item) => item.title && item.url).slice(0, maxPerFeed),
    };
  } catch (err) {
    return { feed, items: [], error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  const { feeds } = JSON.parse(fs.readFileSync(FEEDS_PATH, 'utf8'));
  const seenData = fs.existsSync(SEEN_PATH)
    ? JSON.parse(fs.readFileSync(SEEN_PATH, 'utf8'))
    : { seen: [] };
  const seenSet = new Set(Array.isArray(seenData.seen) ? seenData.seen : []);

  const results = await Promise.all(feeds.map(fetchFeed));

  const sections = [];
  const newlySeen = [];
  const warnings = [];

  for (const result of results) {
    if (result.skipped) {
      warnings.push(`- ${result.feed.name}: skipped (${result.skipped})`);
      continue;
    }
    if (result.error) {
      warnings.push(`- ${result.feed.name}: ${result.error}`);
      continue;
    }

    const fresh = result.items.filter((item) => !seenSet.has(item.id || item.url));
    if (fresh.length === 0) continue;

    const lines = fresh.map((item) => {
      newlySeen.push(item.id || item.url);
      const dateSuffix = item.date ? ` (${item.date.slice(0, 16)})` : '';
      return `- [${item.title}](${item.url})${dateSuffix}`;
    });

    sections.push(`### ${result.feed.name}\n\n${lines.join('\n')}`);
  }

  const header = `# Weekly RSS Inbox (${new Date().toISOString().slice(0, 10)})\n\n`;
  const body =
    sections.length > 0
      ? sections.join('\n\n')
      : '_No new items since last run._';
  const footer =
    warnings.length > 0
      ? `\n\n---\n\n### Feed notes\n\n${warnings.join('\n')}\n`
      : '\n';

  const markdown = `${header}${body}${footer}`;

  if (outPath) {
    fs.writeFileSync(outPath, markdown, 'utf8');
  }

  if (dryRun || !outPath) {
    console.log(markdown);
  }

  if (!dryRun && newlySeen.length > 0) {
    const updatedSeen = Array.from(new Set([...seenSet, ...newlySeen]));
    fs.writeFileSync(SEEN_PATH, JSON.stringify({ seen: updatedSeen }, null, 2) + '\n', 'utf8');
  }
}

main();
