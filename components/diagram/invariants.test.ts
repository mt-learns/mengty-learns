import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { K8S_REQUEST_FLOW } from '../../lib/flows/k8s-request';
import { buildEdgeBuckets } from '../flow/v3/graph';
import {
  buildSkipRankPath,
  buildSmoothStepSvgPath,
  buildStackedTreePath,
  buildTreeBusPath,
  computeDiagramLayout,
  estimateTextWidth,
  edgeGeometry,
  getHandleCoords,
  GROUP_LABEL_HEIGHT,
  labelLineCount,
  nodeLabelChrome,
  splitLabelTokens,
  stepBadgeRect,
  type NodeBox,
} from './layout';
import {
  parseDiagramProps,
  parseFlowProps,
  type DiagramProps,
  type FlowProps,
} from './types';

const DOCS_DIR = path.resolve(process.cwd(), 'content/docs');

// §3.3 / §9.1: EVERY flow and diagram in content is checked at these widths (265/288 = 360px viewport canvas).
const TEST_WIDTHS = [265, 288, 360, 720, 1024] as const;

/** Recursively collects every .mdx file under content/docs that uses <Flow> or <Diagram>. */
function collectContentMdx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectContentMdx(full));
    } else if (entry.name.endsWith('.mdx')) {
      out.push(full);
    }
  }
  return out;
}

const CONTENT_MDX_FILES = collectContentMdx(DOCS_DIR)
  .filter((f) => {
    const src = fs.readFileSync(f, 'utf8');
    return src.includes('<Flow') || src.includes('<Diagram');
  })
  .map((f) => path.relative(DOCS_DIR, f).split(path.sep).join('/'));

const OWNED_MDX_FILES = CONTENT_MDX_FILES;

/**
 * Extracts JSX prop objects from <Flow ... /> and <Diagram ... /> tags in MDX.
 */
function extractTagProps(source: string, tagName: 'Flow' | 'Diagram'): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  const openToken = `<${tagName}`;
  let idx = 0;

  while (idx < source.length) {
    const start = source.indexOf(openToken, idx);
    if (start === -1) break;
    const afterName = source[start + openToken.length];
    if (afterName && !/\s/.test(afterName)) {
      idx = start + openToken.length;
      continue;
    }

    // Walk until self-closing '/>' outside braces and strings
    let braceDepth = 0;
    let inSingle = false;
    let inDouble = false;
    let pos = start + openToken.length;
    let tagEnd = -1;

    while (pos < source.length) {
      const ch = source[pos];
      const prev = source[pos - 1];
      if (ch === "'" && !inDouble && prev !== '\\') {
        inSingle = !inSingle;
      } else if (ch === '"' && !inSingle && prev !== '\\') {
        inDouble = !inDouble;
      } else if (!inSingle && !inDouble) {
        if (ch === '{') braceDepth++;
        else if (ch === '}') braceDepth--;
        else if (braceDepth === 0 && ch === '/' && source[pos + 1] === '>') {
          tagEnd = pos + 2;
          break;
        }
      }
      pos++;
    }

    if (tagEnd === -1) break;
    const body = source.slice(start + openToken.length, tagEnd - 2);
    results.push(parseJsxAttributes(body));
    idx = tagEnd;
  }

  return results;
}

function parseJsxAttributes(attrSource: string): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  let i = 0;

  while (i < attrSource.length) {
    while (i < attrSource.length && /\s/.test(attrSource[i])) i++;
    if (i >= attrSource.length) break;

    const nameMatch = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(attrSource.slice(i));
    if (!nameMatch) {
      i++;
      continue;
    }
    const key = nameMatch[0];
    i += key.length;

    while (i < attrSource.length && /\s/.test(attrSource[i])) i++;
    if (attrSource[i] !== '=') {
      obj[key] = true;
      continue;
    }
    i++; // skip '='
    while (i < attrSource.length && /\s/.test(attrSource[i])) i++;

    if (attrSource[i] === '"' || attrSource[i] === "'") {
      const quote = attrSource[i];
      i++;
      const start = i;
      while (i < attrSource.length && attrSource[i] !== quote) i++;
      obj[key] = attrSource.slice(start, i);
      i++;
    } else if (attrSource[i] === '{') {
      let depth = 0;
      let inSingle = false;
      let inDouble = false;
      const start = i + 1;
      while (i < attrSource.length) {
        const ch = attrSource[i];
        const prev = attrSource[i - 1];
        if (ch === "'" && !inDouble && prev !== '\\') inSingle = !inSingle;
        else if (ch === '"' && !inSingle && prev !== '\\') inDouble = !inDouble;
        else if (!inSingle && !inDouble) {
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) {
              const expr = attrSource.slice(start, i);
              obj[key] = new Function(`return (${expr})`)();
              i++;
              break;
            }
          }
        }
        i++;
      }
    }
  }

  return obj;
}

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
  margin = 0,
): boolean {
  return (
    a.x < b.x + b.width - margin &&
    a.x + a.width > b.x + margin &&
    a.y < b.y + b.height - margin &&
    a.y + a.height > b.y + margin
  );
}

function assertLayoutInvariants(
  label: string,
  layoutResult: ReturnType<typeof computeDiagramLayout>,
  rawNodes: { id: string; rank?: number }[],
  containerWidth: number,
  isStaticDiagram = false,
) {
  const boxes = [...layoutResult.nodes.values()];

  // 0. §3.3 Fit-before-pan: every diagram in content must fit without pan at 265, 288, 360, 720, 1024
  if (containerWidth >= 265) {
    expect(
      layoutResult.panMode,
      `${label} must fit without pan at ${containerWidth}px`,
    ).toBe(false);
  }
  if (containerWidth >= 640) {
    expect(
      layoutResult.panMode,
      `${label} pan is never allowed at >= 640px`,
    ).toBe(false);
  }
  if (isStaticDiagram) {
    expect(
      layoutResult.bounds.width * layoutResult.zoom,
      `${label} static diagram must fit containerWidth ${containerWidth}px`,
    ).toBeLessThanOrEqual(containerWidth + 1);
  }

  // 1. All nodes inside bounds
  for (const box of boxes) {
    expect(box.x, `${label} ${box.id} x >= 0`).toBeGreaterThanOrEqual(0);
    expect(box.y, `${label} ${box.id} y >= 0`).toBeGreaterThanOrEqual(0);
    expect(
      box.x + box.width,
      `${label} ${box.id} right <= bounds.width`,
    ).toBeLessThanOrEqual(layoutResult.bounds.width + 0.5);
    expect(
      box.y + box.height,
      `${label} ${box.id} bottom <= bounds.height`,
    ).toBeLessThanOrEqual(layoutResult.bounds.height + 0.5);
  }

  // 2. No node-node overlaps
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      expect(
        rectsOverlap(boxes[i], boxes[j], 0.5),
        `${label} nodes ${boxes[i].id} and ${boxes[j].id} must not overlap`,
      ).toBe(false);
    }
  }

  // 3. No node-group-label overlaps (top 28px of group box is reserved for label)
  for (const group of layoutResult.groups) {
    const labelRect = {
      x: group.x,
      y: group.y,
      width: group.width,
      height: 28,
    };
    for (const box of boxes) {
      expect(
        rectsOverlap(box, labelRect, 0.5),
        `${label} node ${box.id} must not overlap group label ${group.id}`,
      ).toBe(false);
    }
  }

  // 4. No node-badge overlaps (for <Flow> which renders step badges)
  if (!isStaticDiagram) {
    for (const route of layoutResult.edges) {
    const fromBox = layoutResult.nodes.get(route.from)!;
    const toBox = layoutResult.nodes.get(route.to)!;
    const start = getHandleCoords(
      fromBox,
      route.sourceHandle,
      route.offsetX,
      route.offsetY,
    );
    const end = getHandleCoords(
      toBox,
      route.targetHandle,
      route.offsetX,
      route.offsetY,
    );
    const geom = route.isStackedEdge
      ? buildStackedTreePath(start.x, start.y, end.x, end.y, fromBox)
      : route.isTreeEdge
        ? buildTreeBusPath(start.x, start.y, end.x, end.y)
        : route.skipLaneCoord !== undefined
          ? buildSkipRankPath(
              start.x,
              start.y,
              end.x,
              end.y,
              layoutResult.direction,
              route.skipLaneCoord,
            )
          : buildSmoothStepSvgPath(
              start.x,
              start.y,
              end.x,
              end.y,
              route.sourceHandle,
              route.targetHandle,
            );

    const badgeX =
      geom.labelX + (layoutResult.direction === 'LR' ? 0 : 14);
    const badgeY =
      geom.labelY + (layoutResult.direction === 'LR' ? -14 : 0);
    const badgeRect = {
      x: badgeX - 11,
      y: badgeY - 11,
      width: 22,
      height: 22,
    };

    for (const box of boxes) {
      expect(
        rectsOverlap(box, badgeRect, 1),
        `${label} badge on ${route.key} must not overlap node ${box.id}`,
      ).toBe(false);
    }
    }
  }

  // 5. Same-rank centres equal (±0.5px) when not stacked or wrapped
  if (!layoutResult.stacked) {
    const byRank = new Map<number, NodeBox[]>();
    for (const raw of rawNodes) {
      if (raw.rank === undefined) continue;
      const box = layoutResult.nodes.get(raw.id);
      if (!box) continue;
      const list = byRank.get(raw.rank) ?? [];
      list.push(box);
      byRank.set(raw.rank, list);
    }
    for (const [rank, rankBoxes] of byRank.entries()) {
      if (rankBoxes.length < 2) continue;
      const distinctRows = new Set(rankBoxes.map((b) => Math.round(b.cy)));
      if (layoutResult.direction === 'TB' && distinctRows.size > 1) continue; // wrapped rank
      const ref = layoutResult.direction === 'LR' ? rankBoxes[0].cx : rankBoxes[0].cy;
      for (const b of rankBoxes) {
        const val = layoutResult.direction === 'LR' ? b.cx : b.cy;
        expect(
          Math.abs(val - ref),
          `${label} rank ${rank} node ${b.id} centre alignment`,
        ).toBeLessThanOrEqual(0.5);
      }
    }
  }

  // 6. Rendered label size >= 14px (15px normal, 14px compact)
  const baseFontSize = layoutResult.compact ? 14 : 15;
  expect(
    baseFontSize * layoutResult.zoom,
    `${label} rendered label size >= 14px`,
  ).toBeGreaterThanOrEqual(14);

  // 6a. §4.1: No label wraps inside a word (longest word/camelCase token fits the
  // node's text width: box width minus padding, border, icon, gap and problem badge)
  for (const raw of rawNodes) {
    const box = layoutResult.nodes.get(raw.id);
    if (!box || !('label' in raw) || typeof raw.label !== 'string') continue;
    const isProblem = 'variant' in raw && raw.variant === 'problem';
    const availW = box.width - nodeLabelChrome(layoutResult.compact, isProblem);
    for (const token of splitLabelTokens(raw.label)) {
      expect(
        estimateTextWidth(token, baseFontSize, true),
        `${label} node ${raw.id} token "${token}" must not wrap mid-word`,
      ).toBeLessThanOrEqual(availW);
    }
  }

  // 7. Bounds x zoom fit inside canvas with no node outside viewport
  if (!layoutResult.panMode) {
    expect(
      layoutResult.bounds.width * layoutResult.zoom,
      `${label} scaled width fits inside ${containerWidth}px`,
    ).toBeLessThanOrEqual(containerWidth + 0.5);
    expect(
      layoutResult.bounds.height * layoutResult.zoom,
      `${label} scaled height fits inside canvasHeight ${layoutResult.canvasHeight}px`,
    ).toBeLessThanOrEqual(layoutResult.canvasHeight + 0.5);
  }

  // 8. Siblings in a 2-node rank must sit side-by-side (never stacked into a chain) when 2 nodes fit
  if (
    !isStaticDiagram &&
    !layoutResult.stacked &&
    layoutResult.direction === 'TB' &&
    layoutResult.nodeWidth * 2 + 12 <= containerWidth - 12
  ) {
    const byRank = new Map<number, NodeBox[]>();
    for (const raw of rawNodes) {
      if (raw.rank === undefined) continue;
      const box = layoutResult.nodes.get(raw.id);
      if (!box) continue;
      const list = byRank.get(raw.rank) ?? [];
      list.push(box);
      byRank.set(raw.rank, list);
    }
    for (const [rank, rankBoxes] of byRank.entries()) {
      if (rankBoxes.length === 2) {
        expect(
          Math.abs(rankBoxes[0].cy - rankBoxes[1].cy),
          `${label} rank ${rank} siblings must sit side-by-side (not stacked into a chain)`,
        ).toBeLessThanOrEqual(0.5);
      }
    }
  }
}

/**
 * §6.3 / §2.6 / §3.1 edge label pills: every placed pill stays clear of every node,
 * every group label strip and every other pill, and inside the bounds (which the
 * fit keeps inside the canvas). A <Flow> pill also stays clear of its own step badge,
 * and in a full (non-compact) layout, where all pills show at once, of every badge.
 */
function assertEdgeLabelInvariants(
  label: string,
  layoutResult: ReturnType<typeof computeDiagramLayout>,
  { isStaticDiagram, requireAllPlaced }: { isStaticDiagram: boolean; requireAllPlaced: boolean },
) {
  const nodeBoxes = [...layoutResult.nodes.values()];
  const groupStrips = layoutResult.groups.map((g) => ({
    x: g.x,
    y: g.y,
    width: g.width,
    height: GROUP_LABEL_HEIGHT,
  }));
  const badges = new Map<string, { x: number; y: number; width: number; height: number }>();
  for (const route of layoutResult.edges) {
    const geom = edgeGeometry(route, layoutResult.nodes, layoutResult.direction);
    if (geom) badges.set(route.key, stepBadgeRect(geom.labelX, geom.labelY, layoutResult.direction));
  }

  const placed = layoutResult.edges.filter((r) => r.label && r.labelBox);
  if (requireAllPlaced) {
    const missing = layoutResult.edges.filter((r) => r.label && !r.labelBox).map((r) => r.label);
    expect(missing, `${label} every edge label is placed`).toEqual([]);
  }

  for (const route of placed) {
    const box = route.labelBox!;
    const tag = `${label} label "${route.label}" (${route.key})`;
    expect(box.x, `${tag} left >= 0`).toBeGreaterThanOrEqual(0);
    expect(box.y, `${tag} top >= 0`).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, `${tag} right <= bounds.width`).toBeLessThanOrEqual(
      layoutResult.bounds.width,
    );
    expect(box.y + box.height, `${tag} bottom <= bounds.height`).toBeLessThanOrEqual(
      layoutResult.bounds.height,
    );
    for (const node of nodeBoxes) {
      expect(rectsOverlap(box, node), `${tag} must not overlap node ${node.id}`).toBe(false);
    }
    for (const strip of groupStrips) {
      expect(rectsOverlap(box, strip), `${tag} must not overlap a group label`).toBe(false);
    }
    for (const other of placed) {
      if (other === route) continue;
      expect(
        rectsOverlap(box, other.labelBox!),
        `${tag} must not overlap label "${other.label}"`,
      ).toBe(false);
    }
    if (!isStaticDiagram) {
      const relevant = layoutResult.compact
        ? [[route.key, badges.get(route.key)] as const]
        : [...badges.entries()];
      for (const [key, badge] of relevant) {
        if (!badge) continue;
        expect(rectsOverlap(box, badge), `${tag} must not overlap the step badge on ${key}`).toBe(
          false,
        );
      }
    }
  }
}

/**
 * §4.1 + Typography: every node label fits in at most 2 lines at the node's real
 * text width, so `line-clamp-2` never clips it with an ellipsis and no token is
 * cut. Runs at the rendered size (15px, or 14px compact), never smaller.
 */
function assertNodeLabelsUnclamped(
  label: string,
  layoutResult: ReturnType<typeof computeDiagramLayout>,
  rawNodes: { id: string; label: string; variant?: string }[],
) {
  const fontSize = layoutResult.compact ? 14 : 15;
  for (const raw of rawNodes) {
    const box = layoutResult.nodes.get(raw.id);
    if (!box) continue;
    const avail = box.width - nodeLabelChrome(layoutResult.compact, raw.variant === 'problem');
    const lines = labelLineCount(raw.label, fontSize, avail);
    expect(
      lines,
      `${label} node ${raw.id} "${raw.label}" needs ${lines} lines in ${avail}px (clamped or cut)`,
    ).toBeLessThanOrEqual(2);
    expect(box.lines, `${label} node ${raw.id} height matches its line count`).toBe(
      lines > 1 || raw.label.includes('\n') ? 2 : 1,
    );
  }
}

/** The edge list exactly as FlowServer builds it (one route per from->to:kind, first label wins). */
function flowEdgeInputs(steps: Parameters<typeof buildEdgeBuckets>[0]) {
  return Array.from(buildEdgeBuckets(steps).values()).map((b) => ({
    from: b.from,
    to: b.to,
    kind: b.kind,
    label: b.label,
  }));
}

describe('DIAGRAM-RULES §9.1 layout invariants across all MDX flows and diagrams', () => {
  for (const relPath of OWNED_MDX_FILES) {
    const fullPath = path.join(DOCS_DIR, relPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const flows = extractTagProps(content, 'Flow');
    const diagrams = extractTagProps(content, 'Diagram');

    for (const rawFlow of flows) {
      if (!rawFlow.nodes && !rawFlow.variants) continue;
      const parsed = parseFlowProps(rawFlow as unknown as FlowProps);
      const variants = parsed.variants ?? [
        {
          id: 'default',
          label: 'default',
          layout: parsed.layout,
          nodes: parsed.nodes!,
          steps: parsed.steps!,
          groups: parsed.groups,
        },
      ];

      for (const variant of variants) {
        for (const width of TEST_WIDTHS) {
          it(`${relPath} <Flow id="${parsed.id}" variant="${variant.id}"> @ ${width}px`, () => {
            const edges = variant.steps.map((s) => {
              const [from, to] = s.edge.split('->').map((p) => p.trim());
              return { from, to, kind: s.kind ?? 'request', label: s.label };
            });

            const layoutResult = computeDiagramLayout({
              nodes: variant.nodes,
              edges,
              groups: variant.groups ?? [],
              layout: variant.layout ?? parsed.layout,
              containerWidth: width,
            });

            assertLayoutInvariants(
              `${parsed.id}:${variant.id}@${width}`,
              layoutResult,
              variant.nodes,
              width,
              false,
            );
          });

          it(`${relPath} <Flow id="${parsed.id}" variant="${variant.id}"> edge labels clear of nodes, labels, badges and bounds @ ${width}px`, () => {
            const layoutResult = computeDiagramLayout({
              nodes: variant.nodes,
              edges: flowEdgeInputs(variant.steps),
              groups: variant.groups ?? [],
              layout: variant.layout ?? parsed.layout,
              containerWidth: width,
            });
            assertEdgeLabelInvariants(`${parsed.id}:${variant.id}@${width}`, layoutResult, {
              isStaticDiagram: false,
              // Wide cards have room for every pill; narrow ones may drop one (the step text names it).
              requireAllPlaced: width >= 720,
            });
          });

          it(`${relPath} <Flow id="${parsed.id}" variant="${variant.id}"> node labels fit in 2 lines (never clamped) @ ${width}px`, () => {
            const layoutResult = computeDiagramLayout({
              nodes: variant.nodes,
              edges: flowEdgeInputs(variant.steps),
              groups: variant.groups ?? [],
              layout: variant.layout ?? parsed.layout,
              containerWidth: width,
            });
            assertNodeLabelsUnclamped(`${parsed.id}:${variant.id}@${width}`, layoutResult, variant.nodes);
          });
        }
      }
    }

    for (const rawDiagram of diagrams) {
      const parsed = parseDiagramProps(rawDiagram as unknown as DiagramProps);
      for (const width of TEST_WIDTHS) {
        it(`${relPath} <Diagram id="${parsed.id}"> @ ${width}px`, () => {
          const layoutResult = computeDiagramLayout({
            nodes: parsed.nodes,
            edges: parsed.edges.map((e) => ({
              from: e.from,
              to: e.to,
              kind: e.kind ?? 'request',
              label: e.label,
            })),
            groups: parsed.groups ?? [],
            layout: parsed.layout,
            containerWidth: width,
            clampHeight: false,
            stepBadges: false,
          });

          assertLayoutInvariants(
            `${parsed.id}@${width}`,
            layoutResult,
            parsed.nodes,
            width,
            true,
          );
          assertEdgeLabelInvariants(`${parsed.id}@${width}`, layoutResult, {
            isStaticDiagram: true,
            requireAllPlaced: false,
          });
          assertNodeLabelsUnclamped(`${parsed.id}@${width}`, layoutResult, parsed.nodes);
        });
      }
    }
  }

  for (const width of TEST_WIDTHS) {
    it(`shared lib/flows/k8s-request.ts <Flow id="${K8S_REQUEST_FLOW.id}"> @ ${width}px`, () => {
      const parsed = parseFlowProps(K8S_REQUEST_FLOW);
      const edges = (parsed.steps ?? []).map((s) => {
        const [from, to] = s.edge.split('->').map((p) => p.trim());
        return { from, to, kind: s.kind ?? 'request', label: s.label };
      });
      const layoutResult = computeDiagramLayout({
        nodes: parsed.nodes ?? [],
        edges,
        groups: parsed.groups ?? [],
        layout: parsed.layout,
        containerWidth: width,
      });
      assertLayoutInvariants(
        `${parsed.id}:shared@${width}`,
        layoutResult,
        parsed.nodes ?? [],
        width,
        false,
      );
    });

    it(`shared lib/flows/k8s-request.ts <Flow id="${K8S_REQUEST_FLOW.id}"> edge labels clear of nodes, labels, badges and bounds @ ${width}px`, () => {
      const parsed = parseFlowProps(K8S_REQUEST_FLOW);
      const layoutResult = computeDiagramLayout({
        nodes: parsed.nodes ?? [],
        edges: flowEdgeInputs(parsed.steps ?? []),
        groups: parsed.groups ?? [],
        layout: parsed.layout,
        containerWidth: width,
      });
      assertEdgeLabelInvariants(`${parsed.id}:shared@${width}`, layoutResult, {
        isStaticDiagram: false,
        requireAllPlaced: width >= 720,
      });
      assertNodeLabelsUnclamped(`${parsed.id}:shared@${width}`, layoutResult, parsed.nodes ?? []);
    });
  }

  for (const width of [1024, 1280] as const) {
    it(`k8s-request with direction="LR" lays out LR and satisfies all invariants @ ${width}px`, () => {
      const parsed = parseFlowProps({ ...K8S_REQUEST_FLOW, direction: 'LR' });
      const layoutResult = computeDiagramLayout({
        nodes: parsed.nodes ?? [],
        edges: flowEdgeInputs(parsed.steps ?? []),
        groups: parsed.groups ?? [],
        layout: parsed.layout,
        direction: parsed.direction,
        containerWidth: width,
      });
      expect(layoutResult.direction).toBe('LR');
      expect(layoutResult.panMode).toBe(false);
      assertLayoutInvariants(`${parsed.id}:lr@${width}`, layoutResult, parsed.nodes ?? [], width, false);
      assertEdgeLabelInvariants(`${parsed.id}:lr@${width}`, layoutResult, {
        isStaticDiagram: false,
        requireAllPlaced: true,
      });
      assertNodeLabelsUnclamped(`${parsed.id}:lr@${width}`, layoutResult, parsed.nodes ?? []);
    });
  }

  it('k8s-request with direction="LR" keeps 360px layout unchanged (TB)', () => {
    const parsed = parseFlowProps({ ...K8S_REQUEST_FLOW, direction: 'LR' });
    const base = computeDiagramLayout({
      nodes: parsed.nodes ?? [],
      edges: flowEdgeInputs(parsed.steps ?? []),
      groups: parsed.groups ?? [],
      layout: parsed.layout,
      containerWidth: 360,
    });
    const withDir = computeDiagramLayout({
      nodes: parsed.nodes ?? [],
      edges: flowEdgeInputs(parsed.steps ?? []),
      groups: parsed.groups ?? [],
      layout: parsed.layout,
      direction: parsed.direction,
      containerWidth: 360,
    });
    expect(withDir.direction).toBe('TB');
    expect(withDir.direction).toBe(base.direction);
    expect(withDir.compact).toBe(base.compact);
    expect(withDir.bounds).toEqual(base.bounds);
    expect(withDir.zoom).toBe(base.zoom);
  });
});

describe('Inter text-width estimator stays at or above the rendered width', () => {
  // Natural single-line widths of real node labels in Inter 600 at 14px / 15px,
  // measured in Chromium on the built site (2026-11-27). The layout sizes nodes
  // from estimateTextWidth, so an estimate below these would let a label clamp.
  const MEASURED: Array<[string, number, number]> = [
    ['PlaceOrderPort', 104.19, 111.63],
    ['OrderRepoPort', 101.5, 108.75],
    ['Push / PR Trigger', 117.03, 125.39],
    ['API Server + etcd', 118.03, 126.47],
    ['PlaceOrderCmd', 107.42, 115.09],
    ['FetchHttpClient', 106.19, 113.78],
    ['GH Actions Job', 104.88, 112.36],
    ['Cloud STS / IAM', 110.0, 117.84],
    ['Worker', 49.38, 52.91],
    ['CacheWrapper', 101.25, 108.48],
    ['LoggingWrapper', 113.53, 121.64],
    ['Order Aggregate', 113.02, 121.08],
    ['Dead-letter queue', 123.22, 132.02],
  ];
  for (const [text, w14, w15] of MEASURED) {
    it(`"${text}" estimate >= measured Inter width at 14px and 15px`, () => {
      expect(estimateTextWidth(text, 14, true)).toBeGreaterThanOrEqual(w14);
      expect(estimateTextWidth(text, 15, true)).toBeGreaterThanOrEqual(w15);
      // and not wildly above it, which would waste node width
      expect(estimateTextWidth(text, 14, true)).toBeLessThanOrEqual(w14 * 1.06);
    });
  }

  it('wraps at camelCase and spaces only, and reports a too-wide token as cut', () => {
    const w = estimateTextWidth('PlaceOrder', 14, true);
    expect(labelLineCount('PlaceOrderPort', 14, w + 1)).toBe(2);
    expect(labelLineCount('PlaceOrderPort', 14, estimateTextWidth('Order', 14, true) + 1)).toBe(3);
    expect(labelLineCount('PlaceOrderPort', 14, 10)).toBe(Infinity);
    expect(labelLineCount('Work Queue', 14, 500)).toBe(1);
  });
});
