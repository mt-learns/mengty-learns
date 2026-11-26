import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="h-20 w-20 rounded-[28px] bg-muted flex items-center justify-center text-3xl mb-6">🧭</div>
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">The page you’re looking for doesn’t exist or moved. Try heading back home or browsing the notes.</p>
      <div className="flex gap-3">
        <Button asChild className="min-h-tap rounded-control"><Link href="/">Go home</Link></Button>
        <Button variant="outline" asChild className="min-h-tap rounded-control"><Link href="/docs">Browse docs</Link></Button>
      </div>
    </main>
  );
}