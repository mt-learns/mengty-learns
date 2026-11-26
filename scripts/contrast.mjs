// Measures every text / UI pair of the "Ink & Jade" palette in both themes.
//   node scripts/contrast.mjs            -> prints the table, exits 1 on any failure
//   node scripts/contrast.mjs --markdown -> prints the DESIGN.md table
import fs from 'node:fs';
import { contrast, mixOklab, over, parseHex, toHex } from './lib/color.mjs';
import { CODE_BG, codeColourReport } from './lib/code-colors.mjs';

const css = fs.readFileSync('app/tokens.css', 'utf8');

function block(selectorStart) {
  const i = css.indexOf(selectorStart);
  if (i < 0) throw new Error(`No ${selectorStart} block in tokens.css`);
  const open = css.indexOf('{', i);
  const close = css.indexOf('}', open);
  const vars = {};
  for (const m of css.slice(open + 1, close).matchAll(/--([a-z0-9-]+):\s*([^;]+);/gi)) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
}

const light = block(':root,\n.light {');
const dark = { ...light, ...block('.dark {') };

/** Resolve a token or expression to an opaque RGB triple. `on` is the backdrop for translucent values. */
function resolve(vars, expr, on) {
  expr = expr.trim();
  const ref = expr.match(/^var\(--([a-z0-9-]+)\)$/i);
  if (ref) return resolve(vars, vars[ref[1]], on);
  if (expr.startsWith('#')) return parseHex(expr);
  if (vars[expr]) return resolve(vars, vars[expr], on);
  // Tailwind opacity modifier: token/NN = color-mix(in oklab, token NN%, transparent) over `on`.
  const tw = expr.match(/^([a-z0-9-]+)\/(\d+)$/i);
  if (tw) return over(resolve(vars, tw[1], on), Number(tw[2]) / 100, resolve(vars, on));
  const mix = expr.match(/^color-mix\(in oklab,\s*(.+?)\s+(\d+)%,\s*(.+)\)$/i);
  if (mix) {
    const a = resolve(vars, mix[1], on);
    const p = Number(mix[2]) / 100;
    if (mix[3] === 'transparent') return over(a, p, resolve(vars, on));
    return mixOklab(a, resolve(vars, mix[3], on), p);
  }
  throw new Error(`Cannot resolve ${expr}`);
}

// [foreground, background, kind, where it is used]
// kind: text (>= 4.5), ui (>= 3.0: icons, borders of controls, focus ring)
const PAIRS = [
  ['foreground', 'background', 'text', 'Body text on the page'],
  ['foreground', 'card', 'text', 'Body text on cards'],
  ['foreground', 'code-bg', 'text', 'Plain code text'],
  ['muted-foreground', 'background', 'text', 'Secondary text on the page'],
  ['muted-foreground', 'card', 'text', 'Secondary text on cards'],
  ['muted-foreground', 'muted', 'text', 'Secondary text on muted fills'],
  ['label-tertiary', 'background', 'text', 'Tertiary labels (dates) on the page'],
  ['label-tertiary', 'card', 'text', 'Tertiary labels on cards'],
  ['secondary-foreground', 'secondary', 'text', 'Secondary button / pill'],
  ['accent-foreground', 'accent', 'text', 'Hovered row text'],
  ['primary', 'background', 'text', 'Jade text / active nav on the page'],
  ['primary', 'card', 'text', 'Jade text on cards'],
  ['primary-foreground', 'primary', 'text', 'Primary button label'],
  ['primary-foreground', 'primary-hover', 'text', 'Primary button label, hover'],
  ['primary', 'primary-soft', 'text', 'Jade text on jade tint (badges)'],
  ['primary', 'primary/10', 'text', 'Jade text on bg-primary/10 over the page'],
  ['link', 'background', 'text', 'Links in prose'],
  ['link', 'card', 'text', 'Links on cards'],
  ['link-hover', 'background', 'text', 'Hovered links'],
  ['sidebar-foreground', 'sidebar', 'text', 'Sidebar items'],
  ['sidebar-active-foreground', 'sidebar-active', 'text', 'Sidebar active item'],
  ['highlight', 'background', 'text', 'Amber highlight text on the page'],
  ['highlight', 'card', 'text', 'Amber highlight text on cards'],
  ['highlight-text', 'highlight-soft', 'text', 'Amber badge text on amber tint'],
  ['destructive', 'card', 'text', 'Error text on cards'],
  ['destructive-foreground', 'destructive', 'text', 'Destructive button label'],
  ['destructive-text', 'destructive-soft', 'text', 'Gotcha / outdated callout text'],
  ['destructive', 'destructive/10', 'text', 'Error text on bg-destructive/10'],
  ['success', 'card', 'text', 'Success text on cards'],
  ['success-text', 'success-soft', 'text', 'Tip callout text'],
  ['success-text', 'card', 'text', 'Success text on cards'],
  ['warning-text', 'warning-soft', 'text', 'Warning callout text'],
  ['primary', 'background', 'ui', 'Focus ring, active edges, progress'],
  ['border-strong', 'background', 'ui', 'Control borders on the page'],
  ['border-strong', 'card', 'ui', 'Control borders on cards'],
  ['input', 'field', 'ui', 'Input borders'],
  ['highlight', 'card', 'ui', 'Amber markers (radar)'],
  ['destructive', 'grouped', 'ui', 'Error edges on the diagram canvas'],
  ['muted-foreground', 'grouped', 'ui', 'Idle edges on the diagram canvas'],
  ...['client', 'network', 'service', 'data', 'external', 'abstraction', 'concrete'].map((c) => [
    `diagram-${c}`,
    `diagram-${c}-soft`,
    'text',
    `Diagram ${c} icon on its tile (held to text level)`,
  ]),
];

const MIN = { text: 4.5, ui: 3 };

const rows = PAIRS.map(([fg, bg, kind, use]) => {
  const out = {};
  for (const [mode, vars] of [
    ['light', light],
    ['dark', dark],
  ]) {
    const bgBase = bg.includes('/') ? 'background' : bg;
    const bgRgb = resolve(vars, bg, bgBase);
    const fgRgb = resolve(vars, fg, bgBase);
    out[mode] = { fg: toHex(fgRgb), bg: toHex(bgRgb), ratio: contrast(fgRgb, bgRgb) };
  }
  const pass = out.light.ratio >= MIN[kind] && out.dark.ratio >= MIN[kind];
  return { fg, bg, kind, use, ...out, pass };
});

const code = await codeColourReport();
const codeMin = { light: Infinity, dark: Infinity };
for (const r of code) codeMin[r.mode] = Math.min(codeMin[r.mode], r.after);
const codeFixed = code.filter((r) => r.fixed !== r.colour).length;

const fmt = (n) => n.toFixed(2);
if (process.argv.includes('--markdown')) {
  console.log('| Pair (fg on bg) | Kind | Light | Ratio | Dark | Ratio | Result | Used for |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const r of rows) {
    console.log(
      `| \`${r.fg}\` on \`${r.bg}\` | ${r.kind} ≥ ${MIN[r.kind]} | ${r.light.fg} / ${r.light.bg} | ${fmt(r.light.ratio)} | ${r.dark.fg} / ${r.dark.bg} | ${fmt(r.dark.ratio)} | ${r.pass ? 'Pass' : '**FAIL**'} | ${r.use} |`
    );
  }
  console.log(
    `| Every Shiki token (github-light / github-dark, ${codeFixed} colours remapped by \`app/code-theme.css\`) on \`code-bg\` | text ≥ 4.5 | min on ${CODE_BG.light} | ${fmt(codeMin.light)} | min on ${CODE_BG.dark} | ${fmt(codeMin.dark)} | ${codeMin.light >= 4.5 && codeMin.dark >= 4.5 ? 'Pass' : '**FAIL**'} | Code blocks |`
  );
} else {
  for (const r of rows) {
    console.log(
      `${r.pass ? 'ok  ' : 'FAIL'} ${r.kind.padEnd(4)} ${`${r.fg} on ${r.bg}`.padEnd(52)} light ${fmt(r.light.ratio).padStart(5)}  dark ${fmt(r.dark.ratio).padStart(5)}`
    );
  }
  console.log(`code tokens: min light ${fmt(codeMin.light)}, min dark ${fmt(codeMin.dark)} (${codeFixed} remapped)`);
}

const failed = rows.filter((r) => !r.pass).length + (codeMin.light < 4.5 || codeMin.dark < 4.5 ? 1 : 0);
if (failed) {
  console.error(`${failed} pair(s) below the minimum`);
  process.exit(1);
}
