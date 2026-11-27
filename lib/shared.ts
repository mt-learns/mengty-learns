import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Mengty Learns';
export const siteUrl = 'https://learn.limmengty.com';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';

export const gitConfig = {
  user: 'mengty',
  repo: 'mengtylearns',
  branch: 'main',
};

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
