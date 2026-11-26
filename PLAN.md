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
/404
```
Optional, without a backend: a newsletter through an external form (Buttondown or Substack embed link), and quiz/progress saved only in `localStorage`.

---

## 4. Decisions

| ID | Decision | Choice |
|---|---|---|
| D1 | Docs framework | Fumadocs |
| D2 | Dark mode | `next-themes`, `.dark` class, system default |
| D3 | Accent colour | **Owner to confirm.** Default is iOS blue: `#0066CC` light (AA on white), `#409CFF` dark. Pure `#007AFF` is about 4:1 on white and fails AA. |
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
```
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

## 9. Open questions for the owner
1. **D3:** iOS blue, or another accent colour?
2. Domain: mengtylearns.com is decided. Check it's free before buying.
3. Mascot: kouprey calf, gecko, or none?
4. Who makes the illustrations: by hand, AI-assisted, or commissioned?
5. English only, or Khmer later?
