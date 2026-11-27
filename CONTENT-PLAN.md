# Mengty Learns — Content Plan

> What to write, in what order, and how. This is the content backlog for the app.
> Spec for page types, templates and `<Flow>`: `PLAN.md` §9–§10. Build steps: `IMPLEMENTATION.md`.
> Date: 2026-11-26 · Owner: Lim Mengty

## 1. Rules for every page

1. Use a template: `pnpm new note …` or `pnpm new concept …`. Don't start from a blank file.
2. **TL;DR first**, 3 lines max. If I can't write it, I'm not ready to publish.
3. **Every fact has a source**, official docs first. My opinions go in `<MyTake>`.
4. **I ran it.** Commands and labs ran on my machine. Set `tested_with` and `verified`.
5. **3–5 `cards`** (flashcards) on every page, so they show up in `/review`.
6. **`related`**: at least 2 links to other pages.
7. **Own words, own diagrams.** No copied text or images. Quote briefly with a link.
8. Small is fine: publish `status: draft`, then improve it.

### Definition of done (a page)
- [ ] TL;DR, `type`, `kind`, `level`, `tags`
- [ ] `tested_with` + `verified`, and the commands actually ran
- [ ] At least 1 `<Diagram>` or `<Flow>` on `concept` and `note` pages (`concept` pages require a `<Flow>`; `cheatsheet` and `decision` pages are exempt when tables/matrices are clearer)
- [ ] Gotchas + production checklist (notes) or Pros/Cons + Relations (concepts)
- [ ] 3–5 `cards` and a "Check yourself" `<Quiz>`
- [ ] `sources` with official docs and `related` with ≥ 2 slugs
- [ ] Build, lint and link check green

## 2. Content backlog by section

Legend: **kind**: N note · C concept (+ `<Flow>`) · S cheatsheet · L lab · D decision · P postmortem.
**Priority**: P1 = write in the first month · P2 = month 2–3 · P3 = later.

### 2.1 Foundations
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| Linux processes, signals and exit codes ✅ (`foundations/linux-processes-signals`) | N / explanation | Flow: `SIGTERM` → graceful shutdown → `SIGKILL` | P2 |
| Networking basics: DNS, TCP, TLS, HTTP ✅ (`foundations/networking-basics`) | C / explanation | Flow: browser → DNS → TCP handshake → TLS → HTTP | P1 |
| Git internals: commits, branches, rebase vs merge ✅ (`foundations/git-internals`) | C / explanation | Flow: rebase replays commits | P2 |
| Git cheatsheet ✅ (`foundations/git-cheatsheet`) | S / reference | — | P1 |

### 2.2 Containers (Docker)
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| Docker basics ✅ (`containers/docker-basics`) | N / tutorial | — | P1 |
| Image layers and build cache ✅ (`containers/image-layers-cache`) | C / explanation | Flow: `COPY` order → cache hit or miss · Lab `docker-multistage-next` | P1 |
| Multi-stage builds for Next.js ✅ (`containers/multi-stage-nextjs`) | L / how-to | Lab `docker-multistage-next` | P1 |
| Volumes vs bind mounts ✅ (`containers/volumes-vs-bind-mounts`) | N / explanation | — | P2 |
| Docker networking (bridge, host, compose DNS) ✅ (`containers/docker-networking`) | C / explanation | Flow: container A → compose DNS → container B | P2 |
| Dockerfile best practices (non-root, small images, `.dockerignore`) ✅ (`containers/dockerfile-best-practices`) | N / reference | `hadolint` in the lab | P1 |
| Docker cheatsheet ✅ (`containers/docker-cheatsheet`) | S / reference | — | P1 |

### 2.3 Kubernetes
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| kubectl cheatsheet ✅ (`kubernetes/kubectl-cheatsheet`) | S / reference | — | P1 |
| **Service routing: Ingress → Service → Pod** ✅ (`kubernetes/service-routing`) | C / explanation | **Flow `k8s-request`** (first flow) · Lab `k8s-service-routing` | P1 |
| What happens on `kubectl apply` ✅ (`kubernetes/kubectl-apply`) | C / explanation | Flow: API server → etcd → scheduler → kubelet → container runtime | P1 |
| Pods, Deployments, ReplicaSets ✅ (`kubernetes/pods-deployments`) | N / explanation | — | P1 |
| Requests, limits and OOMKilled ✅ (`kubernetes/requests-limits-oom`) | N / explanation + **P** postmortem | — | P2 |
| ConfigMaps and Secrets (and why Secrets aren't encrypted by default) ✅ (`kubernetes/configmaps-secrets`) | N / how-to | — | P2 |
| Probes: liveness vs readiness vs startup ✅ (`kubernetes/probes`) | C / explanation | Flow: failing readiness → removed from endpoints | P2 |
| Helm basics ✅ (`kubernetes/helm-basics`) | N / tutorial | — | P3 |

### 2.4 IaC: Terraform / OpenTofu
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| Terraform/OpenTofu first project ✅ (`iac/first-project`) | N / tutorial | Lab `tofu-local-file` | P1 |
| How `plan` and `apply` work: state, refresh, diff ✅ (`iac/plan-apply`) | C / explanation | Flow: config + state → refresh → diff → plan → apply | P1 |
| Remote state and locking ✅ (`iac/remote-state-locking`) | N / how-to | — | P2 |
| Modules: when and how ✅ (`iac/modules`) | N / how-to | — | P2 |
| Terraform vs OpenTofu ✅ (`iac/terraform-vs-opentofu`) | D / decision | — | P2 |
| Terraform cheatsheet ✅ (`iac/tofu-cheatsheet`) | S / reference | — | P2 |

### 2.5 CI/CD
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| Write a GitHub Actions workflow ✅ (`ci-cd/github-actions`) | N / how-to | `actionlint` | P1 |
| Pipeline anatomy: triggers, jobs, cache, artifacts ✅ (`ci-cd/pipeline-anatomy`) | C / explanation | Flow: push → parallel jobs → cache → deploy | P1 |
| Caching that actually works (pnpm, Docker layers) ✅ (`ci-cd/caching`) | N / how-to | — | P2 |
| Secrets in CI, and OIDC instead of long-lived keys ✅ (`ci-cd/oidc-not-keys`) | N / how-to | Flow: Action → OIDC token → cloud role | P2 |
| CI/CD for this site (real example) ✅ (`ci-cd/this-site-pipeline`) | N / how-to | Links to `.github/workflows/ci.yml` | P1 |

### 2.6 GitOps
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| What GitOps is (pull vs push deploy) ✅ (`gitops/what-is-gitops`) | C / explanation | Flow: commit → Argo CD detects → sync → cluster = git | P2 |
| Drift and reconciliation ✅ (`gitops/drift-reconciliation`) | C / explanation | Flow: manual `kubectl edit` → drift → auto-heal | P2 |
| Argo CD vs Flux ✅ (`gitops/argocd-vs-flux`) | D / decision | — | P3 |

### 2.7 Design (OOP + patterns)
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| OOP pillars in TypeScript ✅ (`design/oop-pillars`) | N / explanation | — | P1 |
| SOLID with real examples ✅ (`design/solid`) | N / explanation | — | P1 |
| **Bridge** ✅ (`design/bridge`) | C / explanation | **Flow `bridge`** (first flow) + compare toggle (v2) | P1 |
| Strategy ✅ (`design/strategy`) | C / explanation | Flow: context → swap strategy at runtime | P2 |
| Observer ✅ (`design/observer`) | C / explanation | Flow: subject → notify → observers | P2 |
| Adapter ✅ (`design/adapter`) | C / explanation | Flow: client → adapter → legacy API | P2 |
| Factory Method / Abstract Factory ✅ (`design/factory-method`) | C / explanation | Flow | P3 |
| Decorator ✅ (`design/decorator`) | C / explanation | Flow: wrap → wrap → call chain | P3 |
| Pattern relations: Bridge vs Adapter vs Strategy ✅ (`design/pattern-relations`) | N / explanation | — | P2 |

### 2.8 Architecture

**Application architecture styles.** These four are often confused, so they share one example app (an "Order" service in TypeScript) and one compare page. Every page includes the **dependency rule** diagram: which way the arrows point.

| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| **Layered (n-tier) architecture** ✅ (`architecture/layered`) | C / explanation | Flow: HTTP → Presentation → Business → Data → DB, then back. Shows the "leaky layer" and "DB-centric" problems | P1 |
| **Hexagonal (Ports & Adapters)** ✅ (`architecture/hexagonal`) | C / explanation | Flow: driving adapter (REST/CLI/test) → inbound port → domain → outbound port → driven adapter (Postgres/in-memory). Toggle: swap the Postgres adapter for in-memory in tests | P1 |
| **Onion architecture** ✅ (`architecture/onion`) | C / explanation | Flow: rings Domain model → Domain services → Application services → Infrastructure/UI. Dependencies only point inward | P2 |
| **Clean Architecture** ✅ (`architecture/clean`) | C / explanation | Flow: Controller → Use case (interactor) → Entity, with Presenter / Gateway interfaces. Dependency rule plus the crossing-boundaries step | P2 |
| **Layered vs Hexagonal vs Onion vs Clean: compare** ✅ (`architecture/compare-styles`) | N / explanation | Flow compare toggle: the same request in each style. Table: where business logic lives, how dependencies point, testability, folder structure, when to use each | P1 |
| Dependency inversion in practice (the principle behind the last three) ✅ (`architecture/dependency-inversion`) | N / explanation | Links to SOLID (§2.7) | P1 |
| Folder structure for each style (TS/Next.js examples) — **MISSING** | N / reference | Lab `arch-order-service` with branches `layered`, `hexagonal`, `clean` | P2 |
| Vertical slice architecture ✅ (`architecture/vertical-slice`) | C / explanation | Flow: feature slice = handler → logic → data, with no shared layers | P3 |
| Modular monolith (module boundaries, public APIs between modules) ✅ (`architecture/modular-monolith`) | C / explanation | Flow: module A → public API → module B (no direct DB access) | P2 |

**Domain-driven design and patterns**

| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| DDD essentials: ubiquitous language, bounded context, context map ✅ (`architecture/ddd-essentials`) | N / explanation | — | P2 |
| DDD tactical: entity, value object, aggregate, repository, domain event ✅ (`architecture/ddd-tactical`) | C / explanation | Flow: command → aggregate enforces invariant → domain event | P2 |
| CQRS (and when not to use it) ✅ (`architecture/cqrs`) | C / explanation | Flow: command side → write model; query side → read model | P3 |
| Event-driven architecture: events vs commands, outbox pattern ✅ (`architecture/event-driven-outbox`) | C / explanation | Flow: transaction + outbox → relay → broker → consumers | P3 |
| Event sourcing (overview) ✅ (`architecture/event-sourcing`) | N / explanation | — | P3 |

**System-level architecture**

| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| Monolith vs modular monolith vs microservices ✅ (`architecture/monolith-vs-microservices`) | D / explanation | — | P2 |
| C4 model: context → container → component ✅ (`architecture/c4-model`) | C / explanation | Flow with zoom levels (Flow v3) | P3 |
| Write an ADR (with this site's ADRs as examples) ✅ (`process/adr`) | N / how-to | — | P2 |
| Caching strategies (cache-aside, write-through) ✅ (`architecture/caching-redis`) | C / explanation | Flow: read miss → DB → fill cache | P2 |
| Queues and async work ✅ (`architecture/queues-async`) | C / explanation | Flow: API → queue → worker → retry / DLQ | P3 |

### 2.9 Security (OWASP)
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| OWASP Top 10, my summary ✅ (`security/owasp-top-10`) | N / reference | — | P1 |
| SQL injection and parameterized queries ✅ (`security/sql-injection`) | C / explanation | Flow: compare toggle (unsafe vs safe), all in the browser | P2 |
| XSS and output encoding, CSP ✅ (`security/xss-csp`) | C / explanation | Flow | P2 |
| OAuth2 + PKCE login flow ✅ (`security/oauth21-oidc-pkce`) | C / explanation | Flow: app → auth server → code → token | P2 |
| Supply-chain security (lockfiles, Renovate, `pnpm audit`, SBOM) ✅ (`security/supply-chain`) | N / how-to | Links to this repo's CI | P2 |
| Secrets management basics ✅ (`security/secrets-management`) | N / explanation | — | P3 |

## 3. Radar and digest (my "news")

- **Cadence:** biweekly digest (3–5 items) and radar updates when something changes ring.
- **Inbox sources** (`inbox/feeds.json`, private): Kubernetes blog · CNCF blog · GitHub changelog · AWS What's New · OpenTofu releases · HashiCorp blog · OWASP news · CISA KEV · Node.js releases · Next.js blog.
- **Entry format:** **What** (1 line) · **Why it matters to me** (1 line) · **Action** (adopt / try in a lab / watch / ignore) · source link.
- **Starter radar (to review):**

| Ring | Items |
|---|---|
| Adopt | Docker multi-stage builds · GitHub Actions · pnpm · Renovate |
| Trial | OpenTofu · Argo CD · OIDC for CI → cloud |
| Assess | Flux · Cloudflare Workers · eBPF tooling |
| Hold | Long-lived cloud keys in CI · `latest` image tags in production |

## 4. First 4 weeks: publishing schedule

| Week | Publish | Flow / lab |
|---|---|---|
| 1 | Upgrade the 3 existing notes to the template · Git cheatsheet · Docker cheatsheet | — |
| 2 | **Bridge** (concept) · OOP pillars · Image layers and build cache | Flow `bridge` · Lab `docker-multistage-next` |
| 3 | **K8s service routing** (concept) · Pods/Deployments · What happens on `kubectl apply` | Flow `k8s-request` · Lab `k8s-service-routing` |
| 4 | Terraform first project · How plan/apply works · Pipeline anatomy · digest #1 | Flow `tofu-plan` · Lab `tofu-local-file` |

Target after 4 weeks: **≥ 14 pages, 4 flows, 3 labs, ~50 flashcards**. That meets the PLAN §1 goal of 10 notes across 4 sections.

## 5. Execution waves (assigned to agy workers)

> Added 2026-11-26. One wave = one worktree = one worker. **One commit per page** (`docs(<section>): <page>`), no trailers, never push.
> Every page meets the §1 definition of done. Use the `pnpm new` templates, and the `<Flow>`/`<Diagram>` API on `main` after the `diagram-rules` merge (DIAGRAM-RULES.md §10 checklist). Every command has actually been run, and `tested_with` + `verified` are set.
> The lead reviews each page for accuracy against its `sources` before merging. A page that teaches something wrong is worse than no page.

**Gate:** Wave 1 starts after `diagram-rules` is merged. Wave 0 starts after `docs/audit/CONTENT-AUDIT.md` is approved by the owner. After that, waves run one at a time; the next one starts after the previous one is merged.

| Wave | Goal | Pages (section/slug · kind · flow/lab) |
|---|---|---|
| **0: Fix** ✅ | Fix what the content audit finds as Critical/High (wrong facts, broken `related`, missing sources, flow paths that don't match reality, card errors) and fill the `TODO`s on the 6 flow pages | ✅ `architecture/layered`, ✅ `architecture/hexagonal`, ✅ `architecture/compare-styles`, ✅ `architecture/dependency-inversion`, ✅ `design/bridge`, ✅ `kubernetes/service-routing`. Note: `kitchen-sink.mdx` and `kitchen-sink-illustrations.mdx` remain in `content/docs/` as reference/QA fixtures |
| **1: Finish P1** ✅ | Complete the first-month backlog (§2 P1 items not yet written) | ✅ `foundations/networking-basics` C · ✅ `kubernetes/kubectl-apply` C · ✅ `iac/plan-apply` C · ✅ `ci-cd/pipeline-anatomy` C · ✅ `architecture/onion` C · ✅ `architecture/clean` C |
| **2: Security** ✅ | The application-security topics (OWASP ASVS 5.0 as the reference, Top 10 2025 for naming) | ✅ `security/asvs-5-overview` N · ✅ `security/authn-vs-authz` C · ✅ `security/sessions-vs-jwt` C · ✅ `security/oauth21-oidc-pkce` C · ✅ `security/passwords` N · ✅ `security/xss-csp` C · ✅ `security/sql-injection` C · ✅ `security/csrf-ssrf` C · ✅ `security/security-headers` S · ✅ `security/file-uploads` N · ✅ `security/rate-limiting` C · ✅ `security/secrets-management` N · ✅ `security/supply-chain` N · ✅ `security/threat-modeling` N |
| **3: Operations** ✅ | The DevOps and infrastructure topics, each with "when you DON'T need it" and the cost/complexity trade-off | ✅ `containers/compose` C · ✅ `containers/non-root-and-scanning` N · ✅ `containers/volumes-vs-bind-mounts` N · ✅ `foundations/linux-processes-signals` N · ✅ `foundations/reverse-proxy-tls` C · ✅ `architecture/caching-redis` C · ✅ `architecture/queues-async` C · ✅ `ci-cd/deploy-and-rollback` C · ✅ `ci-cd/oidc-not-keys` N · ✅ `foundations/backups-and-dr` N · ✅ `foundations/observability` C · ✅ `kubernetes/probes` C · ✅ `kubernetes/requests-limits-oom` N + P |
| **4: Patterns** ✅ | Patterns the owner studies from *Dive Into Design Patterns* (paraphrase and cite the chapter; never copy text or images), each with "when NOT to use it" | ✅ `design/strategy` C · ✅ `design/observer` C · ✅ `design/adapter` C · ✅ `design/decorator` C · ✅ `design/factory-method` C · ✅ `design/pattern-relations` N · ✅ `design/composition-vs-inheritance` N · ✅ `design/dependency-injection` N |
| **5: Engineering process** ✅ | How software gets from idea to production, sized for small teams | ✅ `process/scrum-kanban-waterfall` D · ✅ `process/prd-and-user-stories` N · ✅ `process/raci` S · ✅ `process/adr` N · ✅ `process/dor-dod-quality-gates` S · ✅ `process/code-review` N · ✅ `process/incident-management` N · ✅ `process/retrospectives` S (plus ✅ `process/estimation-and-prioritization`, ✅ `process/idea-to-production`, ✅ `process/testing-strategy`) |

### Missing from §2 / §5
- `architecture/folder-structure` (N / reference — "Folder structure for each style (TS/Next.js examples)"; `labs/arch-order-service` exists, but the standalone docs page has not been written yet).

### Wave 8+ candidates (remaining gaps against owner's checklist)

| Candidate | Worth it? | Rationale |
|---|---|---|
| `architecture/folder-structure` (N) | **Yes** | Closes the only remaining §2.8 gap and links directly to `labs/arch-order-service`. |
| Frontend architecture & state management (C/N) | **Yes** | Server vs client boundaries, URL/local/global state in Next.js/React — directly used in this site and everyday full-stack work. |
| Accessibility basics: WCAG, ARIA, keyboard & contrast (N/S) | **Yes** | Already enforced in CI via `@axe-core/playwright` and `DESIGN.md`; worth a practical reference note. |
| Performance & Core Web Vitals: LCP, INP, CLS (C/N) | **Yes** | Already gated in CI via Lighthouse CI; a focused guide on measuring and fixing regressions pays off. |
| Observability hands-on lab: Prometheus + Grafana + OTel (L) | **Yes** | Pairs with `foundations/observability` so learners can run real metrics, logs, and traces locally. |
| Kubernetes networking / CNI & `kube-proxy` nftables (C/L) | **Yes (scoped)** | Timely with `kube-proxy` IPVS removal (Kubernetes 1.40) and `nftables` GA (1.33); keep it focused on packet paths and CNI basics. |
| Service mesh: Istio / Linkerd / Cilium mesh (D/N) | **Skip for now** | High operational complexity for small teams; Ingress/Gateway API + NetworkPolicies cover most needs without mesh overhead. |

Rules for the worker in every wave:
- Sources first, official ones (docs.docker.com, kubernetes.io, opentofu.org, owasp.org, RFCs, the vendor docs). If a claim can't be sourced or run, drop it.
- 3–5 cards per page: one fact per card, with a correct and unambiguous answer. Plus a `<Quiz>` with an explanation for each answer.
- Every `<Flow>` follows DIAGRAM-RULES §10: responses retrace the real path, there's no red category, and it's checked at 360/1280 with the flows scrolled into view (`scripts/qa-shots.mjs`).
- Each wave ends with `pnpm lint && pnpm typecheck && pnpm test && pnpm build` green, a screenshot of every new page at 360/1280, and a report listing every page with its sources.

## 6. Maintenance rhythm
- **Monthly:** open the "May be outdated" list (pages where `verified` is more than 12 months old), re-run them, and bump `verified`.
- **Quarterly:** review the radar rings, and retire or merge thin notes.
- **On every tool major release** (from the inbox): check the pages with that tool in `tested_with`.

> **More sources:** the owner's own repos (key-learning, learn-devops, software-engineering) are mapped to Waves 9–13 in `docs/content/KNOWLEDGE-IMPORT-PLAN.md`.
