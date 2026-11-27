import { useId } from 'react';
import type { AssetSize, ClayIconName, SectionIconName, TrackIconName } from './types';

export interface SectionIconProps {
  name: SectionIconName;
  size?: AssetSize;
  title?: string;
  decorative?: boolean;
  className?: string;
}

export interface TrackIconProps {
  name: TrackIconName;
  size?: AssetSize;
  title?: string;
  decorative?: boolean;
  className?: string;
}

const DEFAULT_TITLES: Record<ClayIconName, string> = {
  foundations: 'Foundations section icon',
  containers: 'Containers section icon',
  kubernetes: 'Kubernetes section icon',
  iac: 'Infrastructure as Code section icon',
  'ci-cd': 'CI/CD section icon',
  gitops: 'GitOps section icon',
  platform: 'Platform tools section icon',
  craft: 'Coding craft section icon',
  design: 'Design patterns section icon',
  architecture: 'Architecture section icon',
  frontend: 'Frontend section icon',
  security: 'Security section icon',
  process: 'Process section icon',
  leadership: 'Leadership section icon',
  communication: 'Communication section icon',
  english: 'English for engineers section icon',
  career: 'Career and interviews section icon',
  business: 'Business and startups section icon',
  'build-ship': 'Build & Ship track icon',
  'design-code': 'Design & Code track icon',
  secure: 'Secure track icon',
  'work-grow': 'Work & Grow track icon',
};

const ICON_TINTS: Record<ClayIconName, { glow: string; rim: string }> = {
  foundations: { glow: 'var(--primary, #0F766E)', rim: '#5EEAD4' },
  containers: { glow: '#f59e0b', rim: '#fbbf24' },
  kubernetes: { glow: 'var(--primary, #0F766E)', rim: '#2DD4BF' },
  iac: { glow: '#8b5cf6', rim: '#a78bfa' },
  'ci-cd': { glow: '#f97316', rim: '#fb923c' },
  gitops: { glow: '#10b981', rim: '#34d399' },
  platform: { glow: '#0ea5e9', rim: '#38bdf8' },
  craft: { glow: '#f59e0b', rim: '#fbbf24' },
  design: { glow: '#ec4899', rim: '#f472b6' },
  architecture: { glow: '#6366f1', rim: '#818cf8' },
  frontend: { glow: '#ec4899', rim: '#f472b6' },
  security: { glow: '#10b981', rim: '#34d399' },
  process: { glow: '#0ea5e9', rim: '#38bdf8' },
  leadership: { glow: '#8b5cf6', rim: '#a78bfa' },
  communication: { glow: '#10b981', rim: '#34d399' },
  english: { glow: '#6366f1', rim: '#818cf8' },
  career: { glow: '#f97316', rim: '#fb923c' },
  business: { glow: '#10b981', rim: '#34d399' },
  'build-ship': { glow: 'var(--primary, #0F766E)', rim: '#5EEAD4' },
  'design-code': { glow: '#8b5cf6', rim: '#a78bfa' },
  secure: { glow: '#10b981', rim: '#34d399' },
  'work-grow': { glow: '#f59e0b', rim: '#fbbf24' },
};

/**
 * Soft 3D clay app-icon squircle for each learning section.
 */
export function SectionIcon(props: SectionIconProps) {
  return <ClayIcon {...props} />;
}

/**
 * Soft 3D clay app-icon squircle for each of the 4 learning tracks.
 */
export function TrackIcon(props: TrackIconProps) {
  return <ClayIcon {...props} />;
}

function ClayIcon({
  name,
  size = 48,
  title,
  decorative = false,
  className,
}: {
  name: ClayIconName;
  size?: AssetSize;
  title?: string;
  decorative?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const resolvedTitle = title ?? DEFAULT_TITLES[name];
  const tint = ICON_TINTS[name];

  const a11yProps = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': resolvedTitle };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={className}
      {...a11yProps}
    >
      {!decorative && <title>{resolvedTitle}</title>}
      <defs>
        <linearGradient id={`${uid}-tile`} x1="12%" y1="6%" x2="88%" y2="94%">
          <stop offset="0%" stopColor="var(--card, #ffffff)" />
          <stop offset="100%" stopColor="var(--muted, #f2f2f2)" />
        </linearGradient>
        <radialGradient id={`${uid}-key`} cx="22%" cy="18%" r="72%">
          <stop offset="0%" stopColor={tint.glow} stopOpacity="0.18" />
          <stop offset="60%" stopColor={tint.glow} stopOpacity="0.04" />
          <stop offset="100%" stopColor={tint.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-clay-blue`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="var(--primary, #0F766E)" />
        </linearGradient>
        <linearGradient id={`${uid}-clay-amber`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${uid}-clay-mint`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id={`${uid}-clay-lavender`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id={`${uid}-clay-coral`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="55%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-15%" y="-10%" width="130%" height="135%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.14" />
        </filter>
      </defs>

      {/* Contact shadow under squircle */}
      <ellipse cx="48" cy="88" rx="30" ry="4" fill="#000000" fillOpacity="0.1" />

      {/* iOS Squircle tile */}
      <rect
        x="6"
        y="6"
        width="84"
        height="84"
        rx="22"
        fill={`url(#${uid}-tile)`}
        stroke="var(--border, #ebebeb)"
        strokeWidth="1.5"
      />
      <rect x="6" y="6" width="84" height="84" rx="22" fill={`url(#${uid}-key)`} />
      {/* Top-left inner rim highlight */}
      <path
        d="M 28 7.5 H 68 A 20.5 20.5 0 0 1 88.5 28"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Matte 3D clay object */}
      <g filter={`url(#${uid}-shadow)`}>
        {name === 'foundations' && (
          <g>
            <rect x="24" y="54" width="48" height="14" rx="6" fill={`url(#${uid}-clay-blue)`} />
            <rect x="29" y="39" width="38" height="14" rx="6" fill="#93c5fd" />
            <rect x="35" y="25" width="26" height="13" rx="5.5" fill={`url(#${uid}-clay-amber)`} />
            <rect x="40" y="30" width="8" height="2.5" rx="1.25" fill="#ffffff" fillOpacity="0.85" />
          </g>
        )}

        {name === 'containers' && (
          <g>
            {/* Shipping crate */}
            <rect x="23" y="27" width="50" height="42" rx="9" fill={`url(#${uid}-clay-amber)`} />
            <rect x="23" y="27" width="50" height="11" rx="6" fill="#fef3c7" fillOpacity="0.55" />
            <rect x="30" y="42" width="7" height="20" rx="3.5" fill="#92400e" fillOpacity="0.32" />
            <rect x="44.5" y="42" width="7" height="20" rx="3.5" fill="#92400e" fillOpacity="0.32" />
            <rect x="59" y="42" width="7" height="20" rx="3.5" fill="#92400e" fillOpacity="0.32" />
          </g>
        )}

        {name === 'kubernetes' && (
          <g>
            {/* Original 8-spoke ship's helm wheel with handle knobs (non-trademark) */}
            <g stroke={`url(#${uid}-clay-blue)`} strokeWidth="4.5" strokeLinecap="round">
              <line x1="53.54" y1="50.30" x2="76.64" y2="59.86" />
              <line x1="50.30" y1="53.54" x2="59.86" y2="76.64" />
              <line x1="45.70" y1="53.54" x2="36.14" y2="76.64" />
              <line x1="42.46" y1="50.30" x2="19.36" y2="59.86" />
              <line x1="42.46" y1="45.70" x2="19.36" y2="36.14" />
              <line x1="45.70" y1="42.46" x2="36.14" y2="19.36" />
              <line x1="50.30" y1="42.46" x2="59.86" y2="19.36" />
              <line x1="53.54" y1="45.70" x2="76.64" y2="36.14" />
            </g>
            <circle cx="48" cy="48" r="18" fill="none" stroke={`url(#${uid}-clay-blue)`} strokeWidth="5.5" />
            <path
              d="M 32.41 39 A 18 18 0 0 1 57 32.41"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.5"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <g fill="#93c5fd">
              <circle cx="78.95" cy="60.82" r="3.6" />
              <circle cx="60.82" cy="78.95" r="3.6" />
              <circle cx="35.18" cy="78.95" r="3.6" />
              <circle cx="17.05" cy="60.82" r="3.6" />
              <circle cx="17.05" cy="35.18" r="3.6" />
              <circle cx="35.18" cy="17.05" r="3.6" />
              <circle cx="60.82" cy="17.05" r="3.6" />
              <circle cx="78.95" cy="35.18" r="3.6" />
            </g>
            <circle cx="48" cy="48" r="6" fill="#CCFBF1" stroke="var(--primary, #0F766E)" strokeWidth="2" />
            <circle cx="46.5" cy="46.5" r="1.6" fill="#ffffff" fillOpacity="0.9" />
          </g>
        )}

        {name === 'iac' && (
          <g>
            {/* Blueprint roll */}
            <rect x="22" y="31" width="52" height="34" rx="10" fill={`url(#${uid}-clay-lavender)`} />
            <ellipse cx="28" cy="48" rx="6" ry="17" fill="#ede9fe" />
            <ellipse cx="28" cy="48" rx="2.5" ry="9" fill="#6d28d9" fillOpacity="0.45" />
            <path d="M 40 42 H 64 M 40 49 H 58 M 40 56 H 62" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="49" y="29" width="7" height="38" rx="3.5" fill={`url(#${uid}-clay-amber)`} />
          </g>
        )}

        {name === 'ci-cd' && (
          <g>
            {/* Conveyor belt + package */}
            <rect x="25" y="27" width="22" height="20" rx="6" fill={`url(#${uid}-clay-amber)`} />
            <rect x="53" y="31" width="18" height="16" rx="5" fill={`url(#${uid}-clay-mint)`} />
            <rect x="20" y="51" width="56" height="16" rx="8" fill={`url(#${uid}-clay-coral)`} />
            <circle cx="29" cy="59" r="3.5" fill="#fff7ed" />
            <circle cx="48" cy="59" r="3.5" fill="#fff7ed" />
            <circle cx="67" cy="59" r="3.5" fill="#fff7ed" />
          </g>
        )}

        {name === 'gitops' && (
          <g>
            {/* Branch sapling */}
            <path
              d="M 48 70 V 35 M 48 53 C 48 45 60 44 62 36"
              fill="none"
              stroke={`url(#${uid}-clay-mint)`}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <ellipse cx="38" cy="33" rx="11" ry="7" transform="rotate(-24 38 33)" fill={`url(#${uid}-clay-mint)`} />
            <ellipse cx="63" cy="34" rx="9" ry="6" transform="rotate(20 63 34)" fill="#6ee7b7" />
            <circle cx="48" cy="69" r="5.5" fill={`url(#${uid}-clay-blue)`} />
          </g>
        )}

        {name === 'design' && (
          <g>
            {/* Playful clay building blocks */}
            <rect x="23" y="45" width="24" height="24" rx="7" fill={`url(#${uid}-clay-blue)`} />
            <rect x="50" y="45" width="23" height="24" rx="7" fill={`url(#${uid}-clay-coral)`} />
            <circle cx="38" cy="33" r="11" fill={`url(#${uid}-clay-amber)`} />
            <rect x="52" y="24" width="19" height="18" rx="6" fill={`url(#${uid}-clay-lavender)`} />
          </g>
        )}

        {name === 'architecture' && (
          <g>
            {/* Layered modular skyline */}
            <rect x="22" y="40" width="15" height="30" rx="5" fill={`url(#${uid}-clay-lavender)`} />
            <rect x="40.5" y="25" width="16" height="45" rx="6" fill={`url(#${uid}-clay-blue)`} />
            <rect x="60" y="34" width="14" height="36" rx="5" fill={`url(#${uid}-clay-mint)`} />
            <rect x="45" y="32" width="7" height="4" rx="2" fill="#ffffff" fillOpacity="0.7" />
            <rect x="45" y="40" width="7" height="4" rx="2" fill="#ffffff" fillOpacity="0.7" />
          </g>
        )}

        {name === 'security' && (
          <g>
            {/* Matte shield + padlock */}
            <path
              d="M 48 22 L 70 30 V 47 C 70 61 59 70 48 75 C 37 70 26 61 26 47 V 30 Z"
              fill={`url(#${uid}-clay-mint)`}
            />
            <path
              d="M 42 46 V 41 A 6 6 0 0 1 54 41 V 46"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect x="38" y="45" width="20" height="16" rx="5" fill={`url(#${uid}-clay-amber)`} />
            <circle cx="48" cy="53" r="2.5" fill="#78350f" />
          </g>
        )}
        {name === 'process' && (
          <g>
            {/* Clay clipboard with a half-done checklist */}
            <rect x="25" y="25" width="46" height="49" rx="9" fill={`url(#${uid}-clay-blue)`} />
            <rect x="31" y="32" width="34" height="36" rx="5" fill="#f8fafc" />
            <rect x="38" y="20" width="20" height="10" rx="5" fill={`url(#${uid}-clay-amber)`} />
            <rect x="42" y="22.5" width="8" height="2.5" rx="1.25" fill="#ffffff" fillOpacity="0.85" />
            <circle cx="38" cy="41" r="3.75" fill={`url(#${uid}-clay-mint)`} />
            <path d="M 36.3 41 L 37.6 42.3 L 39.9 39.8" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="38" cy="50" r="3.75" fill={`url(#${uid}-clay-mint)`} />
            <path d="M 36.3 50 L 37.6 51.3 L 39.9 48.8" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="38" cy="59" r="3.25" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="45" y="39.5" width="15" height="3" rx="1.5" fill="#94a3b8" />
            <rect x="45" y="48.5" width="12" height="3" rx="1.5" fill="#94a3b8" />
            <rect x="45" y="57.5" width="14" height="3" rx="1.5" fill={`url(#${uid}-clay-lavender)`} />
          </g>
        )}

        {name === 'leadership' && (
          <g>
            {/* Matte compass: guiding direction */}
            <circle cx="48" cy="48" r="24" fill={`url(#${uid}-clay-lavender)`} />
            <circle cx="48" cy="48" r="18" fill="#f8fafc" />
            <path d="M 48 33 L 54 48 L 48 45 L 42 48 Z" fill={`url(#${uid}-clay-coral)`} />
            <path d="M 48 63 L 54 48 L 48 51 L 42 48 Z" fill={`url(#${uid}-clay-blue)`} />
            <circle cx="48" cy="48" r="3.5" fill={`url(#${uid}-clay-amber)`} />
          </g>
        )}

        {name === 'platform' && (
          <g>
            {/* Stacked server blades + control-plane dial */}
            <rect x="21" y="25" width="54" height="19" rx="7" fill={`url(#${uid}-clay-blue)`} />
            <rect x="21" y="49" width="54" height="19" rx="7" fill={`url(#${uid}-clay-lavender)`} />
            <circle cx="31" cy="34.5" r="3.5" fill={`url(#${uid}-clay-mint)`} />
            <rect x="39" y="32.5" width="24" height="4" rx="2" fill="#ffffff" fillOpacity="0.7" />
            <circle cx="31" cy="58.5" r="3.5" fill={`url(#${uid}-clay-amber)`} />
            <rect x="39" y="56.5" width="18" height="4" rx="2" fill="#ffffff" fillOpacity="0.7" />
            <circle cx="65" cy="58.5" r="5" fill={`url(#${uid}-clay-mint)`} stroke="#ffffff" strokeWidth="1.5" />
          </g>
        )}

        {name === 'frontend' && (
          <g>
            {/* Browser window with overlapping UI cards */}
            <rect x="20" y="24" width="56" height="48" rx="9" fill={`url(#${uid}-clay-blue)`} />
            <rect x="25" y="36" width="46" height="31" rx="5" fill="#f8fafc" />
            <circle cx="28" cy="30" r="2" fill="#ffffff" fillOpacity="0.85" />
            <circle cx="34.5" cy="30" r="2" fill="#ffffff" fillOpacity="0.85" />
            <circle cx="41" cy="30" r="2" fill="#ffffff" fillOpacity="0.85" />
            <rect x="29" y="41" width="20" height="21" rx="4" fill={`url(#${uid}-clay-coral)`} />
            <rect x="52" y="41" width="15" height="9" rx="3.5" fill={`url(#${uid}-clay-amber)`} />
            <rect x="52" y="53" width="15" height="9" rx="3.5" fill={`url(#${uid}-clay-mint)`} />
          </g>
        )}

        {name === 'craft' && (
          <g>
            {/* Craftsman's square + precision mallet */}
            <path d="M 25 25 H 69 V 37 H 37 V 69 H 25 Z" fill={`url(#${uid}-clay-amber)`} stroke={`url(#${uid}-clay-amber)`} strokeWidth="4" strokeLinejoin="round" />
            <rect x="44" y="45" width="26" height="14" rx="5" transform="rotate(-35 57 52)" fill={`url(#${uid}-clay-blue)`} />
            <rect x="54" y="53" width="6" height="19" rx="3" transform="rotate(-35 57 62)" fill={`url(#${uid}-clay-coral)`} />
          </g>
        )}

        {name === 'communication' && (
          <g>
            {/* Two overlapping clay speech bubbles */}
            <rect x="20" y="25" width="42" height="30" rx="11" fill={`url(#${uid}-clay-blue)`} />
            <path d="M 27 52 L 24 62 L 36 54 Z" fill={`url(#${uid}-clay-blue)`} />
            <rect x="28" y="35" width="24" height="3.5" rx="1.75" fill="#ffffff" fillOpacity="0.85" />
            <rect x="28" y="42" width="16" height="3.5" rx="1.75" fill="#ffffff" fillOpacity="0.7" />
            <rect x="42" y="42" width="34" height="24" rx="10" fill={`url(#${uid}-clay-mint)`} />
            <path d="M 65 63 L 71 71 L 58 65 Z" fill={`url(#${uid}-clay-mint)`} />
            <circle cx="53" cy="54" r="2.5" fill="#ffffff" fillOpacity="0.9" />
            <circle cx="60" cy="54" r="2.5" fill="#ffffff" fillOpacity="0.9" />
            <circle cx="67" cy="54" r="2.5" fill={`url(#${uid}-clay-amber)`} />
          </g>
        )}

        {name === 'english' && (
          <g>
            {/* Open clay book with geometric "A" and bookmark */}
            <rect x="20" y="27" width="56" height="42" rx="8" fill={`url(#${uid}-clay-lavender)`} />
            <rect x="24" y="30" width="22" height="36" rx="4" fill="#f8fafc" />
            <rect x="50" y="30" width="22" height="36" rx="4" fill="#f8fafc" />
            <path d="M 31 54 L 35 41 L 39 54 M 32.5 50 H 37.5" fill="none" stroke={`url(#${uid}-clay-blue)`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="54" y="39" width="14" height="3.5" rx="1.75" fill="#94a3b8" />
            <rect x="54" y="46" width="11" height="3.5" rx="1.75" fill="#94a3b8" />
            <rect x="54" y="53" width="13" height="3.5" rx="1.75" fill={`url(#${uid}-clay-mint)`} />
            <path d="M 62 24 H 69 V 38 L 65.5 35 L 62 38 Z" fill={`url(#${uid}-clay-amber)`} />
          </g>
        )}

        {name === 'career' && (
          <g>
            {/* Ascending stepping stones + summit flag */}
            <rect x="22" y="56" width="16" height="14" rx="5" fill={`url(#${uid}-clay-mint)`} />
            <rect x="40" y="44" width="16" height="26" rx="5" fill={`url(#${uid}-clay-blue)`} />
            <rect x="58" y="32" width="16" height="38" rx="5" fill={`url(#${uid}-clay-amber)`} />
            <path d="M 66 32 V 19" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
            <path d="M 66 19 L 78 23.5 L 66 28 Z" fill={`url(#${uid}-clay-coral)`} />
          </g>
        )}

        {name === 'business' && (
          <g>
            {/* Rising bar chart + trend arrow */}
            <rect x="23" y="51" width="13" height="19" rx="5" fill={`url(#${uid}-clay-lavender)`} />
            <rect x="41.5" y="41" width="13" height="29" rx="5" fill={`url(#${uid}-clay-blue)`} />
            <rect x="60" y="30" width="13" height="40" rx="5" fill={`url(#${uid}-clay-mint)`} />
            <path d="M 24 41 L 42 30 L 53 34 L 70 21" fill="none" stroke={`url(#${uid}-clay-amber)`} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 62 20 H 71 V 29" fill="none" stroke={`url(#${uid}-clay-amber)`} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {name === 'build-ship' && (
          <g>
            {/* Clay rocket ship */}
            <path d="M 35 55 L 25 61 L 31 44 Z" fill={`url(#${uid}-clay-coral)`} />
            <path d="M 61 55 L 71 61 L 65 44 Z" fill={`url(#${uid}-clay-coral)`} />
            <path d="M 48 20 C 57 29 61 42 58 59 H 38 C 35 42 39 29 48 20 Z" fill={`url(#${uid}-clay-blue)`} />
            <circle cx="48" cy="40" r="6" fill="#f8fafc" stroke={`url(#${uid}-clay-mint)`} strokeWidth="2.5" />
            <path d="M 43 60 L 48 74 L 53 60 Z" fill={`url(#${uid}-clay-amber)`} />
          </g>
        )}

        {name === 'design-code' && (
          <g>
            {/* Clay code bracket frame + drafting pen */}
            <rect x="22" y="25" width="52" height="46" rx="11" fill={`url(#${uid}-clay-lavender)`} />
            <path d="M 39 41 L 31 48 L 39 55" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 57 41 L 65 48 L 57 55" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="51" y1="38" x2="45" y2="58" stroke={`url(#${uid}-clay-amber)`} strokeWidth="4.5" strokeLinecap="round" />
          </g>
        )}

        {name === 'secure' && (
          <g>
            {/* Clay shield with bright check badge */}
            <path d="M 48 21 L 71 30 V 47 C 71 62 60 71 48 76 C 36 71 25 62 25 47 V 30 Z" fill={`url(#${uid}-clay-mint)`} />
            <path d="M 38 48 L 45 55 L 59 40" fill="none" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="67" cy="64" r="9" fill={`url(#${uid}-clay-amber)`} />
            <circle cx="67" cy="64" r="3" fill="#ffffff" />
          </g>
        )}

        {name === 'work-grow' && (
          <g>
            {/* Clay potted sprout + warm sun */}
            <circle cx="66" cy="27" r="7" fill={`url(#${uid}-clay-amber)`} />
            <path d="M 48 53 V 34" fill="none" stroke={`url(#${uid}-clay-mint)`} strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="38" cy="36" rx="10" ry="6" transform="rotate(-24 38 36)" fill={`url(#${uid}-clay-mint)`} />
            <ellipse cx="58" cy="40" rx="9" ry="5.5" transform="rotate(22 58 40)" fill="#6ee7b7" />
            <path d="M 33 52 H 63 L 59 71 H 37 Z" fill={`url(#${uid}-clay-coral)`} stroke={`url(#${uid}-clay-coral)`} strokeWidth="3" strokeLinejoin="round" />
          </g>
        )}
      </g>
    </svg>
  );
}
