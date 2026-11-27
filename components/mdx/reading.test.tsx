// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Dialogue,
  Example,
  KeyTakeaways,
  OnePicture,
  Rule,
  Say,
  YouWillLearn,
} from './reading';
import { Template } from './Template';
import { PatternBank } from './PatternBank';
import { DecisionTree, buildDecisionDiagramData } from './DecisionTree';
import { computeDiagramLayout } from '../diagram/layout';

afterEach(cleanup);

describe('Reading MDX components', () => {
  it('renders YouWillLearn with items', () => {
    render(<YouWillLearn items={['Understand past simple', 'Avoid dropped -ed endings']} />);
    expect(screen.getByText('You will learn')).toBeInTheDocument();
    expect(screen.getByText('Understand past simple')).toBeInTheDocument();
  });

  it('renders OnePicture wrapping Diagram with 5-min marker', () => {
    const { container } = render(
      <OnePicture
        id="test-one-pic"
        title="Request flow"
        nodes={[
          { id: 'a', label: 'Client' },
          { id: 'b', label: 'API' },
        ]}
        edges={[{ from: 'a', to: 'b', kind: 'request' }]}
      />,
    );
    expect(container.querySelector('[data-five-min="keep"]')).toBeInTheDocument();
    expect(screen.getAllByText('Client').length).toBeGreaterThan(0);
    expect(screen.getAllByText('API').length).toBeGreaterThan(0);
  });

  it('renders KeyTakeaways with numbered items and 5-min marker', () => {
    const { container } = render(
      <KeyTakeaways
        items={[
          'Use past simple for finished times',
          { point: 'Check irregular verbs', detail: 'build -> built' },
        ]}
      />,
    );
    expect(container.querySelector('[data-five-min="keep"]')).toBeInTheDocument();
    expect(screen.getByText('Use past simple for finished times')).toBeInTheDocument();
    expect(screen.getByText('Check irregular verbs')).toBeInTheDocument();
  });

  it('renders Rule with optional formula', () => {
    render(
      <Rule formula="have/has + past participle">
        Use present perfect when the result matters now.
      </Rule>,
    );
    expect(screen.getByText('have/has + past participle')).toBeInTheDocument();
    expect(screen.getByText(/result matters now/)).toBeInTheDocument();
  });

  it('renders Example with non-colour-only labels and reason', () => {
    render(
      <Example
        wrong="I have deployed it yesterday."
        right="I deployed it yesterday."
        reason="Yesterday is a finished time, so use past simple."
      />,
    );
    expect(screen.getByText('Avoid:')).toBeInTheDocument();
    expect(screen.getByText('Use:')).toBeInTheDocument();
    expect(screen.getByText(/Yesterday is a finished time/)).toBeInTheDocument();
  });

  it('renders Say pronunciation note', () => {
    render(<Say word="deployed" ipa="/dɪˈplɔɪd/" sound="ends with /d/" note="Voice the final d." />);
    expect(screen.getByText('deployed')).toBeInTheDocument();
    expect(screen.getByText('/dɪˈplɔɪd/')).toBeInTheDocument();
  });

  it('renders Dialogue with speaker badges', () => {
    render(
      <Dialogue
        title="Standup"
        speakers={['Dev', 'Lead']}
        lines={[
          { speaker: 'Dev', text: 'I fixed the login bug yesterday.' },
          { speaker: 'Lead', text: 'Great, is it deployed?' },
        ]}
      />,
    );
    expect(screen.getByText('Standup')).toBeInTheDocument();
    expect(screen.getByText('I fixed the login bug yesterday.')).toBeInTheDocument();
  });

  it('copies Template text when Copy button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<Template title="Standup" text="Yesterday I ___. Today I am ___." />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy Standup' }));
    expect(writeText).toHaveBeenCalledWith('Yesterday I ___. Today I am ___.');
  });

  it('copies PatternBank pattern when Copy button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(
      <PatternBank
        patterns={[{ pattern: 'Could we ___ instead?', example: 'Could we batch these requests instead?' }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copy pattern: Could we ___ instead?' }));
    expect(writeText).toHaveBeenCalledWith('Could we ___ instead?');
  });

  it('walks DecisionTree and passes diagram layout bounds invariants', () => {
    const nodes = [
      { id: 'q1', label: 'Finished time?', question: 'Is there a finished time (yesterday, last week)?', yes: 'past', no: 'perf' },
      { id: 'past', label: 'Past simple', result: 'Use past simple: I deployed it yesterday.' },
      { id: 'perf', label: 'Present perfect', result: 'Use present perfect: I have deployed it.' },
    ];
    render(<DecisionTree id="tense-tree" title="Tense choice" start="q1" nodes={nodes} />);
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(screen.getByText('Use past simple: I deployed it yesterday.')).toBeInTheDocument();

    const { diagramNodes, diagramEdges } = buildDecisionDiagramData(nodes);
    const layout = computeDiagramLayout({
      nodes: diagramNodes.map((n) => ({ ...n })),
      edges: diagramEdges.map((e) => ({ ...e, kind: e.kind ?? 'request' })),
      layout: 'tree',
      containerWidth: 720,
    });
    expect(layout.nodes.size).toBe(3);
    expect(layout.bounds.width).toBeGreaterThan(0);
    expect(layout.bounds.height).toBeGreaterThan(0);
  });
});
