import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, immutableCache, securityHeaders } from './security-headers.mjs';

/** Parse a Cloudflare _headers file into { pattern: { name: value } }. */
function parseHeadersFile(text: string) {
  const rules: Record<string, Record<string, string>> = {};
  let current: Record<string, string> | null = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = rules[line.trim()] = {};
    } else if (current) {
      const i = line.indexOf(':');
      current[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return rules;
}

const rules = parseHeadersFile(fs.readFileSync(path.join(process.cwd(), 'public/_headers'), 'utf8'));

describe('public/_headers', () => {
  it('caches hashed build assets for a year, immutable', () => {
    expect(rules['/_next/static/*']).toEqual({ 'Cache-Control': immutableCache });
  });

  it('serves sw.js and sw-manifest.json with Cache-Control: no-cache', () => {
    expect(rules['/sw.js']).toEqual({
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/',
    });
    expect(rules['/sw-manifest.json']).toEqual({ 'Cache-Control': 'no-cache' });
  });

  it('sends exactly the security headers from lib/security-headers.mjs on every asset', () => {
    expect(rules['/*']).toEqual(Object.fromEntries(securityHeaders.map((h) => [h.key, h.value])));
  });

  it('stays within the Cloudflare limits (100 rules, 2000 chars per line)', () => {
    expect(Object.keys(rules).length).toBeLessThanOrEqual(100);
    for (const h of securityHeaders) expect(`  ${h.key}: ${h.value}`.length).toBeLessThan(2000);
  });
});

describe('content security policy', () => {
  const directives = Object.fromEntries(
    contentSecurityPolicy.split(';').map((d) => {
      const [name, ...values] = d.trim().split(/\s+/);
      return [name, values];
    })
  );

  it('blocks framing, plugins and base/form hijacking', () => {
    expect(directives['frame-ancestors']).toEqual(["'none'"]);
    expect(directives['object-src']).toEqual(["'none'"]);
    expect(directives['base-uri']).toEqual(["'self'"]);
    expect(directives['form-action']).toEqual(["'self'"]);
  });

  it('allows no eval and only the Cloudflare Web Analytics script origin', () => {
    expect(directives['script-src']).not.toContain("'unsafe-eval'");
    const origins = directives['script-src'].filter((v: string) => !v.startsWith("'"));
    expect(origins).toEqual(['https://static.cloudflareinsights.com']);
  });

  it('connects only to self and the Cloudflare Web Analytics endpoint', () => {
    expect(directives['connect-src']).toEqual(["'self'", 'https://cloudflareinsights.com']);
  });

  it('sets HSTS for a year without preload', () => {
    const hsts = securityHeaders.find((h) => h.key === 'Strict-Transport-Security')!.value;
    expect(hsts).toBe('max-age=31536000; includeSubDomains');
  });
});
