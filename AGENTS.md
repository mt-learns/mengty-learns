# Mengty Learns — implementation rules

These rules bind every contributor, human or agent (Claude, opencode, agy, …). They come first; the framework notes below them are reference.

## 1. Before you change anything
1. Read the task brief and the docs it names: `PLAN.md`, `IMPLEMENTATION.md`, `DESIGN.md`, `DIAGRAM-RULES.md`, `CONTENT-PLAN.md`.
2. Read the existing code you will touch, plus one existing example of the same pattern. Follow what's there.
3. Check library APIs in `node_modules` (Next 16, Fumadocs 16, React Flow, …). Your training data may be outdated, so never guess an API.

## 2. Scope
- Change **only** the files your brief lists. If a fix needs another file, write it in `BLOCKERS.md` instead.
- Shared files (`package.json`, `components/mdx.tsx`, `.gitignore`): add-only, minimal changes.
- Never delete or modify anything outside your worktree. Other repos are read-only.
- No new dependency without a reason in the commit body. Pin exact versions.

## 3. Architecture constraints
- **Static export only:** no server actions, middleware, `cookies()`, ISR, dynamic routes without `generateStaticParams`, or runtime API routes (route handlers must be `force-static`).
- **No backend, no database.** Per-user state lives in `localStorage` under versioned keys (`mt-*-v1`).
- **Client JS only where it's needed:** server components by default. `'use client'` only for real interactivity. Heavy widgets (`<Flow>`) are lazy-loaded and add nothing to pages that don't use them.

## 4. Design
- **Tokens only:** colours, radii, type and motion come from `app/tokens.css` / `DESIGN.md`. No hex values in components.
- **Contrast:** text ≥ 4.5:1, large text and UI graphics ≥ 3:1, in **both** themes. Measure it; don't eyeball it.
- **Icons:** lucide-react only, at 16/20/24px with stroke 1.75. **No emoji as UI icons.** Icon-only buttons need an `aria-label`.
- **Illustrations:** original art only (`components/illustrations/`). No vendor logos or trademarks, and no copied assets.
- **Diagrams:** only `<Flow>` / `<Diagram>`, following `DIAGRAM-RULES.md`. MUST rules block a merge.
- **Accessibility:** keyboard-reachable, visible focus, `prefers-reduced-motion` respected, tap targets ≥ 44px (≥ 24px minimum), and a correct heading order.

## 5. Content
- Follow `CONTENT-PLAN.md` §1: your own words, official sources first, a TL;DR, cards, and `related`.
- `tested_with` lists only versions you actually ran. Mark unrun snippets as "not run".
- Never invent news, events, dates, quotes or benchmark numbers.

## 6. Verification (required before every commit)
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```
- UI changes: look at the rendered result in a production build (`out/`) at **360px and 1280px, light and dark**. Report what you checked.
- Diagram changes: `pnpm qa:diagrams`, then open the screenshots.
- Report real numbers (test counts, sizes, Lighthouse scores). Never report a result you didn't observe.

## 7. Git
- Conventional commits (`feat|fix|docs|refactor|perf|test|chore|ci(scope): …`), one commit per step of the brief.
- **No `Co-Authored-By` trailer and no "Generated with" footer**, in any commit or PR.
- Workers never push and never merge. The lead reviews, merges into `main`, then deletes the worktree.
- "Done" means `git log` shows the commits and `git status` is clean.

## 8. Releases and deploys (every deploy is a release)
- **Production deploys happen only by pushing a SemVer tag `vX.Y.Z`.** `.github/workflows/deploy.yml` checks the tag, runs lint/typecheck/test/build, deploys to Cloudflare Workers (`learn.limmengty.com`), and then creates the GitHub Release `vX.Y.Z` with generated notes. Pushing to `main` never deploys.
- **The tag must equal `package.json` `version`** and point at a commit that is already on `main`. CI rejects anything else.
- **Bump the version in its own commit on `main`:** `chore(release): vX.Y.Z`. Use MAJOR for a breaking change to URLs or content structure, MINOR for new pages, sections or features, and PATCH for fixes only. While the version is 0.x, MINOR is a normal release.
- **Release steps (lead only):**
  1. `main` is green in CI and Quality Gates.
  2. Bump the version and commit.
  3. Push `main`.
  4. Run `git tag -a vX.Y.Z -m "vX.Y.Z"` and `git push origin vX.Y.Z`.
  5. Watch the Deploy run.
  6. Check production (docs/deploy/RUNBOOK.md section 2) and that the release exists.
- **Never** deploy from a laptop (`wrangler deploy`), never move a tag that has a GitHub Release, and never delete a release. A tag whose deploy failed before its release was created may be re-created on the fix. A bad release is fixed by rolling back (`wrangler rollback`, RUNBOOK section 3) and then shipping the next PATCH release.
- Workers never tag, release or deploy.

---

# Fumadocs

This site is built with [Fumadocs](https://fumadocs.dev) on Next.js. The APIs and conventions of Fumadocs may differ from your training data, so check its docs for the task at hand:

- Writing pages: https://fumadocs.dev/docs/next/markdown.md
- Organizing pages and folders: https://fumadocs.dev/docs/next/page-conventions.md
- Customizing the UI: https://fumadocs.dev/docs/next/guides/customize-ui.md
- Changing the theme and colors: https://fumadocs.dev/docs/ui/theme.md
- Upgrading Fumadocs: https://fumadocs.dev/docs/next/upgrade.md
- Other tasks: https://fumadocs.dev/llms.txt lists every docs page.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
