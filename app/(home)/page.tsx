import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Illustration, SectionIcon, TrackIcon } from '@/components/illustrations';
import { Container } from '@/components/layout/container';
import { CountUp } from '@/components/home/count-up';
import { DemoDo } from '@/components/home/demo-do';
import { DemoRead } from '@/components/home/demo-read';
import { DemoRemember } from '@/components/home/demo-remember';
import { HeroIllustration } from '@/components/home/hero-illustration';
import { K8sRequestFlow } from '@/components/home/k8s-flow';
import { PathProgress } from '@/components/home/path-progress';
import { RadarPulse } from '@/components/home/radar-pulse';
import { ReviewCta } from '@/components/home/review-cta';
import { StaggerGrid } from '@/components/home/stagger-grid';
import {
  getLatestNotes,
  getRadarSnapshot,
  getSampleCard,
  getSiteStats,
  getStartHereTour,
  getTracks,
} from '@/lib/home-data';

const sectionY = 'py-16 md:py-24';

function SectionHeading({ id, title, lede, action }: { id: string; title: string; lede?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <h2 id={id} className="text-section text-balance md:text-section-lg">
          {title}
        </h2>
        {lede && <p className="mt-3 text-body leading-relaxed text-muted-foreground">{lede}</p>}
      </div>
      {action}
    </div>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="group inline-flex min-h-tap items-center gap-1.5 self-start font-medium text-link underline decoration-1 underline-offset-[3px] hover:text-link-hover md:self-auto"
    >
      {children}
      <ArrowRight
        className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:transform-none"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </Link>
  );
}

export default function HomePage() {
  const stats = getSiteStats();
  const tracks = getTracks();
  const startHere = getStartHereTour();
  const latest = getLatestNotes(6);
  const radar = getRadarSnapshot(2);
  const card = getSampleCard();

  const proof = [
    { value: stats.notes, label: stats.notes === 1 ? 'note' : 'notes' },
    { value: stats.flows, label: stats.flows === 1 ? 'interactive flow' : 'interactive flows' },
    { value: stats.labs, label: stats.labs === 1 ? 'lab tested in CI' : 'labs tested in CI' },
    { value: stats.flashcards, label: stats.flashcards === 1 ? 'flashcard' : 'flashcards' },
  ];

  return (
    <>
      {/* 1. Hero */}
      <section aria-labelledby="hero-title" className="pt-12 pb-12 md:pt-20 md:pb-16">
        <Container className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <h1
              id="hero-title"
              className="text-display text-balance md:text-display-lg"
            >
              See how infrastructure really works.
            </h1>
            <p className="mt-hero-rise mt-5 max-w-[34rem] text-lede text-muted-foreground md:text-lede-lg">
              Notes, animated flows, labs that CI actually runs, and flashcards that make it stick. DevOps, architecture
              and security, by Lim Mengty.
            </p>
            <div
              className="mt-hero-rise mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: '60ms' }}
            >
              <Link
                href="/docs"
                prefetch={false}
                className="inline-flex min-h-tap items-center justify-center gap-2 whitespace-nowrap rounded-control bg-primary px-6 text-headline text-primary-foreground shadow-[0_1px_2px_rgb(var(--shadow-color)/0.12),0_4px_12px_-4px_rgb(var(--shadow-color)/0.25)] transition-colors hover:bg-primary-hover motion-reduce:transition-none"
              >
                Start learning
                <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <ReviewCta />
            </div>
          </div>
          <div
            className="mt-hero-rise flex justify-center lg:col-span-5 lg:justify-end"
            style={{ animationDelay: '120ms' }}
          >
            <HeroIllustration>
              <Illustration
                name="hero-desk"
                size={256}
                decorative
                className="h-auto max-h-[240px] w-auto max-w-full lg:max-h-none lg:w-full lg:max-w-[440px]"
              />
            </HeroIllustration>
          </div>
        </Container>
      </section>

      {/* 2. Proof strip */}
      <section aria-label="What is on the site" className="border-y border-border bg-card">
        <Container>
          <dl className="grid grid-cols-2 md:grid-cols-4">
            {proof.map((item, index) => (
              <div
                key={item.label}
                className={[
                  'flex flex-col-reverse justify-end gap-1 py-6 md:py-8',
                  index % 2 === 1 ? 'pl-6 border-l border-border' : '',
                  index >= 2 ? 'border-t border-border md:border-t-0' : '',
                  index === 2 ? 'md:pl-6 md:border-l' : '',
                ].join(' ')}
              >
                <dt className="text-footnote font-medium uppercase tracking-[0.06em] text-muted-foreground">{item.label}</dt>
                <dd className="text-stat tabular-nums md:text-stat-lg">
                  <CountUp value={item.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* 3. How it works */}
      <section aria-labelledby="how-title" className={sectionY}>
        <Container>
          <SectionHeading
            id="how-title"
            title="Read it, run it, remember it."
            lede="Every topic goes through the same three steps, so it sticks after the tab is closed."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="flex flex-col rounded-card border border-border bg-card p-6">
              <h3 className="text-title-3 font-semibold">Read</h3>
              <p className="mt-2 text-subheadline leading-relaxed text-muted-foreground">
                Concept pages explain one idea each, with an animated flow you can step through.
              </p>
              <DemoRead />
              <div className="mt-auto pt-5">
                <TextLink href="/docs/kubernetes/service-routing">Open a concept page</TextLink>
              </div>
            </article>
            <article className="flex flex-col rounded-card border border-border bg-card p-6">
              <h3 className="text-title-3 font-semibold">Do</h3>
              <p className="mt-2 text-subheadline leading-relaxed text-muted-foreground">
                Labs are real files in the repo. CI lints, builds and validates them on every change.
              </p>
              <DemoDo />
              <div className="mt-auto pt-5">
                <TextLink href="/docs/containers/multi-stage-nextjs">Try a lab</TextLink>
              </div>
            </article>
            <article className="flex flex-col rounded-card border border-border bg-card p-6">
              <h3 className="text-title-3 font-semibold">Remember</h3>
              <p className="mt-2 text-subheadline leading-relaxed text-muted-foreground">
                Notes end with flashcards. Spaced repetition (FSRS) schedules them, right in your browser.
              </p>
              {card && <DemoRemember question={card.q} answer={card.a} title={card.title} />}
              <div className="mt-auto pt-5">
                <TextLink href="/review">Start today&apos;s review</TextLink>
              </div>
            </article>
          </div>
        </Container>
      </section>

      {/* 4. Learning paths */}
      <section aria-labelledby="paths-title" className={`${sectionY} border-t border-border`}>
        <Container>
          <SectionHeading
            id="paths-title"
            title="Learning paths"
            lede="Four tracks from Git basics and production ops to craft, security, and communication. Progress is saved in this browser."
          />

          {/* 4 track cards: 1 col mobile, 2x2 from md up so rows stay balanced at 360/768/1280/1920 */}
          <StaggerGrid className="grid gap-5 md:grid-cols-2">
            {tracks.map((track, index) => (
              <li
                key={track.id}
                className="flex"
                style={{ '--stagger-i': index } as CSSProperties}
              >
                <article className="flex w-full flex-col rounded-card border border-border bg-card p-6 transition-[border-color,box-shadow] duration-200 ease-[var(--ease-ios)] hover:border-primary/40 hover:shadow-[0_2px_4px_rgb(var(--shadow-color)/0.04),0_12px_24px_-12px_rgb(var(--shadow-color)/0.14)] motion-reduce:transition-none">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <span className="inline-flex shrink-0">
                        <TrackIcon name={track.id} size={48} decorative />
                      </span>
                      <div>
                        <h3 className="text-title-3 font-semibold">{track.title}</h3>
                        <p className="mt-0.5 text-subheadline text-muted-foreground">{track.promise}</p>
                      </div>
                    </div>
                    {track.urls.length > 0 && <PathProgress urls={track.urls} />}
                  </div>

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {track.sections.map((sec) => (
                      <li key={sec.id}>
                        <Link
                          href={sec.href}
                          prefetch={false}
                          className="group inline-flex min-h-tap items-center gap-2 rounded-control border border-border bg-background px-3 py-1.5 text-footnote font-medium transition-colors hover:border-primary/50 hover:bg-primary-soft/50 motion-reduce:transition-none"
                        >
                          <SectionIcon name={sec.id} size={24} decorative />
                          <span>{sec.title}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {sec.count > 0 ? sec.count : 'Soon'}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </StaggerGrid>

          {startHere.length > 0 && (
            <div className="mt-8 rounded-card border border-border bg-card p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h3 className="text-headline font-semibold">Start here: a 30-minute tour</h3>
                  <p className="mt-0.5 text-subheadline text-muted-foreground">
                    Five pages across the tracks to see how the notes, flows, and flashcards fit together.
                  </p>
                </div>
                <span className="text-footnote font-medium tabular-nums text-primary">
                  {startHere.reduce((sum, s) => sum + s.minutes, 0)} min total
                </span>
              </div>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {startHere.map((stop, idx) => (
                  <li key={stop.href} className="flex">
                    <Link
                      href={stop.href}
                      prefetch={false}
                      className="group flex w-full flex-col justify-between rounded-panel border border-border bg-background p-4 transition-[transform,border-color] duration-150 ease-[var(--ease-ios)] hover:-translate-y-0.5 hover:border-primary/50 motion-reduce:transition-none motion-reduce:transform-none"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-caption-1 text-muted-foreground">
                          <span className="font-semibold tabular-nums text-primary">0{idx + 1}</span>
                          <span className="tabular-nums">{stop.minutes} min</span>
                        </div>
                        <p className="mt-1.5 text-subheadline font-semibold leading-snug text-foreground group-hover:text-primary">
                          {stop.title}
                        </p>
                      </div>
                      <p className="mt-2 text-caption-1 text-muted-foreground">{stop.section}</p>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Container>
      </section>

      {/* 5. Watch it work */}
      <section aria-labelledby="watch-title" className={`${sectionY} border-t border-border bg-card`}>
        <Container>
          <SectionHeading
            id="watch-title"
            title="Watch a request cross a cluster"
            lede="Step through a request from the browser to a Pod and back. Concept pages carry flows like this one."
            action={<TextLink href="/docs/kubernetes/service-routing">Read the full page</TextLink>}
          />
          <K8sRequestFlow />
        </Container>
      </section>

      {/* 6. Latest notes + 7. Radar */}
      <section aria-labelledby="latest-title" className={`${sectionY} border-t border-border`}>
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <h2 id="latest-title" className="text-section md:text-section-lg">
              Latest notes
            </h2>
            <p className="mt-3 text-body leading-relaxed text-muted-foreground">The {latest.length} most recently updated pages.</p>
            <div className="mt-4">
              <TextLink href="/docs">Browse all notes</TextLink>
            </div>
          </div>
          <ol className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card lg:col-span-8">
            {latest.map((note) => (
              <li key={note.url}>
                <Link
                  href={note.url}
                  prefetch={false}
                  className="group flex min-h-tap flex-col gap-1.5 px-5 py-4 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:gap-4 motion-reduce:transition-none"
                >
                  <span className="min-w-0 flex-1 font-medium text-foreground">{note.title}</span>
                  <span className="flex shrink-0 items-center gap-3 text-footnote text-muted-foreground">
                    <span className="rounded-pill bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">{note.badge}</span>
                    <span>{note.section}</span>
                    {note.date && (
                      <time dateTime={note.date} className="tabular-nums text-label-tertiary">
                        {note.dateLabel}
                      </time>
                    )}
                    <ArrowRight
                      className="hidden size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[var(--ease-ios)] group-hover:translate-x-0.5 group-hover:text-foreground sm:inline-block motion-reduce:transition-none motion-reduce:transform-none"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="radar-title" className={`${sectionY} border-t border-border`}>
        <Container>
          <SectionHeading
            id="radar-title"
            title="Tech radar"
            lede="What I adopt, trial, assess and hold, with the reason for each."
            action={<TextLink href="/radar">Open the radar</TextLink>}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {radar.map((ring) => (
              <section key={ring.ring} aria-labelledby={`ring-${ring.ring}`} className="flex flex-col rounded-card border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 id={`ring-${ring.ring}`} className="text-headline font-semibold">
                    {ring.label}
                  </h3>
                  <RadarPulse className="rounded-pill bg-highlight-soft px-2.5 py-0.5 text-footnote font-semibold tabular-nums text-highlight-text">
                    {ring.count} {ring.count === 1 ? 'entry' : 'entries'}
                  </RadarPulse>
                </div>
                {ring.top.length > 0 ? (
                  <ul className="mt-4 flex flex-col gap-3">
                    {ring.top.map((entry) => (
                      <li key={entry.title}>
                        <p className="text-subheadline font-medium text-foreground">{entry.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-footnote leading-relaxed text-muted-foreground">{entry.what}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-footnote text-muted-foreground">Nothing here yet.</p>
                )}
              </section>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
