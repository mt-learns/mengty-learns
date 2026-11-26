import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions, homeLinks } from '@/lib/layout.shared';
import { Illustration } from '@/components/illustrations';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()} links={homeLinks()}>
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
        <Illustration name="not-found" size={256} className="w-60 h-auto mb-6" decorative />
        <h1 className="text-3xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6 max-w-md">The page you’re looking for doesn’t exist or moved. Try heading back home or browsing the notes.</p>
        <div className="flex gap-3">
          <Button asChild className="min-h-tap rounded-control"><Link href="/">Go home</Link></Button>
          <Button variant="outline" asChild className="min-h-tap rounded-control"><Link href="/docs">Browse docs</Link></Button>
        </div>
      </main>
    </HomeLayout>
  );
}