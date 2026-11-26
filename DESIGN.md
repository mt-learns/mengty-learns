---
name: Mengty Learns
description: iOS-inspired calm, tactile design system for technical learning and portfolio surfaces.
colors:
  primary-light: "#0066CC"
  primary-dark: "#409CFF"
  background-light: "#f7f7f7"
  background-dark: "#121212"
  card-light: "#ffffff"
  card-dark: "#1e1e1e"
  foreground-light: "#222222"
  foreground-dark: "#f7f7f7"
  muted-light: "#f2f2f2"
  muted-dark: "#262626"
  muted-foreground-light: "#6a6a6a"
  muted-foreground-dark: "#a3a3a3"
  border-light: "#ebebeb"
  border-dark: "#2e2e2e"
  destructive-light: "#cd0014"
  destructive-dark: "#ff453a"
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

**Creative North Star: "iOS Calm + Playful Objects"**

Mengty Learns pairs Apple's Human Interface Guidelines discipline—grouped surfaces, hairline separators, Dynamic Type hierarchy, and translucent materials—with warm, tactile, soft-3D clay spot illustrations. Reading surfaces (`Read` mode) stay quiet and distraction-free so technical prose, code, and interactive `<Flow>` diagrams lead; the home page (`Persuade` mode) uses generous whitespace, clear bento-style learning path tiles, and playful 3D object icons to invite exploration.

**Key Characteristics:**
- **iOS-native geometry:** Nested concentric radii (`12px` controls inside `16px` panels inside `20px` cards).
- **Accessible iOS Blue accent:** `#0066CC` in light mode and `#409CFF` in dark mode (replacing pure `#007AFF` which fails AA on white).
- **Tonal surface hierarchy:** Grouped background (`#f7f7f7` / `#121212`) with elevated white/charcoal cards (`#ffffff` / `#1e1e1e`) and hairline borders (`#ebebeb` / `#2e2e2e`).
- **Original playful objects:** Matte 3D clay squircle icons and spot scenes add warmth without visual noise or third-party trademarks.

## Colors

A restrained neutral grayscale foundation punctuated by a single accessible iOS Blue accent, semantic destructive red, and illustration-only "toy" hues (amber, mint, lavender).

### Primary
- **iOS Blue (Accessible Light)** (`#0066CC`): Primary CTAs, active navigation links, focus rings (`--ring`), and active `<Flow>` request edges in light mode. Provides `5.57:1` contrast on white cards.
- **iOS Sky Blue (Dark)** (`#409CFF`): Primary CTAs (`#000000` foreground, `7.42:1`), active links, and focus rings in dark mode (`5.89:1` on `#1e1e1e` cards).

### Semantic & Destructive
- **Signal Crimson (Light)** (`#cd0014`) / **Coral Red (Dark)** (`#ff453a`): Destructive actions, `<Gotcha>` callouts, `<OutdatedBanner>`, and error edges in `<Flow>`.
- **Success Green (Planned `--success`)**: `#15803d` (light) / `#34d399` (dark) for `<Tip>` callouts and completion states.

### Neutral
- **Grouped Canvas** (`#f7f7f7` light / `#121212` dark): Page-level `--background` and `--grouped` surface.
- **Elevated Card** (`#ffffff` light / `#1e1e1e` dark): `--card`, `--popover`, and `--grouped-secondary` surfaces.
- **Primary Ink** (`#222222` light / `#f7f7f7` dark): `--foreground` (`14.85:1` light, `17.49:1` dark).
- **Secondary Label** (`#6a6a6a` light / `#a3a3a3` dark): `--muted-foreground` and `--label-secondary` (`5.41:1` light, `6.61:1` dark on cards).
- **Hairline Border** (`#ebebeb` light / `#2e2e2e` dark): `--border` and `0.5px` `--separator` dividers inside `GroupedList`.

### Named Rules
**The Accessible Accent Rule.** Never use pure `#007AFF` on light backgrounds; always use `--primary` (`#0066CC` light / `#409CFF` dark) via CSS variables—never hard-coded hex values in components.
**The Toy-Hue Containment Rule.** Playful pastel/clay hues (amber, mint, lavender, coral) are reserved strictly for `<SectionIcon>` and `<Illustration>` SVG art; UI chrome stays neutral + primary.

## Typography

**Display & Body Font:** `Inter` (loaded via `next/font/google` as `--font-inter`, falling back to `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`).
**Mono Font:** `ui-monospace, "SF Mono", "JetBrains Mono", monospace` (`--font-mono`).

**Character:** Clean geometric neo-grotesque tuned to Apple's Dynamic Type scale, balancing compact UI labels with legible long-form technical reading.

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

- **Container:** `max-w-screen-xl` (`1280px`) with `px-4` (`16px`) horizontal gutters for landing/index pages; `max-w-screen-md` (`768px`) for focused `/review`.
- **Responsive Grid:** Single-column stack at `360px`; 2-column (`/projects`, featured projects) or 3-column bento grid (`Learning Paths` on `/`, featured path `md:col-span-2`) on `md:` (`768px+`).
- **Touch Targets:** Minimum `44px` (`--tap-target` / `min-h-tap`) on all interactive buttons, links, and list rows.

## Elevation & Depth

Surfaces rely primarily on **tonal layering** (grouped `#f7f7f7` vs card `#ffffff`) and crisp `1px` borders, reserving blur and subtle shadows for floating chrome and interactive lift.

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
- **Don't** hard-code hex colors (`#007AFF`, `#fff`, `#000`) in React components or MDX; use semantic tokens.
- **Don't** use emoji or Unicode glyphs (`🔥`, `🎉`, `🧭`, `✦`, `✓`, `⚠️`) as UI icons.
- **Don't** skip heading levels (`h1 → h3`) or stack double borders around code blocks and callouts.
- **Don't** render vendor trademarks in section icons or spot illustrations.
