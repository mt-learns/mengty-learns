import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { SiteFooter } from '@/components/layout/site-footer';
import { baseOptions, homeLinks } from '@/lib/layout.shared';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <HomeLayout {...baseOptions()} links={homeLinks()}>
        {children}
      </HomeLayout>
      <SiteFooter />
    </>
  );
}
