# Mengty Learns

Personal learning site for DevOps, architecture and security — one note at a time.

Built as a static Next.js 16 + Fumadocs 16 site (`output: 'export'`) with Tailwind v4, shadcn/ui, and iOS design tokens.

## Local dev

Requirements: Node 22 (`.nvmrc`) and `pnpm` (`11.6.0`).

```bash
pnpm install
pnpm dev
```

Useful scripts:

- `pnpm dev` — start the local Next.js dev server
- `pnpm build` — build `public/cards.json` and export the static site to `out/`
- `pnpm start` — serve `out/` locally via `serve`
- `pnpm lint` — run ESLint
- `pnpm typecheck` — run `tsc --noEmit`
- `pnpm test` — run Vitest unit tests
- `node scripts/make-icons.mjs` — regenerate `public/apple-touch-icon.png` and `public/og.png` from `public/favicon.svg`

## Write a note

Always start from a template using `pnpm new`:

```bash
pnpm new note <section>/<slug>
pnpm new concept <section>/<slug>
```

This creates `content/docs/<section>/<slug>.mdx` from `content/_templates/note.mdx` or `content/_templates/concept.mdx` with `title`, `description`, `updated`, and `verified` pre-filled. Add the new slug to the section's `meta.json` if it should appear in a specific sidebar order.

### Frontmatter fields

Defined in `lib/source.ts`:

| Field | Type / Values | Notes |
|---|---|---|
| `title` | `string` | Required page title |
| `description` | `string` | Short summary |
| `kind` | `'note' \| 'concept' \| 'cheatsheet' \| 'lab' \| 'decision' \| 'postmortem' \| 'radar' \| 'digest'` | Defaults to `'note'` |
| `type` | `'tutorial' \| 'how-to' \| 'reference' \| 'explanation'` | Diátaxis category |
| `level` | `'beginner' \| 'intermediate' \| 'advanced'` | Target depth |
| `tags` | `string[]` | Topic tags |
| `tested_with` | `Record<string, string>` | Tool versions verified against, e.g. `{ docker: "27.x" }` |
| `status` | `'draft' \| 'stable' \| 'outdated'` | Defaults to `'stable'` |
| `updated` | `string` (ISO date) | Last edited date |
| `verified` | `string` (ISO date) | Last date commands/labs were re-run (pages > 365 days show an outdated banner) |
| `cards` | `{ q: string; a: string }[]` | 3–5 flashcards |
| `related` | `string[]` | Slugs of ≥ 2 related pages |
| `sources` | `{ title: string; url: string }[]` | Official docs first |

### Flashcards & `/review`

Add 3–5 `cards` (`{ q, a }`) in the page frontmatter and include a `<Quiz>` at the end of the note. At build time, `scripts/build-cards.mjs` (via `prebuild`) collects all `cards` into `public/cards.json`, which powers spaced-repetition review at `/review` (`ts-fsrs` in `localStorage`).

### Definition of done (a page)

From [CONTENT-PLAN.md §1](./CONTENT-PLAN.md#1-rules-for-every-page):

- [ ] TL;DR (3 lines max), `type`, `kind`, `level`, `tags`
- [ ] `tested_with` + `verified`, and the commands actually ran
- [ ] At least 1 diagram or `<Flow>` (concept pages: a `<Flow>` is required)
- [ ] Gotchas + production checklist (notes) or Pros/Cons + Relations (concepts)
- [ ] 3–5 `cards` and a "Check yourself" `<Quiz>`
- [ ] `sources` with official docs and `related` with ≥ 2 slugs
- [ ] Build, lint and link check green

## Diagrams

All `<Flow>` (animated) and `<Diagram>` (static) diagrams must follow [DIAGRAM-RULES.md](./DIAGRAM-RULES.md):

- Use the shared `<Flow>` or `<Diagram>` components — never hand-draw inline `<svg>` diagrams in MDX.
- Layout is computed automatically with `dagre` (`LR` at container width ≥ 720px, `TB` below that).
- Max 7 nodes per view and max 8 steps per flow; labels ≤ 18 characters with full wrapping (no ellipsis truncation).
- Use `smoothstep` edges, distinct request/response offsets, and iOS design tokens only.

## Labs

Hands-on exercises live in `labs/<name>/` with their own `README.md` and runnable configuration (Dockerfiles, Kubernetes manifests, OpenTofu configs), linked from docs via `<LabLink>`.

`.github/workflows/labs.yml` validates labs automatically on PRs and pushes to `labs/**`:

- **Docker:** `hadolint` + `docker build --no-cache` on `labs/*/Dockerfile`
- **OpenTofu:** `tofu fmt -check`, `tofu validate`, and `tflint` on `labs/*/*.tf`
- **Kubernetes:** `kubeconform -strict` on `labs/**/k8s/*.yaml`

## Radar / digest workflow

- **Weekly inbox:** `.github/workflows/inbox.yml` runs every Monday (or via `workflow_dispatch`) and executes `node scripts/inbox.mjs` against `inbox/feeds.json` to open or update a private GitHub issue (`Inbox week NN`). Nothing is auto-published.
- **Tech Radar (`/radar`):** entries live in `content/radar/*.mdx` with `ring` (`adopt | trial | assess | hold`), `quadrant` (`tools | platforms | techniques | languages`), `what`, `why`, `action`, `updated`, `sources`, and `related`.
- **Digest (`/digest`):** biweekly summaries live in `content/digest/*.mdx` with `date`, `summary`, `status`, and `items`, plus a static RSS feed at `/digest/rss.xml`.

## Deploy

Deployed to **Cloudflare Pages** from `out/`:

- **Build command:** `pnpm build`
- **Build output directory:** `out`
- **Node version:** `22`
- **Custom domain:** `mengtylearns.com` (apex). Redirect `www` to apex in Cloudflare rules.

## Tested with

| Dependency | Version |
|---|---|
| Next.js | 16.4.6 |
| Fumadocs | 16.19.7 |
| Tailwind CSS | ^4.3.5 |
| shadcn/ui | latest |
| TypeScript | ^7.0.2 |
| React | ^19.3.1 |
| pnpm | 11.6.0 |
