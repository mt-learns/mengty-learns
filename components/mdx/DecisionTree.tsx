import { Diagram } from '../diagram/Diagram';
import type { DiagramProps } from '../diagram/types';
import { DecisionTreeLazy } from './DecisionTreeLazy';

export interface DecisionTreeNode {
  id: string;
  label: string;
  question?: string;
  result?: string;
  subtitle?: string;
  yes?: string;
  no?: string;
}

export interface DecisionTreeProps {
  id: string;
  title?: string;
  caption?: string;
  start: string;
  nodes: DecisionTreeNode[];
}

export function buildDecisionDiagramData(nodes: DecisionTreeNode[]): {
  diagramNodes: DiagramProps['nodes'];
  diagramEdges: DiagramProps['edges'];
} {
  const diagramNodes: DiagramProps['nodes'] = nodes.map((n) => ({
    id: n.id,
    label: n.label,
    subtitle: n.subtitle,
    category: n.result ? 'concrete' : 'abstraction',
  }));
  const diagramEdges: DiagramProps['edges'] = [];
  for (const n of nodes) {
    if (n.yes) diagramEdges.push({ from: n.id, to: n.yes, kind: 'request', label: 'Yes' });
    if (n.no) diagramEdges.push({ from: n.id, to: n.no, kind: 'response', label: 'No' });
  }
  return { diagramNodes, diagramEdges };
}

/**
 * Server Component entry point for <DecisionTree>.
 * Renders the static <Diagram> on the server (so dagre never ships to the client)
 * and lazy-loads only the tiny interactive yes/no chooser.
 */
export function DecisionTree({
  id,
  title = 'Decision guide',
  caption,
  start,
  nodes,
}: DecisionTreeProps) {
  const { diagramNodes, diagramEdges } = buildDecisionDiagramData(nodes);

  return (
    <section
      aria-label={title}
      className="not-prose my-6 space-y-4 rounded-card border border-border bg-card p-5"
    >
      <DecisionTreeLazy title={title} start={start} nodes={nodes} />
      <Diagram
        id={id}
        title={`${title} diagram`}
        caption={caption}
        layout="tree"
        nodes={diagramNodes}
        edges={diagramEdges}
      />
    </section>
  );
}
