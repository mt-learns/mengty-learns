import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions, homeLinks } from '@/lib/layout.shared';
import { Illustration } from '@/components/illustrations';
import { Container } from '@/components/layout/container';
import { SiteFooter } from '@/components/layout/site-footer';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <>
      <HomeLayout {...baseOptions()} links={homeLinks()}>
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
          <Illustration name="not-found" size={256} className="mb-6 h-auto w-60" decorative />
          <h1 className="mb-2 text-3xl font-bold tracking-[-0.02em]">Page not found</h1>
          <p className="mb-6 max-w-md text-muted-foreground">
            The page you’re looking for doesn’t exist or moved. Try heading back home or browsing the notes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="min-h-tap rounded-control px-6 hover:bg-primary-hover">
              <Link href="/">Go home</Link>
            </Button>
            <Button variant="outline" asChild className="min-h-tap rounded-control px-6">
              <Link href="/docs">Browse docs</Link>
            </Button>
          </div>
        </Container>
      </HomeLayout>
      <SiteFooter />
    </>
  );
}
