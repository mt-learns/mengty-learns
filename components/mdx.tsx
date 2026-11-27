import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { Sidenote, Gotcha, Tip } from '@/components/mdx/sidenote';
import { Figure } from '@/components/mdx/figure';
import { Terminal } from '@/components/mdx/terminal';
import {
  Analogy,
  Checklist,
  Intent,
  LabLink,
  MyTake,
  ProsCons,
  Relations,
  Step,
  Steps,
} from '@/components/mdx/concept';

import {
  Dialogue,
  Example,
  KeyTakeaways,
  OnePicture,
  Rule,
  Say,
  YouWillLearn,
} from '@/components/mdx/reading';
import { Template } from '@/components/mdx/Template';
import { PatternBank } from '@/components/mdx/PatternBank';
import { DecisionTree } from '@/components/mdx/DecisionTree';
import { FlowServer as Flow } from '@/components/flow/FlowServer';
import { Diagram } from '@/components/diagram/Diagram';
import { Quiz } from '@/components/learn/Quiz';
import { LearningMap } from '@/components/learn/LearningMap';
import { Illustration, SectionIcon } from '@/components/illustrations';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    Callout,
    Card,
    Cards,
    Sidenote,
    Gotcha,
    Tip,
    Figure,
    Terminal,
    Intent,
    Analogy,
    Checklist,
    Steps,
    Step,
    ProsCons,
    Relations,
    LabLink,
    MyTake,
    YouWillLearn,
    OnePicture,
    KeyTakeaways,
    Rule,
    Example,
    Say,
    Dialogue,
    Template,
    PatternBank,
    DecisionTree,
    Flow,
    Diagram,
    Quiz,
    LearningMap,
    SectionIcon,
    Illustration,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
