import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { InstallMenuButton } from '@/components/pwa/install-prompt';
import { NAV_LINKS } from '@/lib/layout.shared';
import { appName, gitConfig } from '@/lib/shared';

const linkClass =
  'inline-flex min-h-tap items-center text-subheadline text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline motion-reduce:transition-none';

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
            <LogoMark className="size-6" />
            {appName}
          </span>
          <p className="text-subheadline text-muted-foreground">Static site. No tracking.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.url}>
                <Link href={link.url} className={linkClass}>
                  {link.text}
                </Link>
              </li>
            ))}
            <li>
              <a href="/digest/rss.xml" className={linkClass}>
                RSS
              </a>
            </li>
            <li>
              <a href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`} className={linkClass} rel="noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <InstallMenuButton />
            </li>
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
