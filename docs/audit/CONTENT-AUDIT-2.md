# Mengty Learns — Content Audit v2 (Waves 1–6)

> **Audit scope:** The 71 new docs pages added in `content/docs/**` across content waves 1–6 (all pages not in the first audit `docs/audit/CONTENT-AUDIT.md`) plus all 12 entries in `content/radar/*`.
> **Audit date:** 2026-11-27
> **Status:** Report only — no content files modified.

---

## 1. Executive Summary

### Content Maturity
Waves 1–6 expanded Mengty Learns from 20 published docs pages to **91 published docs pages** (plus `index.mdx` and 2 `kitchen-sink*` drafts) and **12 radar entries**, closing nearly all major curriculum gaps identified in the first audit (`security/`, `process/`, `gitops/`, `iac/`, `kubernetes/`, `foundations/`, `containers/`, `ci-cd/`, `design/`, and `architecture/`).

- **Inventory audited:** **71 new docs pages** (14 `security/*`, 8 `design/*`, 13 `architecture/*`, 10 `process/*`, 3 `gitops/*`, 5 `iac/*`, 5 `kubernetes/*`, 6 `foundations/*`, 3 `containers/*`, 4 `ci-cd/*`) + **12 `content/radar/*` entries** = **83 pages total**.
- **Baseline quality:** Every new page has 4 flashcards (within 3–5), a 2-question `<Quiz>`, ≥ 2 valid `related` slugs (0 broken internal links), official `sources`, `verified: 2026-11-26`, and 0 inline `<svg>` or raw `x`/`y` pixel coordinates in `<Flow>`/`<Diagram>`.

### Strengths
1. **Strong standards alignment:** All 14 new security pages accurately use **OWASP ASVS 5.0.0** (`V1`–`V17`), **OWASP Top 10:2025** (`A01`–`A10`), **NIST SP 800-63B-4** (8/15/64-char rules, no complexity/rotation), **OAuth 2.1 / RFC 7636 / OIDC Core 1.0**, **RFC 8725**, and **RFC 9110 / 6585**. Process pages align with the **2020 Scrum Guide**, **Kanban Guide 2025**, **Nygard 2011 ADRs**, **Google SRE**, and **Conventional Comments 1.0.0**.
2. **Original Design Pattern examples:** All 5 new GoF pattern pages (`adapter`, `decorator`, `factory-method`, `observer`, `strategy`) replace *Dive Into Design Patterns* domains with original TypeScript/DevOps examples (`BlobStore`, `HttpClient`, `LogExporter`, `BuildObserver`, `DeployStrategy`).
3. **Zero broken `related` slugs or `LabLink`s:** Every `related` slug across all 71 docs and 12 radar entries resolves to an existing page, and all 12 radar entries now have non-empty `related` arrays.
4. **Diagram rule compliance:** All `<Flow>` and `<Diagram>` components use `rank`/`order` dagre hints only, ≤ 7 nodes, ≤ 8 steps, and node labels ≤ 18 characters.

### Worst Problems & Top Risks to a Learner
1. **Vulnerable `// SAFE:` SSRF code sample (Critical):** `security/csrf-ssrf.mdx:128-147` misses IPv4-mapped IPv6 (`::ffff:127.0.0.1`), `0.0.0.0/8`, `100.64.0.0/10`, `::`, and `fe81:`–`febf:`, and performs a separate `lookup()` before `fetch(url)` (DNS rebinding TOCTOU).
2. **Invalid HCL & contradicted OpenTofu `backend {}` rule (Critical):** `iac/remote-state-locking.mdx:63-66` omits required `key_spec = "AES_256"` in `key_provider "aws_kms" "state"`, and `:81` claims `backend {}` cannot use `var.*`/`local.*`—directly contradicting `iac/terraform-vs-opentofu.mdx:49` (OpenTofu 1.8+).
3. **`<Flow>` bypasses `kube-apiserver` (Critical):** `kubernetes/kubectl-apply.mdx:94-95` draws `ctrl->kubelet` directly instead of `ctrl->apiserver` → `apiserver->kubelet`, contradicting its own `<Diagram>` and Card 1.
4. **DDD Aggregate calls Repository directly in `<Flow>` (Critical):** `architecture/ddd-tactical.mdx:89-96` routes `agg->repo` and skips `agg->uc` on return, violating tactical DDD boundaries and `DIAGRAM-RULES.md` §10.
5. **Repo-state drift after Cloudflare Workers migration (High):** `security/security-headers.mdx:36,52,55` falsely states `public/_headers` does not exist; `security/supply-chain.mdx:50-51` falsely states `quality.yml` uses floating `@v4` tags and omits `deploy.yml`; `process/dor-dod-quality-gates.mdx:100` quizzes on `out/` instead of `opennextjs-cloudflare preview`.
6. **Inconsistent DoD & `tested_with` hygiene (Medium/Low):** 10 pages exceed the 160-char `description` limit, 5 design `concept` pages omit `## TL;DR`, 11 non-concept pages omit `<Diagram>`/`<Flow>`, and several unrun snippets omit `// not run` or `(docs)`.

---

## 2. Per-Page Findings Table

Priority scale: **Critical** = teaches something wrong, broken, or insecure · **High** = major repo-truth drift, stale quiz, or broken config · **Medium** = DoD, clarity, consistency, or `<Flow>` retrace issue · **Low** = polish, typos, or minor metadata.
Effort: **S** (< 30 min) · **M** (30–120 min) · **L** (> 2 hours).

| Page | Finding | Evidence (`file:line`) | Impact on Learner | Fix | Priority | Effort |
|---|---|---|---|---|---|---|
| `security/csrf-ssrf.mdx` | `// SAFE:` SSRF helper misses IPv4-mapped IPv6 (`::ffff:127.0.0.1`), `0.0.0.0/8`, `100.64.0.0/10`, `::`, `fe81:`–`febf:`, and has DNS rebinding TOCTOU (`lookup()` then `fetch(url)`). | `content/docs/security/csrf-ssrf.mdx:128-147` | Learners copy a `// SAFE:` SSRF guard that can be bypassed in production. | Normalize IPv4-mapped IPv6 / use CIDR library, check all records, pin resolved IP in custom `undici` dispatcher, mark `// not run`. | **Critical** | M |
| `iac/remote-state-locking.mdx` | `key_provider "aws_kms" "state"` omits required `key_spec = "AES_256"`. | `content/docs/iac/remote-state-locking.mdx:63-66` | `tofu init`/`plan` fails with a missing required attribute error. | Add `key_spec = "AES_256"` inside `key_provider "aws_kms" "state"`. | **Critical** | S |
| `iac/remote-state-locking.mdx` | Claims *"standard backend blocks cannot reference `var.*` or `local.*`"*, contradicting `iac/terraform-vs-opentofu.mdx:49`. | `content/docs/iac/remote-state-locking.mdx:81` | Teaches outdated Terraform limitation as true for OpenTofu 1.13. | Scope gotcha to Terraform / OpenTofu < 1.8 and cross-link OpenTofu 1.8+ early variable evaluation. | **Critical** | S |
| `kubernetes/kubectl-apply.mdx` | `<Flow id="kubectl-apply">` routes `ctrl->kubelet` directly, bypassing `kube-apiserver`. | `content/docs/kubernetes/kubectl-apply.mdx:94-95` | Misleads learners into thinking `kube-scheduler` pushes directly to `kubelet`. | Route `ctrl->apiserver` (bind `spec.nodeName`) then `apiserver->kubelet` (watch). | **Critical** | S |
| `architecture/ddd-tactical.mdx` | `<Flow>` routes `agg->repo` (Aggregate calling Repository) and skips `agg->uc` on return (`uc->cmd`). | `content/docs/architecture/ddd-tactical.mdx:89-96` | Teaches wrong DDD dependency direction and breaks `DIAGRAM-RULES.md` §10. | Route `uc->agg->uc->repo->uc->evt` and `uc->cmd` (`kind: 'response'`). | **Critical** | S |
| `security/security-headers.mdx` | Falsely claims `public/_headers` does not exist in this repo and frames deployment as Cloudflare Pages. | `content/docs/security/security-headers.mdx:36,52,55` | Contradicts actual repo (`public/_headers`, `lib/security-headers.mjs`, `next.config.mjs`, Workers/OpenNext). | Update prose and snippet to describe the actual `public/_headers` + `next.config.mjs` Workers setup. | **High** | S |
| `security/supply-chain.mdx` | Falsely claims `quality.yml` uses floating `@v4` tags and omits `deploy.yml` (says "4 workflows"). | `content/docs/security/supply-chain.mdx:50-51` | Misrepresents repo's actual SHA-pinned `quality.yml` and `deploy.yml`. | Update table to list all 5 workflows accurately (`quality.yml` & `deploy.yml` SHA-pinned; `ci.yml` & `inbox.yml` `@v4`). | **High** | S |
| `process/dor-dod-quality-gates.mdx` | Quiz Q2 asks which workflow tests *"the built `out/` directory"* (now `opennextjs-cloudflare preview`). | `content/docs/process/dor-dod-quality-gates.mdx:100` | Learners memorize an obsolete build artifact path (`out/`). | Update question to reference `opennextjs-cloudflare preview` on port `8787`. | **High** | S |
| `containers/non-root-and-scanning.mdx` | Claims `labs/docker-multistage-next/Dockerfile` uses `USER 1001:1001`; lab actually uses `USER nextjs`. | `content/docs/containers/non-root-and-scanning.mdx:60-71` | Contradicts line 101's own warning that named `USER` fails Kubernetes `runAsNonRoot: true`. | Clarify that the lab uses `USER nextjs` (UID 1001) and the snippet adapts it to `USER 1001:1001` (or update the lab). | **High** | S |
| `containers/compose.mdx` | `adminer` publishes `ports: ["8080:8080"]` while attached only to `backend` (`internal: true`). | `content/docs/containers/compose.mdx:114-125` | `internal: true` bridge lacks external routing, breaking host port publishing on Docker Engine. | Attach `adminer` to `frontend` as well (or bind `127.0.0.1:8080:8080` on a non-internal network). | **High** | S |
| `security/asvs-5-overview.mdx` | Claims Mengty Learns is a static export (`output: 'export'`) hosted on CDN/Pages. | `content/docs/security/asvs-5-overview.mdx:72` | Outdated repo architecture claim (`next.config.mjs` uses `output: 'standalone'` on Workers). | Update to pre-rendered static routes on Next.js + OpenNext/Cloudflare Workers. | **Medium** | S |
| `security/*` (7 pages) | `description` exceeds 160-character DoD limit (`161`–`183` chars). | `csrf-ssrf.mdx:3`, `file-uploads.mdx:3`, `oauth21-oidc-pkce.mdx:3`, `rate-limiting.mdx:3`, `security-headers.mdx:3`, `supply-chain.mdx:3`, `threat-modeling.mdx:3` | Fails SEO/DoD metadata constraint (`≤ 160` chars). | Trim each `description` to ≤ 160 chars. | **Medium** | S |
| `process/*` (3 pages) | `description` exceeds 160-character DoD limit (`162`–`170` chars). | `adr.mdx:3`, `dor-dod-quality-gates.mdx:3`, `incident-management.mdx:3` | Fails SEO/DoD metadata constraint (`≤ 160` chars). | Trim each `description` to ≤ 160 chars. | **Medium** | S |
| `design/*` (5 concept pages) | Missing `## TL;DR` section (`CONTENT-PLAN.md` §1); starts with `## 1. Intent` + `<Intent>` instead. | `adapter.mdx:35`, `decorator.mdx:35`, `factory-method.mdx:35`, `observer.mdx:35`, `strategy.mdx:35` | Inconsistent with DoD checklist (`## TL;DR` ≤ 3 lines on every page). | Add a 1–3 line `## TL;DR` above `## 1. Intent` (or document `<Intent>` as equivalent in `CONTENT-PLAN.md`). | **Medium** | S |
| `design/dependency-injection.mdx` | `BadDeployService` snippet uses undefined `ServiceLocator`, cannot compile/run, and lacks `// not run`. | `content/docs/design/dependency-injection.mdx:106-114` | Learner tries to compile snippet and gets `Cannot find name 'ServiceLocator'`. | Mark snippet `// not run` or declare a minimal `ServiceLocator` stub. | **Medium** | S |
| `security/csrf-ssrf.mdx` | `<Flow id="ssrf-flow">` ends at `ext->app` without returning `app->caller` (or error from `imds`). | `content/docs/security/csrf-ssrf.mdx:100-115` | Violates `DIAGRAM-RULES.md` §10 response-retracing rule. | Add `app->caller` response/error steps (or note async webhook). | **Medium** | S |
| `architecture/caching-redis.mdx` | `<Flow>` Step 6 returns `Hit` directly from a `SET EX 60` command. | `content/docs/architecture/caching-redis.mdx:82-83` | Conflates `SET` response (`OK`) with a subsequent `GET` cache hit. | Change Step 6 to `OK` (`Confirm cache write`) or insert a `GET` step before `Hit`. | **Medium** | S |
| `architecture/onion.mdx` | `<Flow>` response skips `domsvc` (`ui->appsvc` directly). | `content/docs/architecture/onion.mdx:89-91` | Inconsistent with `clean.mdx` and `hexagonal.mdx` and `DIAGRAM-RULES.md` §10. | Route `ui->domsvc->appsvc` (or document runtime DIP dispatch). | **Medium** | S |
| `kubernetes/kubectl-apply.mdx` | `kubectl apply` and `kubectl get` commands lack `# not run` despite `tested_with: "1.36 (docs only)"`. | `content/docs/kubernetes/kubectl-apply.mdx:109-111` | Violates `AGENTS.md` §5 (`Mark unrun snippets as "not run"`). | Add `# not run` comment to lines 109–111. | **Medium** | S |
| `kubernetes/kubectl-apply.mdx` | `<Flow>` Step 5 attributes readiness probe execution to CRI runtime instead of `kubelet`. | `content/docs/kubernetes/kubectl-apply.mdx:97` | Confuses CRI (`containerd`) lifecycle with `kubelet` probe execution. | Change Step 5 text to say CRI reports container started/running; `kubelet` runs readiness probes. | **Medium** | S |
| `gitops/what-is-gitops.mdx` | `<Flow>` Step 7 (`agent->git`, `kind: 'response'`) claims Agent posts status back to Git, contradicting read-only Git access. | `content/docs/gitops/what-is-gitops.mdx:92` | Contradicts `:19` and `:141` (agents have read-only Git access by default). | Clarify optional notification controller, or end flow at `Agent` (`Synced/Healthy` in cluster). | **Medium** | S |
| `kubernetes/*` (5 new pages) | `tested_with` version drift: `kubernetes: "1.36 (docs)"` vs `"1.37 (docs)"`, `kubectl: "1.35.3"` vs `"1.36 (docs only)"`. | `configmaps-secrets.mdx:11-12`, `helm-basics.mdx:12`, `kubectl-apply.mdx:11-12`, `probes.mdx:11`, `requests-limits-oom.mdx:11` | Inconsistent Kubernetes baseline across sibling pages. | Standardize `kubernetes` and `kubectl` `tested_with` versions and `(docs)` markers. | **Medium** | S |
| `foundations/*`, `containers/*`, `ci-cd/*` (4 notes) | Missing `<Diagram>` or `<Flow>` (`CONTENT-PLAN.md` §1 DoD). | `backups-and-dr.mdx`, `non-root-and-scanning.mdx`, `volumes-vs-bind-mounts.mdx`, `caching.mdx` | Note pages rely on prose/tables only without a visual diagram. | Add a concise `<Diagram>` to each of the 4 note pages (or exempt `note` in `CONTENT-PLAN.md`). | **Medium** | M |
| `gitops/*`, `iac/*`, `kubernetes/*` (7 non-concepts) | Missing `<Diagram>` or `<Flow>` (`CONTENT-PLAN.md` §1 DoD). | `argocd-vs-flux.mdx`, `modules.mdx`, `remote-state-locking.mdx`, `terraform-vs-opentofu.mdx`, `tofu-cheatsheet.mdx`, `helm-basics.mdx`, `requests-limits-oom.mdx` | Decision/note/cheatsheet pages lack visual diagrams. | Add `<Diagram>` where helpful (or clarify DoD exemption for `cheatsheet`/`decision`). | **Medium** | M |
| `content/radar/*` (4 entries) | Missing `related` links to new Wave 1–6 docs; `latest-image-tags.mdx` still links to `containers/docker-basics`. | `oidc-ci-cloud.mdx:12`, `long-lived-cloud-keys.mdx:12`, `opentofu.mdx:12`, `latest-image-tags.mdx:12-14` | Missed navigation from Radar to dedicated Wave 1–6 docs. | Add `ci-cd/oidc-not-keys`, `security/secrets-management`, `iac/terraform-vs-opentofu`, and replace `docker-basics`. | **Medium** | S |
| `security/*` (11 pages) | `tested_with` omits `(docs)` marker and 8 code blocks omit `// not run`. | `authn-vs-authz.mdx:11`, `csrf-ssrf.mdx:11`, `file-uploads.mdx:11`, `oauth21-oidc-pkce.mdx:11`, `rate-limiting.mdx:11`, `security-headers.mdx:11`, `sessions-vs-jwt.mdx:11`, `sql-injection.mdx:11`, `threat-modeling.mdx:11`, `xss-csp.mdx:11`, `passwords.mdx:11` | Ambiguous whether TS/HTTP snippets were executed locally. | Add `(docs)` to `tested_with` and `// not run` to unrun snippets. | **Low** | S |
| `security/oauth21-oidc-pkce.mdx` | Prose says "Web Crypto", but code uses Node `Buffer.from(...).toString('base64url')`. | `content/docs/security/oauth21-oidc-pkce.mdx:102,111,113` | Fails in pure browser Web Crypto without Node `Buffer`. | Use `btoa(String.fromCharCode(...bytes))` with URL-safe replacement (or note Node/SSR). | **Low** | S |
| `security/rate-limiting.mdx` | `tested_with.rfc` cites RFC 9110 for `429` (`429` is RFC 6585; `Retry-After` is RFC 9110). | `content/docs/security/rate-limiting.mdx:12` | Minor spec citation imprecision (RFC 6585 is already in `sources`). | Update `tested_with.rfc` to `"RFC 6585 (429), RFC 9110 (Retry-After)"`. | **Low** | S |
| `security/sessions-vs-jwt.mdx` | `<Flow>` steps 2→3 and 7→8 write to `store` without showing `store->auth` return. | `content/docs/security/sessions-vs-jwt.mdx:80-95` | Minor asymmetry in `<Flow>` round-trip. | Add `store->auth` return step or clarify write-ack. | **Low** | S |
| `security/xss-csp.mdx` | `DOMPurify.sanitize()` shown without noting SSR requires `isomorphic-dompurify`. | `content/docs/security/xss-csp.mdx:140` | Confusing if learner runs snippet in Node SSR. | Add 1-line comment noting `isomorphic-dompurify` for Node SSR. | **Low** | S |
| `design/adapter.mdx` | Reuses *Dive Into Design Patterns*' travel power plug analogy (code/domain is original). | `content/docs/design/adapter.mdx:71-73` | Minor analogy overlap with book. | Swap for a software-native analogy (e.g., USB-C dock or REST-to-GraphQL adapter). | **Low** | S |
| `design/composition-vs-inheritance.mdx`, `decorator.mdx` | Typo `"Dogmatically"` capitalized mid-sentence; `FixedRetry.run()` / `RetryHttpClient.request()` throw `undefined` if `maxAttempts <= 0`. | `composition-vs-inheritance.mdx:79-89,111`, `decorator.mdx:155-167` | Minor typo and defensive-coding edge case. | Lowercase `dogmatically`; guard `maxAttempts >= 1` or throw explicit `Error`. | **Low** | S |
| `design/factory-method.mdx`, `adapter.mdx`, `strategy.mdx` | `factory-method.mdx:91` uses `category: 'edge'` vs `'abstraction'`; Simple Factory tab depends on Tab 1 types; top-level `await` requires ESM. | `factory-method.mdx:91,196,200-208`, `adapter.mdx:217`, `strategy.mdx:189` | Minor node tint inconsistency and ESM/tab runnability note. | Standardize `category: 'abstraction'`; note ESM / shared types. | **Low** | S |
| `architecture/c4-model.mdx` | Prose references `FlowNode` while snippet defines `C4DiagramNode`. | `content/docs/architecture/c4-model.mdx:122-133` | Minor naming mismatch between prose and snippet. | Align snippet type name or clarify `C4DiagramNode` is a simplified example. | **Low** | S |
| `architecture/monolith-vs-microservices.mdx`, `queues-async.mdx` | `monolith-vs-microservices` has `tested_with: typescript: "7.0.2"` with no TS code; `queues-async` has `typescript: "7.0.2"` while snippet says `(not run)`. | `monolith-vs-microservices.mdx:10-11`, `queues-async.mdx:10-11,87` | Minor `tested_with` metadata inconsistency. | Remove unused `typescript` key or mark `(docs)`. | **Low** | S |
| `process/scrum-kanban-waterfall.mdx` | Omits 3 Scrum commitments (`Product Goal`, `Sprint Goal`, `Definition of Done`); `related` lacks sibling `process/*` pages. | `content/docs/process/scrum-kanban-waterfall.mdx:22-25,48-52` | Incomplete Scrum Guide 2020 artifact-commitment mapping. | Add commitments to table and link sibling `process/*` pages. | **Low** | S |
| `process/raci.mdx`, `adr.mdx` | `raci.mdx` cites generic `pmi.org` homepage; `adr.mdx` uses ASCII box diagram instead of `<Diagram>`. | `raci.mdx:28-29`, `adr.mdx:52-56` | Minor source specificity and diagram format polish. | Link specific PMI RAM/RACI reference; convert ASCII box to `<Diagram>`. | **Low** | S |
| `foundations/git-internals.mdx`, `observability.mdx`, `kubernetes/probes.mdx`, `ci-cd/pipeline-anatomy.mdx` | Minor `kind: 'response'` on forward state/propagation edges; `pipeline-anatomy` routes trigger through cache before jobs. | `git-internals.mdx:93`, `observability.mdx:87`, `probes.mdx:71`, `pipeline-anatomy.mdx:89-90` | Minor edge-styling semantics. | Remove `kind: 'response'` on forward edges; route `trigger->jobs->cache` in `pipeline-anatomy`. | **Low** | S |
| `ci-cd/caching.mdx`, `oidc-not-keys.mdx` | `github_actions` vs `github-actions` key naming; `oidc-not-keys` implies `ci.yml` has `permissions: contents: read`; `caching.mdx` omits `## When you DON'T need this`. | `caching.mdx:12,86`, `oidc-not-keys.mdx:11,120` | Minor key/section consistency and `ci.yml` reference drift. | Standardize `github_actions` key, clarify `ci.yml` status, add `When you DON'T need this`. | **Low** | S |
| `content/radar/renovate.mdx`, `pnpm.mdx`, `cloudflare-workers.mdx` | Minor `related` additions (`security/supply-chain`, `ci-cd/caching`) and `assess` ring wording vs Workers adoption. | `renovate.mdx:12`, `pnpm.mdx:12`, `cloudflare-workers.mdx:3-7` | Minor cross-link and radar ring alignment polish. | Add new Wave 1–6 `related` slugs and align Workers radar note with `adr.mdx`. | **Low** | S |

---

## 3. Standards Alignment

| Standard / Primary Source | Audited Pages | Alignment Status | Gaps / Required Actions |
|---|---|---|---|
| **OWASP ASVS 5.0.0** (`V1`–`V17`) | All 14 `security/*` pages | **Aligned** | All 17 chapters (`V1` Encoding/Sanitization through `V17` WebRTC) are named and mapped accurately. |
| **OWASP Top 10:2025** (`A01`–`A10`) | `security/*` | **Aligned** | Correctly cites `A01:2025` (incl. SSRF), `A02:2025` Misconfiguration, `A03:2025` Supply Chain, `A05:2025` Injection, `A06:2025` Insecure Design, `A10:2025` Exceptional Conditions. |
| **NIST SP 800-63B-4**, **OAuth 2.1**, **RFC 7636/8725/9110/6585** | `passwords.mdx`, `oauth21-oidc-pkce.mdx`, `sessions-vs-jwt.mdx`, `rate-limiting.mdx` | **Mostly aligned; 2 minor gaps** | Argon2id (`19 MiB / t=2 / p=1`), 8/15/64-char rules, PKCE, and `alg` pinning are accurate. Fix `csrf-ssrf.mdx` SSRF guard and cite RFC 6585 for `429` in `rate-limiting.mdx` `tested_with`. |
| **2020 Scrum Guide & Kanban Guide 2025** | `process/scrum-kanban-waterfall.mdx`, `dor-dod-quality-gates.mdx`, `estimation-and-prioritization.mdx` | **Mostly aligned; 1 gap** | Accountabilities (`Product Owner`, `Scrum Master`, `Developers`) are accurate; add the 3 Scrum commitments (`Product Goal`, `Sprint Goal`, `Definition of Done`) to `scrum-kanban-waterfall.mdx`. |
| **Toolchain & Ecosystem Versions (late 2026)** | All 71 docs pages | **Mostly aligned; k8s drift** | `docker: 29.4.3`, `docker-compose: 5.1.3`, `git: 2.54.0`, `curl: 8.22.0`, `pnpm: 11.6.0`, `next: 16.4.6`, `typescript: 7.0.2`, `vitest: 5.1.1`, `helm: 4.3`, `argocd: 3.6`, `flux: 2.10`, `opentofu: 1.13`, `terraform: 1.17`, `trivy: 0.76.2`, `redis: 8.12.0`, `postgresql: 19`, `opentelemetry-collector: 0.166.0`, `opentelemetry-js: 3.0`, `nginx: 1.30.8`, `caddy: 2.11.9` are all real late-2026 releases. Standardize `kubernetes` (`1.36` vs `1.37`) and `kubectl` (`1.35.3` vs `1.36`). |

---

## 4. Learning-Data Correctness

### Flashcards (`cards`)
- **Total cards across 71 new docs pages:** **284 cards** (exactly 4 cards per page on all 71 pages, within the 3–5 rule).
- **Quality:** Single-fact, concise, and technically accurate across all sections. (No card teaches an error, though `iac/remote-state-locking.mdx` prose contradicts `terraform-vs-opentofu.mdx`.)

### Quizzes (`<Quiz>`)
- **Coverage:** **71 / 71** new docs pages have a `<Quiz>` with 2 single-best-answer questions and distractor explanations.
- **Accuracy issue (1):** `process/dor-dod-quality-gates.mdx:100` asks about `quality.yml` testing *"the built `out/` directory"*, which is stale after the Cloudflare Workers (`opennextjs-cloudflare preview`) migration.

### `<Flow>` Steps & Diagram Labels (`DIAGRAM-RULES.md` §10)
- **Structural compliance:** All `<Flow>` and `<Diagram>` instances across all 71 pages use `rank`/`order` only (0 `x`/`y` coords, 0 inline `<svg>`), ≤ 7 nodes, ≤ 8 steps, node labels ≤ 18 chars, and step titles ≤ 6 words.
- **Path / technical correctness issues (6):**
  1. `kubernetes/kubectl-apply.mdx:94-95` (**Critical**): `ctrl->kubelet` bypasses `kube-apiserver`, and `:97` attributes readiness probes to CRI instead of `kubelet`.
  2. `architecture/ddd-tactical.mdx:89-96` (**Critical**): `agg->repo` has Aggregate calling Repository directly and skips `agg->uc` on return.
  3. `security/csrf-ssrf.mdx:100-115` (**Medium**): `ssrf-flow` ends at `ext->app` without returning `app->caller`.
  4. `architecture/caching-redis.mdx:82-83` (**Medium**): returns `Hit` directly from `SET EX 60`.
  5. `architecture/onion.mdx:89-91` (**Medium**): `ui->appsvc` skips `domsvc` on return.
  6. `gitops/what-is-gitops.mdx:92` (**Medium**): `agent->git` (`kind: 'response'`) claims Agent posts status to Git despite read-only Git access.
  - *(Minor `kind: 'response'` semantics on forward edges in `git-internals.mdx:93`, `observability.mdx:87`, `probes.mdx:71`, `sessions-vs-jwt.mdx:80-95`, and `trigger->cache->jobs` order in `pipeline-anatomy.mdx:89-90`.)*

### `related`, `sources`, `verified` / `tested_with`, DoD
- **`related`:** 0 broken slugs across all 71 docs and 12 radar entries. 4 radar entries need links to new Wave 1–6 docs.
- **`sources`:** 100% of pages have official `sources`.
- **`description` ≤ 160 chars:** 10 pages exceed 160 chars (7 in `security/*`, 3 in `process/*`).
- **`## TL;DR`:** 5 `design/*` concept pages omit `## TL;DR` (using `## 1. Intent` + `<Intent>`).
- **Diagrams on non-concept pages:** 11 `note`/`decision`/`cheatsheet` pages omit `<Diagram>`/`<Flow>`.

---

## 5. Originality Check

Checked all 8 new `content/docs/design/*.mdx` pages against *Dive Into Design Patterns* (Alexander Shvets) and verified prose/examples across all other sections:

| Page | *Dive Into Design Patterns* Example | Mengty Learns Example | Verdict |
|---|---|---|---|
| `design/adapter.mdx` | Stock market XML→JSON; `RoundHole`/`SquarePegAdapter`; US/Europe power plug analogy (pp. 149–161) | `BackupService` → `BlobStore` → `S3BlobAdapter`/`GcsBlobAdapter`; **travel power plug analogy** (`adapter.mdx:71-73`) | **Mostly Original** — code/domain original; **Low** overlap on power plug analogy. |
| `design/decorator.mdx` | `Notifier` (SMS/Facebook/Slack); `DataSource` (Encryption/Compression); wearing clothes (pp. 191–208) | `HttpClient` (`FetchHttpClient`, `RetryHttpClient`, `CachedHttpClient`, `LoggingHttpClient`); HTTP middleware | **Original** |
| `design/factory-method.mdx` | Logistics (`Truck`/`Ship`); UI `Dialog`/`Button` (pp. 71–86) | `LogExporter` (`StdoutExporter`, `OtlpExporter`, `ExporterCreator`); container entrypoint | **Original** |
| `design/observer.mdx` | `Customer`/`Store` (iPhone); `Editor`/`EventManager`; magazine subscription (pp. 336–351) | `PipelineRunner`/`BuildObserver` (`LogSubscriber`, `MetricsSink`, `SlackNotifier`); CI/CD webhooks | **Original** |
| `design/strategy.mdx` | `Navigator`/`RouteStrategy` (Road/Walking/Transit); arithmetic `Context`; airport transport (pp. 368–380) | `DeployRunner`/`DeployStrategy` (`RollingStrategy`, `BlueGreenStrategy`, `CanaryStrategy`); CI uploader | **Original** |
| `design/composition-vs-inheritance.mdx` | `Transport`/`Car`/`Truck`/`Engine` (pp. 44–47) | `BaseMetrics` fragile base class, `HealthChecker` + `RetryPolicy`, TS mixins | **Original** |
| `design/dependency-injection.mdx` | `BudgetReport`/`MySQLDatabase` (pp. 64–67) | `DeployService` + `AuditLog`/`Clock`, `FakeAuditLog`, `ServiceLocator` | **Original** |
| `design/pattern-relations.mdx` | Cross-pattern comparisons (pp. 161, 367) | `DeployStrategy` vs `PipelineState` + decision table | **Original** |

---

## 6. Backlog & Acceptance Criteria

Full CSV exported to [`docs/audit/content-backlog-2.csv`](file:///C:/Users/mengt/orca/workspaces/mt/content-audit2/docs/audit/content-backlog-2.csv) (`CNT-101`–`CNT-124`).

| ID | Title | Priority | Effort | Acceptance Criteria |
|---|---|---|---|---|
| `CNT-101` | Harden `csrf-ssrf.mdx` `// SAFE:` SSRF snippet | **Critical** | M | Blocks IPv4-mapped IPv6, `0.0.0.0/8`, `100.64.0.0/10`, `::`, `fe81:`–`febf:`; pins resolved IP (no TOCTOU); marked `// not run`. |
| `CNT-102` | Fix `remote-state-locking.mdx` `aws_kms` HCL & `backend {}` gotcha | **Critical** | S | `key_spec = "AES_256"` added to `aws_kms`; `backend {}` variable note scoped to Terraform / OpenTofu < 1.8. |
| `CNT-103` | Fix `kubectl-apply.mdx` `<Flow>` (`ctrl->kubelet` & CRI probes) | **Critical** | S | Flow routes `ctrl->apiserver->kubelet`; Step 5 attributes readiness probes to `kubelet`, not CRI. |
| `CNT-104` | Fix `ddd-tactical.mdx` `<Flow>` (`agg->repo` & missing `agg->uc`) | **Critical** | S | Flow routes `uc->agg->uc->repo->uc->evt` and `uc->cmd` (`kind: 'response'`). |
| `CNT-105` | Update `security-headers.mdx` for actual `public/_headers` & Workers | **High** | S | Prose & snippet accurately reflect `public/_headers`, `lib/security-headers.mjs`, and `next.config.mjs` on Workers. |
| `CNT-106` | Update `supply-chain.mdx` workflow audit table | **High** | S | Table lists all 5 workflows accurately (`quality.yml` & `deploy.yml` SHA-pinned; `ci.yml` & `inbox.yml` `@v4`). |
| `CNT-107` | Update `dor-dod-quality-gates.mdx` Quiz Q2 (`out/` → Workers preview) | **High** | S | Quiz Q2 asks about `opennextjs-cloudflare preview` on port `8787`, not `out/`. |
| `CNT-108` | Align `non-root-and-scanning.mdx` description of lab `Dockerfile` | **High** | S | Clarifies lab uses `USER nextjs` (UID 1001) and snippet adapts it to numeric `USER 1001:1001` (or updates lab). |
| `CNT-109` | Fix `compose.mdx` `adminer` `ports` on `internal: true` network | **High** | S | `adminer` attached to `frontend` (or non-internal network) so host port `8080:8080` is reachable. |
| `CNT-110` | Update `asvs-5-overview.mdx` repo hosting description | **Medium** | S | Line 72 reflects pre-rendered static routes on Next.js + OpenNext/Cloudflare Workers. |
| `CNT-111` | Trim `description` ≤ 160 chars on 10 pages (`security/*` 7, `process/*` 3) | **Medium** | S | All 10 `description` frontmatter fields are ≤ 160 characters. |
| `CNT-112` | Add `## TL;DR` to 5 `design/*` concept pages | **Medium** | S | `adapter`, `decorator`, `factory-method`, `observer`, `strategy` each have a 1–3 line `## TL;DR`. |
| `CNT-113` | Mark `dependency-injection.mdx` `BadDeployService` `// not run` | **Medium** | S | `BadDeployService` snippet marked `// not run` (or given `ServiceLocator` stub). |
| `CNT-114` | Fix `<Flow>` return paths in `csrf-ssrf`, `caching-redis`, `onion`, `what-is-gitops` | **Medium** | M | `ssrf-flow` returns to `caller`; `caching-redis` separates `SET OK` from `GET Hit`; `onion` retraces `domsvc`; `what-is-gitops` respects read-only Git. |
| `CNT-115` | Mark unrun `kubectl` commands in `kubectl-apply.mdx` | **Medium** | S | Lines 109–111 include `# not run` comment. |
| `CNT-116` | Standardize `kubernetes` & `kubectl` `tested_with` versions | **Medium** | S | All 5 new k8s pages use a single consistent `kubernetes` & `kubectl` `(docs)` version. |
| `CNT-117` | Add `<Diagram>` to 4 `foundations`/`containers`/`ci-cd` note pages | **Medium** | M | `backups-and-dr`, `non-root-and-scanning`, `volumes-vs-bind-mounts`, `caching` each have ≥ 1 `<Diagram>`. |
| `CNT-118` | Add `<Diagram>` to 7 `gitops`/`iac`/`k8s` non-concept pages (or clarify DoD) | **Medium** | M | Either add `<Diagram>` or update `CONTENT-PLAN.md` §1 DoD for `decision`/`cheatsheet`. |
| `CNT-119` | Wire new Wave 1–6 `related` links in 4 `content/radar/*` entries | **Medium** | S | `oidc-ci-cloud`, `long-lived-cloud-keys`, `opentofu`, `latest-image-tags` link to new Wave 1–6 docs; `docker-basics` removed. |
| `CNT-120` | Standardize `(docs)` and `// not run` markers in `security/*` | **Low** | S | All 11 `security/*` pages mark `(docs)` in `tested_with` and `// not run` on unrun snippets. |
| `CNT-121` | Fix minor `security/*` snippet & RFC citation details | **Low** | S | Browser-safe base64url in `oauth21-oidc-pkce`; RFC 6585 in `rate-limiting`; `store->auth` in `sessions-vs-jwt`; `isomorphic-dompurify` note in `xss-csp`. |
| `CNT-122` | Polish `design/*` analogy, typo, edge-case guards, and node category | **Low** | S | Replace power-plug analogy in `adapter`; lowercase `dogmatically`; guard `maxAttempts >= 1`; `category: 'abstraction'` in `factory-method`. |
| `CNT-123` | Polish `architecture/*` and `process/*` minor metadata & wording | **Low** | S | Align `FlowNode`/`C4DiagramNode` in `c4-model`; clean `tested_with` in `monolith-vs-microservices`/`queues-async`; add Scrum commitments in `scrum-kanban-waterfall`; specific PMI URL in `raci`. |
| `CNT-124` | Polish `foundations/*`, `ci-cd/*`, `probes.mdx`, and `radar/*` minor items | **Low** | S | Fix `kind: 'response'` on forward edges (`git-internals`, `observability`, `probes`), `pipeline-anatomy` order, `github_actions` key, `ci.yml` note, and remaining radar `related` links. |
