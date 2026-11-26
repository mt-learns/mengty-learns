# Mengty Learns — Implementation Plan (Start)

> Companion to `PLAN.md`. This file is the **build order**.
> Date: 2026-11-26 · Owner: Lim Mengty
> **Scope:** one Next.js app, static export, no database, no backend, no monorepo.

## 0. Target

```
next build  →  out/   (plain HTML/CSS/JS)  →  Cloudflare Pages  →  https://mengtylearns.com
```

## 1. Project layout (`D:\me\mt`)

```
mt/
  app/
    layout.tsx                 # RootProvider (Fumadocs) + fonts + theme
    globals.css                # Tailwind v4 + fumadocs css + tokens import
    tokens.css                 # iOS tokens ported from Chongdai
    (home)/
      layout.tsx               # HomeLayout (nav + footer)
      page.tsx                 # /
      projects/page.tsx        # /projects
      about/page.tsx           # /about
    docs/
      layout.tsx               # DocsLayout (sidebar, TOC)
      [[...slug]]/page.tsx     # docs pages + generateStaticParams
    api/search/route.ts        # static search index (built once at build time)
    not-found.tsx
  components/
    ui/                        # shadcn generated
    ios/                       # GroupedList, Tile, SegmentedControl, LargeTitle, MaterialNav
    mdx/                       # Sidenote, Gotcha, Tip, Figure, Terminal, StepThrough, Quiz
    home/                      # Hero, LearningPaths, LatestNotes, ProjectGrid
  content/
    docs/                      # MDX notes, one folder per section + meta.json
    projects.ts                # typed project list
  lib/
    source.ts                  # Fumadocs loader (baseUrl '/docs')
    utils.ts                   # cn()
  public/  images/  favicon.svg  og.png  _redirects
  scripts/optimize-images.mjs
  source.config.ts             # fumadocs-mdx collections + frontmatter schema
  next.config.mjs              # output: 'export', images.unoptimized, MDX plugin
  mdx-components.tsx
  components.json  tsconfig.json  package.json  .nvmrc
  .github/workflows/ci.yml
  PLAN.md  IMPLEMENTATION.md  README.md
```

## 2. Steps

Each step ends with `pnpm lint && pnpm typecheck && pnpm build` passing, plus one commit.

### Step 1 — Scaffold (½ day)
1. In `D:\me`, run `pnpm create fumadocs-app mt`. Choose **Next.js**, **Fumadocs MDX** as the content source, and Tailwind. If the folder must stay as it is, scaffold into a temp folder and move the files in, keeping `PLAN.md` and `IMPLEMENTATION.md`.
2. `git init`, `.nvmrc` (22), `"packageManager": "pnpm@9"`, and a README with a "Tested with" table of pinned versions.
3. Add a `typecheck` script (`tsc --noEmit`).

**Done when:** `pnpm dev` shows the Fumadocs home page and `/docs`.

### Step 2 — Static export (½ day)
1. `next.config.mjs`:
   ```js
   import { createMDX } from 'fumadocs-mdx/next';
   const withMDX = createMDX();
   export default withMDX({
     output: 'export',
     images: { unoptimized: true },
     trailingSlash: true,          // clean URLs on static hosts
     reactStrictMode: true,
   });
   ```
2. Search: make `app/api/search/route.ts` static (Fumadocs `createFromSource(source)` with its static `staticGET` export and `export const revalidate = false`). Set the search dialog to `type: 'static'` in `RootProvider`. Follow the Fumadocs "Static Export" guide for the installed version.
3. Make sure `app/docs/[[...slug]]/page.tsx` exports `generateStaticParams` and `generateMetadata`. The template already does.

**Done when:** `pnpm build` produces `out/`, `npx serve out` works, search finds a page, and no route errors about dynamic usage.

### Step 3 — iOS design system (1 day)
1. `pnpm dlx shadcn@latest init` (Tailwind v4, the `@/*` alias), then `add button card badge tooltip`.
2. Create `app/tokens.css`. Copy the `@theme` type scale, the `:root` and `.dark` blocks, the materials and the `@utility` helpers from Chongdai's `globals.css`. Swap pink for the D3 accent and drop Khmer and the `site` variant (PLAN §5).
3. In `globals.css`: `@import 'tailwindcss'; @import 'fumadocs-ui/css/neutral.css'; @import 'fumadocs-ui/css/preset.css'; @import './tokens.css';`, then add the `--color-fd-*` → token mapping (PLAN §5). Check the import paths against the installed Fumadocs version.
4. Fonts: Inter via `next/font/google` as `--font-inter`, then `--font-sans`.
5. Restyle: nav uses `material-regular`, cards use `rounded-card`, callouts use `rounded-panel`, and code blocks get a 12px radius plus light/dark Shiki themes (`github-light` / `github-dark` to start).
6. A `/docs/_kitchen-sink` page (draft) with headings, a table, code, callouts, tabs, a card and a shadcn button.

**Done when:** the kitchen-sink page looks right in light and dark, text contrast is ≥ 4.5:1, there's no theme flash on reload, and tap targets are ≥ 44px.

### Step 4 — Content schema and MDX components (1 day)
1. `source.config.ts`: extend `frontmatterSchema` with `type`, `level`, `tags`, `tested_with`, `status`, `updated` (PLAN §7). A bad frontmatter value must fail the build.
2. Show the metadata line under the title in the docs page: section · type badge · level · "Tested with …" · updated.
3. `components/mdx/`: `Sidenote`, `Gotcha`, `Tip`, `Figure` (server components), and `Terminal` (client). Register them in `mdx-components.tsx`.
4. Sections: create the 9 folders with `meta.json` (title, icon, page order).
5. Write 3 real notes: one tutorial (Docker basics), one how-to (write a GitHub Actions workflow), and one reference (kubectl cheatsheet).

**Done when:** all 3 notes render with badges and components, and search finds them.

### Step 5 — Home, projects, about (1–2 days)
1. `components/ios/`: `Tile`, `GroupedList`, `SegmentedControl`, `LargeTitle` (copy from Chongdai `common/` and slim them down).
2. Home (`(home)/page.tsx`, server component):
   - Hero: large title, tagline, placeholder art, "Start learning" → `/docs`
   - Learning paths: a large tile for the featured section, small tiles for the rest
   - Latest notes: `source.getPages()` sorted by `updated`, the top 5 in a `GroupedList`
   - Featured projects: from `content/projects.ts`
3. `/projects`: a tile grid plus a `SegmentedControl` topic filter (the only client component). With JS off, all projects show.
4. `/about` and `not-found.tsx` (friendly empty state).
5. Metadata: `metadata` per page, an OG image (static `og.png`), `app/sitemap.ts` and `app/robots.ts` (both work with static export when the data is static).

**Done when:** Lighthouse is ≥ 95 in all four categories on `/` and on one docs page, and the layout works at 360px and on desktop.

### Step 6 — CI and deploy (½ day)
1. `.github/workflows/ci.yml` on PR and push: `pnpm install --frozen-lockfile` → lint → typecheck → build → link check on `out/` (`lychee --offline out`).
2. Cloudflare Pages: connect the repo, build command `pnpm build`, output `out`, Node 22. Every PR gets a preview URL.
3. Domain: point `mengtylearns.com` to Pages, redirect `www` → apex via `public/_redirects` or a Cloudflare rule.

**Done when:** a merge to `main` is live on mengtylearns.com in under 5 minutes, and a broken internal link fails CI.

### Step 7 — Launch polish (½ day)
- Favicon, apple-touch-icon, `theme-color` for light and dark.
- Privacy-friendly analytics, if wanted (Cloudflare Web Analytics, which needs no cookie banner).
- README: how to write a note (copy `content/_templates/note.mdx`).

## 3. Phase 2: Learning system + `<Flow>` (after launch, still static)

Spec: PLAN §9 (learning system) and §10 (templates and `<Flow>`). Content to write: `CONTENT-PLAN.md`.
Same rules as before: one commit per step, with lint, typecheck and build green.

### Step 8 — Schema v2 + templates + `pnpm new` (½ day) · P1
1. Extend the page schema with `kind`, `verified`, `cards`, `related` and `sources` (PLAN §7).
2. Add `content/_templates/note.mdx` and `concept.mdx`, with section headings exactly as in PLAN §10.1.
3. `scripts/new.mjs` + `"new": "node scripts/new.mjs"`. `pnpm new concept design/bridge` copies the template and fills in `title`, `updated`, `verified` (today) and `kind`.
4. Page footer: "Related" (from `related`), "Sources", and "Next in path →" (next page in the section's `meta.json` order).
5. A "⚠️ May be outdated" banner when `verified` is more than 365 days old or `status: outdated`. Calculate it at build time.

**Done when:** `pnpm new` creates a valid page that builds, and a note with an old `verified` date shows the banner.

### Step 9 — Concept-page components (1 day) · P1
`components/mdx/`: `Intent`, `Analogy`, `Checklist`, `Steps` (or reuse the Fumadocs `Steps`), `ProsCons`, `Relations`, `LabLink`, `MyTake`. All are server components with no client JS. Register them in `mdx-components.tsx`.

**Done when:** `content/docs/design/bridge.mdx` uses all 12 template sections, and the page has no client JS beyond the Fumadocs defaults.

### Step 10 — `<Flow>` v1 (2 days) · P1
1. `pnpm add motion`. Create `components/flow/` with `Flow.tsx` (`'use client'`), `types.ts`, `layout.ts` (grid → px), `edges.ts` (SVG path between nodes), and `icons.tsx` (user, gateway, service, pod, db, queue, git, ci, class, interface).
2. Validate props with Zod. An unknown node id in `steps[].edge` throws during the build.
3. Behaviour (PLAN §10.2): highlight active nodes and edges, dim the others to 40%, a dot travelling along the active path (`motion` `offsetDistance` or `pathLength`), the caption with `aria-live="polite"`, prev/next buttons, ← → keys when focused, a scrubber, play/pause with 0.5× / 1× / 2× speeds, and replay.
4. Edge kinds: `request` (accent, solid), `response` (dashed), `error` (destructive).
5. Fallbacks: a numbered `<ol>` of the steps always renders below the diagram. Under `prefers-reduced-motion`, there's no travelling dot or transitions. With JS off, the SVG shows all edges.
6. iOS styling: nodes as `rounded-panel` cards with a section-icon squircle, using tokens only with no hard-coded colours. The canvas scales to the container width, min 320px.
7. Flows: `bridge` (in `design/bridge.mdx`) and `k8s-request` (in `kubernetes/service-routing.mdx`).
8. Tests (Vitest): edge path maths, step validation, keyboard navigation (React Testing Library).

**Done when:** both flows work with mouse, keyboard and reduced motion, and in light and dark at 360px. `<Flow>` + motion add ≤ 35 KB gzip, and only to pages that use them (check the `next build` output).

### Step 11 — Remember: `/review`, `<Quiz>`, paths (1½ days) · P2
1. Build-time script `scripts/build-cards.mjs` → `public/cards.json` (`{ id, slug, q, a }` with id = slug + index). Run it as a `prebuild` step.
2. `/review` page (client): cards due today, reveal the answer, grade Again / Hard / Good / Easy. Scheduling uses `ts-fsrs` (default), with state saved in `localStorage` under `mt-review-v1`. Show a streak and a due count. Add export/import JSON buttons.
3. `<Quiz>`: 1–3 questions, answer first, then reveal. "Add these cards to my review" happens automatically through `cards`.
4. Learning-path progress: a "Mark as done" button on each page, saved in `localStorage`. Section tiles on home and `/docs` show "3 / 8".

**Done when:** a card graded "Good" isn't due again today, state survives reload, and export→import restores it.

### Step 12 — Labs tested in CI (1 day) · P2
1. Create `labs/<name>/` with a `README.md` linked from the note through `<LabLink>`.
2. A CI job `labs` runs these, each one only if matching files exist: `hadolint`, `docker build` for each `labs/*/Dockerfile`, `terraform fmt -check` + `terraform validate` (OpenTofu is fine too), `tflint`, `kubeconform -strict` on `labs/**/k8s/*.yaml`, and `actionlint`.
3. First labs: `docker-multistage-next`, `k8s-service-routing`, `tofu-local-file`.

**Done when:** breaking a lab file fails CI.

### Step 13 — Radar + digest + RSS inbox (1 day) · P3
1. Content `kind: radar` (with fields `ring`: adopt|trial|assess|hold and `quadrant`: tools|platforms|techniques|languages) and `kind: digest`.
2. `/radar`: items grouped by ring (an iOS grouped list; a circular radar chart is optional), each with 2 lines and a link to its note.
3. `/digest`: a list plus RSS (`app/digest/rss.xml/route.ts`, static).
4. `.github/workflows/inbox.yml`: a weekly cron reads `inbox/feeds.json`, fetches the feeds, and opens or updates **one GitHub issue** "Inbox week NN" with new items (title + link). Nothing is published to the site.

**Done when:** the radar page renders from content, and the Action creates an issue in a dry-run on a fork.

### Step 14 — `<Flow>` v2/v3 (as needed) · P3–P4
Compare toggle ("without / with"), step deep links (`?flow=&step=`), a details drawer per step, zoom levels (a group node opens a sub-flow, with a breadcrumb), and an optional ELK auto-layout.

### Step 15 — `<Flow>` v3 redesign on React Flow + docs style fixes (2–3 days) · P1, do this now
Spec: PLAN §10.5 and §10.6.
1. **Style fix first (separate commit):** remove the `pre` rule from `app/global.css`, then style the Fumadocs code block container once so there's one frame. Check callouts, tabs and cards for double frames. Update `/docs/kitchen-sink`.
2. `pnpm add @xyflow/react @dagrejs/dagre` (pin the versions). Create `components/flow/v3/`:
   - `FlowCanvas.tsx`: a read-only ReactFlow with the props in PLAN §10.5. Import `@xyflow/react/dist/base.css` only inside this component, and add theme overrides through tokens.
   - `IosNode.tsx`: icon squircle + label + subtitle, category tint, active/inactive states.
   - `StepEdge.tsx`: custom edge with step badge, visited/active/idle styles, a travelling dot (SVG `animateMotion` or motion/mini), and dashed/error variants.
   - `GroupNode.tsx`: frosted group panel.
   - `layout.ts`: grid → px on desktop, and a dagre top→bottom layout below 640px (recalculated on resize, debounced).
   - `Player.tsx`: card shell, step header, ‹ › + dots + Play/Replay, `<details>` step list (server-rendered), variants SegmentedControl, ⋯ menu (copy link).
3. Keep the data format, and add an optional `title` per step plus an optional `category` per node (with sensible defaults). Keep Zod build-time validation. **Don't break the 6 existing flow pages.** Then add short step `title`s to them.
4. Lazy-load: `FlowLazy` loads the canvas through `next/dynamic` with `ssr: false` when scrolled into view (IntersectionObserver). Until then it shows the server-rendered static SVG skeleton and the step list.
5. Delete the v1/v2 SVG renderer once v3 is at parity, keeping only the static skeleton.
6. Tests: layout switch, step engine (next/prev/dots/end → replay), visited-edge state, deep-link parsing, keyboard. Playwright (or a manual checklist in the PR) at 360px and 1280px, in both themes, with reduced motion.

**Done when:** the PLAN §10.5 acceptance checks pass. Record the `next build` route sizes: flow pages ≤ 80 KB gzip extra, and the rest unchanged.

### Later
- Section 3D icons and hero art (PLAN §6 pipeline).
- `<StepThrough>` and `<Playground>` explainers. One signature explainer per month (`CONTENT-PLAN.md`).
- Optional newsletter: a link or embed form from Buttondown or Substack.

## 4. Definition of done (every step)
- Lint, typecheck and `next build` (static export) are green.
- Works in light and dark, at 360px and on desktop, keyboard only, and with reduced motion.
- No `'use client'` outside `components/mdx/*`, `components/ios/SegmentedControl` and the theme toggle, unless the step says so.
- No server-only Next.js features: no server actions, `cookies()`, middleware, or dynamic routes without `generateStaticParams`.

## 5. Time estimate
About **5–6 working days** to launch with 3 notes (Steps 1–7).
Phase 2: about **7–8 working days** (Steps 8–13), done P1 first (Steps 8–10, ~3½ days), then P2 and P3.
