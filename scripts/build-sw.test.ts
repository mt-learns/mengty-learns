import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildSwManifest } from './build-sw.mjs';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('build-sw', () => {
  it('writes sw-manifest.json with version, shell routes, and small static assets', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-sw-test-'));
    tempDirs.push(tmp);

    fs.mkdirSync(path.join(tmp, 'public'), { recursive: true });
    fs.mkdirSync(path.join(tmp, 'app', 'offline'), { recursive: true });
    fs.mkdirSync(path.join(tmp, '.next', 'static', 'chunks'), { recursive: true });
    fs.mkdirSync(path.join(tmp, '.next', 'static', 'css'), { recursive: true });

    fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ version: '0.2.0' }));
    fs.writeFileSync(path.join(tmp, '.next', 'BUILD_ID'), 'build123');
    fs.writeFileSync(path.join(tmp, 'app', 'offline', 'page.tsx'), 'export default function Offline() {}');
    fs.writeFileSync(path.join(tmp, '.next', 'static', 'css', 'app.css'), 'body{}');
    fs.writeFileSync(path.join(tmp, '.next', 'static', 'chunks', 'small.js'), 'console.log(1);');
    fs.writeFileSync(
      path.join(tmp, '.next', 'static', 'chunks', 'huge-flow.js'),
      'x'.repeat(200 * 1024),
    );

    const outFile = path.join(tmp, 'public', 'sw-manifest.json');
    const manifest = buildSwManifest({ rootDir: tmp, outFile });

    expect(manifest.version).toBe('0.2.0-build123');
    expect(manifest.precache).toContain('/');
    expect(manifest.precache).toContain('/offline/');
    expect(manifest.precache).toContain('/review/');
    expect(manifest.precache).toContain('/cards.json');
    expect(manifest.precache).toContain('/_next/static/css/app.css');
    expect(manifest.precache).toContain('/_next/static/chunks/small.js');
    expect(manifest.precache).not.toContain('/_next/static/chunks/huge-flow.js');

    const disk = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    expect(disk.version).toBe('0.2.0-build123');
  });
});
