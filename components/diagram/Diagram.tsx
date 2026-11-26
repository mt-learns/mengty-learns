import './diagram.css';

import {
  Box,
  Boxes,
  Database,
  GitBranch,
  Layers,
  ListOrdered,
  Network,
  Play,
  Server,
  User,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  buildSkipRankPath,
  buildSmoothStepSvgPath,
  buildStackedTreePath,
  buildTreeBusPath,
  computeDiagramLayout,
  getHandleCoords,
} from './layout';
import { resolveNodeCategory } from './category';
import {
  parseDiagramProps,
  type DiagramProps,
  type FlowEdgeKind,
  type FlowIconName,
  type FlowNodeCategory,
  type ParsedDiagramProps,
} from './types';

const ICON_MAP: Record<FlowIconName, typeof Server> = {
  user: User,
  gateway: Network,
  service: Server,
  pod: Box,
  db: Database,
  queue: ListOrdered,
  git: GitBranch,
  ci: Play,
  class: Boxes,
  interface: Layers,
};

const CATEGORY_STYLE: Record<FlowNodeCategory, { bg: string; fg: string }> = {
  client: { bg: 'var(--flow-cat-client-bg)', fg: 'var(--flow-cat-client-fg)' },
  edge: { bg: 'var(--flow-cat-edge-bg)', fg: 'var(--flow-cat-edge-fg)' },
  network: { bg: 'var(--flow-cat-network-bg)', fg: 'var(--flow-cat-network-fg)' },
  service: { bg: 'var(--flow-cat-service-bg)', fg: 'var(--flow-cat-service-fg)' },
  data: { bg: 'var(--flow-cat-data-bg)', fg: 'var(--flow-cat-data-fg)' },
  external: { bg: 'var(--flow-cat-external-bg)', fg: 'var(--flow-cat-external-fg)' },
  abstraction: { bg: 'var(--flow-cat-abstraction-bg)', fg: 'var(--flow-cat-abstraction-fg)' },
  concrete: { bg: 'var(--flow-cat-concrete-bg)', fg: 'var(--flow-cat-concrete-fg)' },
};

function getStaticEdgeStroke(kind: FlowEdgeKind): string {
  if (kind === 'error') return 'var(--destructive)';
  if (kind === 'request') return 'var(--primary)';
  return 'var(--border-strong)';
}

function DiagramStage({
  data,
  containerWidth,
}: {
  data: ParsedDiagramProps;
  containerWidth: number;
}) {
  const computed = computeDiagramLayout({
    nodes: data.nodes,
    edges: data.edges.map((e) => ({
      from: e.from,
      to: e.to,
      kind: e.kind ?? 'request',
      label: e.label,
    })),
    groups: data.groups ?? [],
    layout: data.layout,
    containerWidth,
    clampHeight: false,
  });

  const pad = 8;
  const stageWidth = computed.bounds.width + pad * 2;
  const stageHeight = computed.bounds.height + pad * 2;
  const scaledWidth = Math.round(stageWidth * computed.zoom);
  const scaledHeight = Math.round(stageHeight * computed.zoom);
  // §3.3a: measured overflow — only show pan hint + overflow when content really exceeds the container.
  const hasHorizontalOverflow =
    computed.panMode && scaledWidth > containerWidth + 1;
  const edgeMetaMap = new Map(
    data.edges.map((e) => [`${e.from}->${e.to}:${e.kind ?? 'request'}`, e]),
  );

  return (
    <div
      className={cn(
        'relative w-full',
        hasHorizontalOverflow ? 'overflow-x-auto' : 'overflow-hidden',
      )}
    >
      {/* container-query scale safety net: never clip, always fit width (§3.1/§3.3) */}
      <div
        className="diagram-stage-wrap"
        style={{
          ['--stage-w' as string]: `${stageWidth}px`,
          ['--stage-rendered-w' as string]: `${scaledWidth}px`,
          ['--stage-rendered-h' as string]: `${scaledHeight}px`,
          ['--stage-zoom' as string]: computed.zoom,
        }}
      >
      <div
        className="relative mx-auto diagram-stage-slot"
      >
        <div
          className="relative origin-top-left diagram-stage-inner"
          style={{
            width: stageWidth,
            height: stageHeight,
          }}
        >
        <svg
          viewBox={`0 0 ${stageWidth} ${stageHeight}`}
          width={stageWidth}
          height={stageHeight}
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <defs>
            {(['request', 'response', 'error'] as const).map((kind) => {
              const color = getStaticEdgeStroke(kind);
              return (
                <marker
                  key={kind}
                  id={`diagram-arrow-${data.id}-${containerWidth}-${kind}`}
                  viewBox="0 0 10 10"
                  refX="14"
                  refY="5"
                  markerWidth="10"
                  markerHeight="10"
                  markerUnits="userSpaceOnUse"
                  orient="auto-start-reverse"
                >
                  <path d="M 1 1.5 L 9.5 5 L 1 8.5 z" fill={color} />
                </marker>
              );
            })}
          </defs>

          <g transform={`translate(${pad}, ${pad})`}>
            {computed.groups.map((group) => (
              <g key={group.id}>
                <rect
                  x={group.x}
                  y={group.y}
                  width={group.width}
                  height={group.height}
                  rx={16}
                  fill="var(--card)"
                  fillOpacity={0.55}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  x={group.x + 16}
                  y={group.y + 22}
                  fill="var(--muted-foreground)"
                  fontSize={11}
                  fontWeight={600}
                  letterSpacing="0.06em"
                >
                  {group.label.toUpperCase()}
                </text>
              </g>
            ))}

            {computed.edges.map((route) => {
              const fromBox = computed.nodes.get(route.from);
              const toBox = computed.nodes.get(route.to);
              if (!fromBox || !toBox) return null;

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
                        computed.direction,
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

              const rawEdge = edgeMetaMap.get(route.key);
              const isDashed =
                rawEdge?.dashed || route.kind === 'response';
              const stroke = getStaticEdgeStroke(route.kind);
              const markerId = `diagram-arrow-${data.id}-${containerWidth}-${route.kind}`;

              return (
                <g key={route.key}>
                  <path
                    d={geom.path}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={1.75}
                    strokeDasharray={isDashed ? '6 4' : undefined}
                    markerEnd={`url(#${markerId})`}
                  />
                  {route.label && (
                    <g
                      transform={`translate(${geom.labelX}, ${
                        geom.labelY + (computed.direction === 'LR' ? -14 : 0)
                      })`}
                    >
                      <rect
                        x={-(route.label.length * 3.8 + 10)}
                        y={-11}
                        width={route.label.length * 7.6 + 20}
                        height={22}
                        rx={11}
                        fill="var(--card)"
                        stroke="var(--border)"
                        strokeWidth={1}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="var(--foreground)"
                        fontSize={12}
                        fontWeight={500}
                      >
                        {route.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {data.nodes.map((node) => {
          const box = computed.nodes.get(node.id);
          if (!box) return null;
          const Icon = ICON_MAP[node.icon ?? 'service'] ?? Server;
          const tint = CATEGORY_STYLE[resolveNodeCategory(node)];
          const isProblem = node.variant === 'problem';
          const compact = computed.compact;

          return (
            <div
              key={node.id}
              title={compact && node.subtitle ? `${node.label}: ${node.subtitle}` : undefined}
              style={{
                left: box.x + pad,
                top: box.y + pad,
                width: box.width,
                minHeight: box.height,
              }}
              className={cn(
                'absolute flex items-center rounded-panel bg-card shadow-xs',
                compact ? 'gap-2 px-2.5 py-1.5' : 'gap-2.5 px-3 py-2',
                isProblem
                  ? 'border border-dashed border-[var(--border-strong)]'
                  : 'border border-border',
              )}
            >
              <div
                className={cn(
                  'flex shrink-0 items-center justify-center',
                  compact ? 'h-7 w-7 rounded-[8px]' : 'h-9 w-9 rounded-[10px]',
                )}
                style={{ backgroundColor: tint.bg, color: tint.fg }}
                aria-hidden="true"
              >
                <Icon className={compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} strokeWidth={2} />
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    'line-clamp-2 break-words font-semibold leading-[1.2] text-foreground',
                    compact ? 'text-[14px]' : 'text-[15px]',
                  )}
                >
                  {node.label}
                </div>
                {!compact && node.subtitle && (
                  <div className="mt-0.5 line-clamp-1 break-words text-[13px] font-normal leading-tight text-muted-foreground">
                    {node.subtitle}
                  </div>
                )}
              </div>

                {isProblem && (
                <span
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-pill border border-[var(--border-strong)] bg-secondary text-foreground"
                  role="img"
                  aria-label="Problem"
                >
                  <X className="h-3 w-3" strokeWidth={2.5} />
                </span>
              )}
            </div>
          );
        })}
        </div>
      </div>
      </div>
      {hasHorizontalOverflow && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-grouped to-transparent"
          />
          <div className="pointer-events-none mt-2 flex justify-end">
            <span className="rounded-pill border border-border bg-card px-2.5 py-1 text-caption-1 font-medium text-muted-foreground shadow-xs">
              Drag to see more â†’
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Server-rendered static <Diagram> using the same dagre layout, nodes, edges, and iOS tokens
 * as <Flow>, with zero client JavaScript.
 */
export function Diagram(props: DiagramProps) {
  const parsed = parseDiagramProps(props);
  const summaryLabel =
    parsed.ariaLabel ?? parsed.caption ?? parsed.title ?? `Diagram ${parsed.id}`;

  return (
    <figure className="my-6">
      <div
        id={`diagram-${parsed.id}`}
        role="img"
        aria-label={summaryLabel}
        className="diagram-container rounded-card bg-card p-4 shadow-sm sm:p-5"
      >
        {parsed.title && (
          <div className="mb-3 text-headline font-semibold text-foreground">
            {parsed.title}
          </div>
        )}

        <div className="rounded-panel bg-grouped p-2">
          {parsed.layout === 'tree' ? (
            <div className="diagram-container">
              <div className="diagram-view-tb">
                <DiagramStage data={parsed} containerWidth={320} />
              </div>
              <div className="diagram-view-lr">
                <DiagramStage data={parsed} containerWidth={720} />
              </div>
            </div>
          ) : (
            <>
              <div className="diagram-view-tb">
                <DiagramStage data={parsed} containerWidth={320} />
              </div>
              <div className="diagram-view-lr">
                <DiagramStage data={parsed} containerWidth={720} />
              </div>
            </>
          )}
        </div>
      </div>

      {parsed.caption && (
        <figcaption className="mt-2 text-center text-caption-1 text-muted-foreground">
          {parsed.caption}
        </figcaption>
      )}
    </figure>
  );
}
