---
name: Mengty Learns
description: "Ink & Jade": Apple design principles with its own identity. Calm, readable, technical.
colors:
  primary-light: "#0F766E"
  primary-dark: "#2DD4BF"
  primary-hover-light: "#115E59"
  primary-hover-dark: "#5EEAD4"
  link-light: "#0F766E"
  link-dark: "#5EEAD4"
  highlight-light: "#B45309"
  highlight-dark: "#F59E0B"
  background-light: "#FAFAF8"
  background-dark: "#0E1013"
  card-light: "#FFFFFF"
  card-dark: "#16191E"
  code-light: "#F5F5F2"
  code-dark: "#13161B"
  foreground-light: "#1C1917"
  foreground-dark: "#ECEAE7"
  muted-light: "#F0EFEC"
  muted-dark: "#1F2329"
  muted-foreground-light: "#57534E"
  muted-foreground-dark: "#A8A29E"
  border-light: "#E7E5E4"
  border-dark: "#2A2E35"
  border-strong-light: "#8A847E"
  border-strong-dark: "#646B75"
  destructive-light: "#B91C1C"
  destructive-dark: "#F87171"
  success-light: "#15803D"
  success-dark: "#4ADE80"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 700
    lineHeight: "2.5625rem"
    letterSpacing: "0.023rem"
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: "1.375rem"
    letterSpacing: "-0.027rem"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: "1.375rem"
    letterSpacing: "-0.027rem"
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.125rem"
    letterSpacing: "-0.005rem"
rounded:
  control: "12px"
  panel: "16px"
  card: "20px"
  pill: "999px"
spacing:
  tap-target: "44px"
  control-h: "40px"
  control-h-touch: "44px"
components:
  button-primary:
    backgroundColor: "{colors.primary-light}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "8px 24px"
  tile-card:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.foreground-light}"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Design System: Mengty Learns

## Overview

**Creative North Star: "Ink & Jade" (Apple principles, own identity)**

Mengty Learns keeps Apple's *principles* (clarity, deference, depth, purposeful motion, consistency) and drops Apple's *palette*. Warm paper and ink neutrals from the stone family, a jade accent for action and links, and amber as the one warm highlight. Reading surfaces (`Read` mode) stay quiet so prose, code and `<Flow>` diagrams lead; the home page (`Persuade` mode) shows the product working: a live flow, real counts, the review queue.

**Key Characteristics:**
- **One container, one grid:** nav, every home section and the footer share `max-w-[1200px] mx-auto px-6 md:px-8`.
- **Jade accent:** `#0F766E` light / `#2DD4BF` dark for buttons, active states, focus and links (links are always underlined).
- **Stone surfaces:** paper `#FAFAF8` / ink `#0E1013` pages, white / `#16191E` cards, hairline borders.
- **Original playful objects:** soft-3D clay icons and spot scenes add warmth; UI chrome stays neutral + jade.

## Colors

Restrained strategy: tinted stone neutrals plus one accent (jade) and one highlight (amber). All values live in `app/tokens.css`; components use tokens only.

### Accent and highlight
- **Jade** (`--primary` `#0F766E` / `#2DD4BF`, hover `#115E59` / `#5EEAD4`): primary buttons, active nav and sidebar items, focus rings, progress, active `<Flow>` edges.
- **Link** (`--link` `#0F766E` / `#5EEAD4`): prose links, underlined with a 3px offset.
- **Amber** (`--highlight` `#B45309` / `#F59E0B`, `--highlight-text` on `--highlight-soft` for badges): radar, "new", streaks. Never a second button colour.

### Status
- **Destructive** (`#B91C1C` / `#F87171`): errors only. Red is never a category tint and never means "bad design".
- **Success** (`#15803D` / `#4ADE80`), **Warning** (`#B45309` / `#F59E0B`): each has a `-soft` fill and a `-text` colour for callouts.

### Neutral (stone)
- **Page** `--background` `#FAFAF8` / `#0E1013`; **card** `--card` `#FFFFFF` / `#16191E`; **code and diagram canvas** `--code-bg` / `--grouped` `#F5F5F2` / `#13161B`.
- **Text** `--foreground` `#1C1917` / `#ECEAE7`; **secondary** `--muted-foreground` `#57534E` / `#A8A29E`; **tertiary** `--label-tertiary` `#6B6560` / `#938D88` (passes 4.5:1, used for dates).
- **Lines** `--border` `#E7E5E4` / `#2A2E35` (decorative); `--border-strong` / `--input` `#8A847E` / `#646B75` for control borders (3:1).

### Diagram category tints (DIAGRAM-RULES §4.3)
`--diagram-{client,network,service,data,external,abstraction,concrete}` (icon colour) and `--diagram-*-soft` (tile fill), in both themes. Tint the icon tile only. `components/diagram/category.ts` switches to these after the diagram-rules merge (see `BLOCKERS.md`).

### Code
Shiki `github-light` / `github-dark` on `--code-bg`. `scripts/code-theme.mjs` generates `app/code-theme.css`, which remaps every token colour under 4.5:1 to the nearest same-hue colour that passes.

### Measured contrast

Generated by `node scripts/contrast.mjs --markdown` (WCAG 2.x relative luminance; translucent fills are composited over the page the way the browser paints them). `node scripts/contrast.mjs` exits non-zero if any pair drops below its minimum.

| Pair (fg on bg) | Kind | Light | Ratio | Dark | Ratio | Result | Used for |
|---|---|---|---|---|---|---|---|
| `foreground` on `background` | text ≥ 4.5 | #1C1917 / #FAFAF8 | 16.73 | #ECEAE7 / #0E1013 | 15.87 | Pass | Body text on the page |
| `foreground` on `card` | text ≥ 4.5 | #1C1917 / #FFFFFF | 17.49 | #ECEAE7 / #16191E | 14.67 | Pass | Body text on cards |
| `foreground` on `code-bg` | text ≥ 4.5 | #1C1917 / #F5F5F2 | 16.01 | #ECEAE7 / #13161B | 15.10 | Pass | Plain code text |
| `muted-foreground` on `background` | text ≥ 4.5 | #57534E / #FAFAF8 | 7.30 | #A8A29E / #0E1013 | 7.55 | Pass | Secondary text on the page |
| `muted-foreground` on `card` | text ≥ 4.5 | #57534E / #FFFFFF | 7.63 | #A8A29E / #16191E | 6.99 | Pass | Secondary text on cards |
| `muted-foreground` on `muted` | text ≥ 4.5 | #57534E / #F0EFEC | 6.63 | #A8A29E / #1F2329 | 6.26 | Pass | Secondary text on muted fills |
| `label-tertiary` on `background` | text ≥ 4.5 | #6B6560 / #FAFAF8 | 5.50 | #938D88 / #0E1013 | 5.81 | Pass | Tertiary labels (dates) on the page |
| `label-tertiary` on `card` | text ≥ 4.5 | #6B6560 / #FFFFFF | 5.74 | #938D88 / #16191E | 5.37 | Pass | Tertiary labels on cards |
| `secondary-foreground` on `secondary` | text ≥ 4.5 | #1C1917 / #F0EFEC | 15.21 | #ECEAE7 / #1F2329 | 13.14 | Pass | Secondary button / pill |
| `accent-foreground` on `accent` | text ≥ 4.5 | #1C1917 / #EDECE8 | 14.79 | #ECEAE7 / #23282F | 12.35 | Pass | Hovered row text |
| `primary` on `background` | text ≥ 4.5 | #0F766E / #FAFAF8 | 5.24 | #2DD4BF / #0E1013 | 10.24 | Pass | Jade text / active nav on the page |
| `primary` on `card` | text ≥ 4.5 | #0F766E / #FFFFFF | 5.47 | #2DD4BF / #16191E | 9.46 | Pass | Jade text on cards |
| `primary-foreground` on `primary` | text ≥ 4.5 | #FFFFFF / #0F766E | 5.47 | #0E1013 / #2DD4BF | 10.24 | Pass | Primary button label |
| `primary-foreground` on `primary-hover` | text ≥ 4.5 | #FFFFFF / #115E59 | 7.58 | #0E1013 / #5EEAD4 | 12.88 | Pass | Primary button label, hover |
| `primary` on `primary-soft` | text ≥ 4.5 | #0F766E / #E6F2F0 | 4.78 | #2DD4BF / #12292A | 8.20 | Pass | Jade text on jade tint (badges) |
| `primary` on `primary/10` | text ≥ 4.5 | #0F766E / #E3EDEA | 4.57 | #2DD4BF / #112424 | 8.70 | Pass | Jade text on bg-primary/10 over the page |
| `link` on `background` | text ≥ 4.5 | #0F766E / #FAFAF8 | 5.24 | #5EEAD4 / #0E1013 | 12.88 | Pass | Links in prose |
| `link` on `card` | text ≥ 4.5 | #0F766E / #FFFFFF | 5.47 | #5EEAD4 / #16191E | 11.91 | Pass | Links on cards |
| `link-hover` on `background` | text ≥ 4.5 | #115E59 / #FAFAF8 | 7.26 | #99F6E4 / #0E1013 | 15.11 | Pass | Hovered links |
| `sidebar-foreground` on `sidebar` | text ≥ 4.5 | #44403C / #FAFAF8 | 9.83 | #D6D3D1 / #0E1013 | 12.79 | Pass | Sidebar items |
| `sidebar-active-foreground` on `sidebar-active` | text ≥ 4.5 | #0F665F / #E6F2F0 | 5.94 | #5EEAD4 / #12292A | 10.31 | Pass | Sidebar active item |
| `highlight` on `background` | text ≥ 4.5 | #B45309 / #FAFAF8 | 4.81 | #F59E0B / #0E1013 | 8.87 | Pass | Amber highlight text on the page |
| `highlight` on `card` | text ≥ 4.5 | #B45309 / #FFFFFF | 5.02 | #F59E0B / #16191E | 8.20 | Pass | Amber highlight text on cards |
| `highlight-text` on `highlight-soft` | text ≥ 4.5 | #92400E / #FDF3E3 | 6.45 | #FBBF24 / #2A2012 | 9.58 | Pass | Amber badge text on amber tint |
| `destructive` on `card` | text ≥ 4.5 | #B91C1C / #FFFFFF | 6.47 | #F87171 / #16191E | 6.37 | Pass | Error text on cards |
| `destructive-foreground` on `destructive` | text ≥ 4.5 | #FFFFFF / #B91C1C | 6.47 | #0E1013 / #F87171 | 6.89 | Pass | Destructive button label |
| `destructive-text` on `destructive-soft` | text ≥ 4.5 | #A51A1A / #FDF0EF | 6.84 | #FCA5A5 / #2A1719 | 8.96 | Pass | Gotcha / outdated callout text |
| `destructive` on `destructive/10` | text ≥ 4.5 | #B91C1C / #F3E4E2 | 5.24 | #F87171 / #251A1C | 6.11 | Pass | Error text on bg-destructive/10 |
| `success` on `card` | text ≥ 4.5 | #15803D / #FFFFFF | 5.02 | #4ADE80 / #16191E | 10.11 | Pass | Success text on cards |
| `success-text` on `success-soft` | text ≥ 4.5 | #136C34 / #EDF7F0 | 5.95 | #86EFAC / #13261B | 11.32 | Pass | Tip callout text |
| `success-text` on `card` | text ≥ 4.5 | #136C34 / #FFFFFF | 6.52 | #86EFAC / #16191E | 12.55 | Pass | Success text on cards |
| `warning-text` on `warning-soft` | text ≥ 4.5 | #92400E / #FDF3E3 | 6.45 | #FBBF24 / #2A2012 | 9.58 | Pass | Warning callout text |
| `primary` on `background` | ui ≥ 3 | #0F766E / #FAFAF8 | 5.24 | #2DD4BF / #0E1013 | 10.24 | Pass | Focus ring, active edges, progress |
| `border-strong` on `background` | ui ≥ 3 | #8A847E / #FAFAF8 | 3.54 | #646B75 / #0E1013 | 3.54 | Pass | Control borders on the page |
| `border-strong` on `card` | ui ≥ 3 | #8A847E / #FFFFFF | 3.70 | #646B75 / #16191E | 3.27 | Pass | Control borders on cards |
| `input` on `field` | ui ≥ 3 | #8A847E / #FFFFFF | 3.70 | #646B75 / #16191E | 3.27 | Pass | Input borders |
| `highlight` on `card` | ui ≥ 3 | #B45309 / #FFFFFF | 5.02 | #F59E0B / #16191E | 8.20 | Pass | Amber markers (radar) |
| `destructive` on `grouped` | ui ≥ 3 | #B91C1C / #F5F5F2 | 5.92 | #F87171 / #13161B | 6.55 | Pass | Error edges on the diagram canvas |
| `muted-foreground` on `grouped` | ui ≥ 3 | #57534E / #F5F5F2 | 6.98 | #A8A29E / #13161B | 7.19 | Pass | Idle edges on the diagram canvas |
| `diagram-client` on `diagram-client-soft` | text ≥ 4.5 | #57534E / #F0EFEC | 6.63 | #D6D3D1 / #23272D | 10.07 | Pass | Diagram client icon on its tile (held to text level) |
| `diagram-network` on `diagram-network-soft` | text ≥ 4.5 | #1D4ED8 / #EAF0FC | 5.86 | #93C5FD / #172336 | 8.76 | Pass | Diagram network icon on its tile (held to text level) |
| `diagram-service` on `diagram-service-soft` | text ≥ 4.5 | #4338CA / #EEEEFC | 6.88 | #A5B4FC / #1E2038 | 7.99 | Pass | Diagram service icon on its tile (held to text level) |
| `diagram-data` on `diagram-data-soft` | text ≥ 4.5 | #136C34 / #EAF6EE | 5.87 | #86EFAC / #14281D | 11.07 | Pass | Diagram data icon on its tile (held to text level) |
| `diagram-external` on `diagram-external-soft` | text ≥ 4.5 | #A14A07 / #FDF1E4 | 5.40 | #FDBA74 / #2D2116 | 9.29 | Pass | Diagram external icon on its tile (held to text level) |
| `diagram-abstraction` on `diagram-abstraction-soft` | text ≥ 4.5 | #7E22CE / #F4ECFC | 6.07 | #D8B4FE / #271D35 | 9.04 | Pass | Diagram abstraction icon on its tile (held to text level) |
| `diagram-concrete` on `diagram-concrete-soft` | text ≥ 4.5 | #0F665F / #E6F2F0 | 5.94 | #5EEAD4 / #12292A | 10.31 | Pass | Diagram concrete icon on its tile (held to text level) |
| Every Shiki token (github-light / github-dark, 9 colours remapped by `app/code-theme.css`) on `code-bg` | text ≥ 4.5 | min on #F5F5F2 | 4.60 | min on #13161B | 4.64 | Pass | Code blocks |

### Named Rules
**The Token Rule.** No hex values in components or MDX; use the semantic tokens. Change a colour in `app/tokens.css`, then rerun `node scripts/contrast.mjs`.
**The Toy-Hue Containment Rule.** Playful clay hues (amber, mint, lavender, coral) live only in `<SectionIcon>` and `<Illustration>` art; UI chrome stays neutral + jade.
**The Red Rule.** Red means an error. Nothing else is red.

## Typography

**Display & Body Font:** `Inter` (loaded with Next's Google font loader as `--font-inter`, falling back to `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`).
**Mono Font:** `ui-monospace, "SF Mono", "JetBrains Mono", monospace` (`--font-mono`).

**Character:** Clean geometric neo-grotesque tuned to Apple's Dynamic Type scale, balancing compact UI labels with legible long-form technical reading.

### Landing scale (`app/tokens.css`)
- **Display** (`text-display` 36/42 → `md:text-display-lg` 56/64, weight 700, tracking −0.02em): the home H1 only.
- **Section** (`text-section` 28/34 → `md:text-section-lg` 36/42, 700, −0.02em): home section headings.
- **Lede** (`text-lede` 18/28.8 → `md:text-lede-lg` 20/32): hero sub copy.
- **Stat** (`text-stat` 36 → `md:text-stat-lg` 44, 700, tabular numerals): the proof strip.

### Hierarchy (iOS Dynamic Type Scale in `app/tokens.css`)
- **Large Title** (`700`, `2.125rem` / `34px`, line-height `2.5625rem`, tracking `0.023rem`): Hero and top-level page titles (`<LargeTitle>`).
- **Title 1** (`400`, `1.75rem` / `28px`, line-height `2.125rem`, tracking `0.0225rem`): Major section headings.
- **Title 2** (`400`, `1.375rem` / `22px`, line-height `1.75rem`, tracking `-0.016rem`): Sub-section headings.
- **Title 3** (`400`, `1.25rem` / `20px`, line-height `1.5625rem`, tracking `-0.028rem`): Card group headings.
- **Headline** (`600`, `1.0625rem` / `17px`, line-height `1.375rem`, tracking `-0.027rem`): Emphasized row titles, card titles, button labels (`font-headline`).
- **Body** (`400`, `1.0625rem` / `17px`, line-height `1.375rem`, tracking `-0.027rem`): Standard UI copy; long-form prose in `.prose` targets `65–75ch` measure and `1.5–1.65` line-height.
- **Callout** (`400`, `1rem` / `16px`, line-height `1.3125rem`, tracking `-0.019rem`): Asides and `<Analogy>` copy.
- **Subheadline** (`400`, `0.9375rem` / `15px`, line-height `1.25rem`, tracking `-0.014rem`): Secondary descriptions and metadata.
- **Footnote** (`400`, `0.8125rem` / `13px`, line-height `1.125rem`, tracking `-0.005rem`): Grouped list headers/footers, timestamps, source links.
- **Caption 1 / 2** (`400`, `0.75rem` / `12px` and `0.6875rem` / `11px`): Badges, edge step pills, and micro-labels.

## Layout

- **One container:** `components/layout/container.tsx` = `max-w-[1200px] mx-auto px-6 md:px-8`. The Fumadocs home nav is pinned to the same width and gutters in `app/global.css` (`#nd-home-layout`, `#nd-nav`), and `components/layout/site-footer.tsx` uses the container. `node scripts/qa-shots.mjs` reports whether the nav, every container and the footer share their content edges.
- **Section rhythm:** `py-16 md:py-24` (64px / 96px), separated by hairline `border-t`. Grids use 12 columns at `lg`; the hero stacks below `lg`.
- **Home (`/`, Persuade):** hero (H1 + two CTAs + desk illustration) → proof strip (build-time counts) → Read / Do / Remember (each with a real artifact: a flow strip, the CI lab checks, a real flashcard) → 9 learning paths (3×3 / 2 / 1) → live `<Flow>` → latest notes → radar snapshot → footer. All counts come from `lib/home-data.ts` at build time.
- **Touch targets:** minimum `44px` (`--tap-target` / `min-h-tap`) on buttons, links and list rows.

## Elevation & Depth

Surfaces rely primarily on **tonal layering** (page `#FAFAF8` vs card `#FFFFFF`) and crisp `1px` borders, reserving blur and subtle shadows for floating chrome and interactive lift.

### Material & Motion Tokens
- **Materials:** `material-thin` (`60%` card + `blur(20px) saturate(180%)`), `material-regular` (`72%`, used on sticky `.fd-nav` and search dialog), `material-thick` (`85%`).
- **Easing (`--ease-ios`):** `cubic-bezier(0.32, 0.72, 0, 1)` for all transitions, hover lifts, and `<Flow>` active node scaling (`scale(1.04)`).
- **Reduced Motion:** All transitions, spring lifts, and `<Flow>` travelling dots must disable under `prefers-reduced-motion: reduce`, preserving instant state highlights.

### Named Rules
**The Single-Frame Rule.** Every code block, callout, tab container, and card must have at most **one** border/frame—never nest bordered `pre` elements inside bordered Fumadocs `figure` containers.

## Shapes

Consistent nested squircle-like rounding:
- **Control (`--radius-control`):** `12px` — buttons, inputs, segmented control tracks, code blocks (`figure.shiki`).
- **Panel (`--radius-panel`):** `16px` — callouts (`<Sidenote>`, `<Gotcha>`, `<Tip>`), `<Intent>`, `<Analogy>`, `<Flow>` nodes and canvas.
- **Card (`--radius-card`):** `20px` — `<Tile>`, `<GroupedList>`, `<Quiz>`, `<Figure>` frames, review cards.
- **Pill (`--radius-pill`):** `999px` — status chips, Diátaxis badges, progress counters.

## Components

### Buttons & Controls
- **Primary Button:** `bg-primary text-primary-foreground rounded-control min-h-tap px-6 font-headline`.
- **SegmentedControl:** `bg-secondary p-1 rounded-control`; active segment uses `bg-background text-foreground shadow-sm font-semibold`.

### Cards & Lists
- **Tile (`components/ios/tile.tsx`):** `rounded-card border bg-card p-6` (`p-8 md:min-h-56` when `large`), icon badge, optional progress/status pill, `font-headline` title, `text-muted-foreground` description.
- **GroupedList (`components/ios/grouped-list.tsx`):** Uppercase `text-footnote` header, `rounded-card bg-card border` container with `0.5px` inset `ml-4` separators, and `min-h-tap` rows with `ChevronRight`.

### Icon Rules
- **Single Icon Set:** Use **`lucide-react`** exclusively for all UI icons. Do not mix icon libraries or inline ad-hoc UI `<svg>` paths when a Lucide icon exists.
- **Size & Stroke Standard:**
  - Inline / badge / button icons: `16px` (`size-4`), `strokeWidth={1.75}`.
  - Navigation / node / list icons: `20px` (`size-5`), `strokeWidth={1.75}`.
  - Feature / empty-state UI icons: `24px` (`size-6`), `strokeWidth={1.75}`.
- **Accessibility:** Decorative icons paired with visible text **must** carry `aria-hidden="true"`. Icon-only buttons **must** provide an `aria-label`.
- **Zero Emoji Policy:** **NO emoji (`🔥`, `🎉`, `🧭`, `⚠️`, `❌`, `✅`) or Unicode symbol glyphs (`✦`, `✓`) as UI icons anywhere** in components, pages, or code-block comments.

### Illustration Rules
- **Visual Style ("Soft 3D Clay App Icon"):** Hand-authored, lightweight SVGs (`< 8 KB` each) featuring an iOS squircle tile, layered directional gradients, a **top-left key light**, soft inner rim highlight, gentle contact shadow, and a matte object silhouette.
- **Theme Awareness:** Use CSS custom properties (`var(--card)`, `var(--primary)`, `var(--foreground)`, etc.) and scoped gradient/filter IDs so every asset adapts cleanly to light and dark modes.
- **Originality:** Zero vendor logos or trademarks (e.g., Kubernetes uses an original 7-spoke helm wheel, never the official K8s mark; Containers uses a cargo crate).
- **Component API (`components/illustrations/`):**
  - `<SectionIcon name="..." size={24 | 48 | 96 | 256} decorative={...} title="..." />` for the 9 sections (`foundations`, `containers`, `kubernetes`, `iac`, `ci-cd`, `gitops`, `design`, `architecture`, `security`).
  - `<Illustration name="..." size={24 | 48 | 96 | 256} decorative={...} title="..." />` for spot art (`hero-desk`, `review-empty`, `not-found`, `lab-header`, `radar-header`).
  - Accessibility: `role="img"` + `<title>` when meaningful, or `aria-hidden="true"` when decorative.
- **Static Exports:** Mirror optimized standalone SVGs in `public/illustrations/` for OG images and static `<img src>` usage.

## Do's and Don'ts

### Do:
- **Do** use iOS token utilities (`rounded-card`, `rounded-panel`, `rounded-control`, `min-h-tap`, `--ease-ios`) for all layout and interaction styling.
- **Do** pair every `lucide-react` icon with `aria-hidden="true"` when adjacent to text.
- **Do** test every page at `360px` and `1280px` in both light and dark modes with `prefers-reduced-motion` enabled.

### Don't:
- **Don't** hard-code hex colors in React components or MDX; use semantic tokens.
- **Don't** use emoji or Unicode glyphs (`🔥`, `🎉`, `🧭`, `✦`, `✓`, `⚠️`) as UI icons.
- **Don't** skip heading levels (`h1 → h3`) or stack double borders around code blocks and callouts.
- **Don't** render vendor trademarks in section icons or spot illustrations.
