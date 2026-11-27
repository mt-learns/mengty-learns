import fs from 'node:fs';
import path from 'node:path';
import type { SectionIconName, TrackIconName } from '@/components/illustrations';
import { SECTION_ICON_NAMES } from '@/components/illustrations';
import { radarSource, source } from '@/lib/source';

/**
 * Build-time data for the landing page. Every number comes from content on
 * disk when `next build` runs (the page is statically exported), never from a
 * hard-coded value.
 */

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs');
const LABS_DIR = path.join(process.cwd(), 'labs');

/** Published docs content pages (excludes /docs landing and section index pages). */
function notePages() {
  return source.getPages().filter((page) => page.slugs.length > 1);
}

function readSource(pagePath: string) {
  try {
    return fs.readFileSync(path.join(DOCS_DIR, pagePath), 'utf8');
  } catch {
    return '';
  }
}

export interface SiteStats {
  notes: number;
  flows: number;
  labs: number;
  flashcards: number;
}

export function getSiteStats(): SiteStats {
  const pages = notePages();
  const flows = pages.reduce((sum, page) => sum + (readSource(page.path).match(/<Flow\b/g)?.length ?? 0), 0);
  const labs = fs.existsSync(LABS_DIR)
    ? fs.readdirSync(LABS_DIR, { withFileTypes: true }).filter((entry) => entry.isDirectory()).length
    : 0;
  const flashcards = pages.reduce((sum, page) => sum + (page.data.cards?.length ?? 0), 0);
  return { notes: pages.length, flows, labs, flashcards };
}

const SECTION_COPY: Record<SectionIconName, { title: string; blurb: string }> = {
  foundations: { title: 'Foundations', blurb: 'Git, shells and the everyday tools under everything else.' },
  containers: { title: 'Containers', blurb: 'Images, layers, caching and Dockerfiles that stay small.' },
  kubernetes: { title: 'Kubernetes', blurb: 'Pods, Services and how a request finds its way in.' },
  iac: { title: 'Infrastructure as Code', blurb: 'OpenTofu projects you can plan, apply and destroy.' },
  'ci-cd': { title: 'CI/CD', blurb: 'Pipelines that build, test and ship on every push.' },
  gitops: { title: 'GitOps', blurb: 'Git as the source of truth for what runs.' },
  platform: { title: 'Platform tools', blurb: 'Ansible, Nginx, API gateways, Vault, Prometheus/Grafana, ELK, and DevSecOps.' },
  craft: { title: 'Coding craft', blurb: 'Naming, refactoring, debugging, code review and everyday engineering discipline.' },
  design: { title: 'Design', blurb: 'OOP, SOLID and patterns, shown with TypeScript.' },
  architecture: { title: 'Architecture', blurb: 'Layered, hexagonal and how dependencies should point.' },
  frontend: { title: 'Frontend', blurb: 'React composition, Next.js rendering, data fetching, forms, Tailwind tokens, accessibility, and UX states.' },
  security: { title: 'Security', blurb: 'The common web risks and the habits that prevent them.' },
  process: { title: 'Process', blurb: 'Idea to production, ADRs, quality gates, and retros for small teams.' },
  leadership: { title: 'Leadership', blurb: 'Transitioning to team lead, clarity, delegation, feedback, and engineering health.' },
  communication: { title: 'Communication', blurb: 'Feedback, writing to be read, proposals, and alignment across teams.' },
  english: { title: 'English for engineers', blurb: 'Grammar, sentence patterns, meetings, presentations, and workplace writing.' },
  career: { title: 'Career & interviews', blurb: 'Resumes, STAR stories, coding patterns, system design, and growth.' },
  business: { title: 'Business & startups', blurb: 'Problem discovery, MVPs, pricing, unit economics, and founder habits.' },
};

export interface TrackSectionChip {
  id: SectionIconName;
  title: string;
  href: string;
  count: number;
  urls: string[];
}

export interface LearningTrack {
  id: TrackIconName;
  title: string;
  promise: string;
  sections: TrackSectionChip[];
  urls: string[];
}

const TRACK_DEFINITIONS: {
  id: TrackIconName;
  title: string;
  promise: string;
  sections: SectionIconName[];
}[] = [
  {
    id: 'build-ship',
    title: 'Build & Ship',
    promise: 'Run it in production',
    sections: ['foundations', 'containers', 'kubernetes', 'iac', 'ci-cd', 'gitops', 'platform'],
  },
  {
    id: 'design-code',
    title: 'Design & Code',
    promise: 'Write software that lasts',
    sections: ['craft', 'design', 'architecture', 'frontend'],
  },
  {
    id: 'secure',
    title: 'Secure',
    promise: "Don't get breached",
    sections: ['security'],
  },
  {
    id: 'work-grow',
    title: 'Work & Grow',
    promise: 'Be great at the job around the code',
    sections: ['process', 'leadership', 'communication', 'english', 'career', 'business'],
  },
];

export function getTracks(): LearningTrack[] {
  const pages = notePages();
  return TRACK_DEFINITIONS.map((track) => {
    const sections: TrackSectionChip[] = track.sections.map((sectionId) => {
      const inSection = pages.filter((page) => page.slugs[0] === sectionId);
      const order = readMetaOrder(sectionId);
      inSection.sort((a, b) => rank(order, a.slugs[1]) - rank(order, b.slugs[1]));
      return {
        id: sectionId,
        title: SECTION_COPY[sectionId].title,
        href: inSection[0]?.url ?? `/docs/${sectionId}`,
        count: inSection.length,
        urls: inSection.map((page) => page.url),
      };
    });
    return {
      id: track.id,
      title: track.title,
      promise: track.promise,
      sections,
      urls: sections.flatMap((s) => s.urls),
    };
  });
}

export interface StartHereStop {
  title: string;
  section: string;
  minutes: number;
  href: string;
}

const START_HERE_CANDIDATES: { slug: string[]; minutes: number }[] = [
  { slug: ['foundations', 'git-cheatsheet'], minutes: 5 },
  { slug: ['kubernetes', 'service-routing'], minutes: 7 },
  { slug: ['design', 'bridge'], minutes: 6 },
  { slug: ['security', 'owasp-top-10'], minutes: 7 },
  { slug: ['process', 'idea-to-production'], minutes: 5 },
];

export function getStartHereTour(): StartHereStop[] {
  const stops: StartHereStop[] = [];
  for (const item of START_HERE_CANDIDATES) {
    const page = source.getPage(item.slug);
    if (!page) continue;
    const sectionId = item.slug[0] as SectionIconName;
    stops.push({
      title: page.data.title,
      section: SECTION_COPY[sectionId]?.title ?? sectionId,
      minutes: item.minutes,
      href: page.url,
    });
  }
  return stops;
}



function readMetaOrder(section: string): string[] {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(DOCS_DIR, section, 'meta.json'), 'utf8'));
    return Array.isArray(meta.pages) ? meta.pages : [];
  } catch {
    return [];
  }
}

function rank(order: string[], slug: string | undefined) {
  const index = slug ? order.indexOf(slug) : -1;
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

const TYPE_LABEL: Record<string, string> = {
  tutorial: 'Tutorial',
  'how-to': 'How-to',
  reference: 'Reference',
  explanation: 'Explanation',
};

const KIND_LABEL: Record<string, string> = {
  lab: 'Lab',
  cheatsheet: 'Cheatsheet',
  concept: 'Concept',
  decision: 'Decision',
  postmortem: 'Postmortem',
};

export interface LatestNote {
  title: string;
  url: string;
  badge: string;
  section: string;
  date: string | null;
  dateLabel: string | null;
}

export function getLatestNotes(limit = 6): LatestNote[] {
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  return notePages()
    .map((page) => {
      const updated = page.data.updated ? new Date(page.data.updated) : null;
      const valid = updated && !Number.isNaN(updated.getTime()) ? updated : null;
      const section = page.slugs[0] as SectionIconName;
      return {
        title: page.data.title,
        url: page.url,
        badge: KIND_LABEL[page.data.kind] ?? TYPE_LABEL[page.data.type ?? ''] ?? 'Note',
        section: SECTION_COPY[section]?.title ?? section,
        time: valid?.getTime() ?? 0,
        date: valid ? valid.toISOString().slice(0, 10) : null,
        dateLabel: valid ? formatter.format(valid) : null,
      };
    })
    .sort((a, b) => b.time - a.time || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map(({ time: _time, ...note }) => note);
}

export const RADAR_RINGS = ['adopt', 'trial', 'assess', 'hold'] as const;
export type RadarRingId = (typeof RADAR_RINGS)[number];

export interface RadarRingSnapshot {
  ring: RadarRingId;
  label: string;
  count: number;
  top: { title: string; what: string }[];
}

export function getRadarSnapshot(perRing = 2): RadarRingSnapshot[] {
  const entries = radarSource.getPages();
  return RADAR_RINGS.map((ring) => {
    const inRing = entries
      .filter((entry) => entry.data.ring === ring)
      .sort(
        (a, b) =>
          new Date(b.data.updated).getTime() - new Date(a.data.updated).getTime() ||
          a.data.title.localeCompare(b.data.title)
      );
    return {
      ring,
      label: ring[0].toUpperCase() + ring.slice(1),
      count: inRing.length,
      top: inRing.slice(0, perRing).map((entry) => ({ title: entry.data.title, what: entry.data.what })),
    };
  });
}

/** One real flashcard question and answer for the "Remember" preview. */
export function getSampleCard(preferSection = 'kubernetes'): { q: string; a: string; title: string; url: string } | null {
  const pages = notePages().sort((a, b) => Number(b.slugs[0] === preferSection) - Number(a.slugs[0] === preferSection));
  for (const page of pages) {
    const card = page.data.cards?.[0];
    if (card) return { q: card.q, a: card.a, title: page.data.title, url: page.url };
  }
  return null;
}
