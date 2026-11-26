// Bundles the Worker exactly as `wrangler deploy` would (--dry-run: no
// account, nothing uploaded), prints the size, writes it to the GitHub job
// summary, and fails above an early-warning threshold.
//   pnpm exec opennextjs-cloudflare build && node scripts/check-worker-size.mjs [--max-mib 48]
//
// Cloudflare's limit is 64 MiB *uncompressed* on Free and Paid; "There is no
// compressed size limit" (developers.cloudflare.com/workers/platform/limits,
// checked 2026-11-26). Older docs, including OpenNext's, still quote 3 MiB
// gzip for Free; gzip is printed for reference only.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const i = process.argv.indexOf('--max-mib');
const maxMiB = i > -1 ? Number(process.argv[i + 1]) : 48;
const LIMIT_MIB = 64;

const outdir = fs.mkdtempSync(path.join(os.tmpdir(), 'worker-size-'));
const res = spawnSync('pnpm', ['exec', 'wrangler', 'deploy', '--dry-run', '--outdir', outdir], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
  env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
});
fs.rmSync(outdir, { recursive: true, force: true });
const output = `${res.stdout}\n${res.stderr}`;
const m = output.match(/Total Upload:\s*([\d.]+)\s*KiB\s*\/\s*gzip:\s*([\d.]+)\s*KiB/);
if (res.status !== 0 || !m) {
  console.error(output);
  console.error('check-worker-size: wrangler dry run failed or printed no size');
  process.exit(1);
}

const mib = (kib) => Number(kib) / 1024;
const total = mib(m[1]);
const gzip = mib(m[2]);
const line = `Worker size: ${total.toFixed(2)} MiB uncompressed (limit ${LIMIT_MIB} MiB, gate ${maxMiB} MiB), ${gzip.toFixed(2)} MiB gzip (reference only)`;
console.log(line);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Worker size\n\n${line}\n\n`);
if (total > maxMiB) {
  console.error(`check-worker-size: ${total.toFixed(2)} MiB is over the ${maxMiB} MiB early-warning gate`);
  process.exit(1);
}
