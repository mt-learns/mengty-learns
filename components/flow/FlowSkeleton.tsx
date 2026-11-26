import type { FlowNode, ParsedFlowStep } from './types';

const SKELETON_CELL_X = 180;
const SKELETON_CELL_Y = 96;
const SKELETON_NODE_W = 148;
const SKELETON_NODE_H = 52;
const SKELETON_PAD = 24;

function parseEdgeEndpoints(edge: string): [string, string] | null {
  const parts = edge.split('->').map((p) => p.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
}

/**
 * Lightweight static SVG skeleton rendered on the server and shown until
 * the interactive React Flow canvas enters the viewport and hydrates.
 * Intentionally avoids importing dagre so dagre stays in the lazy chunk.
 */
export function FlowSkeleton({
  nodes,
  steps,
  title,
}: {
  nodes: FlowNode[];
  steps: ParsedFlowStep[];
  title?: string;
}) {
  const rankCounts = new Map<number, number>();
  const coords = new Map<string, { x: number; y: number }>();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const rank = node.rank ?? i;
    const seenInRank = rankCounts.get(rank) ?? 0;
    const order = node.order ?? seenInRank;
    rankCounts.set(rank, seenInRank + 1);
    coords.set(node.id, {
      x: SKELETON_PAD + rank * SKELETON_CELL_X,
      y: SKELETON_PAD + order * SKELETON_CELL_Y,
    });
  }

  const allCoords = [...coords.values()];
  const maxX = Math.max(0, ...allCoords.map((c) => c.x));
  const maxY = Math.max(0, ...allCoords.map((c) => c.y));
  const width = maxX + SKELETON_NODE_W + SKELETON_PAD;
  const height = maxY + SKELETON_NODE_H + SKELETON_PAD;

  const seenEdges = new Set<string>();
  const edgeLines: {
    key: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    dashed: boolean;
  }[] = [];

  for (const step of steps) {
    const parsed = parseEdgeEndpoints(step.edge);
    if (!parsed) continue;
    const key = `${parsed[0]}->${parsed[1]}`;
    if (seenEdges.has(key)) continue;
    seenEdges.add(key);

    const from = coords.get(parsed[0]);
    const to = coords.get(parsed[1]);
    if (!from || !to) continue;

    edgeLines.push({
      key,
      x1: from.x + SKELETON_NODE_W / 2,
      y1: from.y + SKELETON_NODE_H / 2,
      x2: to.x + SKELETON_NODE_W / 2,
      y2: to.y + SKELETON_NODE_H / 2,
      dashed: step.kind === 'response',
    });
  }

  return (
    <div
      role="img"
      className="flex h-full w-full items-center justify-center p-4"
      aria-label={title ? `${title} diagram preview` : 'Flow diagram preview'}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto max-h-full w-full max-w-full"
        aria-hidden="true"
      >
        {edgeLines.map((e) => (
          <line
            key={e.key}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke="var(--border)"
            strokeWidth={2}
            strokeDasharray={e.dashed ? '5 4' : undefined}
          />
        ))}
        {nodes.map((node) => {
          const pos = coords.get(node.id)!;
          return (
            <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
              <rect
                width={SKELETON_NODE_W}
                height={SKELETON_NODE_H}
                rx={14}
                fill="var(--card)"
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                x={SKELETON_NODE_W / 2}
                y={SKELETON_NODE_H / 2 + 4}
                textAnchor="middle"
                fill="var(--foreground)"
                fontSize={13}
                fontWeight={600}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
