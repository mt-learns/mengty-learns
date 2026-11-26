// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Flow } from './Flow';
import {
  buildFlowDeepLinkRelative,
  buildFlowDeepLinkUrl,
  parseFlowDeepLink,
} from './deep-link';
import { computeEdgePath, parseEdge } from './edges';
import {
  CELL_X,
  CELL_Y,
  GROUP_PAD_BOTTOM,
  GROUP_PAD_TOP,
  GROUP_PAD_X,
  NODE_HEIGHT,
  NODE_WIDTH,
  PADDING_X,
  PADDING_Y,
  getCanvasDimensions,
  getGroupBox,
  getNodePosition,
} from './layout';
import { parseFlowProps } from './types';

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

const SAMPLE_FLOW = {
  id: 'sample-flow',
  title: 'Sample Request Flow',
  nodes: [
    { id: 'user', label: 'User', icon: 'user' as const, x: 0, y: 0 },
    { id: 'svc', label: 'Service', icon: 'service' as const, x: 1, y: 0 },
    { id: 'pod', label: 'Pod', icon: 'pod' as const, x: 1, y: 1 },
  ],
  steps: [
    { edge: 'user->svc', text: 'User sends request to Service' },
    { edge: 'svc->pod', text: 'Service forwards request to Pod' },
    { edge: 'pod->svc', text: 'Pod returns 200 OK', kind: 'response' as const },
  ],
};

describe('Flow layout and edge math', () => {
  it('computes grid node coordinates and canvas dimensions', () => {
    const pos = getNodePosition({ x: 1, y: 2 });
    expect(pos).toEqual({
      x: PADDING_X + CELL_X,
      y: PADDING_Y + 2 * CELL_Y,
      cx: PADDING_X + CELL_X + NODE_WIDTH / 2,
      cy: PADDING_Y + 2 * CELL_Y + NODE_HEIGHT / 2,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });

    const dims = getCanvasDimensions(SAMPLE_FLOW.nodes);
    expect(dims).toEqual({
      width: PADDING_X * 2 + CELL_X + NODE_WIDTH,
      height: PADDING_Y * 2 + CELL_Y + NODE_HEIGHT,
    });
  });

  it('parses valid edges and rejects malformed ones', () => {
    expect(parseEdge('user -> svc')).toEqual({ from: 'user', to: 'svc' });
    expect(() => parseEdge('invalid-edge')).toThrow();
  });

  it('computes straight horizontal, vertical, and curved bidirectional paths', () => {
    const horizontal = computeEdgePath({ x: 0, y: 0 }, { x: 1, y: 0 });
    expect(horizontal.start.x).toBe(PADDING_X + NODE_WIDTH);
    expect(horizontal.end.x).toBe(PADDING_X + CELL_X);
    expect(horizontal.d).toMatch(/^M .+ L .+$/);

    const vertical = computeEdgePath({ x: 1, y: 0 }, { x: 1, y: 1 });
    expect(vertical.start.y).toBe(PADDING_Y + NODE_HEIGHT);
    expect(vertical.end.y).toBe(PADDING_Y + CELL_Y);
    expect(vertical.d).toMatch(/^M .+ L .+$/);

    const curved = computeEdgePath({ x: 1, y: 1 }, { x: 1, y: 0 }, 20);
    expect(curved.d).toMatch(/^M .+ Q .+$/);
  });
});

describe('Flow Zod validation', () => {
  it('accepts valid flow props', () => {
    const parsed = parseFlowProps(SAMPLE_FLOW);
    expect(parsed.steps?.[0].kind).toBe('request');
    expect(parsed.steps?.[2].kind).toBe('response');
  });

  it('throws when a step references an unknown node id', () => {
    expect(() =>
      parseFlowProps({
        ...SAMPLE_FLOW,
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

describe('Flow keyboard navigation and controls', () => {
  it('renders the caption, controls, and always-visible step list', () => {
    render(<Flow {...SAMPLE_FLOW} />);

    expect(screen.getByText('Step 1 / 3')).toBeInTheDocument();
    expect(
      screen.getAllByText('User sends request to Service').length,
    ).toBeGreaterThanOrEqual(2);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('navigates steps with ArrowRight, ArrowLeft, End, and Home keys', () => {
    render(<Flow {...SAMPLE_FLOW} />);

    const region = screen.getByRole('region', { name: 'Sample Request Flow' });
    region.focus();

    fireEvent.keyDown(region, { key: 'ArrowRight' });
    expect(screen.getByText('Step 2 / 3')).toBeInTheDocument();

    fireEvent.keyDown(region, { key: 'End' });
    expect(screen.getByText('Step 3 / 3')).toBeInTheDocument();
    expect(screen.getByText('response')).toBeInTheDocument();

    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    expect(screen.getByText('Step 2 / 3')).toBeInTheDocument();

    fireEvent.keyDown(region, { key: 'Home' });
    expect(screen.getByText('Step 1 / 3')).toBeInTheDocument();
  });

  it('updates active step via buttons, scrubber, and speed toggles', () => {
    render(<Flow {...SAMPLE_FLOW} />);

    const nextBtn = screen.getByRole('button', { name: 'Next step' });
    const prevBtn = screen.getByRole('button', { name: 'Previous step' });
    expect(prevBtn).toBeDisabled();

    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 2 / 3')).toBeInTheDocument();
    expect(prevBtn).not.toBeDisabled();

    const scrubber = screen.getByRole('slider', { name: 'Step scrubber' });
    fireEvent.change(scrubber, { target: { value: '2' } });
    expect(screen.getByText('Step 3 / 3')).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();

    const speed2x = screen.getByRole('button', { name: '2x' });
    fireEvent.click(speed2x);
    expect(speed2x).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Flow v2: variants, deep links, and group nodes', () => {
  const VARIANT_FLOW = {
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
          { edge: 'client->domain', text: 'A step 1' },
          { edge: 'domain->client', text: 'A step 2', kind: 'response' as const },
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
          { edge: 'client->port', text: 'B step 1' },
          { edge: 'port->client', text: 'B step 2', kind: 'response' as const },
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
          { edge: 'client->layer', text: 'C step 1' },
          { edge: 'layer->db', text: 'C step 2' },
          { edge: 'db->client', text: 'C step 3', kind: 'response' as const },
        ],
      },
    ],
  };

  it('validates variants and group boxes with Zod and layout helpers', () => {
    const parsed = parseFlowProps(VARIANT_FLOW);
    expect(parsed.variants).toHaveLength(3);

    const box = getGroupBox({ x: 1, y: 0, width: 1, height: 1 });
    expect(box).toEqual({
      x: PADDING_X + CELL_X - GROUP_PAD_X,
      y: PADDING_Y - GROUP_PAD_TOP,
      width: NODE_WIDTH + GROUP_PAD_X * 2,
      height: NODE_HEIGHT + GROUP_PAD_TOP + GROUP_PAD_BOTTOM,
    });

    expect(() =>
      parseFlowProps({
        id: 'bad-variant',
        variants: [
          {
            id: 'v1',
            label: 'V1',
            nodes: [
              { id: 'a', label: 'A', x: 0, y: 0 },
              { id: 'b', label: 'B', x: 1, y: 0 },
            ],
            steps: [{ edge: 'a->missing', text: 'Broken' }],
          },
        ],
      }),
    ).toThrow(/Unknown node id .*missing/);
  });

  it('switches variants, preserves step index on matching step counts, and resets on mismatch', () => {
    render(<Flow {...VARIANT_FLOW} />);

    expect(screen.getByText('Domain Core')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByText('Step 2 / 2')).toBeInTheDocument();

    // Variant B also has 2 steps -> keep step index 1 ("Step 2 / 2")
    fireEvent.click(screen.getByRole('button', { name: 'Variant B' }));
    expect(screen.getByText('Step 2 / 2')).toBeInTheDocument();
    expect(screen.getAllByText('B step 2').length).toBeGreaterThanOrEqual(2);

    // Variant C has 3 steps -> reset to step index 0 ("Step 1 / 3")
    fireEvent.click(screen.getByRole('button', { name: 'Variant C' }));
    expect(screen.getByText('Step 1 / 3')).toBeInTheDocument();
    expect(screen.getAllByText('C step 1').length).toBeGreaterThanOrEqual(2);
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

  it('reads deep link on mount, updates URL with replaceState, and copies step link', async () => {
    window.history.replaceState(null, '', '/docs/test?flow=sample-flow&step=3');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<Flow {...SAMPLE_FLOW} />);
    expect(screen.getByText('Step 3 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous step' }));
    expect(screen.getByText('Step 2 / 3')).toBeInTheDocument();
    expect(window.location.search).toContain('flow=sample-flow');
    expect(window.location.search).toContain('step=2');

    const copyBtn = screen.getByRole('button', { name: 'Copy link to this step' });
    fireEvent.click(copyBtn);
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('?flow=sample-flow&step=2'),
    );
    expect(await screen.findByRole('button', { name: 'Link copied' })).toBeInTheDocument();
  });
});
