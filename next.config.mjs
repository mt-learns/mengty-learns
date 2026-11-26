import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // No `output: 'export'`: OpenNext transforms a normal `next build`. Every
  // route is still pre-rendered at build time (see the route table).
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

export default withMDX(config);

// Makes Cloudflare bindings available to `next dev`.
initOpenNextCloudflareForDev();
