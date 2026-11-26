import { useId } from 'react';
import type { AssetSize, IllustrationName } from './types';

export interface IllustrationProps {
  name: IllustrationName;
  size?: AssetSize;
  title?: string;
  decorative?: boolean;
  className?: string;
}

const DEFAULT_TITLES: Record<IllustrationName, string> = {
  'hero-desk': 'Desk scene with learning objects',
  'review-empty': 'All flashcards reviewed',
  'not-found': 'Page not found compass',
  'lab-header': 'Hands-on lab flask and terminal',
  'radar-header': 'Personal tech radar',
};

/**
 * Soft 3D clay spot illustrations for key product surfaces.
 */
export function Illustration({
  name,
  size = 256,
  title,
  decorative = false,
  className,
}: IllustrationProps) {
  const uid = useId().replace(/:/g, '');
  const resolvedTitle = title ?? DEFAULT_TITLES[name];

  const a11yProps = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': resolvedTitle };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 160"
      width={size}
      height={Math.round((size * 160) / 240)}
      className={className}
      {...a11yProps}
    >
      {!decorative && <title>{resolvedTitle}</title>}
      <defs>
        <linearGradient id={`${uid}-surface`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--card, #ffffff)" />
          <stop offset="100%" stopColor="var(--muted, #f2f2f2)" />
        </linearGradient>
        <linearGradient id={`${uid}-blue`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="var(--primary, #0066CC)" />
        </linearGradient>
        <linearGradient id={`${uid}-amber`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${uid}-mint`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={`${uid}-lavender`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-15%" y="-15%" width="130%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>

      {name === 'hero-desk' && (
        <g>
          {/* Desk mat */}
          <rect
            x="22"
            y="108"
            width="196"
            height="34"
            rx="14"
            fill={`url(#${uid}-surface)`}
            stroke="var(--border, #ebebeb)"
            strokeWidth="1.5"
          />
          <g filter={`url(#${uid}-soft)`}>
            {/* Blueprint roll */}
            <rect x="36" y="72" width="54" height="32" rx="10" fill={`url(#${uid}-lavender)`} />
            <ellipse cx="42" cy="88" rx="5" ry="16" fill="#ede9fe" />
            <rect x="58" y="70" width="7" height="36" rx="3.5" fill={`url(#${uid}-amber)`} />
            {/* Container crate */}
            <rect x="96" y="58" width="48" height="46" rx="10" fill={`url(#${uid}-amber)`} />
            <rect x="103" y="72" width="7" height="22" rx="3.5" fill="#92400e" fillOpacity="0.3" />
            <rect x="116" y="72" width="7" height="22" rx="3.5" fill="#92400e" fillOpacity="0.3" />
            <rect x="129" y="72" width="7" height="22" rx="3.5" fill="#92400e" fillOpacity="0.3" />
            {/* Shield */}
            <path
              d="M 168 48 L 194 57 V 76 C 194 92 181 102 168 107 C 155 102 142 92 142 76 V 57 Z"
              fill={`url(#${uid}-mint)`}
            />
            <path d="M 159 77 L 166 84 L 178 70" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Floating wheel badge */}
            <circle cx="72" cy="44" r="16" fill="none" stroke={`url(#${uid}-blue)`} strokeWidth="6" />
            <circle cx="72" cy="44" r="5" fill="#dbeafe" />
          </g>
        </g>
      )}

      {name === 'review-empty' && (
        <g>
          <ellipse cx="120" cy="136" rx="68" ry="8" fill="#000000" fillOpacity="0.08" />
          <g filter={`url(#${uid}-soft)`}>
            <rect x="58" y="46" width="124" height="78" rx="18" transform="rotate(-5 120 85)" fill="var(--muted, #f2f2f2)" stroke="var(--border, #ebebeb)" />
            <rect x="58" y="40" width="124" height="78" rx="18" fill={`url(#${uid}-surface)`} stroke="var(--border, #ebebeb)" strokeWidth="1.5" />
            <circle cx="120" cy="79" r="22" fill={`url(#${uid}-mint)`} />
            <path d="M 110 79 L 117 86 L 131 71" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="176" cy="42" r="10" fill={`url(#${uid}-amber)`} />
          </g>
        </g>
      )}

      {name === 'not-found' && (
        <g>
          <ellipse cx="120" cy="138" rx="56" ry="7" fill="#000000" fillOpacity="0.08" />
          <path d="M 48 118 Q 84 96 120 114 T 192 104" fill="none" stroke="var(--border, #ebebeb)" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
          <g filter={`url(#${uid}-soft)`}>
            <rect x="76" y="30" width="88" height="88" rx="24" transform="rotate(-6 120 74)" fill={`url(#${uid}-surface)`} stroke="var(--border, #ebebeb)" strokeWidth="1.5" />
            <circle cx="120" cy="74" r="28" fill={`url(#${uid}-blue)`} />
            <polygon points="120,54 127,74 120,94 113,74" fill="#ffffff" transform="rotate(30 120 74)" />
            <circle cx="120" cy="74" r="4.5" fill={`url(#${uid}-amber)`} />
          </g>
        </g>
      )}

      {name === 'lab-header' && (
        <g>
          <ellipse cx="120" cy="136" rx="64" ry="8" fill="#000000" fillOpacity="0.08" />
          <g filter={`url(#${uid}-soft)`}>
            {/* Terminal card */}
            <rect x="44" y="42" width="108" height="74" rx="16" fill={`url(#${uid}-surface)`} stroke="var(--border, #ebebeb)" strokeWidth="1.5" />
            <circle cx="60" cy="56" r="3.5" fill="#f97316" />
            <circle cx="71" cy="56" r="3.5" fill="#fbbf24" />
            <circle cx="82" cy="56" r="3.5" fill="#10b981" />
            <path d="M 58 76 L 68 82 L 58 88 M 74 88 H 104" fill="none" stroke="var(--primary, #0066CC)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Flask */}
            <path d="M 156 44 H 176 L 172 68 L 192 108 A 10 10 0 0 1 183 122 H 149 A 10 10 0 0 1 140 108 L 160 68 Z" fill={`url(#${uid}-mint)`} />
            <circle cx="166" cy="30" r="6" fill={`url(#${uid}-amber)`} />
            <circle cx="178" cy="20" r="4" fill="#93c5fd" />
          </g>
        </g>
      )}

      {name === 'radar-header' && (
        <g>
          <ellipse cx="120" cy="138" rx="60" ry="7" fill="#000000" fillOpacity="0.08" />
          <g filter={`url(#${uid}-soft)`}>
            <circle cx="120" cy="80" r="56" fill={`url(#${uid}-surface)`} stroke="var(--border, #ebebeb)" strokeWidth="1.5" />
            <circle cx="120" cy="80" r="40" fill="none" stroke="var(--primary, #0066CC)" strokeOpacity="0.22" strokeWidth="2" />
            <circle cx="120" cy="80" r="22" fill="none" stroke="var(--primary, #0066CC)" strokeOpacity="0.35" strokeWidth="2" />
            <path d="M 120 80 L 166 48 A 56 56 0 0 1 174 96 Z" fill="var(--primary, #0066CC)" fillOpacity="0.16" />
            <circle cx="120" cy="80" r="7" fill={`url(#${uid}-blue)`} />
            <circle cx="148" cy="58" r="6" fill={`url(#${uid}-mint)`} />
            <circle cx="96" cy="64" r="5" fill={`url(#${uid}-amber)`} />
            <circle cx="136" cy="108" r="5" fill={`url(#${uid}-lavender)`} />
          </g>
        </g>
      )}
    </svg>
  );
}
