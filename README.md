# Mengty Learns

> Learning DevOps, architecture and security, one note at a time.
> **learn.limmengty.com** · a static, personal learning site by Lim Mengty

A learning system, not a blog: structured notes, animated process flows, hands-on labs that CI actually runs, flashcards with spaced repetition, and a personal tech radar. Everything is pre-rendered at build time (no backend, no database) and served from a Cloudflare Worker.

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
| Framework | Next.js 16 App Router, every route pre-rendered (SSG), `output: 'standalone'` |
| Hosting | Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`), static assets + read-only cache, no bindings to pay for |
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
| `pnpm build` | Builds `public/cards.json`, runs `next build`, then fails if any route is not static (`scripts/check-static-routes.mjs`) |
| `pnpm preview` | OpenNext build, then the Worker locally in wrangler dev at http://localhost:8787 (Linux/macOS/WSL; see Deploy) |
| `pnpm start` | `next start` on the Node build (no Worker) |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | ESLint / `tsc --noEmit` / Vitest |
| `pnpm qa:diagrams` | Screenshots every page with a diagram at 360/768/1280 × light/dark into `qa/diagrams/` (needs `pnpm preview` running, or `--url`) |
| `node scripts/qa-shots.mjs` / `node scripts/qa-axe.mjs` | Page screenshots + edge report / axe scan, against `pnpm preview` (or `--url <base>`) |
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
| `quality.yml` | Lighthouse (perf ≥ 0.9, a11y/best-practices/SEO ≥ 0.95) + axe (no serious/critical violations), against the Worker in wrangler dev |
| `deploy.yml` | lint, typecheck, test, OpenNext build, static-route and size gates, then PR preview version or production deploy |

## Deploy

**Cloudflare Workers with OpenNext**, deployed from GitHub Actions (`.github/workflows/deploy.yml`). Decisions: `docs/deploy/CLOUDFLARE-WORKERS-PLAN.md`. Operations (first deploy, domain check, rollback, token rotation, logs, size): `docs/deploy/RUNBOOK.md`.

| What | Where |
|---|---|
| Worker | `mengty-learns`, config in `wrangler.jsonc` |
| Production | `https://learn.limmengty.com` (Workers custom domain; change the subdomain in `wrangler.jsonc` only) |
| PR previews | each same-repo PR uploads a Worker *version* (not live); its preview URL is in the job summary |
| Production deploys | every push to `main`, after lint, typecheck, tests, the static-route gate and the size gate |
| Secrets | GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, never in the repo |
| Cache | `open-next.config.ts`: read-only static-assets incremental cache (no R2/KV/D1/Queue) |
| Headers | `lib/security-headers.mjs`, applied by `next.config.mjs` (Worker responses) and `public/_headers` (static assets) |

How it works: `opennextjs-cloudflare build` runs `pnpm build`, then bundles `.open-next/worker.js` plus `.open-next/assets`. Assets (`/_next/static/*`, `public/`) are served by Workers Static Assets without running the Worker; pages come from the Worker, which reads their pre-rendered HTML/RSC from the assets cache (`x-opennext-cache: HIT`).

Locally on Windows, `opennextjs-cloudflare build` fails (`EPERM ... symlink`: OpenNext copies pnpm's symlinked `node_modules`, and Windows needs Developer Mode or admin for symlinks). Use WSL (clone into the Linux filesystem, not `/mnt/c`), or rely on CI. `pnpm dev`, `pnpm build`, lint, typecheck and tests work on Windows.

Never run `pnpm deploy` or `pnpm upload` from a laptop: deploys go through CI so they are tested and logged.

## Tested with

| Dependency | Version |
|---|---|
| Next.js | 16.4.6 |
| Fumadocs | 16.19.7 |
| Tailwind CSS | 4.3.x |
| React | 19.3.x |
| TypeScript | 7.0.x |
| Node / pnpm | 22 / 11.6.0 |
| @opennextjs/cloudflare | 1.20.18 |
| Wrangler | 4.168.0 |
| Cloudflare compatibility date | 2026-11-23 |

## License

Content © Lim Mengty. All rights reserved unless stated otherwise.
