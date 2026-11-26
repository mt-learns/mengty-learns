import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// The site is fully pre-rendered (no ISR, no revalidation), so the read-only
// Workers Static Assets cache is enough: no R2, KV, D1, Queue or Tag Cache.
// See docs/deploy/CLOUDFLARE-WORKERS-PLAN.md (D3) and
// https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
