export const SECTION_ICON_NAMES = [
  'foundations',
  'containers',
  'kubernetes',
  'iac',
  'ci-cd',
  'gitops',
  'design',
  'architecture',
  'security',
] as const;

export type SectionIconName = (typeof SECTION_ICON_NAMES)[number];

export const ILLUSTRATION_NAMES = [
  'hero-desk',
  'review-empty',
  'not-found',
  'lab-header',
  'radar-header',
] as const;

export type IllustrationName = (typeof ILLUSTRATION_NAMES)[number];

export type AssetSize = 24 | 48 | 96 | 256;
