// Resolves the Shiki themes Fumadocs uses by default (github-light / github-dark)
// and computes, for every token colour that falls under 4.5:1 on our code
// background, the nearest same-hue colour that passes.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { contrast, ensureContrast } from './color.mjs';

export const CODE_BG = { light: '#F5F5F2', dark: '#13161B' };
export const CODE_TARGET = 4.6; // a hair over 4.5 so rounding never flips a pair

async function loadTheme(name) {
  // pnpm does not hoist shiki: resolve it the way fumadocs-core does.
  const core = fs.realpathSync(path.resolve('node_modules/fumadocs-core'));
  const shikiDir = fs.realpathSync(path.join(core, '..', 'shiki'));
  const file = createRequire(path.join(shikiDir, 'package.json')).resolve(`@shikijs/themes/${name}`);
  return (await import(pathToFileURL(file).href)).default;
}

function themeColours(theme) {
  const set = new Set();
  const fg = theme.colors?.['editor.foreground'];
  if (fg) set.add(fg.toUpperCase());
  for (const tc of theme.tokenColors ?? []) {
    const c = tc.settings?.foreground;
    if (c && /^#[0-9a-f]{6}$/i.test(c)) set.add(c.toUpperCase());
  }
  return [...set];
}

/** @returns {Promise<{ mode: 'light'|'dark', theme: string, colour: string, fixed: string, before: number, after: number }[]>} */
export async function codeColourReport() {
  const rows = [];
  for (const [mode, theme] of [
    ['light', 'github-light'],
    ['dark', 'github-dark'],
  ]) {
    const t = await loadTheme(theme);
    for (const colour of themeColours(t)) {
      const fixed = ensureContrast(colour, CODE_BG[mode], CODE_TARGET);
      rows.push({
        mode,
        theme,
        colour,
        fixed,
        before: contrast(colour, CODE_BG[mode]),
        after: contrast(fixed, CODE_BG[mode]),
      });
    }
  }
  return rows;
}
