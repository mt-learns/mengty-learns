# Mengty Learns — Personal Learning Site Plan

> Owner: Lim Mengty · Status: Draft v3 · Date: 2026-11-26
> Domain: **mengtylearns.com** · Repo: `mengtylearns` · Tagline: *"Learning DevOps, architecture and security — one note at a time."*
> Stack: **Next.js (static export) + Fumadocs + Tailwind v4 + shadcn/ui** · single app, no database, no backend
> Design language: iOS-style, ported from the Chongdai design system (`chongdai/packages/ui/src/styles/globals.css`)
> Build steps: see `IMPLEMENTATION.md`

---

## 1. Product brief

### Problem
My notes on DevOps, IaC, software design and security are scattered. I want one fast, searchable site that I use for my own learning and can also share as a portfolio.

### Goals (MVP)
1. **Learn in public.** Publish structured notes on Docker, Kubernetes, Terraform/OpenTofu, CI/CD, GitOps, OOP, design patterns, architecture and OWASP.
2. **Easy to find.** Full-text search, a clear sidebar, and tags.
3. **Portfolio.** A home page, projects, and an about page that look polished. Use the iOS-style system, the same feel as Chongdai.
4. **Low upkeep.** A static site with one app and no server, database or monorepo.

### Non-goals
- Accounts, comments, view counters, a database, an API, or server code of any kind.
- i18n in MVP.
- Reusing Chongdai's *brand* (pink, Khmer wedding art). I reuse the **system**, not the brand.

### Users
| User | Need |
|---|---|
| Me (primary) | Write MDX fast. Find my notes later. Copy commands. |
| Recruiter / peer | Scan projects and skills in under 30 seconds. Read one good article. |

### Success metrics
- Lighthouse ≥ 95 on Performance, Accessibility, Best Practices and SEO (home page and one docs page).
- 0 broken links in CI.
- At least 10 published notes across at least 4 sections within 4 weeks of launch.

---

## 2. Stack decision

| Need | Choice | Why |
|---|---|---|
| Framework | **Next.js App Router, `output: 'export'`** | A pure static `out/` folder. Same framework as Chongdai, so no new tool to learn. |
| Docs shell (sidebar, TOC, search, MDX) | **Fumadocs** (`fumadocs-ui`, `fumadocs-core`, `fumadocs-mdx`) | Built for the Next.js App Router. Tailwind-based, so it themes easily to iOS. Supports static export with a **static search index** (no server). |
| Styling | Tailwind v4 + shadcn/ui | Same as Chongdai. You can copy the tokens and components across. |
| Dark mode | `next-themes` with the `.dark` class (Fumadocs' built-in provider) | Chongdai already uses `.dark`, so the tokens port **as is**, with no sync problem. |
| Interactive explainers | Plain React client components (`'use client'`) used in MDX | Matches the Josh Comeau-style demos. Only these components ship extra JS. |
| Hosting | Cloudflare Pages (recommended) or GitHub Pages, serving `out/` | Free, with preview URLs per PR. Custom domain at the root, so no `basePath`. |

Alternative considered: **Nextra 4** (Pagefind search, also static). It's fine, but its theme is more opinionated and harder to restyle to iOS. Fumadocs wins on custom design.

### Static-export constraints (must know)
| Not available with `output: 'export'` | What to do instead |
|---|---|
| `next/image` optimisation | Set `images.unoptimized: true` and ship pre-optimised AVIF/WebP (one small `sharp` script) |
| Route Handlers with dynamic data, middleware, ISR, server actions, `cookies()` | Not needed. Everything is generated at build time. |
| Dynamic routes without `generateStaticParams` | Every `[slug]` route must export `generateStaticParams` (Fumadocs does this for docs) |
| Redirects in `next.config` | Use the host's `_redirects` file (Cloudflare) |

---

## 3. Site map

```
/                    Home: hero, learning paths, latest notes, featured projects
/docs                Learning index (sections as tiles)
/docs/<section>/...  Fumadocs pages (MDX)
/projects            Project tiles + topic filter
/about               About me, skills, contact links
/review              Daily flashcard review (spaced repetition, localStorage)
/radar               Personal Tech Radar (Adopt / Trial / Assess / Hold)
/digest              Weekly or biweekly "5 things that matter"
/404
```
Optional, without a backend: a newsletter through an external form (Buttondown or Substack embed link), and quiz/progress saved only in `localStorage`.

---

## 4. Decisions

| ID | Decision | Choice |
|---|---|---|
| D1 | Docs framework | Fumadocs |
| D2 | Dark mode | `next-themes`, `.dark` class, system default |
| D3 | Accent colour | **Superseded 2026-11-26 by `design/REDESIGN-PLAN.md`:** "Ink & Jade" (jade #0F766E / #2DD4BF, amber highlight, warm stone neutrals). Apple design principles, not Apple colours. |
| D4 | Fonts | Inter via `next/font/google` (self-hosted at build time), falling back to the system stack. Mono: `ui-monospace, "SF Mono", "JetBrains Mono", monospace`. |
| D5 | Hosting and domain | `mengtylearns.com` apex on Cloudflare Pages. `www` redirects to the apex. |
| D6 | Package manager | pnpm, Node 22 LTS (`.nvmrc`) |
| D7 | Illustration direction | "Friendly 3D objects + interactive explainers" (§6). All art is original. |

---

## 5. Design system: port from Chongdai

Port the **system**, not the brand. Copy from `chongdai/packages/ui/src/styles/globals.css` into `app/tokens.css`:

| Keep as is | Change |
|---|---|
| The `@custom-variant dark` rule and the `:root` / `.dark` token blocks | Primary / link / ring → D3 accent instead of pink |
| iOS Dynamic Type scale (`--text-large-title` … `--text-caption-2`) | Drop Khmer type (`--text-title-km`, Kantumruy, the 14/22 override) |
| Radii: control 12px, panel 16px, card 20px, pill | Drop the `site` variant (Increase Contrast mode) |
| `--tap-target: 44px`, control heights | — |
| Neutral palette and roles: `grouped`, `separator`, `label-secondary`, `label-tertiary` | — |
| Materials `material-thin/regular/thick` (blur 20px, saturate 180%) | Use only on the sticky nav and the search dialog. Add a solid fallback. |
| `--ease-ios`, and the `rounded-*`, `min-h-tap`, `h-control` utilities | Respect `prefers-reduced-motion` |
| shadcn token names (`--background`, `--card`, `--primary` …) | — |

### Fumadocs theming
Fumadocs reads its own `--color-fd-*` variables (background, foreground, card, primary, muted, border, accent, popover, ring). Map them to the iOS tokens once:

```css
@theme inline {
  --color-fd-background: var(--background);
  --color-fd-foreground: var(--foreground);
  --color-fd-card: var(--card);
  --color-fd-card-foreground: var(--card-foreground);
  --color-fd-popover: var(--popover);
  --color-fd-popover-foreground: var(--popover-foreground);
  --color-fd-primary: var(--primary);
  --color-fd-primary-foreground: var(--primary-foreground);
  --color-fd-muted: var(--muted);
  --color-fd-muted-foreground: var(--muted-foreground);
  --color-fd-accent: var(--accent);
  --color-fd-accent-foreground: var(--accent-foreground);
  --color-fd-border: var(--border);
  --color-fd-ring: var(--ring);
}
```
Check the exact variable names against the installed Fumadocs version (look at `fumadocs-ui/css/*.css`). Pin the version.

### iOS components to build
`GroupedList`, `Tile` (20px radius card), `SegmentedControl`, `LargeTitle`, `MaterialNav`, plus shadcn `Card`, `Badge`, `Button`, `Tooltip`. Copy them from Chongdai's `packages/ui/src/components/common` where they already exist (`grouped-list`, `segmented-control`, `badge`, `page-title`), and remove the Chongdai-specific props.

---

## 6. Illustration and explainer concept

**References:** [kentcdodds.com/courses](https://kentcdodds.com/courses) (friendly character, spot illustrations, course cards with featured items shown larger) and [joshwcomeau.com](https://www.joshwcomeau.com/react/use-deferred-value/) (interactive demos inside the article, step-through timelines, a playful long-form layout).
**Rule:** take the *ideas*, never the assets. Every illustration and widget is original.

### Visual concept: "iOS calm + playful objects"
| Element | Direction |
|---|---|
| **Style** | Soft 3D clay / app-icon look: rounded geometry, top-left soft light, a gentle contact shadow, matte materials |
| **Palette** | Neutral iOS base plus the D3 accent. 2 or 3 "toy" hues (amber, mint, lavender) used **only inside illustrations** |
| **Per-section icon** | An original 3D object in an iOS squircle: crate (Containers), an original wheel (Kubernetes, not the logo), blueprint roll (IaC), conveyor belt (CI/CD), branch sapling (GitOps), blocks (Design/OOP), skyline (Architecture), shield with lock (Security). No vendor trademarks. |
| **Mascot (optional, post-launch)** | An original character (e.g. a kouprey calf or a gecko in a hard hat) for the 404 page, empty states and the hero |
| **Hero** | Large title "Hi, I'm Mengty. I'm learning in public." plus a 3D desk scene of section objects, each linking to its section |
| **Format** | SVG for spot art and diagrams. Pre-optimised AVIF/WebP with `width`/`height` for 3D renders, and light/dark variants where needed |
| **Motion** | Spring "boop" on hover (scale 1.04, rotate 2°, `--ease-ios`), sparkle on "new" badges. All off under reduced motion. |

### Listing pages (Kent-style cards, iOS skin)
- Learning paths: the **featured path is a large tile** (illustration, title, blurb, "3 / 8 notes" chip). Other sections are small tiles in a 2- or 3-column grid.
- Projects: the same tile anatomy, with a 16:10 screenshot and tech badges.
- Latest notes: an iOS `GroupedList` with a 24px section squircle, the title, a `type` badge and the date.

### MDX components (`components/mdx/`)
| Component | Purpose | Client JS? |
|---|---|---|
| `<Sidenote>` | Soft tinted aside ("Why does this matter?") | no |
| `<Gotcha>` / `<Tip>` | Warning and tip callouts (wrap the Fumadocs `Callout`) | no |
| `<Figure>` | Illustration with a caption, light/dark aware | no |
| `<Terminal>` | Animated terminal session | yes |
| `<StepThrough>` | Scrubbable frame-by-frame timeline (slider + arrow keys) | yes |
| `<Playground>` | Sliders and toggles that drive a live diagram | yes |
| `<Quiz>` | 1–3 question self-check stored in `localStorage` | yes |

**Signature explainers (one per section, post-launch, one per month):** Docker layer cache, Kubernetes scheduler simulator, Terraform plan stepper, CI pipeline scrubber, GitOps drift slider, pattern playgrounds, and an OWASP injection demo that runs only in the browser.

### Art pipeline
A one-line brief per object (`docs/art-briefs.md`) → draft (Blender, Spline or AI-assisted) → hand clean-up → `scripts/optimize-images.mjs` (sharp: AVIF/WebP at 1x/2x) → QA in both themes. Alt text is required.

---

## 7. Content model

Frontmatter schema in `source.config.ts` (`fumadocs-mdx`), extending the default:

```ts
type:        'tutorial' | 'how-to' | 'reference' | 'explanation'   // Diátaxis, shown as a badge
level:       'beginner' | 'intermediate' | 'advanced'
tags:        string[]
tested_with: Record<string, string>     // { docker: "27.x" }
status:      'draft' | 'stable' | 'outdated'
updated:     date
verified:    date                       // last time I re-ran the commands/labs
kind:        'note' | 'concept' | 'cheatsheet' | 'lab' | 'decision' | 'postmortem' | 'radar' | 'digest'
cards:       { q: string; a: string }[] // 3–5 flashcards → /review (§9)
related:     string[]                   // slugs → "Related" + backlinks
sources:     { title: string; url: string }[]  // official docs first
```
The note and concept-page templates are in §10. What to write, and in what order, is in `CONTENT-PLAN.md`.
Projects are plain data in `content/projects.ts` (a typed array), so they need no extra loader.

Sections (sidebar order through `meta.json`): Foundations → Containers → Kubernetes → IaC → CI/CD → GitOps → Design → Architecture → Security.

---

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| A static-export feature is used by mistake (image optimisation, a dynamic route) | `next build` fails loudly. Keep `images.unoptimized`. CI builds every PR. |
| Fumadocs upgrade breaks theme variables | Pin the version. Keep the mapping in one file. Run a visual check page in CI preview. |
| Too much client JS | Only `components/mdx/*` interactive widgets are `'use client'`. Check `next build` output sizes. |
| iOS blur is slow on low-end Android | Use materials on the nav only. Add an `@supports` solid fallback. |
| Content sprawl | Diátaxis `type` field, schema validation, and MDX templates in `content/_templates/`. |

---

## 9. Learning system (learn fast, remember long)

The site is a **learning system, not a news site**. Every feature below works with static export, keeping state in `localStorage` with no backend.

### 9.1 Content types
| `kind` | What it is | Example |
|---|---|---|
| `note` | Evergreen how-to / explanation / reference (Diátaxis `type`) | "How Docker volumes work" |
| `concept` | Full concept page with a `<Flow>` (§10.2) | "Bridge pattern", "Kubernetes Service routing" |
| `cheatsheet` | One page of commands I reuse | kubectl, Terraform, git |
| `lab` | Hands-on exercise. Its files live in `labs/<name>/` and CI runs them | "Multi-stage Dockerfile for Next.js" |
| `decision` | "Why X over Y", ADR-style | "Argo CD vs Flux for my setup" |
| `postmortem` | My mistakes and how I fixed them (most memorable) | "My pod was OOMKilled" |
| `radar` | One Tech Radar entry: Adopt / Trial / Assess / Hold | "OpenTofu: Trial" |
| `digest` | Weekly or biweekly "5 things that matter", in my own words, with links | "Week 48" |

### 9.2 Correctness rules ("the correct way")
1. **Facts link to their source.** Official docs first (kubernetes.io, the Terraform registry, OWASP, MDN). My opinions go in a `<MyTake>` aside.
2. **`tested_with` + `verified`** on every note. The page shows **"⚠️ May be outdated"** automatically when `verified` is more than 12 months old, or when `status: outdated` is set.
3. **Labs are tested code.** `labs/<name>/` holds real files. CI runs `docker build`, `hadolint`, `terraform fmt -check && terraform validate`, `tflint`, `kubeconform` and `actionlint`. If a lab breaks, the build fails.
4. **No copied content.** Write in my own words, and quote briefly with a link.
5. Internal and external link check in CI (weekly for external links).

### 9.3 Remember: spaced repetition + active recall
| Feature | Behaviour |
|---|---|
| **Flashcards** | 3–5 `cards` per note in the frontmatter. The build collects them into `public/cards.json`. |
| **`/review` page** | Shows the cards due today. Each card is graded Again / Hard / Good / Easy, and an FSRS (or SM-2) schedule in `localStorage` decides when it comes back. Shows a streak and a due count. Export/import JSON as a backup. |
| **"Check yourself"** | `<Quiz>` at the end of each note: answer first, then reveal. |
| **TL;DR first** | Required: 3 lines max (the Feynman test). |
| **Related + backlinks** | From `related`, so notes connect (Docker → Pods → Helm). |
| **Learning paths** | An ordered path per section, with progress ("3 / 8 done") in `localStorage` and "Next in path →" at the bottom of every page. |

### 9.4 News: a personal radar, not a news feed
- **`/radar`**: the Thoughtworks-style rings (Adopt / Trial / Assess / Hold). Each item has 2 lines: what it is · why it matters to me · my action.
- **`/digest`**: a weekly or biweekly post with 3–5 items, in my own words, with source links.
- **Inbox automation, kept private:** a scheduled GitHub Action pulls RSS feeds (Kubernetes blog, CNCF, GitHub changelog, AWS What's New, OpenTofu/HashiCorp releases, OWASP, CISA KEV) into a GitHub issue or `inbox/*.json` that is **not published**. I pick 3–5 items a week and write radar or digest entries. Budget: 15 min a week.

### 9.5 My routine
- **Daily, 15 min:** `/review` cards, then read one note.
- **Weekly, 1–2 h:** one lab, one new or updated note, and one digest or radar entry.
- **Monthly:** fix "outdated" notes, and write one postmortem or decision plus one new `<Flow>`.

### 9.6 Writing must stay easy
- `pnpm new <kind> <section>/<slug>` creates the file from a template with the dates filled in.
- Publish small (`status: draft` keeps it out of the paths), and improve later.

---

## 10. Docs UX: page templates and animated process flows

**References (ideas only, no copied text or art):** the page structure of refactoring.guru (e.g. `/design-patterns/bridge`), and IcePanel's animated "flows" over architecture diagrams.

### 10.1 Templates
**Note template** (`kind: note`):
TL;DR → Why it exists (the problem) → Mental model (one diagram or `<Flow>`) → Do it (commands) → Gotchas → Production checklist → Check yourself → Sources.

**Concept page template** (`kind: concept`): a fixed order, so readers always know where to look:

| # | Section | Component |
|---|---|---|
| 1 | Intent: TL;DR, 2–3 lines | `<Intent>` |
| 2 | Problem: what hurts, with an illustration | `<Figure>` |
| 3 | Solution in plain words | prose |
| 4 | Real-world analogy | `<Analogy>` |
| 5 | **▶ Flow: watch it work** | `<Flow>` |
| 6 | Structure: static class or component diagram | `<Figure>` (SVG) |
| 7 | Code: language tabs (TS / Go / Python) + "Run it" lab link | `<Tabs>` + `<LabLink>` |
| 8 | When to use / when to avoid | `<Checklist>` |
| 9 | How to implement: numbered steps | `<Steps>` |
| 10 | Pros / Cons | `<ProsCons>` |
| 11 | Relations: "Bridge vs Adapter vs Strategy" | `<Relations>` |
| 12 | Check yourself (feeds `/review`) | `<Quiz>` + `cards` |

### 10.2 `<Flow>`: an animated step-by-step process diagram
```
┌──────────────────────────────────────────────────────────────┐
│   [User] ──●──▶ [Ingress] ─────▶ [Service] ─────▶ [Pod A]     │
│                                     └──────────▶ [Pod B]      │
│  Step 2 / 5  Ingress matches host + path and forwards to the  │
│              Service "web" on port 80.                        │
│  ◀  ▶  ⏯   ━━━━●━━━━━━━   1x   🔗 link to this step           │
└──────────────────────────────────────────────────────────────┘
```

**Behaviour**
- In each step, the active nodes and edges are highlighted and the others fade to 40%. A dot travels along the active edge.
- Edges can be `request` (accent colour), `response` (dashed) or `error` (destructive colour).
- The caption is synced to the step. A details drawer is optional.
- Controls: previous/next, ← → keys, a scrubber, autoplay at 0.5× / 1× / 2×, replay, and a step deep link `?flow=<id>&step=3`.
- A **compare toggle** (v2): "without pattern" vs "with pattern" (e.g. subclass explosion vs Bridge).
- **Zoom levels** (v3, the C4 idea): clicking a group node drills into its own sub-flow, with a breadcrumb back.

**Authoring as data:** written in MDX, or as `flows/<id>.ts` for big flows:
```mdx
<Flow id="k8s-request"
  nodes={[
    { id: 'user', label: 'User',    icon: 'user',    x: 0, y: 1 },
    { id: 'ing',  label: 'Ingress', icon: 'gateway', x: 1, y: 1 },
    { id: 'svc',  label: 'Service', icon: 'service', x: 2, y: 1 },
    { id: 'podA', label: 'Pod A',   icon: 'pod',     x: 3, y: 0 },
    { id: 'podB', label: 'Pod B',   icon: 'pod',     x: 3, y: 2 },
  ]}
  steps={[
    { edge: 'user->ing', text: 'Browser sends GET /cart' },
    { edge: 'ing->svc',  text: 'Ingress matches host + path, forwards to Service "web"' },
    { edge: 'svc->podA', text: 'kube-proxy picks a healthy Pod endpoint' },
    { edge: 'podA->svc', text: 'Pod A responds 200', kind: 'response' },
    { edge: 'svc->user', text: 'Response returns to the user', kind: 'response' },
  ]}
/>
```

**Tech:** hand-built SVG on a grid layout (`x`/`y` × cell size), with edges drawn as SVG paths. The `motion` library (`motion/react`) animates the dot along each path and the highlight changes, using `--ease-ios`. Nodes use iOS styling: `rounded-panel` cards, a section-icon squircle, and a light material. Mermaid was rejected (it can't animate a step sequence). **Superseded by §10.5:** v3 draws flows with React Flow in read-only mode. An automatic ELK layout is a possible later addition.

**Non-functional rules**
- `'use client'`, rendered only inside docs pages. The JS budget is ≤ 35 KB gzip for `<Flow>` + motion. Pages without a flow ship none of it.
- **Accessibility:** the same steps always render as a visible numbered list (`<ol>`) below the diagram. Controls are buttons with labels, and `aria-live="polite"` announces the caption.
- **Reduced motion:** no travelling dot or transitions, only an instant highlight per step.
- **Print and no-JS:** the SVG is static with all edges visible, plus the numbered list.
- **Mobile:** the diagram scales to the width (min 320px), and the caption and controls sit below it.
- Validate the data at build time: unknown node ids in a step fail the build.

### 10.3 Learner journey
```
Home ─▶ Learning path (3/8) ─▶ Concept page
   Intent → Problem → ▶ Flow → Structure → Code → Lab ─▶ Check yourself
        └─ cards saved ─▶ /review (daily) ─▶ "Next in path →"
```

### 10.4 Rollout
| Phase | Scope |
|---|---|
| **P1** | Note + concept templates, `pnpm new`, the `<Flow>` v1 (nodes, edges, steps, controls, list fallback, reduced motion), the first 2 flows: **Bridge** and **K8s request** |
| **P2** | `/review` + `cards.json` + `<Quiz>`, learning-path progress, "May be outdated" badge, labs tested in CI, response/error edges, deep links |
| **P3** | `<Flow>` compare toggle, `/radar` + `/digest`, the RSS inbox Action |
| **P4** | Zoom levels, ELK auto-layout, 1–2 new flows a month (`CONTENT-PLAN.md`) |

### 10.5 `<Flow>` v3: UX redesign (replaces the v1/v2 renderer)

**Why.** Review of v1/v2 (2026-11-26):
- **Too many controls:** prev, play, next, replay, speed, scrubber, and the full step list are all visible at once. The player takes more space than the diagram.
- **Hard to read:** labels are SVG text at 11–13px, and the whole SVG scales down on mobile, so text gets tiny.
- **Not iOS:** the nodes are plain bordered boxes, there's no depth, and the step history isn't visible.
- **Lost path:** only the current edge is highlighted, so readers forget where the request came from.

**Decision: draw flows with React Flow (`@xyflow/react`) in read-only "presentation mode".** Keep our own step engine and the **same data format** (`nodes`, `steps`, `variants`, `groups`), so the 6 existing flow pages need no content changes.
- **Why React Flow now:** nodes are real HTML/React. Text stays sharp and readable at any size, and iOS Tailwind styles apply directly. It also handles fit-to-view, zoom and pan, custom edges and edge labels.
- **Not an editor:** `nodesDraggable=false`, `nodesConnectable=false`, `elementsSelectable=false`, `zoomOnScroll=false`, `panOnScroll=false`, `preventScrolling=false` (the page keeps scrolling). Zoom happens only through the buttons and pinch on touch.
- **Layout:** keep the hand-placed `x`/`y` grid on desktop. On narrow screens (< 640px), switch automatically to a **top→bottom** layout calculated with `@dagrejs/dagre` (small). ELK is too heavy.
- **Cost:** about 50–60 KB gzip, **loaded lazily** (dynamic import once scrolled into view) and only on pages with a flow. The new budget is **≤ 80 KB gzip on flow pages, 0 KB elsewhere**. Show a static skeleton (the SVG from v1's no-JS fallback) until it loads.

**The new player: one iOS card**
```
╭──────────────────────────────────────────────────────────╮
│  Kubernetes request path                      [−] [+] [⤢] │  ← title + zoom (small, quiet)
│ ┌────────────────────────────────────────────────────────┐ │
│ │   ◉ User ──①──▶ ◉ Ingress ──②──▶ ◉ Service ──③─▶ ◉ Pod A │ │  ← canvas (grouped bg, 16:9, min-h 320)
│ │                                         ╰───────▶ ◉ Pod B │ │
│ └────────────────────────────────────────────────────────┘ │
│  ②  Ingress routes the request                             │  ← step title (headline)
│     Matches host + path, forwards to Service "web":80.     │  ← 1–2 lines (subheadline, muted)
│                                                            │
│   ‹    ● ● ◉ ○ ○    ›                    ▶ Play            │  ← dots = scrubber; one primary action
│  ▸ All steps (5)                                           │  ← disclosure, iOS grouped list inside
╰──────────────────────────────────────────────────────────╯
```

| Area | v3 rule |
|---|---|
| **Card** | `rounded-card`, `bg-card`, a soft shadow, and **no inner borders**. The canvas uses the `grouped` background with `rounded-panel`. No double borders anywhere. |
| **Nodes** | iOS app-icon style: a **44px squircle icon** with a per-category tint (client = gray, edge/network = blue, service = indigo, data = green, external = orange), plus a **15px semibold label** and an optional 13px subtitle. Real HTML text. |
| **Active state** | The active node gets a tinted ring, soft shadow and `scale(1.04)` (spring, `--ease-ios`, 300ms). Inactive nodes drop to **opacity 0.55** and stay legible. |
| **Edges** | 1.5px neutral at rest. **The active edge** is 2.5px accent with a dot travelling along it. **Visited edges stay tinted**, so the path so far stays visible. Each edge has a **step-number badge** (pill, 11px) at its midpoint. Response = dashed, error = destructive. |
| **Groups** | Frosted `material-thin` rounded panels with a small uppercase label (for the hexagon, onion rings and "Cluster"). |
| **Step text** | Steps gain a short **`title`** (≤ 6 words) plus the `text` (≤ 2 lines). A number badge matches the edge badge. |
| **Controls** | Only **‹ / ›**, **step dots** (tap to jump, also the scrubber), and **one Play/Pause/Replay** button. **Removed:** the speed selector (fixed at about 2.2 s per step) and the range scrubber. Replay appears in place of Play at the end. |
| **Start state** | Step 0 is an **Overview**: everything at full opacity, with a "Start ▶" call to action. No autoplay. |
| **Step list** | A `<details>` "All steps (n)" disclosure in iOS grouped-list style. Tapping a row jumps to that step. The list is server-rendered, so it works without JS, for screen readers and in print. |
| **Variants** | An iOS `SegmentedControl` above the canvas, full width on mobile. |
| **Mobile** | Top→bottom layout, a fixed canvas height of 420px, pinch to zoom, double-tap to fit, and controls in a single row. |
| **Keyboard / a11y** | ← → move between steps when the card is focused. Space plays or pauses. Visible focus rings. `aria-live` announces "Step 2 of 5: Ingress routes the request". Reduced motion: no dot travel and no scale, just an instant highlight. |
| **Deep links** | Kept from v2 (`?flow=&step=`), with "Copy link" in a small ⋯ menu. |

**Acceptance checks**
- At 360px, every label is ≥ 13px with no overlap, and the whole flow fits without horizontal scroll.
- The path-so-far is visible at every step.
- Only 3 controls are visible at once, plus the disclosure.
- Light and dark modes pass 4.5:1 contrast for labels.
- Lighthouse a11y ≥ 95 on a flow page. Pages without a flow have no React Flow JS.

### 10.6 Docs styling fixes (found in review)
- **Double border on code blocks:** the global `pre { border; rounded-xl }` rule in `app/global.css` nests inside Fumadocs' own code-block `figure`, which already has a border and radius. **Fix:** delete the `pre` rule, and style the Fumadocs code-block container once (radius 12px, one border or none, `bg-card`). Do the same check for callouts, tabs and cards, so each has exactly **one frame**.
- Add a **visual check page** (`/docs/kitchen-sink`) to the review checklist, with code blocks, tabs, callouts, tables and a flow, in both themes at 360px and 1280px.

---

## 11. Open questions for the owner
1. **D3:** iOS blue, or another accent colour?
2. Domain: mengtylearns.com is decided. Check it's free before buying.
3. Mascot: kouprey calf, gecko, or none?
4. Who makes the illustrations: by hand, AI-assisted, or commissioned?
5. English only, or Khmer later?
6. Flashcard scheduler: FSRS (better retention, slightly more code) or SM-2 (simple)? *Default: FSRS via the `ts-fsrs` package.*
7. Digest cadence: weekly or biweekly? *Default: biweekly. It's easier to keep up.*
8. Code-tab languages for concept pages: TS + Go + Python, or TS only to start? *Default: TS only in P1, then add Go.*

---

## Appendix A — Diagram rendering standard
All flows and diagrams follow **`DIAGRAM-RULES.md`** (MUST rules are blocking for merge). It supersedes the visual details in §10.5 wherever they differ: the badge-per-edge lists, the fixed canvas height, raw x/y coordinates, bezier edges, and opacity dimming.
