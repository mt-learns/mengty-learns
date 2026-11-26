# Diagram & Flow Rendering Rules (standard)

> Every diagram on mengtylearns.com must follow these rules: the animated `<Flow>` and the static `<Diagram>` alike.
> Spec context: PLAN.md §10.5. Owner review 2026-11-26 found clipped canvases, truncated labels, unreadable badges,
> overlapping request/response arrows, messy curves and unreadable dimmed text. Each rule below prevents one of those.
> **MUST** = blocking for merge. **SHOULD** = default; deviations must be justified in the PR.

---

## 1. One visual language, one renderer

| # | Rule |
|---|---|
| 1.1 | **MUST** render every diagram with the shared components: `<Flow>` (animated, steps) or `<Diagram>` (static, no steps). Both use the **same node, edge, layout and theme code**. |
| 1.2 | **MUST NOT** hand-draw inline `<svg>` diagrams in MDX. Existing inline SVG "Problem" and "Structure" figures must be converted to `<Diagram>`. |
| 1.3 | `<Diagram>` is server-rendered static output (an SVG for the edges plus HTML nodes, or a pure SVG built from the same layout). It needs no client JS and has the same look as `<Flow>`. |
| 1.4 | Both take the same data format: `nodes`, `edges`, optional `groups` and (Flow only) `steps` and `variants`. |

## 2. Layout: grid, rank and alignment

| # | Rule |
|---|---|
| 2.1 | **MUST** lay out with dagre for every diagram. Authors give **structure, not pixels**: optional `rank` (column in LR / row in TB) and `order` (position within the rank) as hints. Raw `x`/`y` are removed from the data format (or ignored with a dev warning). |
| 2.2 | **Direction:** `LR` when the **container** (not the viewport) is ≥ 720px wide, `TB` below that. Measure the container with `ResizeObserver` or CSS container queries, because the docs column is narrower than the viewport. Trees and hierarchies (class diagrams, layers) are always `TB`. |
| 2.3 | **Spacing:** rank gap 72px, node gap 40px, group padding 24px (+ 28px for the group label). |
| 2.4 | **Alignment:** nodes in the same rank **share the same centre line**. A parent is **centred over its children** (trees). No node may be off-grid. |
| 2.5 | **Max 7 nodes per view, max 8 steps.** Anything bigger must be split into two flows or use a group. |
| 2.6 | **No overlaps:** no node overlaps another node, a group label, or a badge. This is verified by a unit test on the layout output (§9). |

## 3. Canvas: fit, never clip

| # | Rule |
|---|---|
| 3.1 | **MUST** fit the whole diagram inside the card. Use `fitView` with `padding: 0.12` on mount, on container resize, and on variant change. Nothing may be clipped at any width ≥ 320px. |
| 3.2 | **Canvas height = layout height × zoom + padding**, clamped to 240–560px. No fixed 420px with empty space or clipping. |
| 3.3 | **Fit before pan.** Try these in order until the diagram fits the container at zoom ≥ 0.87 (label ≥ 13px): **(a)** choose the LR/TB direction that fits best; **(b)** the **compact node variant** (width 128–160px, 28px icon, 14px label, subtitle moved into the step text/tooltip); **(c)** **wrap wide ranks**: when a rank has more nodes than fit, split it into rows of N (siblings under a tree bus wrap onto a second row, still connected by the bus); **(d)** for trees and class diagrams at < 480px, the **stacked list layout** (an indented vertical tree, like a file explorer, with elbow connectors on the left). **Pan is the last resort, and is never allowed when the container is ≥ 640px wide.** |
| 3.3a | The pan hint ("Drag to see more") appears **only** when content actually overflows (measured), with a fade edge on the overflowing side. Never when everything fits. |
| 3.4 | The camera does **not** move on step change (no auto-pan), so readers keep their orientation. |
| 3.5 | Zoom controls appear only when §3.3 pan mode is active. |

## 4. Nodes

| # | Rule |
|---|---|
| 4.1 | **Full label always visible:** wrap to a maximum of 2 lines, **never truncate with an ellipsis**. Node width = measured text width + icon + padding, clamped to **160–240px**. All nodes in one diagram use the **same width** (the widest, within the clamp) for a calm grid. Height is 64px (1 line) or 80px (2 lines). |
| 4.2 | Label 15px / 600. Subtitle 13px / 400 in `--muted-foreground`. Labels **≤ 18 characters**; put more detail in the subtitle (a lint check in validation warns). |
| 4.3 | Icon tile 36px rounded squircle with a category tint (client = gray, network = blue, service = indigo, data = green, external = orange, abstraction = purple, concrete = teal). **Tint only on the icon tile**, never on borders or text. **Red/destructive is never a category tint.** |
| 4.4 | **Dimming never touches text:** inactive nodes keep text at full contrast (≥ 4.5:1). Dim them with a muted border, a desaturated icon tile, and a background step only. **No `opacity` on the node element.** |
| 4.5 | Active node: 2px accent ring + a subtle accent background tint (8%) + shadow. No scale jump above 1.02. |
| 4.6 | Variant for "problem/bad" nodes: dashed border in `--border-strong` + a small "✕" badge. **Red is reserved for errors** and never used for "bad design". |

## 5. Edges

| # | Rule |
|---|---|
| 5.1 | **Type:** `smoothstep` (orthogonal with an 8px corner radius) for all diagrams. A straight line only when source and target share a centre line. **No bezier curves.** |
| 5.2 | **Handles follow direction:** LR leaves the **right** side and enters the **left**. TB leaves the **bottom** and enters the **top**. A back-edge (response) in LR uses the **opposite pair** (out left / in right) and is routed **below** the forward edge. |
| 5.3 | **Request and response never overlap:** when both directions exist between the same two nodes, draw two parallel edges **offset ±10px** from the centre line (request above or left, response below or right). |
| 5.4 | Tree connectors (class hierarchies, layers): **elbow/bus style**. A vertical from the parent's bottom-centre to a horizontal bus, then a vertical to each child's top-centre. **No diagonals.** |
| 5.5 | Edges must not pass through nodes or group labels (dagre routing plus the §9 test). |
| 5.6 | **Stroke:** idle 1.5px in `--border-strong` (≥ 3:1 against the canvas, per WCAG 1.4.11). Visited 2px accent at 55%. Active 2.5px accent. Response is dashed (6 4). Error uses `--destructive`. |
| 5.7 | The arrowhead is 10px and stops **4px before** the node border. One arrowhead per edge. |
| 5.8 | **Every edge attaches to a node handle at both ends.** No free-floating ends and no arrows that stop in empty space. |
| 5.9 | **Skip-rank edges** (an edge connecting nodes more than one rank apart) are allowed only when the content really skips the middle node. They're routed in a dedicated lane **≥ 24px clear** of the nodes they pass, enter the target from its side handle, and never run along or under another node's border. If the hop doesn't really skip the middle node, model it as separate edges. |

## 6. Step badges and labels

| # | Rule |
|---|---|
| 6.1 | **Show a badge only on the active edge:** a 22px circle with 12px / 700 text, accent background and contrasting text. **Never list several numbers** ("1·5"). Visited edges show no badge; they're tinted (§5.6). |
| 6.2 | The badge sits at the edge midpoint, **offset 14px perpendicular to the line** (above for LR, right for TB). It must never cover a line junction, an arrowhead or a node. |
| 6.3 | Optional edge labels (e.g. "HTTP", "SQL"): 12px / 500 pill with a card background and a 1px border, placed at the midpoint on the opposite side to the badge. Max 12 characters. |
| 6.4 | The full numbering lives in the step list (Player) and the `<ol>` fallback, matched by colour and number. |

## 7. Colour and theme

| # | Rule |
|---|---|
| 7.1 | Tokens only (`--card`, `--grouped`, `--border-strong`, `--primary`, `--destructive`, …). No hex values in diagram code. |
| 7.2 | A diagram uses **at most 3 semantic colours**: accent (flow), destructive (error), and muted (idle). Category tints are allowed on icon tiles only. |
| 7.3 | Check **both themes**: labels ≥ 4.5:1, lines and arrows ≥ 3:1 against the canvas. |
| 7.4 | Canvas = `--grouped` background with `rounded-panel`, inside a `rounded-card` with **one frame only** (no nested borders). |

## 8. Motion and accessibility

| # | Rule |
|---|---|
| 8.1 | The dot travels for 600ms with `--ease-ios`. Highlight transitions take 200ms. Nothing else moves. |
| 8.2 | `prefers-reduced-motion`: no dot travel and no transitions, only an instant state change. |
| 8.3 | `aria-live="polite"` announces "Step 2 of 5: <title>". ← → / Space / Home / End work when the card is focused. Visible focus ring. |
| 8.4 | The server-rendered step list works without JS and in print. A `<Diagram>` has `role="img"` plus an `aria-label` summary and a visible caption. |

## 9. Verification (required before merge)

| # | Check |
|---|---|
| 9.1 | **Layout unit tests** for every flow and diagram in the content, both directions: no node-node, node-badge or node-group-label overlap. All nodes inside the bounds. Same-rank centres equal (±0.5px). Rendered label size ≥ 13px at the computed zoom for container widths 320, 360, 720 and 1024. |
| 9.2 | **Validation:** unknown node ids, more than 7 nodes, more than 8 steps, or labels over 18 characters fail (or warn, for the label length) at build time. |
| 9.3 | **Screenshots:** a Playwright script (`pnpm qa:diagrams`) captures every page with a flow or diagram at **360 / 768 / 1280px × light / dark**, saved to `qa/diagrams/<page>-<width>-<theme>.png` (gitignored). The worker **must open and look at every screenshot** and fix issues before reporting. List the reviewed files in the report. |
| 9.4 | Reduced-motion run of the same script (emulate `reduce`) for one flow. |
| 9.5 | Bundle: report the lazy flow chunk size (gzip). Target ≤ 80 KB. Use React Flow core only, import dagre lazily together with it, and check for duplicate React or zustand copies. |

## 10. Authoring checklist (for every new diagram)
- [ ] ≤ 7 nodes, ≤ 8 steps, labels ≤ 18 characters, subtitles for details
- [ ] `rank`/`order` hints only, no pixel coordinates
- [ ] Every step has a `title` (≤ 6 words) and `text` (≤ 2 lines)
- [ ] Response steps marked `kind: 'response'` and errors `kind: 'error'`
- [ ] **Responses retrace the real path:** if the request went Browser → Gateway → API, the response goes API → Gateway → Browser (2 steps), not API → Browser directly. Draw a direct skip edge (§5.9) only when the system really bypasses the middle hop (e.g. a CDN, or direct server return).
- [ ] `pnpm qa:diagrams` screenshots reviewed at 360 and 1280, light and dark
