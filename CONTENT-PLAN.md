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
- [ ] At least 1 diagram or `<Flow>` (concept pages: a `<Flow>` is required)
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
| Linux processes, signals and exit codes | N / explanation | Flow: `SIGTERM` → graceful shutdown → `SIGKILL` | P2 |
| Networking basics: DNS, TCP, TLS, HTTP | C / explanation | Flow: browser → DNS → TCP handshake → TLS → HTTP | P1 |
| Git internals: commits, branches, rebase vs merge | C / explanation | Flow: rebase replays commits | P2 |
| Git cheatsheet | S / reference | — | P1 |

### 2.2 Containers (Docker)
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| Docker basics ✅ (exists, upgrade it to the template) | N / tutorial | — | P1 |
| Image layers and build cache | C / explanation | Flow: `COPY` order → cache hit or miss · Lab `docker-multistage-next` | P1 |
| Multi-stage builds for Next.js | L / how-to | Lab `docker-multistage-next` | P1 |
| Volumes vs bind mounts | N / explanation | — | P2 |
| Docker networking (bridge, host, compose DNS) | C / explanation | Flow: container A → compose DNS → container B | P2 |
| Dockerfile best practices (non-root, small images, `.dockerignore`) | N / reference | `hadolint` in the lab | P1 |
| Docker cheatsheet | S / reference | — | P1 |

### 2.3 Kubernetes
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| kubectl cheatsheet ✅ (exists, upgrade it) | S / reference | — | P1 |
| **Service routing: Ingress → Service → Pod** | C / explanation | **Flow `k8s-request`** (first flow) · Lab `k8s-service-routing` | P1 |
| What happens on `kubectl apply` | C / explanation | Flow: API server → etcd → scheduler → kubelet → container runtime | P1 |
| Pods, Deployments, ReplicaSets | N / explanation | — | P1 |
| Requests, limits and OOMKilled | N / explanation + **P** postmortem | — | P2 |
| ConfigMaps and Secrets (and why Secrets aren't encrypted by default) | N / how-to | — | P2 |
| Probes: liveness vs readiness vs startup | C / explanation | Flow: failing readiness → removed from endpoints | P2 |
| Helm basics | N / tutorial | — | P3 |

### 2.4 IaC: Terraform / OpenTofu
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| Terraform/OpenTofu first project | N / tutorial | Lab `tofu-local-file` | P1 |
| How `plan` and `apply` work: state, refresh, diff | C / explanation | Flow: config + state → refresh → diff → plan → apply | P1 |
| Remote state and locking | N / how-to | — | P2 |
| Modules: when and how | N / how-to | — | P2 |
| Terraform vs OpenTofu | D / decision | — | P2 |
| Terraform cheatsheet | S / reference | — | P2 |

### 2.5 CI/CD
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| Write a GitHub Actions workflow ✅ (exists, upgrade it) | N / how-to | `actionlint` | P1 |
| Pipeline anatomy: triggers, jobs, cache, artifacts | C / explanation | Flow: push → parallel jobs → cache → deploy | P1 |
| Caching that actually works (pnpm, Docker layers) | N / how-to | — | P2 |
| Secrets in CI, and OIDC instead of long-lived keys | N / how-to | Flow: Action → OIDC token → cloud role | P2 |
| CI/CD for this site (real example) | N / how-to | Links to `.github/workflows/ci.yml` | P1 |

### 2.6 GitOps
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| What GitOps is (pull vs push deploy) | C / explanation | Flow: commit → Argo CD detects → sync → cluster = git | P2 |
| Drift and reconciliation | C / explanation | Flow: manual `kubectl edit` → drift → auto-heal | P2 |
| Argo CD vs Flux | D / decision | — | P3 |

### 2.7 Design (OOP + patterns)
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| OOP pillars in TypeScript | N / explanation | — | P1 |
| SOLID with real examples | N / explanation | — | P1 |
| **Bridge** | C / explanation | **Flow `bridge`** (first flow) + compare toggle (v2) | P1 |
| Strategy | C / explanation | Flow: context → swap strategy at runtime | P2 |
| Observer | C / explanation | Flow: subject → notify → observers | P2 |
| Adapter | C / explanation | Flow: client → adapter → legacy API | P2 |
| Factory Method / Abstract Factory | C / explanation | Flow | P3 |
| Decorator | C / explanation | Flow: wrap → wrap → call chain | P3 |
| Pattern relations: Bridge vs Adapter vs Strategy | N / explanation | — | P2 |

### 2.8 Architecture

**Application architecture styles.** These four are often confused, so they share one example app (an "Order" service in TypeScript) and one compare page. Every page includes the **dependency rule** diagram: which way the arrows point.

| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| **Layered (n-tier) architecture** | C / explanation | Flow: HTTP → Presentation → Business → Data → DB, then back. Shows the "leaky layer" and "DB-centric" problems | P1 |
| **Hexagonal (Ports & Adapters)** | C / explanation | Flow: driving adapter (REST/CLI/test) → inbound port → domain → outbound port → driven adapter (Postgres/in-memory). Toggle: swap the Postgres adapter for in-memory in tests | P1 |
| **Onion architecture** | C / explanation | Flow: rings Domain model → Domain services → Application services → Infrastructure/UI. Dependencies only point inward | P2 |
| **Clean Architecture** | C / explanation | Flow: Controller → Use case (interactor) → Entity, with Presenter / Gateway interfaces. Dependency rule plus the crossing-boundaries step | P2 |
| **Layered vs Hexagonal vs Onion vs Clean: compare** | N / explanation | Flow compare toggle: the same request in each style. Table: where business logic lives, how dependencies point, testability, folder structure, when to use each | P1 |
| Dependency inversion in practice (the principle behind the last three) | N / explanation | Links to SOLID (§2.7) | P1 |
| Folder structure for each style (TS/Next.js examples) | N / reference | Lab `arch-order-service` with branches `layered`, `hexagonal`, `clean` | P2 |
| Vertical slice architecture | C / explanation | Flow: feature slice = handler → logic → data, with no shared layers | P3 |
| Modular monolith (module boundaries, public APIs between modules) | C / explanation | Flow: module A → public API → module B (no direct DB access) | P2 |

**Domain-driven design and patterns**

| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| DDD essentials: ubiquitous language, bounded context, context map | N / explanation | — | P2 |
| DDD tactical: entity, value object, aggregate, repository, domain event | C / explanation | Flow: command → aggregate enforces invariant → domain event | P2 |
| CQRS (and when not to use it) | C / explanation | Flow: command side → write model; query side → read model | P3 |
| Event-driven architecture: events vs commands, outbox pattern | C / explanation | Flow: transaction + outbox → relay → broker → consumers | P3 |
| Event sourcing (overview) | N / explanation | — | P3 |

**System-level architecture**

| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| Monolith vs modular monolith vs microservices | D / explanation | — | P2 |
| C4 model: context → container → component | C / explanation | Flow with zoom levels (Flow v3) | P3 |
| Write an ADR (with this site's ADRs as examples) | N / how-to | — | P2 |
| Caching strategies (cache-aside, write-through) | C / explanation | Flow: read miss → DB → fill cache | P2 |
| Queues and async work | C / explanation | Flow: API → queue → worker → retry / DLQ | P3 |

### 2.9 Security (OWASP)
| Page | kind / type | Flow or lab | Priority |
|---|---|---|---|
| OWASP Top 10, my summary | N / reference | — | P1 |
| SQL injection and parameterized queries | C / explanation | Flow: compare toggle (unsafe vs safe), all in the browser | P2 |
| XSS and output encoding, CSP | C / explanation | Flow | P2 |
| OAuth2 + PKCE login flow | C / explanation | Flow: app → auth server → code → token | P2 |
| Supply-chain security (lockfiles, Renovate, `pnpm audit`, SBOM) | N / how-to | Links to this repo's CI | P2 |
| Secrets management basics | N / explanation | — | P3 |

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

## 5. Maintenance rhythm
- **Monthly:** open the "May be outdated" list (pages where `verified` is more than 12 months old), re-run them, and bump `verified`.
- **Quarterly:** review the radar rings, and retire or merge thin notes.
- **On every tool major release** (from the inbox): check the pages with that tool in `tested_with`.
