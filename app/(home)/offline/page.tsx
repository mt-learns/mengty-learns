import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Layers, WifiOff } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { OfflineClient } from './offline-client';

export const metadata: Metadata = {
  title: 'Offline',
  description: 'You are currently offline. Open cached notes or review flashcards.',
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-xl space-y-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-panel border bg-card text-primary">
            <WifiOff className="size-6" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-[-0.02em] font-headline">
            You’re offline
          </h1>
          <p className="text-body text-muted-foreground">
            This page hasn’t been cached on your device yet. Your flashcards and any notes you’ve already visited are still available below.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="min-h-tap rounded-control px-6">
            <Link href="/review/">
              <Layers className="size-4" strokeWidth={1.75} aria-hidden="true" />
              <span>Open flashcards</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="min-h-tap rounded-control px-6">
            <Link href="/">
              <BookOpen className="size-4" strokeWidth={1.75} aria-hidden="true" />
              <span>Go home</span>
            </Link>
          </Button>
        </div>

        <OfflineClient />
      </div>
    </Container>
  );
}
