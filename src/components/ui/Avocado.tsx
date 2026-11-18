// L'avocat (le fruit) mascotte, volontairement un peu moche : yeux asymetriques, bouche tordue.
// Meme dessin de base que sur la page Evolutions, decline en plusieurs emotions.

import type { ReactNode } from 'react'

export type AvocadoEmotion = 'neutral' | 'curious' | 'focused' | 'hesitant' | 'delighted'

const GREEN = '#4a7c59'
const GREEN_DARK = '#3d6b4a'
const FLESH = '#d4e8a0'
const PIT = '#c9a84c'
const INK = '#1a1a2e'

interface AvocadoProps {
  emotion?: AvocadoEmotion
  className?: string
  /** Texte alternatif ; si absent, le dessin est decoratif (aria-hidden) */
  title?: string
}

export function Avocado({ emotion = 'neutral', className, title }: AvocadoProps) {
  return (
    <svg
      viewBox="0 0 120 156"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}

      {/* Decor derriere (confettis, point d'interrogation...) */}
      {EXTRAS_BEHIND[emotion]}

      {/* Corps commun */}
      <ellipse cx="60" cy="90" rx="38" ry="52" fill={GREEN} />
      <ellipse cx="60" cy="45" rx="22" ry="30" fill={GREEN_DARK} />
      <ellipse cx="60" cy="88" rx="30" ry="42" fill={FLESH} />
      <ellipse cx="60" cy="100" rx="16" ry="22" fill={PIT} />
      {/* Petites jambes ridicules */}
      <rect x="46" y="138" width="10" height="14" rx="4" fill={GREEN} transform="rotate(10,51,145)" />
      <rect x="66" y="138" width="10" height="14" rx="4" fill={GREEN} transform="rotate(-8,71,145)" />

      {/* Visage + bras selon l'emotion */}
      {FACES[emotion]}
    </svg>
  )
}

const arm = (x1: number, y1: number, x2: number, y2: number) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={GREEN} strokeWidth="8" strokeLinecap="round" />
)

const EXTRAS_BEHIND: Record<AvocadoEmotion, ReactNode> = {
  neutral: null,
  curious: null,
  focused: null,
  hesitant: (
    <g fill={PIT} fontWeight="700" fontFamily="system-ui, sans-serif">
      <text x="88" y="30" fontSize="26">?</text>
      <text x="102" y="16" fontSize="14" opacity="0.7">?</text>
    </g>
  ),
  delighted: (
    <g>
      <rect x="14" y="20" width="6" height="3" rx="1" fill={PIT} transform="rotate(-25,17,21)" />
      <rect x="30" y="6" width="5" height="3" rx="1" fill="#e57373" transform="rotate(30,32,7)" />
      <rect x="84" y="8" width="6" height="3" rx="1" fill="#8ecae6" transform="rotate(-15,87,9)" />
      <rect x="100" y="26" width="5" height="3" rx="1" fill={PIT} transform="rotate(40,102,27)" />
      <circle cx="22" cy="40" r="2" fill="#8ecae6" />
      <circle cx="96" cy="44" r="2" fill="#e57373" />
      <circle cx="58" cy="4" r="1.8" fill={PIT} />
    </g>
  ),
}

const FACES: Record<AvocadoEmotion, ReactNode> = {
  // Version d'origine (page Evolutions)
  neutral: (
    <g>
      <circle cx="48" cy="78" r="9" fill="white" />
      <circle cx="74" cy="72" r="7" fill="white" />
      <circle cx="50" cy="80" r="4" fill={INK} />
      <circle cx="75" cy="73" r="3.5" fill={INK} />
      <circle cx="51" cy="79" r="1.5" fill="white" />
      <circle cx="76" cy="72" r="1" fill="white" />
      <line x1="42" y1="67" x2="56" y2="71" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="68" y1="62" x2="80" y2="65" stroke={INK} strokeWidth="2.5" strokeLinecap="round" transform="rotate(-8,74,63)" />
      <path d="M 48 95 Q 55 90 65 96 Q 70 99 75 94" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      {arm(22, 88, 38, 95)}
      {arm(82, 92, 98, 84)}
    </g>
  ),

  // 01 - Curieux / enthousiaste : sourcil leve, grand sourire, il fait coucou
  curious: (
    <g>
      <circle cx="48" cy="78" r="9.5" fill="white" />
      <circle cx="74" cy="71" r="8" fill="white" />
      <circle cx="50" cy="77" r="4.2" fill={INK} />
      <circle cx="76" cy="70" r="3.8" fill={INK} />
      <circle cx="51.5" cy="75.5" r="1.6" fill="white" />
      <circle cx="77.2" cy="68.8" r="1.2" fill="white" />
      <line x1="41" y1="66" x2="55" y2="68" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 66 58 Q 74 51 82 56" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 47 92 Q 61 106 76 89 Q 61 97 47 92 Z" fill={INK} />
      {arm(22, 88, 38, 95)}
      {arm(84, 88, 102, 64)}
      {/* traits de mouvement de la main */}
      <path d="M 108 56 Q 112 62 110 68" stroke={PIT} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M 96 54 Q 100 50 106 50" stroke={PIT} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
    </g>
  ),

  // 02 - Concentre / un peu stresse : sourcils fronces, goutte de sueur, il tient son justificatif
  focused: (
    <g>
      <ellipse cx="48" cy="79" rx="9" ry="6" fill="white" />
      <ellipse cx="74" cy="73" rx="7" ry="5" fill="white" />
      <circle cx="50" cy="80.5" r="3.5" fill={INK} />
      <circle cx="76" cy="74.5" r="3" fill={INK} />
      <line x1="40" y1="69" x2="55" y2="74" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      <line x1="67" y1="68" x2="81" y2="62" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 50 96 Q 55 93 60 96 Q 65 99 72 95" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* goutte de sueur */}
      <path d="M 90 44 Q 85 53 90 57 Q 95 53 90 44 Z" fill="#8ecae6" />
      {arm(22, 88, 38, 95)}
      {arm(88, 100, 84, 112)}
      {/* justificatif (carte pro) */}
      <g transform="rotate(-8,86,118)">
        <rect x="72" y="104" width="28" height="30" rx="2" fill="white" stroke={INK} strokeWidth="1.5" />
        <line x1="77" y1="112" x2="95" y2="112" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="77" y1="118" x2="92" y2="118" stroke={INK} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <line x1="77" y1="123" x2="94" y2="123" stroke={INK} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <circle cx="93" cy="128" r="3" fill={PIT} />
      </g>
    </g>
  ),

  // 03 - Hesitant : regard en l'air, bouche en zigzag, main au menton
  hesitant: (
    <g>
      <circle cx="48" cy="78" r="9" fill="white" />
      <circle cx="74" cy="72" r="7" fill="white" />
      <circle cx="52" cy="74.5" r="4" fill={INK} />
      <circle cx="77" cy="68.5" r="3.5" fill={INK} />
      <circle cx="53" cy="73.5" r="1.4" fill="white" />
      <path d="M 40 66 Q 47 60 56 64" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <line x1="68" y1="63" x2="81" y2="63" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 50 97 L 55 94 L 60 98 L 65 94 L 70 98 L 74 95" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 24 92 Q 30 112 48 104" stroke={GREEN} strokeWidth="8" fill="none" strokeLinecap="round" />
      {arm(82, 92, 98, 84)}
    </g>
  ),

  // 04 - Ravi : yeux plisses de joie, joues roses, bouche grande ouverte, bras en l'air
  delighted: (
    <g>
      <path d="M 40 79 Q 48 69 56 79" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 67 73 Q 74 64 81 73" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="39" cy="89" rx="5" ry="3" fill="#f4a3a3" opacity="0.75" />
      <ellipse cx="85" cy="83" rx="4.5" ry="2.8" fill="#f4a3a3" opacity="0.75" />
      <path d="M 46 89 Q 60 114 77 86 Z" fill={INK} />
      <ellipse cx="62" cy="99" rx="6" ry="3.5" fill="#e57373" />
      {arm(26, 80, 12, 56)}
      {arm(94, 76, 108, 54)}
    </g>
  ),
}
