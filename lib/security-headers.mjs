// Response headers for every route. Single source of truth for both places
// Cloudflare needs them (see docs/deploy/CLOUDFLARE-WORKERS-PLAN.md, D7):
//   - next.config.mjs headers(): responses the Worker builds (all HTML pages,
//     RSC payloads, route handlers). Cloudflare's _headers file does NOT
//     apply to Worker responses.
//   - public/_headers: files served straight from Workers Static Assets
//     (/_next/static/*, public/), which never reach the Worker or next.config.
// lib/security-headers.test.ts fails if public/_headers drifts from this list.

/**
 * CSP, as strict as a statically pre-rendered Next.js app allows:
 * - script-src needs 'unsafe-inline': Next streams the RSC payload in inline
 *   <script> tags (self.__next_f.push) and the theme script is inline. Pages are
 *   pre-rendered at build time, so per-request nonces are impossible, and the
 *   inline payloads differ on every page, so hashes are impractical. No
 *   'unsafe-eval' and no third-party script origins.
 * - style-src needs 'unsafe-inline': React Flow, motion and Fumadocs set
 *   inline style attributes.
 * Everything else is same-origin only.
 */
export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/** @type {{ key: string, value: string }[]} */
export const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  // No `preload` until the owner decides (it is hard to undo).
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  // Legacy twin of frame-ancestors 'none' for old browsers.
  { key: 'X-Frame-Options', value: 'DENY' },
];

/** Hashed build assets: safe to cache forever. */
export const immutableCache = 'public, max-age=31536000, immutable';
