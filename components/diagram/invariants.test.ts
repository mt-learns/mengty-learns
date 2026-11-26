import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { K8S_REQUEST_FLOW } from '../../lib/flows/k8s-request';
import {
  buildSkipRankPath,
  buildSmoothStepSvgPath,
  buildStackedTreePath,
  buildTreeBusPath,
  computeDiagramLayout,
  getHandleCoords,
  type NodeBox,
} from './layout';
import {
  parseDiagramProps,
  parseFlowProps,
  type DiagramProps,
  type FlowProps,
} from './types';

const DOCS_DIR = path.resolve(process.cwd(), 'content/docs');

// §3.3 / §9.1: EVERY flow and diagram in content is checked at these widths.
const TEST_WIDTHS = [360, 720, 1024] as const;

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

  // 0. §3.3 Fit-before-pan: every diagram in content must fit without pan at 360, 720, 1024
  if (containerWidth >= 360) {
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
          });

          assertLayoutInvariants(
            `${parsed.id}@${width}`,
            layoutResult,
            parsed.nodes,
            width,
            true,
          );
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
  }
});
