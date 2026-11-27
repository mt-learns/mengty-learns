/* global fetch, setTimeout */
// Where the QA scripts point their browser: a running Worker preview.
//   --url <base>  >  QA_URL env  >  http://localhost:8787 (`pnpm preview`)
// The scripts no longer serve out/ themselves: since the OpenNext move the
// site is a Worker, so QA runs against `opennextjs-cloudflare preview`
// (wrangler dev, the same runtime as production).
export const DEFAULT_QA_URL = 'http://localhost:8787';

export function qaBaseUrl(argv = process.argv) {
  const i = argv.indexOf('--url');
  const raw = i > -1 ? argv[i + 1] : process.env.QA_URL || DEFAULT_QA_URL;
  return raw.replace(/\/+$/, '');
}

/** Resolve the base URL and wait (up to `timeoutMs`) until it answers. */
export async function waitForQaTarget(argv = process.argv, timeoutMs = 30_000) {
  const base = qaBaseUrl(argv);
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const res = await fetch(base + '/');
      await res.body?.cancel();
      return base;
    } catch {
      if (Date.now() > deadline) {
        throw new Error(
          `No server at ${base}. Start the Worker preview first (\`pnpm preview\`, or ` +
            '`pnpm exec opennextjs-cloudflare preview --port 8787` after a build), or pass --url <base>.'
        );
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}
