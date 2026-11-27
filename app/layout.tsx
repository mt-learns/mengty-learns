import { Atkinson_Hyperlegible_Next, Inter, JetBrains_Mono } from 'next/font/google';
import { Provider } from '@/components/provider';
import { ThemeColorSync } from '@/components/pwa/theme-color-sync';
import { SwRegister } from '@/components/pwa/sw-register';
import './global.css';
import { type ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { appName, siteUrl } from '@/lib/shared';

/*
 * One family per content role (DESIGN.md, Typography). All three are variable
 * fonts, self-hosted by next/font, latin only, with a metric-adjusted fallback
 * so the swap does not shift the layout.
 */
// UI, headings, navigation, stats and diagram labels.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true,
  variable: '--font-inter',
});

// Long-form reading: distinct I/l/1, 0/O and rn/m at body size.
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true,
  variable: '--font-atkinson',
});

// Its italic shares the family name but is not preloaded: few pages use
// italics, so the browser fetches it only where emphasis appears.
const atkinsonItalic = Atkinson_Hyperlegible_Next({
  subsets: ['latin'],
  style: 'italic',
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
  variable: '--font-atkinson-italic',
});

// Code, commands, file paths. Ligatures are switched off in CSS.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true,
  variable: '--font-jetbrains-mono',
});

const tagline = 'See how infrastructure really works: notes, animated flows, labs that CI runs and flashcards for DevOps, architecture and security.';

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF8' },
    { media: '(prefers-color-scheme: dark)', color: '#0E1013' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: tagline,
  appleWebApp: {
    capable: true,
    title: 'Mengty',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: appName,
    title: appName,
    description: tagline,
    url: siteUrl,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: `${appName} — ${tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description: tagline,
    images: ['/og.png'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${atkinson.variable} ${atkinsonItalic.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-dvh">
        <Provider>
          <ThemeColorSync />
          <SwRegister />
          {children}
        </Provider>
      </body>
    </html>
  );
}
