import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs">ML</span>
          {appName}
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}

export function homeLinks(): LinkItemType[] {
  return [
    { text: 'Docs', url: '/docs', active: 'nested-url' },
    { text: 'Radar', url: '/radar', active: 'nested-url' },
    { text: 'Projects', url: '/projects', active: 'nested-url' },
    { text: 'About', url: '/about', active: 'nested-url' },
  ];
}
