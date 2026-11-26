import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions, homeLinks } from '@/lib/layout.shared';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout {...baseOptions()} links={homeLinks()}>{children}</HomeLayout>;
}
