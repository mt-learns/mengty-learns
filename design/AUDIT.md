# Design & Technical Audit — Mengty Learns

> Audited: 2026-11-26 · Target: production static export (`out/`) served at `http://localhost:4173`
> Viewports: `360×800` and `1280×800` · Screenshots: `design/audit-shots/`
> Tools: `impeccable detect`, `impeccable shot`, computed WCAG 2.1 contrast analysis, manual code review.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|---|---|---|
| 1 | Accessibility | 2/4 | `label-tertiary` fails 4.5:1 (2.81:1 light, 3.27:1 dark); skipped headings (`h1→h3`, `h2→h4`); missing `aria-hidden` on decorative emoji/glyphs |
| 2 | Performance | 4/4 | Pure static export (`output: 'export'`), lazy-loaded React Flow only on flow pages, zero runtime server overhead |
| 3 | Theming | 3/4 | Strong iOS token foundation (`#0066CC` / `#409CFF`), but `Tip` references undefined `--success` token and Shiki comments fall to 3.5:1 in dark mode |
| 4 | Responsive Design | 3/4 | Clean 360px stacking on most pages, but `SegmentedControl` on `/radar` clips horizontally at 360px and `OutdatedBanner`/cards lack wrapping guards |
| 5 | Implementation Integrity | 2/4 | Emoji/glyphs used as UI icons in 6 files; `kitchen-sink.mdx` shipped as `status: stable`; `Ci Cd` sidebar title; duplicate "Next" footer links |
| **Total** | | **14/20** | **Good (address weak dimensions before launch)** |

**Implementation Integrity Verdict:** **Partial Pass.** The iOS token system (`app/tokens.css`) and Fumadocs integration (`--color-fd-*`) form a coherent foundation, and the React Flow v3 player (`components/flow/v3/`) is well-crafted. However, category-default shortcuts (stacked icon tiles on `/` and `/404`, emoji/Unicode glyphs standing in for icons, missing `--success` token, and a `draft` kitchen-sink page leaking into production) undercut the product's precision.

---

## Executive Summary

- **Total findings:** 18 (2 P0, 9 P1, 7 P2)
- **Top 5 critical issues:**
  1. **[P0] Undefined `--success` token in `<Tip>`** (`components/mdx/sidenote.tsx`): `bg-success/10 text-success border-success/20` renders with no color styling.
  2. **[P0] `label-tertiary` fails WCAG AA contrast** (`app/tokens.css`, `app/(home)/radar/radar-filter.tsx`): `#9a9a9a` on `#ffffff` = **2.81:1** (light) and `#6e6e6e` on `#1e1e1e` = **3.27:1** (dark).
  3. **[P1] Emoji & Unicode glyphs used as UI icons** (6 files): `🔥`, `🎉`, `🧭`, `✦`, `✓`, `⚠️`, `❌`, `✅` instead of `lucide-react` or authored SVGs.
  4. **[P1] Tight body line-height (`1.29x`) & long prose measure (`~90ch`)** (`app/tokens.css`, `app/global.css`): `--text-body` (`17px / 22px = 1.294x`) is below the `1.45–1.65x` reading comfort floor in `Read` mode.
  5. **[P1] Duplicate "Next" links & `draft` page leaking in `/docs`** (`app/docs/[[...slug]]/page.tsx`, `content/docs/kitchen-sink.mdx`, `content/docs/ci-cd/meta.json`): Both custom `Next in path:` and Fumadocs footer render; `Kitchen Sink` is `status: stable`; `ci-cd` renders as `Ci Cd`.

---

## Measured WCAG Contrast Ratios (`app/tokens.css`)

| Pair | Light Ratio | Dark Ratio | WCAG AA (4.5:1) |
|---|---|---|---|
| `foreground` on `background` | `#222222` / `#f7f7f7` = **14.85:1** | `#f7f7f7` / `#121212` = **17.49:1** | Pass |
| `foreground` on `card` | `#222222` / `#ffffff` = **15.91:1** | `#f7f7f7` / `#1e1e1e` = **15.56:1** | Pass |
| `muted-foreground` on `background` | `#6a6a6a` / `#f7f7f7` = **5.05:1** | `#a3a3a3` / `#121212` = **7.43:1** | Pass |
| `muted-foreground` on `card` | `#6a6a6a` / `#ffffff` = **5.41:1** | `#a3a3a3` / `#1e1e1e` = **6.61:1** | Pass |
| `muted-foreground` on `muted` | `#6a6a6a` / `#f2f2f2` = **4.83:1** | `#a3a3a3` / `#262626` = **6.00:1** | Pass |
| `label-tertiary` on `card` | `#9a9a9a` / `#ffffff` = **2.81:1** | `#6e6e6e` / `#1e1e1e` = **3.27:1** | **FAIL** |
| `label-tertiary` on `background` | `#9a9a9a` / `#f7f7f7` = **2.63:1** | `#6e6e6e` / `#121212` = **3.67:1** | **FAIL** |
| `primary` on `card` | `#0066CC` / `#ffffff` = **5.57:1** | `#409CFF` / `#1e1e1e` = **5.89:1** | Pass |
| `primary-foreground` on `primary` | `#ffffff` / `#0066CC` = **5.57:1** | `#000000` / `#409CFF` = **7.42:1** | Pass |
| `destructive` on `card` | `#cd0014` / `#ffffff` = **5.82:1** | `#ff453a` / `#1e1e1e` = **4.89:1** | Pass |
| `destructive` on `destructive/10` | `#cd0014` / `#fae6e8` = **4.87:1** | `#ff453a` / `#352221` = **4.40:1** | **FAIL (Dark)** |
| Shiki comment on `card` (dark) | — | `#6a737d` / `#1e1e1e` = **3.50:1** | **FAIL (Dark)** |

---

## Prioritized Findings (P0 / P1 / P2)

### P0 — Blocking / Broken Tokens & Contrast

#### [P0-1] Undefined `--success` token in `<Tip>` callout
- **Evidence:** `components/mdx/sidenote.tsx` line 22 uses `bg-success/10 text-success border-success/20`, but `app/tokens.css` defines no `--success` or `--color-success` token.
- **Rule broken:** Design token completeness; semantic feedback components must resolve to valid theme tokens in light and dark modes.
- **Affected files:** `components/mdx/sidenote.tsx`, `app/tokens.css`.
- **Fix (Phase 2):** Add `--success` (`#15803d` light / `#34d399` dark, matching `--flow-cat-data-fg` contrast) to `app/tokens.css` and expose `--color-success` in `@theme inline`.

#### [P0-2] `label-tertiary` fails WCAG AA contrast in both themes
- **Evidence:** Measured `2.81:1` light (`#9a9a9a` on `#ffffff`) and `3.27:1` dark (`#6e6e6e` on `#1e1e1e`). Observed directly on `/radar` (`radar-filter.tsx` line 98, `2026-11-26` date labels) by `impeccable detect` (`3.3:1`).
- **Rule broken:** WCAG 2.1 SC 1.4.3 (Contrast Minimum ≥ 4.5:1 for normal/small text).
- **Affected files:** `app/tokens.css`, `app/(home)/radar/radar-filter.tsx`.
- **Fix (Phase 2):** Darken light `--label-tertiary` to `#737373` (4.74:1 on `#ffffff`, 4.41:1 -> `#6e6e6e` = 5.10:1 on `#ffffff`, 4.76:1 on `#f7f7f7`) and lighten dark `--label-tertiary` to `#8e8e93` (5.58:1 on `#1e1e1e`, 6.28:1 on `#121212`).

---

### P1 — Major Accessibility, Typography, Icon & Layout Issues

#### [P1-1] Emoji and Unicode glyphs used as UI icons (Fixed in Phase 1, Commit 3)
- **Evidence:**
  - `app/(home)/review/review-client.tsx`: line 104 `🔥 {streak}`, line 147 `All caught up! 🎉`
  - `app/not-found.tsx`: line 7 `🧭`
  - `components/ios/tile.tsx`: line 49 `✦` fallback
  - `components/learn/MarkDone.tsx`: line 34 `✓ Completed`
  - `components/learn/OutdatedBanner.tsx`: line 8 `⚠️ May be outdated:`
  - `content/docs/containers/image-layers-cache.mdx`: lines 56 & 62 `# ❌` / `# ✅` inside Dockerfile code block
- **Rule broken:** Craft Floor & Icon Consistency standard (`lucide-react` 16/20/24px, stroke 1.75; no emoji as UI icons).
- **Fix (Phase 1):** Replace with `lucide-react` icons (`Flame`, `PartyPopper`, `Compass`, `Sparkles`, `Check`, `AlertTriangle`) with `aria-hidden="true"` and text labels; use plain comments (`# Avoid:` / `# Good:`) in the Dockerfile snippet.

#### [P1-2] Dark-mode `destructive` on `destructive/10` slightly below 4.5:1
- **Evidence:** `#ff453a` on `#352221` (10% mix over `#1e1e1e`) measures **4.40:1**. Used in `OutdatedBanner.tsx` and `Gotcha`.
- **Rule broken:** WCAG 2.1 SC 1.4.3 (≥ 4.5:1).
- **Affected files:** `app/tokens.css`, `components/learn/OutdatedBanner.tsx`, `components/mdx/sidenote.tsx`.
- **Fix (Phase 2):** Adjust dark `--destructive` to `#ff594f` (5.08:1 on `#352221`, 5.64:1 on `#1e1e1e`).

#### [P1-3] Shiki dark-mode code comments fail 4.5:1 contrast
- **Evidence:** `impeccable detect` on `/docs/design/bridge` and `/docs/containers/multi-stage-nextjs` flagged `#6a737d` on `#1e1e1e` at **3.5:1** (`span.line > span`).
- **Rule broken:** WCAG 2.1 SC 1.4.3 (≥ 4.5:1).
- **Affected files:** `app/global.css`.
- **Fix (Phase 2):** Override `.dark figure.shiki span[style*="6A737D" i]` (or configure Shiki dark theme) to `#8b949e` (5.3:1 on `#1e1e1e`).

#### [P1-4] Body line-height (`1.29x`) too tight for long-form reading
- **Evidence:** `app/tokens.css` sets `--text-body: 1.0625rem` (17px) and `--text-body--line-height: 1.375rem` (22px) -> `1.294x`. Flagged by `impeccable detect` (`tight-leading`) on `/docs/design/bridge` and `/docs/containers/multi-stage-nextjs`.
- **Rule broken:** Craft Floor & `Read` mode typography (1.5x–1.7x line-height for multi-line reading copy).
- **Affected files:** `app/tokens.css`, `app/global.css`.
- **Fix (Phase 2):** Keep `--text-body` compact for UI rows if needed, or add `--text-prose` / set `.prose, .fd-docs-body` `line-height: 1.65` (`28px` at `17px`).

#### [P1-5] Prose measure exceeds 75ch (`~89–90 chars`)
- **Evidence:** `impeccable detect` (`line-length`) flagged paragraphs in `/docs/design/bridge` (`~89 chars`) and `/docs/containers/multi-stage-nextjs` (`~90 chars`).
- **Rule broken:** Craft Floor typography (`65–75ch` max measure for body prose).
- **Affected files:** `app/global.css`.
- **Fix (Phase 2):** Constrain prose paragraphs/lists inside `.prose` / `[data-docs-body]` to `max-width: 68ch`.

#### [P1-6] Skipped heading levels (`h1 → h3`, `h2 → h4`)
- **Evidence:**
  - `content/docs/containers/multi-stage-nextjs.mdx` & `image-layers-cache.mdx`: `### TL;DR` immediately after `<h1>` title.
  - `components/learn/PageFooter.tsx` lines 14 & 31: `<h4>Related Notes</h4>` and `<h4>Sources</h4>` after `<h2>`.
  - `app/(home)/review/review-client.tsx` lines 116 & 147: `<h3>` immediately after `<h1>Daily Review</h1>` (no `<h2>`).
- **Rule broken:** WCAG 2.1 SC 1.3.1 (Info and Relationships — sequential heading hierarchy).
- **Fix (Phase 2):** Use `## TL;DR` in MDX notes, `<h3>` in `PageFooter.tsx`, and `<h2>` for the active/empty card heading in `review-client.tsx`.

#### [P1-7] Duplicate "Next" navigation in docs footer
- **Evidence:** Screenshot `design/audit-shots/docs/1280x800.png` shows both custom `Next in path: Kitchen Sink →` (`app/docs/[[...slug]]/page.tsx` lines 80–89) and Fumadocs' built-in `<DocsPage>` footer card `Kitchen Sink >`.
- **Rule broken:** Information architecture & visual restraint (avoid duplicate primary navigation affordances).
- **Affected files:** `app/docs/[[...slug]]/page.tsx`.
- **Fix (Phase 2):** Either pass `footer={{ enabled: false }}` to `<DocsPage>` or remove the custom `nextInPath` link if Fumadocs' footer already follows `meta.json` order.

#### [P1-8] `Kitchen Sink` page shipped as `status: stable` in production sidebar
- **Evidence:** `content/docs/kitchen-sink.mdx` has `status: stable` and appears in the production sidebar (`design/audit-shots/docs/1280x800.png`), while `lib/source.ts` does not filter `status: draft` from `docs`.
- **Rule broken:** `PLAN.md` §9.6 (`status: draft` keeps WIP/test pages out of production paths).
- **Affected files:** `content/docs/kitchen-sink.mdx`, `lib/source.ts`.
- **Fix (Phase 2):** Mark `kitchen-sink.mdx` as `status: draft` and filter `draft` pages in `lib/source.ts` in production builds.

#### [P1-9] Illustration gaps & stacked icon-tile pattern on `/` and `/404`
- **Evidence:** `impeccable detect` flagged `icon-tile-stack` on `/` (`96×96px` icon tile above `h1`) and `/404` (`80×80px` compass emoji box above `h1`). Home hero lacks the planned "desk scene" (`PLAN.md` §6), and `/review` empty state, `/radar`, `/digest` (labeled "lab" & "radar" headers in brief) lack spot illustrations. Section tiles still use flat 24px line SVGs instead of the "soft 3D clay app icon" system.
- **Rule broken:** `PLAN.md` §6 ("iOS calm + playful objects") & Craft Floor (avoid generic stacked icon-tile hero).
- **Fix:** Create the illustration system in Phase 1 (Commit 4), and wire it into `/`, `/docs`, `/review`, `/radar`, `/404` in Phase 2.

---

### P2 — Minor Polish, Consistency & Mobile Ergonomics

#### [P2-1] Sidebar folder title `Ci Cd` instead of `CI/CD`
- **Evidence:** `content/docs/ci-cd/meta.json` has `"title": "Ci Cd"`, visible in `docs/1280x800.png` and `review/1280x800.png` (`Ci-Cd` via `currentCard.slug.split('/')[0]`).
- **Fix (Phase 2):** Update `content/docs/ci-cd/meta.json` to `"title": "CI/CD"` and map section slugs to display names in `review-client.tsx`.

#### [P2-2] `SegmentedControl` clips horizontally on `/radar` at `360px`
- **Evidence:** Screenshot `design/audit-shots/radar/360x800.png` shows `Languages` cut off past the right edge of the `SegmentedControl` inside `overflow-x-auto`.
- **Affected files:** `components/ios/segmented-control.tsx`, `app/(home)/radar/radar-filter.tsx`.
- **Fix (Phase 2):** Allow `flex-wrap` or compact horizontal padding (`px-3 text-footnote`) on narrow viewports so all 5 options fit or show a clear scroll fade.

#### [P2-3] `404` page lacks site navigation shell (`HomeLayout`)
- **Evidence:** Screenshot `design/audit-shots/404/1280x800.png` renders without the top navigation bar, leaving users with only two buttons and no search or nav.
- **Affected files:** `app/not-found.tsx`.
- **Fix (Phase 2):** Wrap `NotFound` content in `<HomeLayout {...baseOptions()} links={homeLinks()}>` or share the home shell.

#### [P2-4] Missing `motion-reduce:transition-none` on interactive tiles and buttons
- **Evidence:** `components/ios/tile.tsx` (`transition-all`, `group-hover:scale-105 transition-transform`), `components/ios/grouped-list.tsx` (`transition-colors`), `components/learn/Quiz.tsx` (`transition-all`) lack `motion-reduce:transition-none motion-reduce:transform-none`.
- **Rule broken:** `PLAN.md` §5 & §6 ("All off under reduced motion").
- **Fix (Phase 2):** Add `motion-reduce:transition-none motion-reduce:transform-none` (or global reduced-motion utility rule in `app/global.css`).

#### [P2-5] Native `alert()` used in `/review` JSON import
- **Evidence:** `app/(home)/review/review-client.tsx` lines 87 & 89 call `alert('Imported successfully!')` and `alert('Invalid JSON')`.
- **Rule broken:** iOS calm UX & accessible inline status feedback (`aria-live="polite"`).
- **Fix (Phase 2):** Replace `alert()` with an inline `role="status"` / `role="alert"` message banner.

#### [P2-6] Inconsistent `strokeWidth` and icon sizing across components
- **Evidence:** `components/ios/tile.tsx` uses `strokeWidth: 1.8`, `components/flow/v3/IosNode.tsx` uses `strokeWidth={2}`, `components/mdx/concept/*` uses default `2` (`lucide-react` default).
- **Rule broken:** Icon standard (`lucide-react`, 16/20/24px, stroke `1.75`).
- **Fix (Phase 2):** Standardize on `strokeWidth={1.75}` and `size-4` (16px) / `size-5` (20px) / `size-6` (24px).

#### [P2-7] Redundant `Intent` badge inside `1. Intent` section on concept pages
- **Evidence:** Screenshot `design/audit-shots/concept-bridge/1280x800.png` shows `1. Intent` heading immediately followed by `<Intent>` card repeating the word `Intent`.
- **Affected files:** `content/docs/design/bridge.mdx` / `components/mdx/concept/intent.tsx`.
- **Fix (Phase 2):** Pass `title="TL;DR"` or omit the redundant inner header when nested directly under `## 1. Intent`.

---

## Per-Page Audit Notes

| Route | Screenshots | Key Observations |
|---|---|---|
| `/` (Home) | `design/audit-shots/home/360x800.png`, `1280x800.png` | Clean hierarchy and card spacing; flagged for `icon-tile-stack` (`96×96` icon above `h1`), missing hero desk scene, and flat section icons. |
| `/docs` (Docs Index) | `design/audit-shots/docs/360x800.png`, `1280x800.png` | Sidebar `Ci Cd` typo, `Kitchen Sink` visible in prod, duplicate "Next" footer links (`Next in path:` + Fumadocs footer). |
| `/docs/design/bridge` (Concept) | `design/audit-shots/concept-bridge/360x800.png`, `1280x800.png` | Strong `<Flow>` v3 and `<Steps>`; flagged for `tight-leading` (`1.29x`), `line-length` (`~89ch`), dark Shiki comment contrast (`3.5:1`), and redundant `Intent` label. |
| `/docs/containers/multi-stage-nextjs` (Lab) | `design/audit-shots/lab-nextjs/360x800.png`, `1280x800.png` | `<LabLink>` and `<Quiz>` are clear; flagged for `h1→h3` (`### TL;DR`), `h2→h4` (`PageFooter`), `line-length` (`~90ch`), and Shiki comment contrast (`3.5:1`). |
| `/review` (Flashcards) | `design/audit-shots/review/360x800.png`, `1280x800.png` | Clean card layout at 360px & 1280px; uses `🔥` and `🎉` emoji, `Ci-Cd` label, `h1→h3` heading skip, and `alert()` on import. |
| `/radar` (Tech Radar) | `design/audit-shots/radar/360x800.png`, `1280x800.png` | Grouped list is legible; `text-label-tertiary` date fails contrast (`3.3:1` dark / `2.81:1` light); `SegmentedControl` clips `Languages` at 360px. |
| `/digest` (Digest) | `design/audit-shots/digest/360x800.png`, `1280x800.png` | Clean empty state & RSS button; needs spot illustration in Phase 2. |
| `/404` (Not Found) | `design/audit-shots/404/360x800.png`, `1280x800.png` | Uses `🧭` emoji in `80×80` box (`icon-tile-stack`); lacks `<HomeLayout>` nav shell. |

---

## Phase 2 Proposed Diffs (Owner-Deferred Files)

> These files are outside Phase 1 scope and are actively edited by other workers. Apply in Phase 2 after merges.

### 1. `app/tokens.css` — Contrast & `--success` token fixes
```diff
   --destructive: #cd0014;
   --destructive-foreground: #ffffff;
+  --success: #15803d;
+  --success-foreground: #ffffff;
   --border: #ebebeb;
   --ring: #0066CC;
   --separator: #f2f2f2;
   --label-secondary: #6a6a6a;
-  --label-tertiary: #9a9a9a;
+  --label-tertiary: #6e6e6e;
```
```diff
-  --destructive: #ff453a;
+  --destructive: #ff594f;
   --destructive-foreground: #000000;
+  --success: #34d399;
+  --success-foreground: #000000;
   --border: #2e2e2e;
   --ring: #409CFF;
   --separator: #262626;
   --label-secondary: #a3a3a3;
-  --label-tertiary: #6e6e6e;
+  --label-tertiary: #8e8e93;
```
And inside `@theme inline`:
```diff
   --color-destructive: var(--destructive);
   --color-destructive-foreground: var(--destructive-foreground);
+  --color-success: var(--success);
+  --color-success-foreground: var(--success-foreground);
```

### 2. `app/global.css` — Prose reading measure, line-height & Shiki dark comment contrast
```diff
+@layer components {
+  .prose p,
+  .prose li {
+    max-width: 68ch;
+    line-height: 1.65;
+  }
+  .dark figure.shiki span[style*="6A737D" i] {
+    color: #8b949e !important;
+  }
+}
```

### 3. `app/docs/[[...slug]]/page.tsx` — Remove duplicate "Next in path" footer
```diff
-  // Find next in path from section meta/pages
-  const allPages = source.getPages();
-  const currentIndex = allPages.findIndex((p) => p.url === page.url);
-  const nextInPath = currentIndex !== -1 && currentIndex + 1 < allPages.length ? allPages[currentIndex + 1] : null;
...
-      {nextInPath && (
-        <div className="mt-8 pt-6 border-t flex justify-end">
-          <a
-            href={nextInPath.url}
-            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
-          >
-            Next in path: {nextInPath.data.title} →
-          </a>
-        </div>
-      )}
```
