import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map((page) => ({
    url: `${siteUrl}${page.url}`,
    lastModified: page.data.updated ? new Date(page.data.updated) : new Date(),
  }));

  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/docs`, lastModified: new Date() },
    { url: `${siteUrl}/projects`, lastModified: new Date() },
    { url: `${siteUrl}/about`, lastModified: new Date() },
    ...pages,
  ];
}