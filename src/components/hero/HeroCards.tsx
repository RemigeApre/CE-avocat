'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { UtensilsCrossed, Drama, Flower2, Plane, FerrisWheel, Gift } from 'lucide-react'
import { FlipCard } from '@/components/ui/FlipCard'
import { createPortal } from 'react-dom'
import { LawyerGame } from '@/components/ui/LawyerGame'
import { CATEGORY_PUNS, categoryHref, type CategoryPunSlug } from '@/lib/categoryPuns'

// Icone par categorie (Lucide) ; libelles et slugs viennent de CATEGORY_PUNS
const ICON_CLASS = 'w-9 h-9'
const ICON_STROKE = 1.5
const ICONS: Record<CategoryPunSlug, ReactNode> = {
  gastronomie: <UtensilsCrossed className={ICON_CLASS} strokeWidth={ICON_STROKE} aria-hidden="true" />,
  culture: <Drama className={ICON_CLASS} strokeWidth={ICON_STROKE} aria-hidden="true" />,
  'bien-etre': <Flower2 className={ICON_CLASS} strokeWidth={ICON_STROKE} aria-hidden="true" />,
  voyages: <Plane className={ICON_CLASS} strokeWidth={ICON_STROKE} aria-hidden="true" />,
  loisirs: <FerrisWheel className={ICON_CLASS} strokeWidth={ICON_STROKE} aria-hidden="true" />,
}

const CARDS = CATEGORY_PUNS.map(({ pun, slug }) => ({
  label: pun,
  slug,
  href: categoryHref(slug),
  icon: ICONS[slug],
}))

const ROTATIONS = ['-2deg', '1.5deg', '-1.5deg', '2deg', '-1deg', '1.5deg']

// Apparence commune des deux faces d'une carte du hero
const FACE = 'rounded-[4px] border shadow-[0_6px_24px_rgba(27,45,90,0.14),0_2px_6px_rgba(27,45,90,0.08)]'
const CARD_PROPS = {
  className: 'w-[108px] h-[152px] transition-transform duration-200 hover:scale-105',
  frontClassName: `${FACE} bg-white border-navy-100`,
  backClassName: `${FACE} bg-navy-800 border-navy-700`,
}

const plural = (n: number) => `offre${n > 1 ? 's' : ''}`

const ACTION_CLASS = 'pointer-events-auto mt-3 inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2'

interface HeroCardsProps {
  /** Nombre d'offres actives par slug de categorie */
  counts: Record<string, number>
  /** Nombre total d'offres actives (verso de la carte Surprise) */
  total: number
}

export function HeroCards({ counts, total }: HeroCardsProps) {
  const [gameOpen, setGameOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const modal = gameOpen && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => setGameOpen(false)}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-0.5">Mini-jeu</p>
            <h2 className="text-base font-bold text-navy-800">Le Maître en cavale</h2>
          </div>
          <button
            onClick={() => setGameOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M6 6l12 12M6 18L18 6"/>
            </svg>
          </button>
        </div>
        <LawyerGame />
        <p className="text-xs text-gray-400 text-center mt-3">← → ou clic gauche / droit pour se déplacer</p>
      </div>
    </div>
  )

  return (
    <>
      {/* 1 colonne sous 2xl (rail defilant), 2 colonnes au-dessus */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
        {CARDS.map((card, i) => {
          const count = counts[card.slug] ?? 0
          return (
            <FlipCard
              key={card.slug}
              {...CARD_PROPS}
              style={{ rotate: ROTATIONS[i] }}
              label={card.label}
              flipLabel={`${card.label} : voir le nombre d'offres`}
              front={
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <div className="text-navy-700">{card.icon}</div>
                  <span className="text-[11px] font-semibold text-navy-600 text-center leading-tight px-3">{card.label}</span>
                </div>
              }
              back={
                <div className="h-full flex flex-col items-center justify-center px-2 text-center">
                  <span className="text-3xl font-bold text-gold-400 leading-none tabular-nums">{count}</span>
                  <span className="mt-1 text-[11px] text-white/70">{plural(count)}</span>
                  <a href={card.href} className={ACTION_CLASS}>Voir</a>
                </div>
              }
            />
          )
        })}

        {/* Carte mystère : verso = total des offres + acces au mini-jeu */}
        <FlipCard
          {...CARD_PROPS}
          style={{ rotate: ROTATIONS[5] }}
          label="Surprise"
          front={
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Gift className={`${ICON_CLASS} text-navy-700`} strokeWidth={ICON_STROKE} aria-hidden="true" />
              <span className="text-[11px] font-semibold text-navy-600 text-center leading-tight px-3">Surprise</span>
            </div>
          }
          back={
            <div className="h-full flex flex-col items-center justify-center px-2 text-center">
              <span className="text-3xl font-bold text-gold-400 leading-none tabular-nums">{total}</span>
              <span className="mt-1 text-[11px] text-white/70">{plural(total)} au total</span>
              <button type="button" onClick={() => setGameOpen(true)} className={ACTION_CLASS}>
                Jouer <span aria-hidden="true">▶</span>
              </button>
            </div>
          }
        />
      </div>

      {mounted && createPortal(modal, document.body)}
    </>
  )
}
