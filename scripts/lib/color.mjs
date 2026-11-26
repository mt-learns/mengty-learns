// Small colour toolkit for the contrast gates (WCAG 2.x relative luminance,
// OKLab mixing like CSS `color-mix(in oklab, …)`, alpha compositing in sRGB).

export function parseHex(hex) {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Not a hex colour: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

export function toHex(rgb) {
  return (
    '#' +
    rgb
      .map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const unlin = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

export function luminance(rgb) {
  const [r, g, b] = rgb.map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const la = luminance(typeof a === 'string' ? parseHex(a) : a);
  const lb = luminance(typeof b === 'string' ? parseHex(b) : b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function toOklab(rgb) {
  const [r, g, b] = rgb.map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function fromOklab([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => unlin(Math.min(1, Math.max(0, c))));
}

/** Source colour at `alpha` composited over an opaque backdrop (what the browser paints). */
export function over(rgb, alpha, backdrop) {
  return rgb.map((c, i) => c * alpha + backdrop[i] * (1 - alpha));
}

/** `color-mix(in oklab, a p, b)` for two opaque colours. */
export function mixOklab(a, b, p) {
  const x = toOklab(a);
  const y = toOklab(b);
  return fromOklab(x.map((v, i) => v * p + y[i] * (1 - p)));
}

/**
 * Move `fg` in OKLab lightness (keeping hue and chroma) until it reaches
 * `target` contrast on `bg`. Returns the closest passing colour.
 */
export function ensureContrast(fgHex, bgHex, target = 4.6) {
  if (contrast(fgHex, bgHex) >= target) return fgHex.toUpperCase();
  const bg = parseHex(bgHex);
  const darker = luminance(bg) > 0.18;
  const [L, A, B] = toOklab(parseHex(fgHex));
  for (let step = 1; step <= 100; step++) {
    const nl = darker ? L - step * 0.01 : L + step * 0.01;
    const candidate = toHex(fromOklab([nl, A, B]));
    if (contrast(candidate, bgHex) >= target) return candidate;
  }
  return darker ? '#000000' : '#FFFFFF';
}
