import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';
import { LogoMark } from '@/components/brand/logo';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
          <LogoMark />
          {appName}
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}

/** Top navigation for the home layout. Docs, Review, Radar and Digest only. */
export const NAV_LINKS = [
  { text: 'Docs', url: '/docs' },
  { text: 'Review', url: '/review' },
  { text: 'Radar', url: '/radar' },
  { text: 'Digest', url: '/digest' },
] as const;

export function homeLinks(): LinkItemType[] {
  return NAV_LINKS.map((link) => ({ ...link, active: 'nested-url' as const }));
}
