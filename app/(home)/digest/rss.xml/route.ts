import { getPublishedDigests } from '@/lib/source';
import { appName, siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';
export const revalidate = false;

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function GET() {
  const digests = getPublishedDigests();
  const feedUrl = `${siteUrl}/digest/rss.xml`;

  const itemsXml = digests
    .map((entry) => {
      const link = `${siteUrl}${entry.url}`;
      const pubDate = new Date(entry.data.date).toUTCString();
      return `    <item>
      <title>${escapeXml(entry.data.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <description>${escapeXml(entry.data.summary)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${appName} — Digest`)}</title>
    <link>${escapeXml(`${siteUrl}/digest`)}</link>
    <description>${escapeXml('Biweekly 3–5 things that matter, in my own words, with source links.')}</description>
    <language>en-us</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
