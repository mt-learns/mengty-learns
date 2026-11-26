# Redesign plan: landing page + "Ink & Jade" palette

> Owner feedback (2026-11-26, screenshot of `/`): the landing page is weak and not modern. It shouldn't use Apple's
> **colours**, only Apple's **design principles**. Projects and About aren't needed. Find a colour palette that's
> easy to read for a docs site.
> This plan replaces PLAN.md decision D3 (iOS blue) and supersedes the home-page parts of PLAN.md §3 and §6.

## 1. Problems in the current landing page

| # | Problem | Evidence |
|---|---|---|
| 1 | **Two containers that don't line up:** the nav and hero use a centred `max-w-screen-xl` container, but "Learning Paths" starts at x≈16px | Screenshot: the heading and cards hug the left edge while the hero is centred |
| 2 | **Generic hero:** an icon tile, "Hi, I'm Mengty." and a tagline. It says nothing about what the site does or why it's different | No value proposition, no proof, no product preview |
| 3 | **Unbalanced grid:** one 2/3-width "featured" card plus one card, with empty space on the right. Only 4 of 9 sections shown | Cards end at x≈1260 on a 1900px screen |
| 4 | **Apple colours:** iOS blue `#0066CC`/`#409CFF` and Apple grey neutrals look like a copy of Apple, not an identity | `app/tokens.css` |
| 5 | **Pages the owner doesn't want:** "View projects", the Projects and About nav items, and Featured Projects | Nav + home |
| 6 | **Hidden features:** the site's best features (animated flows, labs tested in CI, spaced-repetition review, radar) aren't shown at all | — |

## 2. Design direction: "Apple principles, own identity"

Keep Apple's *principles* and drop its *palette*:
- **Clarity:** one idea per section, strong type hierarchy, generous whitespace.
- **Deference:** content first. Chrome stays quiet: a translucent material nav, hairline borders.
- **Depth:** soft layered elevation, subtle shadows, the existing soft-3D clay illustrations.
- **Motion with purpose:** spring easing (`--ease-ios`), short and interruptible, off under reduced motion.
- **Consistency:** one container, one grid, one spacing scale everywhere.

Identity: **"Ink & Jade"**: warm paper and ink neutrals (stone, not Apple grey), a **jade/teal** accent for action and links, and **amber** as a warm highlight (radar, "new", streaks). It's calm, technical and very readable, and doesn't look like Apple, GitHub or the Fumadocs default.

## 3. Palette "Ink & Jade" (measured WCAG contrast)

| Role | Light | Ratio (on bg / card) | Dark | Ratio (on bg / card) |
|---|---|---|---|---|
| `--background` (page) | `#FAFAF8` warm paper | — | `#0E1013` ink | — |
| `--card` (surface) | `#FFFFFF` | — | `#16191E` | — |
| `--foreground` (text) | `#1C1917` | 16.7 / 17.5 | `#ECEAE7` | 15.9 / 14.7 |
| `--muted-foreground` | `#57534E` | 7.3 / 7.6 | `#A8A29E` | 7.6 / 7.0 |
| `--primary` (accent: buttons, active) | `#0F766E` jade | 5.2 / 5.5 | `#2DD4BF` | 10.2 / 9.5 |
| `--primary-foreground` | `#FFFFFF` (5.5 on jade) | — | `#0E1013` (10.2 on jade) | — |
| `--primary-hover` | `#115E59` | 7.3 / 7.6 | `#5EEAD4` | — |
| `--link` | `#0F766E` (underlined) | 5.2 / 5.5 | `#5EEAD4` | 12.9 / 11.9 |
| `--highlight` (amber, new token) | `#B45309` | 4.8 / 5.0 | `#F59E0B` | 8.9 / 8.2 |
| `--border` | `#E7E5E4` | (decorative) | `#2A2E35` | (decorative) |

Rules for the implementer:
- Derive the remaining tokens (`--muted`, `--accent`, `--secondary`, `--grouped`, `--separator`, `--border-strong`, `--input`, `--ring`, `--label-secondary/tertiary`, `--success/warning/destructive` (+ `-soft`, `-text`), `--sidebar-*`, `--material-*`, the Fumadocs `--color-fd-*` mapping, and the diagram category tints) from the same stone/jade/amber families. **Every text pair must be ≥ 4.5:1 and every UI graphic ≥ 3:1 in both themes.** Measure with a script and commit the table to `DESIGN.md`.
- `--label-tertiary` must also be ≥ 4.5:1 if it's used for text (the audit's P0-2).
- Code blocks: choose Shiki light/dark themes (or token overrides) where **every** token is ≥ 4.5:1 on the code background, with the code background one step off the page (`#F5F5F2` / `#13161B`).
- Diagram category tints (DIAGRAM-RULES §4.3) are re-derived to fit the palette. Red stays reserved for errors.
- Drop the Apple-specific values: `#0066CC`, `#409CFF`, `#f7f7f7`/`#121212` neutrals, and `#007AFF`-style blues.

## 4. Information architecture

- **Nav:** logo mark + "Mengty Learns" · **Docs · Review · Radar · Digest** · search · theme · GitHub. **Remove Projects and About.**
- **Delete** `app/(home)/projects/**`, `app/(home)/about/**` and `content/projects.ts`, plus every link to them (home, sitemap, footer, README).
- Logo: replace the "ML" text tile with the original "MT" monogram (`public/favicon.svg` family), in the jade accent.

## 5. New landing page (`/`)

One container for everything: `max-w-[1200px] mx-auto px-6 md:px-8`, a 12-column grid, a section rhythm of 96px desktop / 64px mobile, and the same container in the nav and footer.

| # | Section | Content | Notes |
|---|---|---|---|
| 1 | **Hero** (2 columns on desktop, stacked on mobile) | Eyebrow: "DevOps · Architecture · Security". **H1: "See how infrastructure really works."** (or a similar promise; the owner may edit). Sub: "Notes, animated flows, labs that CI actually runs, and flashcards that make it stick, by Lim Mengty." CTAs: **Start learning** (primary, → `/docs`) and **Today's review** (secondary, → `/review`, shows "n cards due" from `localStorage` after hydration, hidden until then). Right column: the enriched `hero-desk` illustration, **or** a small live `<Flow>` preview (the k8s request) in a device-like card | H1: 56/64px desktop, 36/42px mobile, tracking −0.02em, weight 700. Left-aligned text. LCP stays text |
| 2 | **Proof strip** | Real build-time counts: **N notes · N interactive flows · N labs · N flashcards** (computed from content; never hard-coded) | Small caps label + large numerals |
| 3 | **How it works** (3 columns) | **Read**: concept pages with animated flows. **Do**: labs validated in CI. **Remember**: spaced-repetition review. Each with a spot illustration and a link | Equal cards |
| 4 | **Learning paths**: all 9 sections | A bento grid, 3×3 desktop / 2 columns tablet / 1 column mobile. Each card: section icon (48px clay), title, one line, "N pages", and progress "x / N done" (localStorage, hidden until hydrated). Equal heights, aligned | Replaces the unbalanced 2-card grid |
| 5 | **Watch it work** | One featured `<Flow>` (e.g. Bridge or the k8s request) with 2 lines of context + "Explore concept pages →" | Lazy-loaded (no cost above the fold) |
| 6 | **Latest notes** | 6 most recently `updated` pages: title, kind/type badge, section, date. Grouped list | — |
| 7 | **Radar snapshot** | 4 rings with counts and the top 2 entries each → `/radar`. Amber highlight | — |
| 8 | **Footer** | Same container: Docs · Review · Radar · Digest · RSS · GitHub · "Static site. No tracking." | — |

States and behaviour:
- Server-render everything except the `localStorage` bits (due count, progress), which hydrate without layout shift (reserve their space).
- Reduced motion: no hero animation, and the flow preview starts paused.
- 360px: one column, CTAs stacked full width, hero illustration below the text at ≤ 240px tall.

## 6. Docs readability (applies to every page)
- Prose 17px / 1.65, max 70ch. Headings use the same scale family as the landing page.
- Links: jade, underline with an offset of 3px. Hover darkens.
- The sidebar active item uses `--primary` text on `--primary`/10 background (≥ 4.5:1, measured), not a filled pill.
- Callouts, code and tables use the new surfaces. One frame each (no nested borders).

## 7. Acceptance criteria
1. Nav, every home section and the footer share the same left and right edges at 360, 768, 1280 and 1920px (screenshot evidence).
2. No Projects/About routes, links or sitemap entries remain (`grep -ri "projects\|about" app lib content/*.ts` is clean, apart from unrelated words).
3. No Apple colour values remain (`grep -i "0066cc\|409cff\|007aff" app components` is empty).
4. The contrast table in `DESIGN.md` shows every text pair ≥ 4.5:1 and every UI graphic ≥ 3:1, in both themes.
5. Lighthouse on `/`, `/docs`, `/docs/design/bridge` and `/review`: performance ≥ 0.9, and accessibility, best practices and SEO ≥ 0.95. Axe shows no serious or critical violations. Report the real scores (this absorbs the old phase-2 commit #6 and `BLOCKERS.md`).
6. Screenshots of `/`, `/docs`, a concept page, `/review`, `/radar` and 404 at 360 and 1280 px, in light and dark, reviewed and listed in the report.
7. Build, lint, typecheck and tests are green, with no `Co-Authored-By` or "Generated with" in commits.

## 8. Commit plan
1. `feat(tokens): ink and jade palette` (tokens, Fumadocs mapping, Shiki themes, diagram tints, contrast table in DESIGN.md)
2. `refactor(nav): remove projects and about` (routes, content, links, sitemap, README)
3. `feat(home): modern landing page` (sections 1–8)
4. `fix(docs): reading comfort with the new palette` (§6)
5. `chore(quality): green lighthouse and axe gates` (+ update BLOCKERS.md)
