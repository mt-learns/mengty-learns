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

---

# Landing redesign (`landing-redesign` branch): open items for other owners

## A. Diagram category tints must switch to the new tokens (owner: diagram-rules worker)

- `app/tokens.css` now defines `--diagram-{client,network,service,data,external,abstraction,concrete}` (icon colour) and `--diagram-*-soft` (tile fill) for both themes, measured in `DESIGN.md` (every icon ≥ 4.5:1 on its tile).
- **After the diagram-rules merge, `components/diagram/category.ts` must use these tokens** instead of its own values.
- `components/flow/v3/flow.css` still declares `--flow-cat-*` with the old Apple blues (`#0066cc`, `#409cff`). It is outside this branch's scope, so `grep -i "0066cc\|409cff" components` is not empty until the diagram worker replaces or deletes that file. Map `edge` → `--diagram-network`, `service` → `--diagram-service`, `data` → `--diagram-data`, `external` → `--diagram-external`, `client` → `--diagram-client`.

## B. Landing page decisions the plan didn't cover

- **No eyebrow above the H1.** The plan asks for "DevOps · Architecture · Security" as an eyebrow; the impeccable craft floor (which the owner asked us to follow) bans eyebrows outright. The three topics moved into the sub copy instead.
- **Read / Do / Remember use real artifacts instead of spot illustrations.** There is no spot art for "Read", and an icon-plus-text card is the template the plan wants to leave behind. Each column shows real material: the k8s flow's nodes, the commands `labs.yml` runs, and a real flashcard question.
- **Hero right column is the `hero-desk` illustration**, not a live `<Flow>`: React Flow in the first viewport would load ~60 KB of JS before interaction and put the performance gate at risk. The live flow is section 5 instead, lazy-loaded below the fold.
- **The home flow duplicates the data of `content/docs/kubernetes/service-routing.mdx`** (`components/home/k8s-flow.tsx`), because that file belongs to the diagram-rules worker. After the merge, move the flow data to a shared module (or switch to the new `<Flow>`/`<Diagram>` API if it changes) so there is one copy.
- **`<Flow>` on mobile (owner: diagram-rules worker):** at 360px the canvas is tall and the nodes render ~6px text. It's the shared Player's mobile layout, not the landing page; the home page inherits whatever the diagram work ships.
- **GitOps has no pages yet.** Its learning-path card shows "Coming soon" with a dashed border and no link instead of linking to a 404.
- **Screenshots use the `playwright` package already on `main`** (`scripts/qa-shots.mjs`) rather than adding `@playwright/test`, to avoid a `package.json` / lockfile conflict with the diagram-rules branch, which adds it.
