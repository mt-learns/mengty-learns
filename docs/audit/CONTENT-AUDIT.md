# Mengty Learns — Content Audit & Roadmap

> **Audit scope:** Content and data only (`content/docs/**`, `content/radar/*`, `content/digest/*`, `content/_templates/*`, `labs/*/README.md` + lab teaching files, `CONTENT-PLAN.md`, `PLAN.md` §7/§9/§10, `DIAGRAM-RULES.md`).  
> **Audit date:** 2026-11-26  
> **Status:** Report only — awaiting owner approval before any content edits.

---

## 1. Executive Summary

### Content Maturity
Mengty Learns has a **well-designed learning architecture** (Diátaxis types, `tested_with` + `verified` freshness metadata, flashcards feeding `/review`, `<Quiz>` active recall, `<Flow>` step-by-step animations, and CI-validated `labs/`), but the actual corpus is at an **early MVP / uneven-maturity stage**:

- **Inventory:** 20 published docs pages + 2 `kitchen-sink*` draft pages in `content/docs/`, 12 `content/radar/` entries, 1 draft `content/digest/` meta-entry, 2 `content/_templates/`, and 3 `labs/` (`docker-multistage-next`, `k8s-service-routing`, `tofu-local-file`).
- **Two tiers of quality:** Newer pages written to the v2 template (`git-cheatsheet`, `docker-cheatsheet`, `dockerfile-best-practices`, `image-layers-cache`, `multi-stage-nextjs`, `pods-deployments`, `first-project`, `this-site-pipeline`, `oop-pillars`, `solid`, `owasp-top-10`) are crisp, accurate, and complete. Older/v1 pages (`docker-basics`, `kubectl-cheatsheet`, `github-actions`) and the 6 `TODO(schema-v2)` concept pages (`service-routing`, `bridge`, `layered`, `hexagonal`, `dependency-inversion`, `compare-styles`) lag behind.

### Strengths
1. **Accurate, up-to-date security & language baselines:** `owasp-top-10.mdx` accurately teaches **OWASP Top 10:2025** (including SSRF absorbed into `A01:2025`, `A03:2025 Software Supply Chain Failures`, and `A10:2025 Mishandling of Exceptional Conditions`). `oop-pillars.mdx` and `solid.mdx` are verified against **TypeScript 7.0.2** and align cleanly with *Dive Into Design Patterns* and Robert C. Martin.
2. **Real, CI-tested labs:** `labs/docker-multistage-next`, `labs/k8s-service-routing`, and `labs/tofu-local-file` are wired into `.github/workflows/labs.yml` (`hadolint`, `docker build`, `tofu fmt/validate`, `tflint`, `kubeconform`, `actionlint`).
3. **Zero broken `related` slugs:** Every `related` slug across `content/docs/` and `content/radar/` resolves to an existing page.
4. **Honest `this-site-pipeline.mdx`:** Claims about `.github/workflows/ci.yml`, `labs.yml`, and `inbox.yml` match the actual workflow files and pinned versions (`pnpm 11.6.0`, Node `22`, `actions/checkout@v4.2.2`, `hadolint-action@v3.5.0`).

### Worst Problems & Top Risks to a Learner
1. **Missing `<LabLink>` targets (Critical):** `bridge.mdx`, `layered.mdx`, and `hexagonal.mdx` tell learners to run commands in `bridge-pattern-ts` and `arch-order-service`, neither of which exists in `labs/`.
2. **Insecure/contradictory CI example (Critical):** `github-actions.mdx` warns learners to pin actions to a full SHA in `<Gotcha>` and flashcards, then immediately shows an unpinned `actions/checkout@v4` + `npm install` (instead of `npm ci`) in its only example.
3. **Misleading multi-stage Dockerfile copy (Critical):** `labs/docker-multistage-next/Dockerfile` runs `npm install` in `deps` but never copies `node_modules` into `runner` (it only works because `package.json` has zero dependencies), teaching a broken pattern for real apps.
4. **Backwards `<Flow>` response edges (Critical):** `compare-styles.mdx` (`onion` and `clean` variants) routes the final `201 Created` / `ViewModel` response *inward* (`ui->appsvc`, `ctrl->uc`) instead of back to the caller.
5. **No flashcards or quizzes on 6 core concept pages (High):** `service-routing`, `bridge`, `layered`, `hexagonal`, `dependency-inversion`, and `compare-styles` all have `TODO(schema-v2)` / `TODO(step-11)` — meaning `/review` has **0 cards** for Architecture, Bridge, and Kubernetes Service Routing.
6. **Severe coverage gaps vs. owner's topic list:** Security has only 1 page (no ASVS 5.0, authN/authZ, JWT/OAuth2.1, XSS/CSRF/SQLi, rate limiting, or secrets); GitOps has 0 pages; Engineering Process (Scrum/Kanban/ADRs/DoR/DoD/incidents/retros) has 0 pages; DevOps lacks Linux/signals, reverse proxy/TLS, Redis, queues, observability, backups/DR.

---

## 2. Per-Page Findings Table

Priority scale: **Critical** = teaches something wrong, broken, or insecure · **High** = major template/schema/standards/freshness gap · **Medium** = clarity, consistency, or completeness issue · **Low** = polish or minor metadata.  
Effort: **S** (< 30 min) · **M** (30–120 min) · **L** (> 2 hours).

| Page | Finding | Evidence (`file:line`) | Impact on Learner | Fix | Priority | Effort |
|---|---|---|---|---|---|---|
| `ci-cd/github-actions.mdx` | Example uses unpinned `actions/checkout@v4` and `npm install` right after `<Gotcha>` and card Q2 say to pin full SHAs. | `content/docs/ci-cd/github-actions.mdx:14-15,30-32,43-45` | Teaches the exact insecure habit the page warns against; `npm install` is non-deterministic in CI. | Pin `actions/checkout` to full 40-char SHA + comment tag, use `npm ci`, upgrade to Note template (`## TL;DR`, `<Quiz>`, `tested_with`). | **Critical** | S |
| `architecture/compare-styles.mdx` | `onion` and `clean` `<Flow>` variants route final response *inward* (`ui->appsvc`, `ctrl->uc`) because caller node is omitted. | `content/docs/architecture/compare-styles.mdx:148,169` | Learners see the HTTP response travelling back into the application core instead of out to the client. | Add `HTTP Client` node to `onion` and `clean` variants and route final response to it (`ui->http`, `ctrl->http`). | **Critical** | S |
| `design/bridge.mdx` | `<LabLink>` references non-existent `bridge-pattern-ts` lab (`npx tsx bridge.ts`). | `content/docs/design/bridge.mdx:218-222` | Learner tries to run the lab command and hits a missing directory/file error. | Create `labs/bridge-pattern-ts/` (or remove `<LabLink>` until the lab exists). | **Critical** | M |
| `architecture/layered.mdx`, `hexagonal.mdx` | `<LabLink>` references non-existent `arch-order-service` lab (`npx tsx ...`, `pnpm test`). | `content/docs/architecture/layered.mdx:208-212`, `hexagonal.mdx:228-232` | Learner cannot run the advertised Order service branches (`layered`, `hexagonal`, `clean`). | Create `labs/arch-order-service/` as planned in `CONTENT-PLAN.md` §2.8, or mark as planned. | **Critical** | L |
| `labs/docker-multistage-next/Dockerfile` | `deps` runs `npm install` but `runner` only copies `package.json`, never `node_modules`. | `labs/docker-multistage-next/Dockerfile:8,20` | Works only because `package.json` has 0 dependencies; fails with `MODULE_NOT_FOUND` if learner adds any package. | Copy `node_modules` from `deps` (or add a minimal dep / explicit comment explaining why `node_modules` is omitted). | **Critical** | S |
| `kubernetes/service-routing.mdx`, `design/bridge.mdx`, `architecture/layered.mdx`, `hexagonal.mdx`, `dependency-inversion.mdx`, `compare-styles.mdx` | `TODO(schema-v2)` & `TODO(step-11)` left in production docs: missing `kind`, `verified`, `cards`, `related`, `sources` frontmatter and missing `<Quiz>`. | `service-routing.mdx:13,275`, `bridge.mdx:13,299`, `layered.mdx:13,293`, `hexagonal.mdx:13,311`, `dependency-inversion.mdx:13,166`, `compare-styles.mdx:13` | Zero flashcards in `/review` and no active-recall `<Quiz>` for 6 flagship concept/architecture pages. | Backfill `kind`, `verified`, 3–5 `cards`, ≥2 `related`, `sources`, and `<Quiz>` on all 6 pages. | **High** | M |
| `service-routing.mdx`, `bridge.mdx`, `layered.mdx`, `hexagonal.mdx`, `dependency-inversion.mdx`, `compare-styles.mdx` | Hand-drawn inline `<svg>` figures and raw `x`/`y` coordinates in `<Flow>`. | `service-routing.mdx:25-49,70-74,88-119` (and same pattern in the other 5 pages) | Violates `DIAGRAM-RULES.md` §1.2 (MUST NOT inline `<svg>`) and §2.1 (MUST use dagre `rank`/`order`, no `x`/`y`). | Convert inline `<svg>` figures to `<Diagram>` and replace `x`/`y` with `rank`/`order`. | **High** | L |
| `containers/docker-basics.mdx` | Legacy stub: duplicate `# Docker Basics` H1, no `## TL;DR`, no `## Do it`, no `## Production checklist`, no `<Quiz>`, stale `docker: "27.x"`. | `content/docs/containers/docker-basics.mdx:11-12,28-53` | Weak beginner onboarding; Docker 27.x is EOL (current is 29.x). | Upgrade to `note` template and re-verify against Docker 29.x. | **High** | M |
| `kubernetes/kubectl-cheatsheet.mdx` | Legacy stub: duplicate `# Kubectl Cheatsheet` H1, missing `tested_with`, `## TL;DR`, `<Quiz>`, `## Sources` in body; only 6 commands. | `content/docs/kubernetes/kubectl-cheatsheet.mdx:1-47` | Too thin to serve as a daily cheatsheet; no `tested_with` version or self-check quiz. | Upgrade to cheatsheet template with `tested_with` (k8s 1.35), `apply`, `describe`, `rollout`, `port-forward`, `<Quiz>`. | **High** | M |
| `kubernetes/service-routing.mdx`, `pods-deployments.mdx` | `tested_with` lists EOL Kubernetes versions (`1.31` and `1.34.1`; 1.34 reached EOL 2026-10-27). | `service-routing.mdx:7-8`, `pods-deployments.mdx:10-11` | Commands/flags may drift from supported Kubernetes 1.35+. | Re-verify manifests and `kubectl` output on Kubernetes 1.35+ and bump `tested_with`. | **High** | S |
| `design/bridge.mdx`, `architecture/layered.mdx`, `hexagonal.mdx`, `dependency-inversion.mdx`, `compare-styles.mdx` | `tested_with` lists stale `typescript: "5.x"` while `oop-pillars.mdx` and `solid.mdx` use `7.0.2`. | `bridge.mdx:7-8`, `layered.mdx:7-8`, `hexagonal.mdx:7-8`, `dependency-inversion.mdx:7-8`, `compare-styles.mdx:7-8` | Inconsistent toolchain baseline across Design & Architecture sections. | Re-run snippets with TypeScript 7.0.2 and update `tested_with`. | **High** | S |
| `kubernetes/service-routing.mdx` | `<Flow id="k8s-request">` models `Service` as a stateful hop returning `200 OK` (`podA->svc`, `svc->ing`). | `content/docs/kubernetes/service-routing.mdx:79-82` | Misleads learners into thinking `Service` is an L7 proxy process rather than virtual IP DNAT/conntrack via `kube-proxy`. | Clarify in step text that `Service` is a virtual IP (DNAT/conntrack via `kube-proxy`), not a proxy process. | **High** | S |
| `content/docs/gitops/meta.json` | Section exists in sidebar with 0 pages and is missing from `content/docs/index.mdx`. | `content/docs/gitops/meta.json:1-4`, `content/docs/index.mdx:14-63` | Clicking/seeing an empty GitOps section signals unfinished site. | Publish P2 GitOps pages (`what-is-gitops`, `drift-reconciliation`) and add GitOps card to `index.mdx`. | **High** | M |
| `labs/docker-multistage-next/Dockerfile`, `labs/k8s-service-routing/k8s/*` | Lab `Dockerfile` lacks `HEALTHCHECK` (despite `/healthz` in `server.mjs`); `ingress.yaml` lacks `ingressClassName`; `deployment.yaml` lacks `securityContext`. | `labs/docker-multistage-next/Dockerfile:23-26`, `labs/k8s-service-routing/k8s/ingress.yaml:5`, `deployment.yaml:17` | Misses key production-hardening practices taught elsewhere on the site. | Add `HEALTHCHECK` to lab `Dockerfile`, `ingressClassName: nginx` (with comment) to `ingress.yaml`, and `securityContext` to `deployment.yaml`. | **High** | S |
| `design/bridge.mdx` | `<Flow id="bridge">` skips `device` on return (`tv->remote`) and ends step 7 at `device->radio` with no response. | `content/docs/design/bridge.mdx:98-103` | Violates `DIAGRAM-RULES.md` §10 ("Responses retrace the real path"). | Retrace `tv->device->remote->client` or document interface pass-through consistently. | **Medium** | S |
| `design/bridge.mdx` | Reuses the exact `RemoteControl`/`Device`/`TV`/`Radio` example from *Dive Into Design Patterns*. | `content/docs/design/bridge.mdx:23-214` | Violates `CONTENT-PLAN.md` §1 rule 7 ("Own words, own diagrams") and risks copyright overlap. | Replace example domain with an original one (e.g., `Exporter` × `StorageDriver` already mentioned in `<MyTake>`). | **Medium** | M |
| `architecture/hexagonal.mdx` | `<Flow id="hexagonal-order">` skips `inport` on response (`domain->rest`, `domain->test`). | `content/docs/architecture/hexagonal.mdx:102,125` | Asymmetric flow path compared to `DIAGRAM-RULES.md` §10. | Route responses back through `inport` (`domain->inport->rest`). | **Medium** | S |
| `content/radar/*` | 4 radar items have `related: []` (`cloudflare-workers`, `opentofu`, `pnpm`, `renovate`); `docker-multistage-builds` and `latest-image-tags` link to `docker-basics` instead of `multi-stage-nextjs` / `dockerfile-best-practices`. | `content/radar/opentofu.mdx:12`, `pnpm.mdx:12`, `docker-multistage-builds.mdx:12-13`, `latest-image-tags.mdx:12-13` | Missed internal navigation between Radar and relevant Docs. | Wire `related` slugs to existing docs (`iac/first-project`, `ci-cd/this-site-pipeline`, `containers/multi-stage-nextjs`, `containers/dockerfile-best-practices`). | **Medium** | S |
| `content/radar/cloudflare-workers.mdx` | Claims "Zero cold-start overhead" and foregrounds Pages alongside Workers. | `content/radar/cloudflare-workers.mdx:6` | Slight overstatement (isolates have minimal/sub-ms startup, not zero; Cloudflare recommends Workers Static Assets over Pages for new projects). | Soften to "Near-zero cold-start overhead" and reference Workers Assets / KV / D1 / R2. | **Medium** | S |
| `kubernetes/kubectl-cheatsheet.mdx` | Hardcodes `/bin/bash` in `kubectl exec`. | `content/docs/kubernetes/kubectl-cheatsheet.mdx:15,46` | Fails on Alpine/distroless containers (like this site's own Docker lab). | Show `sh` as primary and note `/bin/bash` when available. | **Medium** | S |
| `iac/first-project.mdx` | `related` points to `containers/multi-stage-nextjs` and `kubernetes/service-routing`. | `content/docs/iac/first-project.mdx:21-23` | Weak topical link for a learner finishing an OpenTofu tutorial. | Link to `ci-cd/this-site-pipeline` (which runs `tofu validate`/`tflint`) and future `iac/plan-apply`. | **Medium** | S |
| `ci-cd/this-site-pipeline.mdx` | Accurately documents `ci.yml`, `labs.yml`, `inbox.yml`, but omits noting `ci.yml` lacks explicit `permissions: contents: read`. | `content/docs/ci-cd/this-site-pipeline.mdx:51-64`, `.github/workflows/ci.yml:1-23` | Minor least-privilege teaching gap when comparing `ci.yml` with `labs.yml`. | Note in Gotchas that `ci.yml` should also declare `permissions: contents: read`. | **Medium** | S |
| `containers/dockerfile-best-practices.mdx` | Shows `npm ci --omit=dev --ignore-scripts` while linked lab `labs/docker-multistage-next` has no `package-lock.json` and uses `npm install`. | `dockerfile-best-practices.mdx:58-59`, `labs/docker-multistage-next/Dockerfile:8` | Learner inspecting the lab may wonder why `package-lock.json` and `npm ci` are absent. | Add `package-lock.json` to lab or add a 1-line note explaining `npm ci` vs `npm install`. | **Low** | S |
| `kitchen-sink.mdx`, `kitchen-sink-illustrations.mdx` | Both sit in `content/docs/` with `status: draft` (unlisted in `meta.json`). | `content/docs/kitchen-sink.mdx:6`, `kitchen-sink-illustrations.mdx:6` | Acceptable for dev/QA (`PLAN.md` §10.6), but should not leak into production search, sitemap, or `/review`. | Verify build excludes `status: draft` from nav/search/cards, or gate behind `NODE_ENV !== 'production'`. | **Low** | S |
| `content/digest/digest-0-how-this-works.mdx` | Only digest entry is a `status: draft` meta-doc (`items: []`). | `content/digest/digest-0-how-this-works.mdx:5-6` | `/digest` is empty in production until Digest #1 is published. | Publish Digest #1 with 3–5 sourced items per `CONTENT-PLAN.md` §4. | **Low** | M |

---

## 3. Standards Alignment

| Standard / Primary Source | Audited Pages | Alignment Status | Gaps / Required Actions |
|---|---|---|---|
| **OWASP Top 10:2025** (`top10.owasp.org/2025/`) | `security/owasp-top-10.mdx` | **Aligned** | Correctly covers `A01:2025` (including SSRF), `A02:2025` Security Misconfiguration, `A03:2025` Software Supply Chain Failures, and `A10:2025` Mishandling of Exceptional Conditions. |
| **OWASP ASVS 5.0** (17 chapters, V1–V17) | `security/owasp-top-10.mdx` (only security page) | **Not yet covered** | No ASVS 5.0 page exists. Future security pages must use **ASVS 5.0** chapters (`V1` Encoding/Sanitization, `V2` Validation/Business Logic, `V3` Web Frontend, `V4` API/Web Service, `V5` File Handling, `V6` Authentication, `V7` Session Management, `V8` Authorization, `V9` Self-contained Tokens, `V10` OAuth/OIDC, `V11` Cryptography, `V12` Secure Communication, `V13` Configuration, `V14` Data Protection, `V15` Business Continuity/Resilience, `V16` Client-Side/Privacy, `V17` Real-Time) — never ASVS 4.x numbering. |
| ***Dive Into Design Patterns*** (Alexander Shvets) | `design/oop-pillars.mdx`, `design/solid.mdx`, `design/bridge.mdx` | **Aligned on concepts; 1 originality issue** | OOP Pillars (Abstraction, Encapsulation, Inheritance, Polymorphism) and SOLID (SRP, OCP, LSP, ISP, DIP) match the book's definitions and caveats. `bridge.mdx` matches Intent, Problem, Structure, Applicability, Pros/Cons, and Relations (Adapter, Strategy, Abstract Factory), **but** reuses the book's `RemoteControl`/`Device` example domain — rewrite with an original domain. |
| **Architecture Primary Sources** (Cockburn, Fowler, Martin, Palermo) | `layered.mdx`, `hexagonal.mdx`, `dependency-inversion.mdx`, `compare-styles.mdx` | **Aligned** | Fowler's Presentation/Domain/Data, Cockburn's Driving/Driven Ports & Adapters, Martin's DIP & Clean Dependency Rule, and Palermo's Onion rings are accurately represented and cited. Missing dedicated `onion.mdx` and `clean.mdx` pages. |
| **DevOps Best Practices** (Docker, Kubernetes, OpenTofu, GitHub Actions) | `containers/*`, `kubernetes/*`, `iac/*`, `ci-cd/*`, `labs/*` | **Mostly aligned; 3 gaps** | `dockerfile-best-practices.mdx`, `image-layers-cache.mdx`, `multi-stage-nextjs.mdx`, `pods-deployments.mdx`, `first-project.mdx`, and `this-site-pipeline.mdx` follow best practices. Gaps: `github-actions.mdx` unpinned `@v4` + `npm install`; `labs/docker-multistage-next/Dockerfile` omits `node_modules` copy & `HEALTHCHECK`; `service-routing.mdx` & `pods-deployments.mdx` cite EOL k8s versions (`1.31`, `1.34.1`). |

---

## 4. Learning-Data Correctness

### Flashcards (`cards`)
- **Total cards across `content/docs/`:** 49 cards across 14 pages; **6 pages have 0 cards** (`service-routing`, `bridge`, `layered`, `hexagonal`, `dependency-inversion`, `compare-styles`) due to `TODO(schema-v2)`.
- **Quality of existing 49 cards:** Generally strong — one fact per card, unambiguous, non-trivial (e.g., `git-cheatsheet`, `solid`, `owasp-top-10`, `this-site-pipeline`).
- **Minor issue:** `github-actions.mdx` Q2 ("Why should you pin action versions to a full SHA?") is contradicted by the page's own `@v4` code block.

### Quizzes (`<Quiz>`)
- **11 pages** have `<Quiz>` with 2–3 well-crafted, single-best-answer questions and clear distractor explanations.
- **9 pages lack `<Quiz>`:** the 6 `TODO(schema-v2)` pages + the 3 legacy stubs (`docker-basics`, `kubectl-cheatsheet`, `github-actions`).

### `<Flow>` Steps & Diagram Labels
- **6 `<Flow>` instances** exist (`service-routing`, `bridge`, `layered`, `hexagonal`, `compare-styles`, `kitchen-sink`).
- **Correctness bugs:**
  1. `compare-styles.mdx` (`onion` & `clean` variants): final response edges (`ui->appsvc`, `ctrl->uc`) point *inward* instead of out to the caller.
  2. `service-routing.mdx` (`k8s-request`): portrays `Service` as a stateful L7 hop returning responses (`podA->svc`, `svc->ing`) instead of virtual IP DNAT/conntrack.
  3. `bridge.mdx` (`bridge`): skips `device` on `tv->remote` and omits return steps after `device->radio`.
  4. `hexagonal.mdx` (`hexagonal-order`): skips `inport` on `domain->rest` / `domain->test`.
- **Rule compliance (`DIAGRAM-RULES.md`):** All 6 concept pages still use `x`/`y` grid coordinates (§2.1 violation) and hand-drawn inline `<svg>` figures (§1.2 violation).

### `related`, `sources`, `verified` / `tested_with`
- **`related`:** 0 broken slugs across `content/docs/` and `content/radar/`. However, 6 docs pages omit `related` in frontmatter, and 4 radar pages have `related: []`.
- **`sources`:** All existing sources are official-first (`docs.docker.com`, `kubernetes.io`, `opentofu.org`, `docs.github.com`, `top10.owasp.org`, `typescriptlang.org`, `git-scm.com`, `martinfowler.com`, `alistair.cockburn.us`, `blog.cleancoder.com`, `jeffreypalermo.com`). 6 docs pages lack `sources` in frontmatter (present in MDX body only).
- **`verified` / `tested_with`:** All `verified` dates are `2026-11-26` (< 365 days), **except** the 6 `TODO(schema-v2)` pages which omit `verified`. Version staleness: `docker: "27.x"` (EOL), `kubernetes: "1.31"` (EOL), `kubectl: "1.34.1"` (EOL 2026-10-27), `typescript: "5.x"` (stale vs `7.0.2`).

### Radar & Digest
- **Radar (`content/radar/*`):** All 12 entries match `CONTENT-PLAN.md` §3, have justified rings/quadrants, official source URLs, and no fabricated dates or benchmarks. Needs `related` links wired and `cloudflare-workers.mdx` wording tightened.
- **Digest (`content/digest/*`):** Only `digest-0-how-this-works.mdx` (`status: draft`, `items: []`) exists. No fabricated claims, but Digest #1 is still unstarted.

---

## 5. Coverage-Gap Map (vs. Owner's Topic List)

> Reference: `audit-request.md`. Items already listed in `CONTENT-PLAN.md` §2 are referenced by section rather than duplicated.

### A. Architecture & Design
| Owner Topic | Current Coverage | In `CONTENT-PLAN.md`? | Gap Assessment |
|---|---|---|---|
| Architecture styles (Layered, Hexagonal, Onion, Clean, Vertical Slice, Modular Monolith) | `layered`, `hexagonal`, `compare-styles` exist | Yes (§2.8: `onion`, `clean`, `vertical-slice`, `modular-monolith`, `folder-structure`) | **Medium gap:** `onion` and `clean` are compared in `compare-styles` but lack dedicated pages and `arch-order-service` lab. |
| SOLID, OOP, composition vs inheritance, DI | `oop-pillars`, `solid`, `dependency-inversion` exist | Yes (§2.7, §2.8) | **Small gap:** Composition vs inheritance is covered inside `oop-pillars` & `bridge`, but Dependency Injection (containers vs pure DI) is not yet a dedicated section/page. |
| Design patterns (GoF) | `bridge` only | Partial (§2.7: Strategy, Observer, Adapter, Factory/Abstract Factory, Decorator, Pattern relations) | **Medium gap:** Missing Builder, Facade, Proxy, Chain of Responsibility, Command, State, Template Method from the owner's list. |
| DDD, CQRS, Event-driven, Outbox, Event Sourcing | None | Yes (§2.8) | **Large gap:** 0 pages written yet. |
| Overengineering / technical debt / testing strategy | None | No | **Missing from plan:** Practical "When NOT to abstract" / testing pyramid & contract testing page. |

### B. Security (OWASP ASVS 5.0)
| Owner Topic | Current Coverage | In `CONTENT-PLAN.md`? | Gap Assessment |
|---|---|---|---|
| OWASP Top 10:2025 | `security/owasp-top-10` | Yes (§2.9) | Covered. |
| ASVS 5.0 baseline & checklist | None | No | **Critical gap:** ASVS 5.0 is the owner's primary security reference, yet 0 pages explain its 17 chapters or L1/L2/L3 verification. |
| AuthN, passwords, sessions, JWT/refresh, OAuth 2.1/OIDC | None | Partial (§2.9: `OAuth2 + PKCE`) | **Critical gap:** No coverage of password hashing (Argon2id), session management, JWT pitfalls, or OAuth 2.1/OIDC. |
| AuthZ (RBAC / ABAC / BOLA / BFLA) | Mentioned briefly in `owasp-top-10` | No | **Critical gap:** Access control is #1 in OWASP 2025 and ASVS V8, needs a dedicated page. |
| Injection (SQLi), XSS/CSP, CSRF, SSRF | None | Partial (§2.9: SQLi, XSS/CSP) | **High gap:** CSRF and SSRF (now in A01:2025) are missing from `CONTENT-PLAN.md`. |
| API security, rate limiting, file uploads, security headers, secrets, logging/PII, threat modelling | None | Partial (§2.9: Secrets) | **High gap:** Rate limiting, uploads, security headers (HSTS/CSP/CORS), threat modelling, and PII-safe logging are missing from `CONTENT-PLAN.md`. |
| Supply chain (`pnpm audit`, lockfiles, Renovate, SBOM) | Mentioned in `owasp-top-10` & `this-site-pipeline` | Yes (§2.9) | Scheduled in `CONTENT-PLAN.md` P2. |

### C. DevOps, Infrastructure & Backend Operations
| Owner Topic | Current Coverage | In `CONTENT-PLAN.md`? | Gap Assessment |
|---|---|---|---|
| Docker, Compose, layers, multi-stage, non-root | 5 pages + 1 lab | Yes (§2.2) | **Small gap:** Docker Compose, volumes/bind mounts, and Docker networking are planned; **container image scanning** (Trivy/Grype) is missing from `CONTENT-PLAN.md`. |
| Kubernetes | 3 pages + 1 lab | Yes (§2.3) | **Medium gap:** `kubectl apply`, probes, requests/limits/OOMKilled, ConfigMaps/Secrets are planned in P1/P2. |
| IaC (OpenTofu/Terraform) | 1 page + 1 lab | Yes (§2.4) | **Medium gap:** `plan/apply`, remote state/locking, modules, Tofu vs TF are planned. |
| CI/CD, GitOps, rollback | 2 CI pages; 0 GitOps | Yes (§2.5, §2.6) | **Medium gap:** Deployment & **rollback strategies** (blue-green, canary, `rollout undo`) and GitOps pages are missing/unstarted. |
| Linux, reverse proxy/TLS, firewall/networking | None | Partial (§2.1: Linux signals, DNS/TCP/TLS/HTTP) | **High gap:** Reverse proxy + TLS termination (Caddy/Nginx/Cloudflare) and host firewall/UFW/security groups are missing from `CONTENT-PLAN.md`. |
| Caching (Redis + persistence), queues/workers | None | Yes (§2.8: Caching, Queues) | **High gap:** Redis persistence (RDB/AOF, eviction) is not in `CONTENT-PLAN.md`. |
| Observability, backups/recovery, DR, cost/sizing | None | No | **Critical DevOps gap:** Monitoring/logging/alerting, backups & restore testing, DR (RPO/RTO), and resource sizing/cost are completely absent from `CONTENT-PLAN.md`. |

### D. Engineering Workflow, Process & Leadership
| Owner Topic | Current Coverage | In `CONTENT-PLAN.md`? | Gap Assessment |
|---|---|---|---|
| Agile / Scrum / Kanban / Waterfall / Hybrid | None | No | **Missing section:** 0 process pages in `CONTENT-PLAN.md`. |
| Lifecycle docs (PRD, RACI, DoR/DoD, quality gates) | None | No | **Missing section.** |
| ADRs ("why X over Y") | None | Partial (§2.8: `Write an ADR`) | Planned in §2.8, but no process home. |
| Code review, incident management, postmortems, retros | None | No | **Missing section** (even though `kind: postmortem` exists in `PLAN.md` §7!). |

---

## 6. Proposed New Pages (Not Already in `CONTENT-PLAN.md`)

> Only new proposals are listed here; items already in `CONTENT-PLAN.md` §2 (e.g. `onion`, `clean`, `k8s-probes`, `tofu-plan-apply`, `oauth2-pkce`, `sqli`, `xss-csp`, `supply-chain`) should simply be executed from `CONTENT-PLAN.md`.

| Section / Slug | Kind | Level | One-Line Scope | Official Sources | Flow / Lab |
|---|---|---|---|---|---|
| `security/asvs-5-checklist` | `note` | intermediate | How to apply OWASP ASVS 5.0 (L1–L3, chapters V1–V17) to a web app without checklist bloat. | `owasp.org/www-project-application-security-verification-standard/` | — |
| `security/authn-sessions-jwt` | `concept` | intermediate | Password hashing (Argon2id), server sessions vs stateless JWT + refresh rotation, and logout revocation. | `cheatsheetseries.owasp.org`, `rfc8725` | `<Flow>`: login → access + refresh rotation → revoke |
| `security/authz-rbac-abac` | `concept` | intermediate | Object- and function-level authorization (RBAC vs ABAC, preventing BOLA/BFLA, deny-by-default). | `owasp.org/API-Security/`, `top10.owasp.org/2025/A01` | `<Flow>`: request → authN → ownership/policy check → allow/403 |
| `security/csrf-ssrf-headers` | `note` | intermediate | Defending against CSRF (`SameSite`, tokens), SSRF (allowlists, metadata IP blocks), and security headers (HSTS, CSP). | `top10.owasp.org/2025/`, `developer.mozilla.org` | — |
| `security/rate-limiting-uploads` | `note` | intermediate | Token-bucket/sliding-window rate limiting and safe file upload/download handling (MIME, size, random keys, no exec). | `cheatsheetseries.owasp.org` | — |
| `security/threat-modeling-basics` | `note` | beginner | Lightweight STRIDE threat modeling for small teams before building a feature. | `owasp.org/www-community/Threat_Modeling` | — |
| `containers/image-scanning-trivy` | `note` | beginner | Scanning container images for OS/library CVEs with Trivy in CI and acting on severity gates. | `trivy.dev/docs/` | — |
| `foundations/reverse-proxy-tls-firewall` | `concept` | beginner | How TLS termination, reverse proxies (Nginx/Caddy), and host firewalls (`ufw`/security groups) protect backend services. | `caddyserver.com/docs/`, `nginx.org/en/docs/` | `<Flow>`: Client → TLS Proxy → Private App Port |
| `architecture/redis-caching-persistence` | `note` | intermediate | Redis data structures, TTL/eviction policies, and RDB vs AOF persistence trade-offs. | `redis.io/docs/latest/` | — |
| `foundations/observability-backups-dr` | `note` | intermediate | Structured logs, metrics/alerts, automated backups with restore drills, and RPO/RTO for small systems. | `sre.google/sre-book/` | — |
| `ci-cd/deploy-rollback-strategies` | `decision` | intermediate | Rolling updates vs blue-green vs canary deployments and fast rollback triggers. | `kubernetes.io/docs/concepts/workloads/controllers/deployment/` | — |
| `design/facade-proxy-command-state` | `note` | intermediate | Practical overview of Facade, Proxy, Command, and State from *Dive Into Design Patterns* — when to use and when to skip. | `refactoring.guru/design-patterns` | — |
| `process/agile-scrum-kanban-hybrid` | `decision` | beginner | Comparing Scrum, Kanban, Waterfall, and Scrumban/hybrid for small engineering teams. | `scrumguides.org`, `kanban.university` | — |
| `process/dor-dod-quality-gates` | `note` | beginner | Practical Definition of Ready, Definition of Done, PR code review standards, and CI merge gates. | `conventionalcommits.org` | — |
| `process/incident-management-postmortems` | `note` | intermediate | Severity triage, mitigation-first incident response, and blameless postmortems (templates for `kind: postmortem`). | `sre.google/sre-book/` | — |

---

## 7. Content Standards Going Forward

Linked to `CONTENT-PLAN.md` §1 and `PLAN.md` §7/§9/§10:

### Definition of Ready (DoR) before writing a page
1. Target `section/slug`, `kind`, `type` (Diátaxis), and `level` are defined in `CONTENT-PLAN.md`.
2. At least 1 primary/official source URL is identified.
3. If `kind: concept` or `kind: lab`, the `<Flow>` steps or `labs/<slug>/` exercise is scoped first.

### Definition of Done (DoD) before publishing (`status: stable`)
- **Frontmatter:** `title`, `description` (≤ 160 chars), `updated`, `verified`, `kind`, `type`, `level`, `tags`, `tested_with` (exact versions actually run), `cards` (3–5 single-fact cards), `related` (≥ 2 valid slugs), `sources` (≥ 1 official doc URL).
- **Structure:** No duplicate `# H1` in body; `## TL;DR` (≤ 3 lines) at top; `## Gotchas` + `## Production checklist` (notes) or `## When to use / when to avoid` + `## Pros / Cons` + `## Relations` (concepts); `## Check yourself` with `<Quiz>`; `## Sources` at bottom.
- **Diagrams:** Only `<Flow>` or `<Diagram>` using `rank`/`order` (no inline `<svg>`, no raw `x`/`y`, ≤ 7 nodes, ≤ 8 steps, responses retrace real hops).
- **Originality:** Own words, own examples, own diagrams; unrun commands marked `# not run`.
- **Checks:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` green; `pnpm qa:diagrams` screenshots checked if diagram changed.

### Source Policy
1. **Official docs first:** `docs.docker.com`, `kubernetes.io`, `opentofu.org`, `docs.github.com`, `owasp.org` / `top10.owasp.org` / ASVS 5.0, `typescriptlang.org`, `git-scm.com`, primary architecture papers.
2. **Opinions separated:** Personal heuristics go inside `<MyTake>`, never presented as universal specification.
3. **Freshness:** Re-verify pages when `verified` > 365 days or when a tool in `tested_with` releases a new major version.

---

## 8. Content Roadmap & Backlog

| ID | Title | Description | Reason | Priority | Dependencies | Effort | Acceptance Criteria | Owner |
|---|---|---|---|---|---|---|---|---|
| `CNT-001` | Fix `github-actions.mdx` insecure example | Pin `actions/checkout` to full SHA, switch `npm install` → `npm ci`, upgrade to Note template. | Contradicts own `<Gotcha>` and teaches unpinned CI actions. | **Critical** | None | S | Full SHA pin + `npm ci` + `TL;DR` + `<Quiz>` + `tested_with`. | Worker |
| `CNT-002` | Fix `compare-styles.mdx` backwards `<Flow>` edges | Add `HTTP Client` node to `onion` and `clean` variants; route final response to caller. | Response arrows currently point back into core. | **Critical** | None | S | All 4 variants end with response reaching caller; `pnpm qa:diagrams` passes. | Worker |
| `CNT-003` | Resolve missing `<LabLink>` targets (`bridge`, `layered`, `hexagonal`) | Create `labs/bridge-pattern-ts/` and `labs/arch-order-service/` (or remove broken `<LabLink>`s). | Learners hit missing paths when running `<LabLink>` commands. | **Critical** | None | L | Every `<LabLink name="...">` resolves to a real `labs/<name>/` directory whose command runs cleanly. | Worker |
| `CNT-004` | Fix `labs/docker-multistage-next/Dockerfile` | Copy `node_modules` from `deps` (or explain), add `HEALTHCHECK` for `/healthz`, add `package-lock.json` or align `dockerfile-best-practices.mdx`. | Current `Dockerfile` omits `node_modules` copy and `HEALTHCHECK`. | **Critical** | None | S | `hadolint` + `docker build` pass; `/healthz` and `HEALTHCHECK` work. | Worker |
| `CNT-005` | Backfill `schema-v2` & `<Quiz>` on 6 concept pages | Add `kind`, `verified`, `cards` (3–5), `related` (≥ 2), `sources`, and `<Quiz>` to `service-routing`, `bridge`, `layered`, `hexagonal`, `dependency-inversion`, `compare-styles`. | Eliminates all `TODO(schema-v2)` / `TODO(step-11)` and adds ~24 flashcards to `/review`. | **High** | None | M | 0 `TODO(schema-v2)`/`TODO(step-11)` comments remain; all 6 pages have 3–5 cards and `<Quiz>`. | Worker |
| `CNT-006` | Migrate inline `<svg>` & `x`/`y` flows to `<Diagram>` & `rank`/`order` | Convert 9 inline `<svg>` figures across 6 pages to `<Diagram>` and update `<Flow>` props to dagre `rank`/`order`. | Enforces `DIAGRAM-RULES.md` §1.2 and §2.1 MUST rules. | **High** | None | L | 0 inline `<svg>` in `content/docs/**`; 0 `x`/`y` coords in `<Flow>`; `pnpm qa:diagrams` green. | Worker |
| `CNT-007` | Upgrade legacy stubs (`docker-basics`, `kubectl-cheatsheet`) | Rewrite to Note/Cheatsheet templates, remove duplicate `# H1`, add `TL;DR`, `<Quiz>`, `tested_with`, `sh` in `kubectl exec`. | Upgrades remaining v1 stubs and fixes EOL `docker: 27.x`. | **High** | None | M | Both pages match template DoD and use current `tested_with`. | Worker |
| `CNT-008` | Refresh stale `tested_with` versions | Re-verify `service-routing` & `pods-deployments` on k8s 1.35+, and 5 design/arch pages on TS 7.0.2; fix `k8s-request` Service step text. | Removes EOL k8s (`1.31`, `1.34.1`) and stale TS `5.x`. | **High** | None | S | All `tested_with` versions are actively supported; `k8s-request` explains DNAT/conntrack. | Worker |
| `CNT-009` | Harden `labs/k8s-service-routing` manifests | Add `ingressClassName` to `ingress.yaml` and `securityContext` to `deployment.yaml`. | Aligns k8s lab with modern clusters and least-privilege pods. | **High** | None | S | `kubeconform -strict` passes in CI. | Worker |
| `CNT-010` | Rewrite `bridge.mdx` with original domain & fix `<Flow>` paths | Replace `RemoteControl`/`Device` (from book) with `Exporter`/`StorageDriver`; fix `bridge` and `hexagonal` return hops. | Ensures originality (`CONTENT-PLAN` §1.7) and `DIAGRAM-RULES` §10. | **Medium** | `CNT-003` | M | Original TS example + lab + retraced response steps. | Worker |
| `CNT-011` | Wire Radar `related` links & refine `cloudflare-workers.mdx` | Populate `related` on all 12 radar entries; soften "Zero cold-start". | Improves Radar ↔ Docs cross-linking and technical precision. | **Medium** | None | S | 0 empty `related: []` where matching docs exist. | Worker |
| `CNT-012` | Launch GitOps section & update `index.mdx` | Publish `gitops/what-is-gitops` and `gitops/drift-reconciliation`; add GitOps card to `content/docs/index.mdx`. | Eliminates empty GitOps sidebar section. | **High** | None | M | `content/docs/gitops/meta.json` lists ≥ 2 pages; `index.mdx` links GitOps. | Worker |
| `CNT-013` | Execute Security core backlog (ASVS 5.0, AuthN, AuthZ, Injection) | Write `asvs-5-checklist`, `authn-sessions-jwt`, `authz-rbac-abac`, `sqli`, `xss-csp`, `csrf-ssrf-headers`, `oauth2-pkce`. | Closes biggest curriculum gap against OWASP ASVS 5.0 & 2025. | **High** | `CNT-005` | L | All 7 security pages pass DoD with ASVS 5.0 citations. | Lead / Worker |
| `CNT-014` | Execute DevOps ops backlog (Linux, TLS/Proxy, Redis, Observability/DR) | Write `linux-signals`, `networking-basics`, `reverse-proxy-tls-firewall`, `redis-caching-persistence`, `observability-backups-dr`, `deploy-rollback-strategies`. | Closes production operations and infrastructure gaps. | **Medium** | None | L | Pages pass DoD with `<Flow>` where specified. | Worker |
| `CNT-015` | Create `process/` section (SDLC, DoR/DoD, Incidents, Retros) | Add `content/docs/process/meta.json` and 3 core pages (`agile-scrum-kanban-hybrid`, `dor-dod-quality-gates`, `incident-management-postmortems`). | Covers owner's engineering workflow & leadership requirements. | **Medium** | None | M | `process/` section live in sidebar with ≥ 3 pages. | Owner / Lead |
| `CNT-016` | Publish Digest #1 & gate `kitchen-sink*` in prod | Publish first biweekly digest; ensure `kitchen-sink*` drafts are excluded from prod nav/search/cards. | Completes `/digest` MVP and keeps internal QA pages clean. | **Low** | None | S | `/digest` shows Digest #1 with sourced items; prod `/review` has 0 draft cards. | Owner |

---

## 9. Measurable Content Quality Gates

Every PR touching `content/` or `labs/` must satisfy:

| Gate | Target | How Verified |
|---|---|---|
| **Official sources** | ≥ 1 official source URL per stable page; 100% of digest claims linked | Frontmatter `sources` schema check + PR review |
| **Broken internal links** | `0` broken `related` slugs or `LabLink` names | Build-time link/slug validator + `labs/<name>/` existence check |
| **Freshness** | `verified` < 365 days on 100% of `status: stable` pages; 0 EOL versions in `tested_with` | Automated `verified` age check + monthly review |
| **Active recall** | 3–5 `cards` and ≥ 1 `<Quiz>` on 100% of `status: stable` pages | Frontmatter schema + MDX check |
| **Command truthfulness** | 100% of runnable snippets actually executed, or explicitly marked `# not run` | Author checklist + CI `labs.yml` (`hadolint`, `docker build`, `tofu validate`, `tflint`, `kubeconform`, `actionlint`) |
| **Diagram compliance** | 0 inline `<svg>` in `content/docs/**`; 0 raw `x`/`y` coords; ≤ 7 nodes / ≤ 8 steps | `DIAGRAM-RULES.md` §9 unit test + `pnpm qa:diagrams` |
| **Build & site gate** | `pnpm lint && pnpm typecheck && pnpm test && pnpm build` green | `.github/workflows/ci.yml` |
