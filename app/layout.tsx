import { Inter } from 'next/font/google';
import { Provider } from '@/components/provider';
import './global.css';
import { type ReactNode } from 'react';
import type { Metadata } from 'next';
import { siteUrl } from '@/lib/shared';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Mengty Learns',
    template: '%s | Mengty Learns',
  },
  description: 'Learning DevOps, architecture and security — one note at a time.',
  openGraph: {
    siteName: 'Mengty Learns',
    url: siteUrl,
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
