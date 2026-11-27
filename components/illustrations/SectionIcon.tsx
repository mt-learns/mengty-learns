import { useId } from 'react';
import type { AssetSize, SectionIconName } from './types';

export interface SectionIconProps {
  name: SectionIconName;
  size?: AssetSize;
  title?: string;
  decorative?: boolean;
  className?: string;
}

const DEFAULT_TITLES: Record<SectionIconName, string> = {
  foundations: 'Foundations section icon',
  containers: 'Containers section icon',
  kubernetes: 'Kubernetes section icon',
  iac: 'Infrastructure as Code section icon',
  'ci-cd': 'CI/CD section icon',
  gitops: 'GitOps section icon',
  design: 'Design patterns section icon',
  architecture: 'Architecture section icon',
  security: 'Security section icon',
  process: 'Process section icon',
};

const SECTION_TINTS: Record<SectionIconName, { glow: string; rim: string }> = {
  foundations: { glow: 'var(--primary, #0F766E)', rim: '#5EEAD4' },
  containers: { glow: '#f59e0b', rim: '#fbbf24' },
  kubernetes: { glow: 'var(--primary, #0F766E)', rim: '#2DD4BF' },
  iac: { glow: '#8b5cf6', rim: '#a78bfa' },
  'ci-cd': { glow: '#f97316', rim: '#fb923c' },
  gitops: { glow: '#10b981', rim: '#34d399' },
  design: { glow: '#ec4899', rim: '#f472b6' },
  architecture: { glow: '#6366f1', rim: '#818cf8' },
  security: { glow: '#10b981', rim: '#34d399' },
  process: { glow: '#0ea5e9', rim: '#38bdf8' },
};

/**
 * Soft 3D clay app-icon squircle for each of the 10 learning sections.
 */
export function SectionIcon({
  name,
  size = 48,
  title,
  decorative = false,
  className,
}: SectionIconProps) {
  const uid = useId().replace(/:/g, '');
  const resolvedTitle = title ?? DEFAULT_TITLES[name];
  const tint = SECTION_TINTS[name];

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
      </g>
    </svg>
  );
}
