import type { FlowNode, ParsedFlowStep } from './types';

const SKELETON_CELL_X = 160;
const SKELETON_CELL_Y = 96;
const SKELETON_NODE_W = 128;
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
  const maxX = Math.max(0, ...nodes.map((n) => n.x));
  const maxY = Math.max(0, ...nodes.map((n) => n.y));
  const width = SKELETON_PAD * 2 + maxX * SKELETON_CELL_X + SKELETON_NODE_W;
  const height = SKELETON_PAD * 2 + maxY * SKELETON_CELL_Y + SKELETON_NODE_H;

  const nodeMap = new Map(
    nodes.map((n) => [
      n.id,
      {
        x: SKELETON_PAD + n.x * SKELETON_CELL_X,
        y: SKELETON_PAD + n.y * SKELETON_CELL_Y,
      },
    ]),
  );

  const seenEdges = new Set<string>();
  const edgeLines: { key: string; x1: number; y1: number; x2: number; y2: number; dashed: boolean }[] = [];

  for (const step of steps) {
    const parsed = parseEdgeEndpoints(step.edge);
    if (!parsed) continue;
    const key = `${parsed[0]}->${parsed[1]}`;
    if (seenEdges.has(key)) continue;
    seenEdges.add(key);

    const from = nodeMap.get(parsed[0]);
    const to = nodeMap.get(parsed[1]);
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
      className="flex h-full w-full items-center justify-center p-4"
      aria-label={title ? `${title} diagram preview` : 'Flow diagram preview'}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto max-h-full w-full max-w-full"
        role="img"
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
          const pos = nodeMap.get(node.id)!;
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
