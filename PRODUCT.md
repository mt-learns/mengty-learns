# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Lim Mengty (primary author and learner):** Uses the site daily to review flashcards (`/review`), write structured MDX notes fast (`pnpm new`), verify commands in runnable labs, and retrieve reference commands and architecture patterns.
- **Peers, engineering managers, and recruiters:** Scan technical depth (`/docs`), the learning system at work (`/review`, animated flows, CI-tested labs), and engineering judgment (`/radar`, `/digest`) in under 30 seconds, or read one deep-dive concept page end-to-end.

## Product Purpose

**Mengty Learns** (`mengtylearns.com`) is a personal learning system and public engineering portfolio. It consolidates scattered notes on DevOps, cloud infrastructure, software architecture, design patterns, and security into one fast, static, searchable knowledge base built for long-term retention rather than ephemeral news.

Success means:
- Publishing evergreen, tested notes across 9 core sections (Foundations, Containers, Kubernetes, IaC, CI/CD, GitOps, Design, Architecture, Security).
- Maintaining daily active recall through spaced-repetition flashcards (`/review`) and in-page `<Quiz>` checks.
- Keeping every lab runnable and CI-verified (`hadolint`, `docker build`, `terraform validate`, `kubeconform`, `actionlint`).

## Positioning

Unlike a chronological blog or a generic documentation site, Mengty Learns pairs **Diátaxis-structured notes** with **interactive step-by-step process flows (`<Flow>`)**, **CI-tested labs (`labs/*`)**, and **local-first spaced repetition (`/review`)**—all shipped as a zero-backend static export.

## Operating Context

- **Reading & learning:** Long-form comprehension (`Read` mode) on `/docs/*`, `/radar`, and `/digest`, plus an inviting overview (`Persuade` mode) on `/`.
- **Daily review ritual:** 15-minute daily flashcard session on `/review` using FSRS scheduling persisted in `localStorage` (`mt-review-v1`, `mt-streak-v1`) with JSON export/import backup.
- **Authoring workflow:** Local MDX authoring via `pnpm new <kind> <section>/<slug>`, build-time flashcard extraction (`scripts/build-cards.mjs` → `public/cards.json`), and automated link/lab validation in GitHub Actions.

## Capabilities and Constraints

- **Static export only (`output: 'export'`):** No server actions, middleware, `cookies()`, database, or un-prerendered dynamic routes. Search runs against a static build-time index (`/api/search`).
- **Content schema (`lib/source.ts`):** Every docs page carries `type`, `level`, `tags`, `tested_with`, `status` (`draft | stable | outdated`), `updated`, `verified`, `kind`, `cards`, `related`, and `sources`. Notes older than 365 days from `verified` automatically display an outdated banner.
- **Client JS budget:** Pages without interactive widgets (`<Flow>`, `<Quiz>`, `<Terminal>`, `SegmentedControl`, `/review`) ship minimal JS; React Flow is lazy-loaded only on pages with `<Flow>`.
- **Non-goals:** No user accounts, comments, view counters, backend APIs, or i18n in MVP.

## Brand Commitments

- **Name & Tagline:** *Mengty Learns* — *"Learning DevOps, architecture and security — one note at a time."*
- **Voice:** Clear, direct, practical, written in Mengty's own words. Facts link to official documentation first; personal opinions live explicitly in `<MyTake>`.
- **Originality:** All prose, diagrams, flows, and illustrations are original. No copied vendor trademarks or third-party assets.
- **Anti-reference:** Reuses Chongdai's iOS design system tokens and components, never Chongdai's pink palette, wedding domain, or Khmer typography.

## Evidence on Hand

- Production static build (`out/`) with 9 doc sections, interactive `<Flow>` v3 concept pages (`design/bridge`, `kubernetes/service-routing`, `architecture/*`), runnable labs (`labs/docker-multistage-next`, `labs/k8s-service-routing`, `labs/tofu-local-file`), `/radar` (12 entries), `/digest` and `/review` (21 generated flashcards).

## Product Principles

1. **Learn in public, verify in CI:** Every command and lab is tested; stale notes flag themselves automatically.
2. **Comprehension over decoration:** Structure concept pages predictably (Intent → Problem → Solution → Analogy → Flow → Structure → Code → Checklist → Steps → Pros/Cons → Relations → Quiz).
3. **Remember long-term:** Every note feeds active recall (`<Quiz>` + `/review` FSRS) and connects via `related` links and learning paths.
4. **Zero-ops static simplicity:** One Next.js + Fumadocs app, static `out/` output, state in `localStorage`.

## Accessibility & Inclusion

- Target WCAG 2.1 AA contrast (≥ 4.5:1 body text, ≥ 3:1 large text) in both light and dark themes.
- Full keyboard navigation, visible focus rings, sequential heading hierarchy, and `44px` minimum tap targets.
- Full `prefers-reduced-motion` support: animations and transitions disable cleanly while preserving state clarity.
- Responsive from `360px` mobile viewports to desktop (`1280px+`) without horizontal overflow.
