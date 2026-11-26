import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { Sidenote, Gotcha, Tip, Figure } from '@/components/mdx/sidenote';
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
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
