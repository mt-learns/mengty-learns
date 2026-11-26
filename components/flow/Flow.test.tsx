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
import {
  DESKTOP_CELL_X,
  DESKTOP_CELL_Y,
  computeDesktopPositions,
  computeFlowGraph,
  computeMobileDagrePositions,
} from './v3/layout';

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

const SAMPLE_FLOW = parseFlowProps({
  id: 'sample-flow',
  title: 'Sample Request Flow',
  nodes: [
    { id: 'user', label: 'User', icon: 'user', category: 'client', x: 0, y: 0 },
    { id: 'svc', label: 'Service', icon: 'service', x: 1, y: 0 },
    { id: 'pod', label: 'Pod', icon: 'pod', x: 1, y: 1 },
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
        { id: 'a', label: 'A', icon: 'user', x: 0, y: 0 },
        { id: 'b', label: 'B', icon: 'db', x: 1, y: 0 },
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
          { id: 'user', label: 'User', x: 0, y: 0 },
          { id: 'svc', label: 'Service', x: 1, y: 0 },
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
          { id: 'a', label: 'A', x: 0, y: 0 },
          { id: 'a', label: 'A2', x: 1, y: 0 },
        ],
        steps: [{ edge: 'a->a', text: 'Self' }],
      }),
    ).toThrow(/Duplicate node id .*a/);
  });
});

describe('Flow v3 layout switch & visited edges', () => {
  it('uses hand-placed grid on desktop and top-to-bottom dagre on mobile', () => {
    const desktop = computeDesktopPositions(SAMPLE_FLOW.nodes!);
    expect(desktop.get('user')?.x).toBe(0);
    expect(desktop.get('svc')?.x).toBe(DESKTOP_CELL_X);
    expect(desktop.get('pod')?.y).toBe(DESKTOP_CELL_Y);

    const mobile = computeMobileDagrePositions(SAMPLE_FLOW.nodes!, SAMPLE_FLOW.steps!);
    const userPos = mobile.get('user')!;
    const svcPos = mobile.get('svc')!;
    const podPos = mobile.get('pod')!;
    expect(userPos.y).toBeLessThan(svcPos.y);
    expect(svcPos.y).toBeLessThan(podPos.y);
  });

  it('marks overview, active, and visited edges accurately', () => {
    const overviewGraph = computeFlowGraph({
      nodes: SAMPLE_FLOW.nodes!,
      steps: SAMPLE_FLOW.steps!,
      isMobile: false,
      activeStepIndex: -1,
      reducedMotion: false,
    });
    expect(overviewGraph.edges.every((e) => !e.data?.isActive && !e.data?.isVisited)).toBe(true);

    const step2Graph = computeFlowGraph({
      nodes: SAMPLE_FLOW.nodes!,
      steps: SAMPLE_FLOW.steps!,
      isMobile: false,
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
        groups: [{ id: 'core-a', label: 'Domain Core', x: 1, y: 0, width: 1, height: 1 }],
        nodes: [
          { id: 'client', label: 'Client', x: 0, y: 0 },
          { id: 'domain', label: 'Domain', x: 1, y: 0 },
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
          { id: 'client', label: 'Client', x: 0, y: 0 },
          { id: 'port', label: 'Port', x: 1, y: 0 },
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
          { id: 'client', label: 'Client', x: 0, y: 0 },
          { id: 'layer', label: 'Layer', x: 1, y: 0 },
          { id: 'db', label: 'DB', x: 2, y: 0 },
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
