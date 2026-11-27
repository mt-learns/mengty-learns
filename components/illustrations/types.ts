export const SECTION_ICON_NAMES = [
  'foundations',
  'containers',
  'kubernetes',
  'iac',
  'ci-cd',
  'gitops',
  'platform',
  'craft',
  'design',
  'architecture',
  'frontend',
  'security',
  'process',
  'leadership',
  'communication',
  'english',
  'career',
  'business',
] as const;

export type SectionIconName = (typeof SECTION_ICON_NAMES)[number];

export const TRACK_ICON_NAMES = [
  'build-ship',
  'design-code',
  'secure',
  'work-grow',
] as const;

export type TrackIconName = (typeof TRACK_ICON_NAMES)[number];

export type ClayIconName = SectionIconName | TrackIconName;

export const ILLUSTRATION_NAMES = [
  'hero-desk',
  'review-empty',
  'not-found',
  'lab-header',
  'radar-header',
] as const;

export type IllustrationName = (typeof ILLUSTRATION_NAMES)[number];

export type AssetSize = 24 | 48 | 96 | 256;
