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

## 3. After launch (no backend needed)
- Section 3D icons and hero art (PLAN §6 pipeline).
- `<StepThrough>`, `<Playground>` and `<Quiz>` (localStorage) components.
- One signature explainer per month, starting with the Docker layer cache.
- Optional newsletter: a link or embed form from Buttondown or Substack.

## 4. Definition of done (every step)
- Lint, typecheck and `next build` (static export) are green.
- Works in light and dark, at 360px and on desktop, keyboard only, and with reduced motion.
- No `'use client'` outside `components/mdx/*`, `components/ios/SegmentedControl` and the theme toggle, unless the step says so.
- No server-only Next.js features: no server actions, `cookies()`, middleware, or dynamic routes without `generateStaticParams`.

## 5. Time estimate
About **5–6 working days** to launch with 3 notes, then content work continues.
