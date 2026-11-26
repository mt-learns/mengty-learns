import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import { createMDX } from 'fumadocs-mdx/next';

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
};

export default withMDX(config);

// Makes Cloudflare bindings available to `next dev`.
initOpenNextCloudflareForDev();
