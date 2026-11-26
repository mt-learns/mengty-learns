# Mengty Learns

> Learning DevOps, architecture and security, one note at a time.
> **mengtylearns.com** · a static, personal learning site by Lim Mengty

A learning system, not a blog: structured notes, animated process flows, hands-on labs that CI actually runs, flashcards with spaced repetition, and a personal tech radar. Everything is static (no backend, no database) and deployed as plain files.

## What's inside

| Area | Route | What it is |
|---|---|---|
| Docs | `/docs/<section>/…` | Notes, concept pages, cheatsheets and labs in 9 sections: Foundations, Containers, Kubernetes, IaC, CI/CD, GitOps, Design, Architecture, Security |
| Review | `/review` | Daily flashcards (FSRS spaced repetition, saved in `localStorage`) built from every page's `cards` |
| Radar | `/radar` | Personal Tech Radar: Adopt / Trial / Assess / Hold |
| Digest | `/digest` (+ `/digest/rss.xml`) | Biweekly "things that matter", in my own words |
| Labs | `labs/<name>/` | Runnable Docker / Kubernetes / OpenTofu exercises, validated in CI |

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router, **static export** (`output: 'export'`) to `out/` |
| Docs shell | Fumadocs 16 (sidebar, TOC, static search, MDX) |
| Styling | Tailwind CSS v4 + shadcn/ui + design tokens in `app/tokens.css` (see `DESIGN.md`) |
| Diagrams | `<Flow>` (animated, React Flow, lazy-loaded) and `<Diagram>` (static), both following `DIAGRAM-RULES.md` |
| Content | MDX with a typed frontmatter schema in `lib/source.ts` |
| Tests | Vitest (unit + diagram layout invariants), Playwright (diagram screenshot QA), Lighthouse CI + axe (quality gates) |

## Quick start

Requirements: Node 22 (`.nvmrc`) and pnpm.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

| Script | Does |
|---|---|
| `pnpm dev` | Local dev server |
| `pnpm build` | Builds `public/cards.json`, then exports the static site to `out/` |
| `pnpm start` | Serves `out/` locally |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | ESLint / `tsc --noEmit` / Vitest |
| `pnpm qa:diagrams` | Screenshots every page with a diagram at 360/768/1280 × light/dark into `qa/diagrams/` |
| `pnpm new <kind> <section>/<slug>` | New page from a template (`note`, `concept`, …) |
| `node scripts/inbox.mjs --dry-run` | Preview this week's RSS inbox |

## Project map

```
app/                 routes: (home) landing, /docs, /review, /radar, /digest; tokens.css + global.css
components/
  flow/  diagram/    animated <Flow> and static <Diagram> (DIAGRAM-RULES.md)
  mdx/               MDX components (Sidenote, Gotcha, Tip, Figure, Terminal, concept sections)
  learn/             Quiz, MarkDone, OutdatedBanner, PageFooter
  illustrations/     original SVG section icons and spot illustrations
  ios/  ui/          design-system primitives and shadcn components
content/
  docs/ radar/ digest/   MDX content
  _templates/            note.mdx, concept.mdx
labs/                runnable labs (CI: .github/workflows/labs.yml)
scripts/             new.mjs, build-cards.mjs, inbox.mjs, qa-diagrams.mjs, make-icons.mjs
design/              AUDIT.md, REDESIGN-PLAN.md, screenshots
```

## Documentation map

| File | Read it for |
|---|---|
| `AGENTS.md` | **Implementation rules** for anyone (human or agent) changing code: scope, verification, commits, design |
| `PLAN.md` | Product brief, decisions, learning system, page templates |
| `IMPLEMENTATION.md` | The build order (steps and acceptance criteria) |
| `CONTENT-PLAN.md` | What to write, rules for every page, the publishing schedule |
| `DESIGN.md` / `PRODUCT.md` | Design system (tokens, type, colour, icons, illustration) and product context |
| `DIAGRAM-RULES.md` | The rendering standard for every flow and diagram |
| `design/REDESIGN-PLAN.md` | Current landing-page + palette redesign |
| `BLOCKERS.md` | Known open issues |

## Writing a page

1. `pnpm new note containers/volumes` (or `concept`, `cheatsheet`, `lab`, …).
2. Fill in the frontmatter (schema in `lib/source.ts`): `title`, `description`, `kind`, `type` (Diátaxis), `level`, `tags`, `tested_with`, `verified`, `status`, 3–5 `cards`, `sources` (official docs first) and `related` (≥ 2 slugs).
3. Start with a TL;DR (≤ 3 lines). Run every command you publish.
4. Diagrams only through `<Flow>` / `<Diagram>`. Check them with `pnpm qa:diagrams`.
5. Done means: the definition-of-done checklist in `CONTENT-PLAN.md` §1, plus a green `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

Pages whose `verified` date is more than 365 days old show a "May be outdated" banner automatically.

## Labs, radar and digest

- **Labs:** `labs/<name>/` with its own README. CI runs hadolint, `docker build`, `tofu fmt/validate`, tflint, kubeconform and actionlint.
- **Inbox:** `.github/workflows/inbox.yml` (weekly) turns `inbox/feeds.json` into a private GitHub issue. Nothing is auto-published. I write radar or digest entries from it by hand.
- **Radar:** `content/radar/*.mdx` (`ring`, `quadrant`, `what`, `why`, `action`). **Digest:** `content/digest/*.mdx`.

## Quality gates (CI)

| Workflow | Checks |
|---|---|
| `ci.yml` | install, lint, typecheck, build |
| `labs.yml` | lab linting and validation |
| `quality.yml` | Lighthouse (perf ≥ 0.9, a11y/best-practices/SEO ≥ 0.95) + axe (no serious/critical violations) |

## Deploy

Cloudflare Pages, from `out/`: build command `pnpm build`, output directory `out`, Node 22. Custom domain `mengtylearns.com` (apex), with `www` redirected to the apex.

## Tested with

| Dependency | Version |
|---|---|
| Next.js | 16.4.6 |
| Fumadocs | 16.19.7 |
| Tailwind CSS | 4.3.x |
| React | 19.3.x |
| TypeScript | 7.0.x |
| Node / pnpm | 22 / 11.6.0 |

## License

Content © Lim Mengty. All rights reserved unless stated otherwise.
