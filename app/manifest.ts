import type { MetadataRoute } from 'next';
import { appName } from '@/lib/shared';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: 'Mengty',
    description:
      'See how infrastructure really works: notes, animated flows, labs that CI runs and flashcards for DevOps, architecture and security.',
    id: '/',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone'],
    orientation: 'any',
    background_color: '#FAFAF8',
    theme_color: '#FAFAF8',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-monochrome-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'monochrome',
      },
      {
        src: '/icon-monochrome-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'monochrome',
      },
    ],
    shortcuts: [
      {
        name: "Today's review",
        short_name: 'Review',
        url: '/review/?source=pwa-shortcut',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Docs',
        short_name: 'Docs',
        url: '/docs/?source=pwa-shortcut',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Radar',
        short_name: 'Radar',
        url: '/radar/?source=pwa-shortcut',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
    screenshots: [
      {
        src: '/screenshots/narrow.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Mengty Learns on mobile',
      },
      {
        src: '/screenshots/wide.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Mengty Learns on desktop',
      },
    ],
  };
}
