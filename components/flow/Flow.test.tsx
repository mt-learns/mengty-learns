// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Flow } from './Flow';
import { computeEdgePath, parseEdge } from './edges';
import {
  CELL_X,
  CELL_Y,
  NODE_HEIGHT,
  NODE_WIDTH,
  PADDING_X,
  PADDING_Y,
  getCanvasDimensions,
  getNodePosition,
} from './layout';
import { parseFlowProps } from './types';

afterEach(() => {
  cleanup();
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
    expect(parsed.steps[0].kind).toBe('request');
    expect(parsed.steps[2].kind).toBe('response');
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
