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
  reading:
    fontFamily: "'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible Next Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: "1.6"
    letterSpacing: "0"
  prose-h2:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "1.25"
    letterSpacing: "-0.02em"
  prose-h3:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: "1.3"
    letterSpacing: "-0.015em"
  prose-caption:
    fontFamily: "'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible Next Fallback', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.45"
    letterSpacing: "0"
  code:
    fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: "1.6"
    letterSpacing: "0"
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

One family per content role, three families in all. Each is a variable font, self-hosted by `next/font/google` (latin subset, `display: swap`, metric-adjusted fallback) and loaded in `app/layout.tsx`. The roles are wired in `app/global.css`.

### Roles

| Role | Family (variable) | Token / utility | Where | Weights |
|---|---|---|---|---|
| **UI** | Inter | `--font-sans` / `font-sans` (the page default) | Headings, nav, sidebar, TOC, buttons, badges, tabs, table headers, stats, `<Flow>` and `<Diagram>` labels, landing display | 400, 500, 600, 650 (prose h3), 700 |
| **Reading** | Atkinson Hyperlegible Next | `--font-reading` / `font-reading` | `.prose` body, lists, tables, callouts, concept blocks (`<Intent>`, `<Analogy>`, checklists), quiz questions and answers, flashcard answers (`/review`), radar and digest item text | 400, 600 (italic 400 on demand) |
| **Code** | JetBrains Mono | `--font-mono` / `font-mono` | `pre`, `code`, `kbd`, `samp`, Shiki blocks, `<Terminal>`, `<LabLink>` commands, cheatsheet commands, file paths | 400 |

Inside `.prose`, the reading font is set on the container, and headings, buttons, tabs, `th`, flows and diagrams switch back to Inter (`@layer components`, so an explicit `font-*` utility still wins). Code is unlayered so it beats the typography plugin's `kbd { font-family: inherit }`.

### Why these three
- **Atkinson Hyperlegible Next** (Braille Institute) is drawn for character distinction: tailed `l`, serifed `I`, slashed `0`, open `rn` against `m`. On a site full of flags, versions and identifiers (`-l`, `v1.31`, `0x1F`), prose has to keep `Il1` and `O0` apart at 17px, and Inter does not (`design/type/glyphs.png`).
- **Inter** stays the UI voice. It's compact and neutral at 11 to 17px in controls, and it holds the display sizes. It never sets long reading text.
- **JetBrains Mono** gives one code face on every OS. Before, `ui-monospace` meant SF Mono on Mac, Consolas on Windows and DejaVu on Linux. Its dotted zero, tall x-height and plain `{}[]()` read clearly at 15px.

### Sizes, line-heights, tracking
- **Prose** (Atkinson): 17px / 1.6 (27.2px), tracking 0, paragraphs and lists capped at 70ch, `text-wrap: pretty`. Atkinson's x-height is 0.50em against Inter's 0.55em (measured), so the same leading reads looser; 1.6 replaces Inter's 1.65. The `text-*` tokens' Inter tracking (down to −0.027rem) is reset to 0 inside prose, except in flows and diagrams.
- **Prose headings** (Inter, Markdown headings only, i.e. `h2[id]` and below): h2 24/30 700, h3 20/26 650, h4 17/24 600; tracking −0.02em (h2), −0.015em (h3), −0.01em (h4); more space above than below (h2 2.25em / 0.6em, h3 1.9em / 0.5em). Component headings (quiz, flow player, footer) keep their own `text-*` size.
- **Lists:** 0.375em between items. **Tables:** 15px / 1.5 with tabular figures. **Figure captions:** 14px (prose) or 13px (`text-footnote`, components).
- **Concept blocks and callouts** (Atkinson): 15 to 17px at 1.5 to 1.55. The `text-*` tokens' line-heights are tuned for Inter UI and are too tight for reading.
- **Code blocks:** 15px / 1.6. **Inline code:** 0.9em (its 0.55em x-height then matches Atkinson's). **Headings' inline code:** 0.875em.
- **Display** (Inter): 600 to 700 with tracking −0.01em to −0.02em (see the scales below).

### Rules
- **No ligatures in code.** `font-variant-ligatures: none` plus `liga` / `calt` off on every code element. Learners must see `=>`, `!==` and `>=` as the characters they type; Inter's defaults draw `=>` as a single arrow.
- **Tabular figures for numbers that line up or change:** stats, counts, dates, step numbers, review counters, table cells and ordered-list markers (`tabular-nums`).
- **Minimum 13px for anything read:** body, metadata, captions, terminal titles, commands. 11 to 12px (`text-caption-*`) is only for Inter micro-labels: badges, chips and diagram step pills.
- **At most three families.** A new one needs a role none of these can do.
- **Budget:** three preloaded files, 120 KB per page (Inter 47.3 KB, Atkinson 33.2 KB, JetBrains Mono 39.5 KB). The Atkinson italic (36.7 KB) is not preloaded and loads only on pages with emphasis. No layout shift: Inter and JetBrains Mono use next/font's fallbacks, and Atkinson uses an Arial-based `Atkinson Hyperlegible Next Fallback` face in `app/global.css` (size-adjust 98.71%, ascent 99.28%, descent 32.42%, measured in Chromium). Lighthouse CLS is 0 on `/` and a docs page.

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
- **Home (`/`, Persuade):** hero (H1 + two CTAs + desk illustration) → proof strip (build-time counts) → Read / Do / Remember (each with a real artifact: a flow strip, the CI lab checks, a real flashcard) → 4 track cards (`Build & Ship`, `Design & Code`, `Secure`, `Work & Grow`, 2×2 on desktop) with section icon chips + 30-minute "Start here" tour → live `<Flow>` → latest notes → radar snapshot → footer. All counts come from `lib/home-data.ts` at build time.
- **Docs sidebar & section landings:** `content/docs/meta.json` groups the 18 sections under the 4 track separators (`build-ship`, `design-code`, `secure`, `work-grow`). Each section landing renders `<LearningMap section="..." />`, a beginner-to-advanced SVG path with zero-CLS `localStorage` completion badges. Every sidebar page item carries a 16px `lucide-react` kind glyph (`note`, `concept`, `cheatsheet`, `lab`, `decision`, `postmortem`, `lesson`).
- **Touch targets:** minimum `44px` (`--tap-target` / `min-h-tap`) on buttons, links and list rows.

## Reading (docs)

- **Prose:** Atkinson Hyperlegible Next 17px / 1.6, paragraphs and lists capped at 70ch, body text in `--foreground` (no 90% mix). Headings are Inter with −0.02em tracking and balanced wrapping, matching the landing scale (see Typography).
- **Links:** `--link`, underlined (1px, 3px offset); hover moves to `--link-hover`.
- **Sidebar active item:** `--sidebar-active-foreground` on `--sidebar-active` (jade on a jade tint, 5.9:1 / 10.3:1), with no filled pill.
- **Frames:** code blocks, tables and callouts each have one border; the code `pre` inside the figure has none. `<Sidenote>` uses a full border, not a side bar.
- **Wide pages share the container:** `/radar`, `/review`, `/digest` and `/digest/<slug>` use `components/layout/container.tsx`, so their edges match the nav.

## Elevation & Depth

Surfaces rely primarily on **tonal layering** (page `#FAFAF8` vs card `#FFFFFF`) and crisp `1px` borders, reserving blur and subtle shadows for floating chrome and interactive lift.

### Material & Motion Tokens
- **Materials:** `material-thin` (`60%` card + `blur(20px) saturate(180%)`), `material-regular` (`72%`, used on sticky `.fd-nav` and search dialog), `material-thick` (`85%`).
- **Easing (`--ease-ios`):** `cubic-bezier(0.32, 0.72, 0, 1)` for all transitions, hover lifts, and `<Flow>` active node scaling (`scale(1.04)`).
- **Reduced Motion:** All transitions, spring lifts, and `<Flow>` travelling dots must disable under `prefers-reduced-motion: reduce`, preserving instant state highlights.

## Motion

Motion is purposeful, physical, quick, and interruptible. It explains the product loop (**notes → flows → labs → review**) without decorative noise.

### Tokens (`app/tokens.css`)
- **Easing:** `--ease-ios: cubic-bezier(0.32, 0.72, 0, 1)`
- **Durations:**
  - `--duration-fast: 150ms` — immediate control feedback, arrow nudges, hover states
  - `--duration-base: 260ms` — routine state changes, card lifts, icon tilts
  - `--duration-entrance: 420ms` — hero supporting entrance (60ms stagger, < 600ms total), grid reveals (40ms stagger, once)
  - **Extended sequences:** 900ms cubic ease-out for proof strip count-up; 480ms `--ease-ios` for 3D flashcard flip; 5.5s idle float on the hero illustration (paused offscreen).

### What animates
- **Composited properties only:** `transform` (translate, scale, rotate, `rotateY`, `scaleX` for progress fills) and `opacity`.
- **Landing page focal sequences:** Hero supporting elements (subtitle, CTAs, illustration), proof strip count-up (once on reveal), Read/Do/Remember mini demos (once on reveal, replay on hover/focus), Learning paths stagger (once) + hover lift + `scaleX` progress pill fill, `<Flow>` autoplay at 50% viewport (pauses offscreen), and subtle row hover arrow nudges.

### What never animates
- **The Hero `<h1>` (LCP element):** always visible at `opacity: 1` on first paint.
- **Layout-thrashing properties:** never animate `width`, `height`, `top`, `left`, `margin`, or `padding`. Reserve dimensions (`tabular-nums`, `ch` widths, grid-stacked spacers) so hydration and state changes produce zero CLS.
- **Scroll-jacking or text parallax:** never hijack scroll or move body text out of flow.
- **Infinite attention loops:** only the 2–4px hero illustration float loops, and it pauses when offscreen. Nothing flashes > 3 times per second.

### Reduced Motion (`prefers-reduced-motion: reduce`)
- All entrances, staggers, count-ups, typing animations, 3D flips, idle floats, and `<Flow>` autoplays disable immediately.
- Content renders in its final settled state; interactive controls (such as flipping the sample flashcard) fall back to instant opacity/visibility swaps without spatial movement.

### Named Rules
**The Single-Frame Rule.** Every code block, callout, tab container, and card must have at most **one** border/frame—never nest bordered `pre` elements inside bordered Fumadocs `figure` containers.

## Shapes

Consistent nested squircle-like rounding:
- **Control (`--radius-control`):** `12px` — buttons, inputs, segmented control tracks, code blocks (`figure.shiki`).
- **Panel (`--radius-panel`):** `16px` — callouts (`<Sidenote>`, `<Gotcha>`, `<Tip>`), `<Intent>`, `<Analogy>`, `<Flow>` nodes and canvas.
- **Card (`--radius-card`):** `20px` — `<Tile>`, `<GroupedList>`, `<Quiz>`, `<Figure>` frames, review cards.
- **Pill (`--radius-pill`):** `999px` — status chips, Diátaxis badges, progress counters.

## Logo

**The "mt" monogram.** A lowercase **m** whose second shoulder runs on as the **t**'s crossbar (the m and t share a stem), with an **amber dot** after the crossbar: a cursor, or the next step in a flow. It says "a path being worked through", which is what the site does. Master: `design/logo/mark.svg`; lockup: `design/logo/lockup.svg`; component: `<LogoMark>` in `components/brand/logo.tsx` (nav and footer).

### Construction
- **128 grid, pixel-aligned at 16px** (1px = 8 units). One stroke path at width **16** (2px at 16px) with round caps and joins, counters 16, arch radius 16, t foot radius 12. Dot `r=9` at (116, 48), on the crossbar's centre line with 12 units of air after the crossbar's cap.
- Stroke-based: never outline it or change the stroke width per size; scale the whole viewBox.
- **Favicon variant** (`public/favicon.svg`, 16px-optimised): the same drawing with a taller t and an `r=8` dot (13 units clear of the crossbar), on a full-bleed **tile** (`rx=24`): paper `#FAFAF8` in light, ink `#0E1013` in dark. The tile is required: the favicon's colour scheme follows the OS, not the browser, so a bare mark can land on the wrong tab colour (measured 1.86:1 teal on a white tab, 2.20:1 jade on a dark tab). On its own tile the mark is always ≥ 4.8:1.
- **apple-touch-icon** (180px): paper tile, mark at 120px (30px padding; iOS masks the corners). Generated by `node scripts/make-icons.mjs`, which also builds `og.png`.

### Clear space and size
- **x = ¼ of the mark's height** (16 at the 64px master; the stroke width doubled). Keep x clear on every side. In the lockup the gap from mark to wordmark is also x.
- **Lockup:** mark + "Mengty Learns" in Inter 600, tracking −0.02em, the wordmark's cap height centred on the mark. In UI it's `<LogoMark>` + text with `gap-2` (nav: 28px mark, footer: 24px).
- **Minimum size:** 16px for the mark alone (favicon variant below 24px), 24px mark in a lockup.

### Colour versions (measured)
| Version | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|
| Full colour (stroke `--primary`, dot `--highlight`) | jade #0F766E, amber #B45309 on #FAFAF8 | 5.24 / 4.81 | #2DD4BF, #F59E0B on #0E1013 | 10.24 / 8.87 |
| Monochrome (one ink, dot included) | #1C1917 on #FAFAF8 | 16.73 | — | — |
| Inverted (one paper colour on ink) | — | — | #FAFAF8 on #0E1013 | 18.23 |

### Don'ts
- Don't put the mark in a coloured squircle or app-icon tile in the UI (tiles are only for the favicon and apple-touch icon, and they're paper or ink).
- Don't recolour the dot jade or the stroke amber, add gradients, shadows or outlines, or rotate, stretch or re-space the letters.
- Don't let the dot touch the crossbar, or set the mark below 16px.
- Don't hard-code its colours in components: use `--primary` and `--highlight` (the Token Rule).

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
  - `<SectionIcon name="..." size={24 | 48 | 96 | 256} decorative={...} title="..." />` for all 18 sections (`foundations`, `containers`, `kubernetes`, `iac`, `ci-cd`, `gitops`, `platform`, `craft`, `design`, `architecture`, `frontend`, `security`, `process`, `leadership`, `communication`, `english`, `career`, `business`).
  - `<TrackIcon name="..." size={24 | 48 | 96 | 256} decorative={...} title="..." />` for the 4 tracks (`build-ship`, `design-code`, `secure`, `work-grow`).
  - `<Illustration name="..." size={24 | 48 | 96 | 256} decorative={...} title="..." />` for spot art (`hero-desk`, `review-empty`, `not-found`, `lab-header`, `radar-header`).
  - Accessibility: `role="img"` + `<title>` when meaningful, or `aria-hidden="true"` when decorative.
- **Static Exports:** Mirror optimized standalone SVGs in `public/illustrations/` for OG images and static `<img src>` usage.

### Reading & Lesson Components (`components/mdx/`, `components/learn/`)
- **`<LearningMap section="..." />`:** Server-ordered beginner → advanced SVG path for section landing pages, with a zero-CLS `localStorage` (`mt-completed-v1`) progress island. Fits 265–1024px without pan; labels 15px.
- **`<YouWillLearn items={[...]} />`:** 3-bullet goal box at the top of a page. Do: keep each outcome to 1 line. Don't: repeat the page description verbatim.
- **`<OnePicture ... />`:** Wraps `<Diagram>` for a static visual summary (marked `data-five-min="keep"`). Do: follow `DIAGRAM-RULES.md` (≤ 7 nodes, labels ≤ 18 chars). Don't: hand-draw raw inline `<svg>`.
- **`<KeyTakeaways items={[...]} />`:** 3–5 numbered takeaways at the end (marked `data-five-min="keep"`). `scripts/build-cards.mjs` also emits its items as flashcards into `public/cards.json`.
- **`<Rule formula?>`:** Concise 2–4 line rule box with an optional monospace formula pill. Do: keep one rule per box. Don't: bury multi-paragraph prose inside `<Rule>`.
- **`<Example wrong? right reason? />`:** Workplace wrong-vs-right comparison using `X`/`Check` Lucide icons + explicit `Avoid:` / `Use:` labels (never colour-only) and a 1-line `Why:` reason.
- **`<Say word ipa? sound? note? />`:** Pronunciation callout for meetings and speaking lessons.
- **`<Template title? text? />`:** Copy-ready workplace template (standup, PR, email, STAR) with a keyboard-accessible `Copy` button (`min-h-tap`).
- **`<Dialogue title? speakers? lines={[...]} />`:** Multi-speaker conversation with distinct speaker pills. Do: keep turns realistic and short.
- **`<DecisionTree id title? caption? start nodes={[...]} />`:** Clickable yes/no decision guide paired with a `<Diagram layout="tree">` view that satisfies `DIAGRAM-RULES.md`.
- **`<PatternBank title? patterns={[...]} />`:** Fill-in-the-blank sentence patterns, each with an optional example and a keyboard-accessible `Copy` button.
- **`<FiveMinuteToggle />`:** Docs action-bar toggle persisted under `mt-five-min-v1` that condenses a page to TL;DR, `<OnePicture>`, `<KeyTakeaways>`, and flashcards. Pair with `@media print` in `app/global.css` for clean cheatsheet/lesson printing.

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
