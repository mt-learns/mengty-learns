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
          {/* Desk slab */}
          <rect
            x="14"
            y="116"
            width="212"
            height="30"
            rx="14"
            fill={`url(#${uid}-surface)`}
            stroke="var(--border, #ebebeb)"
            strokeWidth="1.5"
          />
          <path d="M 30 117.5 H 210" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" />

          {/* Contact shadows */}
          <g fill="#000000" fillOpacity="0.08">
            <ellipse cx="68" cy="118" rx="46" ry="4" />
            <ellipse cx="134" cy="118" rx="26" ry="3.5" />
            <ellipse cx="200" cy="117" rx="24" ry="3.5" />
            <ellipse cx="168" cy="118" rx="22" ry="3" />
          </g>

          <g filter={`url(#${uid}-soft)`}>
            {/* Kubernetes helm wheel badge */}
            <g transform="translate(148 44)">
              <g stroke={`url(#${uid}-blue)`} strokeWidth="3.8" strokeLinecap="round">
                <line x1="4.16" y1="1.72" x2="22.17" y2="9.18" />
                <line x1="1.72" y1="4.16" x2="9.18" y2="22.17" />
                <line x1="-1.72" y1="4.16" x2="-9.18" y2="22.17" />
                <line x1="-4.16" y1="1.72" x2="-22.17" y2="9.18" />
                <line x1="-4.16" y1="-1.72" x2="-22.17" y2="-9.18" />
                <line x1="-1.72" y1="-4.16" x2="-9.18" y2="-22.17" />
                <line x1="1.72" y1="-4.16" x2="9.18" y2="-22.17" />
                <line x1="4.16" y1="-1.72" x2="22.17" y2="-9.18" />
              </g>
              <circle cx="0" cy="0" r="15" fill="none" stroke={`url(#${uid}-blue)`} strokeWidth="4.5" />
              <path d="M -13 -7.5 A 15 15 0 0 1 7.5 -13" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.8" strokeLinecap="round" />
              <g fill="#93c5fd">
                <circle cx="24.02" cy="9.95" r="3" />
                <circle cx="9.95" cy="24.02" r="3" />
                <circle cx="-9.95" cy="24.02" r="3" />
                <circle cx="-24.02" cy="9.95" r="3" />
                <circle cx="-24.02" cy="-9.95" r="3" />
                <circle cx="-9.95" cy="-24.02" r="3" />
                <circle cx="9.95" cy="-24.02" r="3" />
                <circle cx="24.02" cy="-9.95" r="3" />
              </g>
              <circle cx="0" cy="0" r="5" fill="#dbeafe" stroke="var(--primary, #0066CC)" strokeWidth="1.8" />
            </g>

            {/* Container crate */}
            <rect x="112" y="74" width="44" height="42" rx="9" fill={`url(#${uid}-amber)`} />
            <rect x="112" y="74" width="44" height="10" rx="5" fill="#fef3c7" fillOpacity="0.55" />
            <rect x="119" y="88" width="7" height="24" rx="3.5" fill="#92400e" fillOpacity="0.3" />
            <rect x="131" y="88" width="7" height="24" rx="3.5" fill="#92400e" fillOpacity="0.3" />
            <rect x="143" y="88" width="7" height="24" rx="3.5" fill="#92400e" fillOpacity="0.3" />

            {/* Laptop / terminal */}
            <rect x="26" y="104" width="84" height="12" rx="6" fill={`url(#${uid}-surface)`} stroke="var(--border, #ebebeb)" strokeWidth="1.5" />
            <rect x="30" y="52" width="76" height="56" rx="9" fill={`url(#${uid}-surface)`} stroke="var(--border, #ebebeb)" strokeWidth="1.5" />
            <rect x="35" y="57" width="66" height="46" rx="5" fill="#1e293b" />
            <circle cx="42" cy="64" r="2" fill="#f97316" />
            <circle cx="49" cy="64" r="2" fill="#fbbf24" />
            <circle cx="56" cy="64" r="2" fill="#10b981" />
            <rect x="41" y="72" width="34" height="3" rx="1.5" fill="#93c5fd" />
            <rect x="41" y="79" width="48" height="3" rx="1.5" fill="#6ee7b7" />
            <rect x="41" y="86" width="26" height="3" rx="1.5" fill="#fde68a" />
            <rect x="41" y="93" width="40" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.28" />

            {/* Security shield */}
            <path
              d="M 200 52 L 220 60 V 76 C 220 89 210 97 200 101 C 190 97 180 89 180 76 V 60 Z"
              fill={`url(#${uid}-mint)`}
            />
            <path d="M 191 76 L 198 83 L 211 69" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Notebook stack */}
            <rect x="152" y="100" width="34" height="8" rx="4" fill={`url(#${uid}-lavender)`} />
            <rect x="156" y="92" width="26" height="8" rx="4" fill={`url(#${uid}-amber)`} />
            <rect x="159" y="94.5" width="20" height="1.6" rx="0.8" fill="#ffffff" fillOpacity="0.7" />

            {/* Pencil */}
            <g transform="rotate(-14 70 112)">
              <rect x="48" y="109" width="44" height="6" rx="3" fill={`url(#${uid}-amber)`} />
              <path d="M 48 109 L 42 112 L 48 115 Z" fill="#fde68a" />
              <rect x="80" y="109" width="12" height="6" rx="2" fill="#d97706" />
            </g>
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
