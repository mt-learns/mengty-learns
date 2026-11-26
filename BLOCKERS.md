# Blockers & Out-of-Scope Quality Findings

Findings from running `@lhci/cli` (`lighthouserc.json`) and `@axe-core/playwright` against `out/` on `/`, `/docs/`, `/docs/design/bridge/`, and `/review/`.

Only issues in `app/layout.tsx`, `app/(home)/page.tsx`, and `lib/layout.shared.tsx` were fixed in this branch (`lib/layout.shared.tsx` nav badge contrast fixed from `bg-primary/10 text-primary` [4.49:1] to `bg-primary text-primary-foreground` [≥ 5.7:1]). The remaining items below are outside the `launch-quality` file scope and require fixes in their respective modules.

## 1. `/docs/design/bridge/` — Lighthouse Accessibility `0.89` (< 0.95) & axe-core serious violations

- **`aria-prohibited-attr` (serious, Lighthouse + axe-core):** `components/flow/` renders `div.h-full.p-4.w-full` with an `aria-label` attribute and no valid ARIA `role`.
- **`target-size` (Lighthouse a11y):** `components/flow/` step indicator buttons (`div.mt-3 > div.flex > div.flex > button.inline-flex`) have insufficient touch target size/spacing.
- **`color-contrast` (serious, Lighthouse + axe-core, 7 code nodes):** Shiki `github-light` syntax tokens (`#e36209` on `#ffffff`) have a 3.48:1 contrast ratio (< 4.5:1) in code blocks.

## 2. `/docs/` & `/docs/design/bridge/` — `color-contrast` (serious, axe-core)

- **Type pill badge in `app/docs/[[...slug]]/page.tsx`:** `.px-2.5.capitalize.rounded-full` uses `bg-primary/10 text-primary` (`#0066cc` on `#dee8f3`), which has a 4.49:1 contrast ratio (< 4.5:1). Needs `bg-primary text-primary-foreground` or darker text/tint.
- **`region` (moderate, axe-core):** Fumadocs `#toc-title` and TOC links sit outside a landmark region.

## 3. `/review/` — Lighthouse Performance `0.82` (< 0.90) & axe-core heading order

- **Performance `0.82`:** Largest Contentful Paint (`0.51`) and Total Blocking Time (`0.80`) on `/review/` (`app/(home)/review/review-client.tsx`).
- **`heading-order` (moderate, axe-core; also flagged by Lighthouse a11y):** `h3.text-xl` appears without a preceding `h2` (`h1` → `h3`).

## 4. All 4 routes — Lighthouse Best Practices `0.96` (`errors-in-console`)

- Next.js 16 static export client-side prefetching requests `__next.*.txt` RSC payload files that do not exist in `out/` when served by a static file server (`serve` / `lhci`), logging 404 console errors.
