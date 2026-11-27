import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import { createMDX } from 'fumadocs-mdx/next';
import { securityHeaders } from './lib/security-headers.mjs';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // Standalone, not `export`: OpenNext transforms the standalone `next build`
  // output into a Worker. Every route is still pre-rendered at build time
  // (scripts/check-static-routes.mjs enforces it).
  output: 'standalone',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // Security headers on every response the Worker builds (HTML, RSC, route
  // handlers). Static assets get the same list from public/_headers.
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/sw-manifest.json',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },
};

export default withMDX(config);

// Makes Cloudflare bindings available to `next dev`.
initOpenNextCloudflareForDev();
