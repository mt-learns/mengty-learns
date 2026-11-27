# Knowledge import plan: limme-learning repos into Mengty Learns

> Owner request (2026-11-27): use the owner's own repos as source material for more pages.
> Sources (all authored by Mengty LIM, public, no license file):
> - `limme-learning/key-learning` (89 files): leadership, management and technical-management playbooks, project management/RACI, system analysis, state machines, design patterns, a POS practice project
> - `limme-learning/learn-devops` (188 files): a "secure deployment platform" reference implementation (VM + Kubernetes tracks), 9 planning docs, 13 tool cheatsheets **with interview Q&A**, Ansible roles, Terraform modules, GitOps overlays, Grafana provisioning, a payment-service runbook/SLO
> - `limme-learning/software-engineering` (95 files): project setup, core concepts, patterns, architecture, OAuth/OIDC/Keycloak, compliance, APIs, databases, frontend, testing, UX/UI, example code (Spring Boot / Next.js / React), stakeholder communication, career, a Khmer glossary

## 1. Import rules (binding for every worker)

1. **Adapt, don't paste.** Every page becomes a site page made with `pnpm new <kind>`, with a TL;DR, `type`/`kind`/`level`, 3–5 cards, a `<Quiz>`, ≥ 2 `related`, official `sources`, `tested_with`/`verified`, and a `<Flow>` on concept pages (CONTENT-PLAN §1, DIAGRAM-RULES §10).
2. **Verify every fact again.** The repo text is a draft, not a source. Each technical claim, command and config gets checked against the official docs (fetch them) before it's published. Wrong or unverifiable parts are dropped or marked "unverified". Commands the worker can't run are marked "not run".
3. **Credit the origin.** Add the original repo file as the last entry in `sources`, e.g. `{ title: "key-learning: state machines (author's notes)", url: "https://github.com/limme-learning/key-learning/blob/main/..." }`. Official sources come first.
4. **Generalise the banking context.** Keep the lessons, drop internal-looking specifics (`*.bank.internal`, `CHANGE_ME` hosts, made-up UUIDs). No secrets, ever (gitleaks rules apply).
5. **Merge, don't duplicate.** When this site already has a page on the topic (see §3 "enrich"), add the repo's better material to that page instead of creating a second one.
6. **Interview Q&A → cards.** Each `interview-qna.md` becomes 3–5 *verified* cards on the matching page (one fact per card, unambiguous answer), not a Q&A dump.
7. **Third-party content.** If a repo file quotes or closely paraphrases a book or vendor doc, rewrite it in the owner's own words or drop it (the same originality rule as the patterns book).

## 2. New sections

| Section | Slug | Why | Code needed (one code task, see §5) |
|---|---|---|---|
| Leadership | `leadership` | The two playbooks plus team-lead growth and career: the owner's strongest original material, and nothing like it on the site yet | section icon, `lib/home-data.ts`, `index.mdx` card |
| Frontend | `frontend` | React/Next.js/Vue, data fetching, forms, URL state, Tailwind, motion, accessibility, UX states. The site is itself a Next.js app, so it's a good worked example | same |
| Platform | `platform` | The tools of the secure deployment platform: Ansible, Nginx, Kong/Gravitee, Vault, VPN/private access, Prometheus/Grafana, ELK, DevSecOps | same |

The home "Learning paths" grid goes from 10 to 13 cards: the code task must re-balance it (for example 4-4-5 or a bento layout, never an orphan card).

## 3. Page map

Legend: **new** = new page · **enrich** = merge into an existing page · source = repo/path. Priority: P1 first wave, P2 next, P3 later.

### Wave 9: Leadership (new section, ~12 pages) · source: `key-learning`, `software-engineering/11, 13`
| Page | Kind | From | Pri |
|---|---|---|---|
| leadership/becoming-a-team-lead (new) | concept + Flow (IC → lead transition) | team-lead-growth/01-* | P1 |
| leadership/clarity-and-alignment (new) | note | management-playbook/03 | P1 |
| leadership/delegation-and-ownership (new) | note | management-playbook/06 | P1 |
| leadership/communication-and-listening (new) | note | management-playbook/04, team-lead-growth/03 | P1 |
| leadership/coaching-feedback-growth (new) | note | management-playbook/09, team-lead-growth/04 | P1 |
| leadership/trust-safety-conflict (new) | note | management-playbook/10 | P1 |
| leadership/decision-making (new) | note | management-playbook/08 (link process/adr) | P1 |
| leadership/operating-rhythm (new) | cheatsheet | management-playbook/14, project-management/02/05 | P1 |
| leadership/stakeholder-communication (new) | note + translation table | software-engineering/11/* | P1 |
| leadership/incident-leadership (enrich process/incident-management + new short page) | note | management-playbook/12, technical-management-playbook/11 | P2 |
| leadership/engineering-health-metrics (new) | note | technical-management-playbook/13, management-playbook/13 | P2 |
| leadership/t-shaped-leader-and-roadmap (new) | note | software-engineering/13/01, 02, 08, 09, 10 | P2 |
| leadership/first-90-days (new) | cheatsheet | management-playbook/15, technical-management-playbook/17, se/13/10 | P2 |
| process/raci, process/dor-dod-quality-gates, process/idea-to-production (enrich) | — | project-management/02/*, technical-management-playbook/02–10 | P1 |

### Wave 10: Frontend and UX (new section, ~12 pages) · source: `software-engineering/07, 09, 10`
| Page | Kind | From | Pri |
|---|---|---|---|
| frontend/react-component-architecture | note | 07/01, 10-example-code/react/component-structure | P1 |
| frontend/nextjs-rendering-strategies | concept + Flow (SSG/ISR/SSR/streaming; this site as the example) | 07/02 | P1 |
| frontend/data-fetching-tanstack-query | concept + Flow (cache → stale → refetch) | 07/06, example | P1 |
| frontend/url-state-nuqs | note | 07/07, example | P2 |
| frontend/forms-react-hook-form-zod | note | 07/08, example | P1 |
| frontend/tailwind-and-design-tokens | note | 07/04, 09/01 | P1 |
| frontend/motion-with-purpose | note (link this site's DESIGN.md Motion) | 07/05 | P2 |
| frontend/vue-nuxt-composition-api | note | 07/03 | P3 |
| frontend/accessibility-wcag-basics | note | 09/02 | P1 |
| frontend/responsive-mobile-first | note | 09/03 | P2 |
| frontend/loading-error-empty-states | cheatsheet | 09/04 | P1 |
| frontend/engineer-designer-handoff | note | 09/05 | P3 |
| frontend/typed-api-clients-openapi-orval | how-to | 05/04, 10-example-code/nextjs/orval | P2 |

### Wave 11: Platform tools (new section, ~12 pages + cards) · source: `learn-devops`
| Page | Kind | From | Pri |
|---|---|---|---|
| platform/secure-deployment-platform | concept + Flow (VM track vs K8s track, end to end) | docs/00, 01, 02 | P1 |
| platform/security-baseline | note | docs/03, infra/ansible/roles/hardening_cis | P1 |
| platform/ansible-essentials | cheatsheet + interview cards | cheatsheets/03, infra/ansible | P1 |
| platform/nginx-edge | cheatsheet (link foundations/reverse-proxy-tls) | cheatsheets/04, roles/nginx_edge | P1 |
| platform/api-gateway-kong-gravitee | decision | cheatsheets/05, 06, gitops/platform/kong | P2 |
| platform/vault-secrets | cheatsheet + concept Flow (dynamic secrets/leases) | cheatsheets/13 | P1 |
| platform/vpn-private-access | note | cheatsheets/12 | P2 |
| platform/prometheus-grafana | cheatsheet (PromQL, recording/alert rules) | cheatsheets/07, observability/grafana | P1 |
| platform/elk-logging | cheatsheet | cheatsheets/08 | P2 |
| platform/devsecops-pipeline | concept + Flow (scan gates) | cheatsheets/09, docs/05, ci/* | P1 |
| platform/slo-and-runbooks | note (payment-service SLO + runbook as examples) | apps/payment-service/docs | P2 |
| foundations/backups-and-dr (enrich) | — | docs/07 | P1 |
| ci-cd + gitops pages (enrich with cards) | — | cheatsheets/10, gitops/* | P2 |
| containers/docker-cheatsheet, kubernetes/kubectl-cheatsheet, iac/tofu-cheatsheet (enrich + cards) | — | cheatsheets/01, 02, 11 + interview-qna | P1 |
| platform/devops-interview-playbook | cheatsheet (how to answer, linking to the pages) | cheatsheets/00 | P3 |

### Wave 12: Engineering depth (enrich existing sections, ~16 pages) · source: `software-engineering`, `key-learning/software-design`
| Page | Kind | From | Pri |
|---|---|---|---|
| design/state-machines | concept + Flow (order lifecycle) | key-learning/software-design/02/* | P1 |
| design/mediator, design/proxy | concept + Flow | key-learning/03/04, 05 | P1 |
| design/singleton-and-why-not | note | key-learning/03/07 | P2 |
| design/anti-patterns | note | key-learning/03/09, se/02/04 | P1 |
| design/use-case-and-class-design | note | key-learning/software-design/01/* | P2 |
| design/yagni-kiss-dry | note | se/01/02 | P1 |
| architecture/choosing-an-architecture | decision | se/03/06 | P1 |
| architecture/failure-modes-resilience | concept + Flow (timeouts, retries, circuit breaker) | se/01/03 | P1 |
| architecture/performance-budget | note | se/01/06 | P2 |
| architecture/database-partitioning | concept + Flow (partition pruning) | se/06/02 | P1 |
| architecture/normalization-vs-denormalization | note | se/06/03 | P2 |
| architecture/migrations-liquibase (enrich schema-migrations + regulated section) | — | se/06/04–06, 10-example-code/spring-boot/liquibase | P2 |
| architecture/graphql-trade-offs, architecture/grpc-protobuf | note | se/05/02, 03 | P2 |
| architecture/rest-graphql-grpc-decision (enrich api-design) | decision | se/05/05 | P2 |
| security/keycloak-realms-clients-roles | concept + Flow | se/04/04 | P1 |
| security/sso-architecture-keycloak | concept + Flow | se/04/05 | P2 |
| security/compliance-pci-gdpr-soc2 | note (an overview, not legal advice) | se/04/06 | P2 |
| security/internal-vs-external-apis | note | se/04/07 | P2 |
| process/testing-strategy (enrich) + process/e2e-playwright-cypress, process/contract-testing | note | se/08/* | P2 |
| process/tech-debt-tracking | note | se/01/08 | P2 |
| process/project-kickoff-checklist | cheatsheet (the 10 setup steps condensed) | se/00/* | P1 |

### Wave 13: Capstone and labs (P3)
- **Case study series** `capstone/pos-invoice-stock` (7 pages): domain → requirements/use cases → modules → state machines → patterns → implementation plan → release/runbook. It ties the design, architecture and process pages together (key-learning/practice-projects).
- **Labs** (only if they can run in CI): `labs/ansible-baseline` (ansible-lint + `--syntax-check`), `labs/kustomize-overlays` (kustomize build + kubeconform), `labs/promql-rules` (promtool check rules).
- **Glossary**: `foundations/glossary-khmer` built from `khmer-glossary.md`, **only after** the code task adds a Khmer font fallback (Noto Sans Khmer), because the current fonts have no Khmer glyphs.
- **Spring Boot examples**: not imported as labs (this repo's labs are TS/Docker/K8s/Tofu). Link them as the owner's external examples where relevant.

## 4. Sizing

| Wave | New | Enrich | Worker | Gate before start |
|---|---|---|---|---|
| 9 Leadership | ~13 | 3 | agy | none |
| 10 Frontend | ~13 | 0 | agy | none |
| 11 Platform | ~12 | 5 | agy | none |
| 12 Engineering depth | ~16 | 4 | agy | after Wave 9/10/11 merge (avoids meta.json conflicts) |
| 13 Capstone/labs/glossary | ~9 | — | agy + code task | after the font/section code task |

Target after Waves 9–12: about 160 pages, and from the interview Q&A, 600+ verified flashcards.

## 5. Code task (one worker, after the flow-followups merge)
- Add section icons (original clay style, matching the other 10) and `lib/home-data.ts` entries for `leadership`, `frontend` and `platform`, and re-balance the home grid for 13 cards.
- Add a Khmer font fallback (`Noto Sans Khmer` via next/font, used only through `:lang(km)`, with no cost on pages without Khmer).
- `index.mdx` cards with icons for the 3 new sections.

## 6. Review (lead)
For each wave: check facts against the cited official sources (sample at least 5 claims per page group), originality, a flow check at 360/1280, and the card correctness sample. Merge, then the next release (minor version bump per AGENTS.md §8).
