// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildFlowDeepLinkRelative,
  buildFlowDeepLinkUrl,
  parseFlowDeepLink,
} from './deep-link';
import { parseFlowProps, resolveNodeCategory } from './types';
import { Player } from './v3/Player';
import { GroupNode } from './v3/GroupNode';
import { IosNode } from './v3/IosNode';
import { computeFlowGraph } from './v3/layout';
import { ReactFlowProvider } from '@xyflow/react';

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

const SAMPLE_FLOW = parseFlowProps({
  id: 'sample-flow',
  title: 'Sample Request Flow',
  nodes: [
    { id: 'user', label: 'User', icon: 'user', category: 'client', rank: 0, order: 0 },
    { id: 'svc', label: 'Service', icon: 'service', rank: 1, order: 0 },
    { id: 'pod', label: 'Pod', icon: 'pod', rank: 2, order: 0 },
  ],
  steps: [
    { edge: 'user->svc', title: 'Send request', text: 'User sends request to Service' },
    { edge: 'svc->pod', title: 'Forward to pod', text: 'Service forwards request to Pod' },
    { edge: 'pod->svc', title: 'Return 200 OK', text: 'Pod returns 200 OK', kind: 'response' },
  ],
});

describe('Flow Zod validation & defaults', () => {
  it('accepts valid flow props with optional title and category', () => {
    const parsed = parseFlowProps({
      id: 'compat-flow',
      nodes: [
        { id: 'a', label: 'A', icon: 'user', rank: 0, order: 0 },
        { id: 'b', label: 'B', icon: 'db', rank: 1, order: 0 },
      ],
      steps: [{ edge: 'a->b', text: 'A calls B' }],
    });

    expect(parsed.steps?.[0].kind).toBe('request');
    expect(parsed.steps?.[0].title).toBeUndefined();
    expect(resolveNodeCategory(parsed.nodes![0])).toBe('client');
    expect(resolveNodeCategory(parsed.nodes![1])).toBe('data');
  });

  it('throws when a step references an unknown node id', () => {
    expect(() =>
      parseFlowProps({
        id: 'bad-edge',
        nodes: [
          { id: 'user', label: 'User', rank: 0, order: 0 },
          { id: 'svc', label: 'Service', rank: 1, order: 0 },
        ],
        steps: [{ edge: 'user->ghost', text: 'Broken edge' }],
      }),
    ).toThrow(/Unknown node id .*ghost/);
  });

  it('throws on duplicate node ids', () => {
    expect(() =>
      parseFlowProps({
        id: 'dup',
        nodes: [
          { id: 'a', label: 'A', rank: 0, order: 0 },
          { id: 'a', label: 'A2', rank: 1, order: 0 },
        ],
        steps: [{ edge: 'a->a', text: 'Self' }],
      }),
    ).toThrow(/Duplicate node id .*a/);
  });
});

describe('Flow v3 layout switch & visited edges', () => {
  it('uses LR dagre at wide container (>= 720px) and TB dagre on narrow (< 720px)', () => {
    const desktop = computeFlowGraph({
      nodes: SAMPLE_FLOW.nodes!,
      steps: SAMPLE_FLOW.steps!,
      containerWidth: 760,
      activeStepIndex: -1,
      reducedMotion: false,
    });
    expect(desktop.layout.direction).toBe('LR');
    const dUser = desktop.layout.nodes.get('user')!;
    const dSvc = desktop.layout.nodes.get('svc')!;
    const dPod = desktop.layout.nodes.get('pod')!;
    expect(dUser.cx).toBeLessThan(dSvc.cx);
    expect(dSvc.cx).toBeLessThan(dPod.cx);

    const mobile = computeFlowGraph({
      nodes: SAMPLE_FLOW.nodes!,
      steps: SAMPLE_FLOW.steps!,
      containerWidth: 360,
      activeStepIndex: -1,
      reducedMotion: false,
    });
    expect(mobile.layout.direction).toBe('TB');
    const mUser = mobile.layout.nodes.get('user')!;
    const mSvc = mobile.layout.nodes.get('svc')!;
    const mPod = mobile.layout.nodes.get('pod')!;
    expect(mUser.cy).toBeLessThan(mSvc.cy);
    expect(mSvc.cy).toBeLessThan(mPod.cy);
  });

  it('marks overview, active, and visited edges accurately', () => {
    const overviewGraph = computeFlowGraph({
      nodes: SAMPLE_FLOW.nodes!,
      steps: SAMPLE_FLOW.steps!,
      containerWidth: 760,
      activeStepIndex: -1,
      reducedMotion: false,
    });
    expect(overviewGraph.edges.every((e) => !e.data?.isActive && !e.data?.isVisited)).toBe(true);

    const step2Graph = computeFlowGraph({
      nodes: SAMPLE_FLOW.nodes!,
      steps: SAMPLE_FLOW.steps!,
      containerWidth: 760,
      activeStepIndex: 1,
      reducedMotion: false,
    });
    const edge1 = step2Graph.edges.find((e) => e.id === 'user->svc:request');
    const edge2 = step2Graph.edges.find((e) => e.id === 'svc->pod:request');
    const edge3 = step2Graph.edges.find((e) => e.id === 'pod->svc:response');

    expect(edge1?.data?.isVisited).toBe(true);
    expect(edge1?.data?.isActive).toBe(false);
    expect(edge2?.data?.isActive).toBe(true);
    expect(edge2?.data?.isVisited).toBe(false);
    expect(edge3?.data?.isActive).toBe(false);
    expect(edge3?.data?.isVisited).toBe(false);
  });
});

describe('Flow v3 Player controls, keyboard, and <details> list', () => {
  it('starts in Overview state with Start CTA and server-rendered <details> list', () => {
    render(<Player {...SAMPLE_FLOW} />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByText('All steps (3)')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('navigates steps via ‹ ›, dots, Replay at end, and <details> rows', () => {
    render(<Player {...SAMPLE_FLOW} />);

    const prevBtn = screen.getByRole('button', { name: 'Previous step' });
    const nextBtn = screen.getByRole('button', { name: 'Next step' });
    expect(prevBtn).toBeDisabled();

    fireEvent.click(nextBtn);
    expect(screen.getAllByText('Send request').length).toBeGreaterThanOrEqual(2);
    expect(prevBtn).not.toBeDisabled();

    const dot3 = screen.getByRole('button', { name: /Go to step 3/ });
    fireEvent.click(dot3);
    expect(nextBtn).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Replay' })).toBeInTheDocument();

    // Tapping a row in <details> jumps to that step
    const step2Row = screen.getByRole('button', { name: /Service forwards request to Pod/i });
    fireEvent.click(step2Row);
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('supports ArrowRight, ArrowLeft, Home, End, and Space keys', () => {
    render(<Player {...SAMPLE_FLOW} />);

    const region = screen.getByRole('region', { name: 'Sample Request Flow' });
    region.focus();

    fireEvent.keyDown(region, { key: 'ArrowRight' });
    expect(screen.getAllByText('Send request').length).toBeGreaterThanOrEqual(2);

    fireEvent.keyDown(region, { key: 'End' });
    expect(screen.getByRole('button', { name: 'Replay' })).toBeInTheDocument();

    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();

    fireEvent.keyDown(region, { key: ' ' });
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();

    fireEvent.keyDown(region, { key: 'Home' });
    expect(screen.getAllByText('Send request').length).toBeGreaterThanOrEqual(2);
  });
});

describe('Flow v3 variants and deep links', () => {
  const VARIANT_FLOW = parseFlowProps({
    id: 'compare-flow',
    title: 'Compare Variants',
    variants: [
      {
        id: 'same-len-a',
        label: 'Variant A',
        groups: [{ id: 'core-a', label: 'Domain Core', nodeIds: ['domain'] }],
        nodes: [
          { id: 'client', label: 'Client', rank: 0, order: 0 },
          { id: 'domain', label: 'Domain', rank: 1, order: 0 },
        ],
        steps: [
          { edge: 'client->domain', title: 'A1', text: 'A step 1' },
          { edge: 'domain->client', title: 'A2', text: 'A step 2', kind: 'response' },
        ],
      },
      {
        id: 'same-len-b',
        label: 'Variant B',
        nodes: [
          { id: 'client', label: 'Client', rank: 0, order: 0 },
          { id: 'port', label: 'Port', rank: 1, order: 0 },
        ],
        steps: [
          { edge: 'client->port', title: 'B1', text: 'B step 1' },
          { edge: 'port->client', title: 'B2', text: 'B step 2', kind: 'response' },
        ],
      },
      {
        id: 'diff-len-c',
        label: 'Variant C',
        nodes: [
          { id: 'client', label: 'Client', rank: 0, order: 0 },
          { id: 'layer', label: 'Layer', rank: 1, order: 0 },
          { id: 'db', label: 'DB', rank: 2, order: 0 },
        ],
        steps: [
          { edge: 'client->layer', title: 'C1', text: 'C step 1' },
          { edge: 'layer->db', title: 'C2', text: 'C step 2' },
          { edge: 'db->client', title: 'C3', text: 'C step 3', kind: 'response' },
        ],
      },
    ],
  });

  it('switches variants, preserves step index on matching step counts, and resets on mismatch', () => {
    render(<Player {...VARIANT_FLOW} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getAllByText('A step 2').length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getByRole('button', { name: 'Variant B' }));
    expect(screen.getAllByText('B step 2').length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getByRole('button', { name: 'Variant C' }));
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('parses and builds step deep links', () => {
    expect(parseFlowDeepLink('?flow=sample-flow&step=2', 'sample-flow', 3)).toBe(1);
    expect(parseFlowDeepLink('?flow=other&step=2', 'sample-flow', 3)).toBeNull();
    expect(parseFlowDeepLink('?flow=sample-flow&step=0', 'sample-flow', 3)).toBeNull();
    expect(parseFlowDeepLink('?flow=sample-flow&step=4', 'sample-flow', 3)).toBeNull();
    expect(parseFlowDeepLink('?flow=sample-flow&step=abc', 'sample-flow', 3)).toBeNull();

    expect(
      buildFlowDeepLinkRelative('/docs/architecture/layered/', '?foo=bar', '#flow', 'sample-flow', 2),
    ).toBe('/docs/architecture/layered/?foo=bar&flow=sample-flow&step=3#flow');

    expect(
      buildFlowDeepLinkUrl('https://mengtylearns.com/docs/design/bridge/', 'bridge', 1),
    ).toBe('https://mengtylearns.com/docs/design/bridge/?flow=bridge&step=2');
  });

  it('reads deep link on mount, updates URL with replaceState, and copies link from ⋯ menu', async () => {
    window.history.replaceState(null, '', '/docs/test?flow=sample-flow&step=3');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<Player {...SAMPLE_FLOW} />);
    expect(screen.getAllByText('Return 200 OK').length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getByRole('button', { name: 'Previous step' }));
    expect(window.location.search).toContain('flow=sample-flow');
    expect(window.location.search).toContain('step=2');

    fireEvent.click(screen.getByRole('button', { name: 'Flow options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Copy link/i }));
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('flow=sample-flow&step=2'),
    );
  });
});

describe('Flow §4 & §6 readable states, problem variant, and single active badge', () => {
  it('renders dimmed IosNode without opacity classes and renders problem variant with dashed border + X', () => {
    const { container } = render(
      <ReactFlowProvider>
        <IosNode
          id="n1"
          type="ios"
          positionAbsoluteX={0}
          positionAbsoluteY={0}
          zIndex={0}
          isConnectable={false}
          dragging={false}
          draggable={false}
          selectable={false}
          deletable={false}
          selected={false}
          data={{
            label: 'RemoteControl',
            subtitle: 'Abstraction',
            icon: 'class',
            category: 'service',
            variant: 'problem',
            isActive: false,
            isOverview: false,
            isError: false,
            width: 200,
            height: 64,
          }}
        />
      </ReactFlowProvider>,
    );

    const nodeEl = container.querySelector('.rounded-panel') as HTMLElement;
    expect(nodeEl.className).not.toMatch(/\bopacity-/);
    expect(nodeEl.className).toContain('border-dashed');
    expect(nodeEl.className).not.toContain('destructive');
    expect(screen.getByLabelText('Problem')).toBeInTheDocument();
  });

  it('sets activeStepNumber only on the active edge and never lists multiple numbers', () => {
    const graph = computeFlowGraph({
      nodes: SAMPLE_FLOW.nodes!,
      steps: SAMPLE_FLOW.steps!,
      containerWidth: 760,
      activeStepIndex: 1,
      reducedMotion: false,
    });

    const activeEdges = graph.edges.filter((e) => e.data?.isActive);
    const inactiveEdges = graph.edges.filter((e) => !e.data?.isActive);
    expect(activeEdges).toHaveLength(1);
    expect(activeEdges[0].data?.activeStepNumber).toBe(2);
    expect(inactiveEdges.every((e) => e.data?.activeStepNumber === null)).toBe(true);
  });

  it('wraps group labels at word boundaries without truncation and reserves vertical space', () => {
    const longLabel = 'Application Core (Domain + Ports)';
    const { container } = render(
      <ReactFlowProvider>
        <GroupNode
          id="g1"
          type="group"
          positionAbsoluteX={0}
          positionAbsoluteY={0}
          zIndex={-10}
          isConnectable={false}
          dragging={false}
          draggable={false}
          selectable={false}
          deletable={false}
          selected={false}
          data={{
            label: longLabel,
            width: 208,
            height: 160,
          }}
        />
      </ReactFlowProvider>,
    );

    const span = container.querySelector('span')!;
    expect(span.textContent).toBe(longLabel);
    expect(span.className).not.toContain('truncate');
    expect(span.className).toContain('whitespace-normal');

    const graph = computeFlowGraph({
      nodes: [
        { id: 'a', label: 'Port', rank: 0, order: 0 },
        { id: 'b', label: 'Adapter', rank: 1, order: 0 },
      ],
      steps: [{ edge: 'a->b', text: 'Port calls Adapter', kind: 'request' }],
      groups: [{ id: 'core', label: longLabel, nodeIds: ['a'] }],
      containerWidth: 360,
      activeStepIndex: -1,
      reducedMotion: false,
    });

    const groupBox = graph.layout.groups[0];
    const memberBox = graph.layout.nodes.get('a')!;
    expect(groupBox.labelHeight).toBeGreaterThan(28);
    expect(memberBox.y).toBeGreaterThanOrEqual(groupBox.y + groupBox.labelHeight!);
  });
});
