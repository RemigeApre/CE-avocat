'use client'

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useDialog } from '@/lib/useDialog'
import { UtensilsCrossed, Drama, Flower2, Plane, FerrisWheel, Gift } from 'lucide-react'
import { FlipCard } from '@/components/ui/FlipCard'
import { Carousel } from '@/components/ui/Carousel'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'

// Le mini-jeu (moteur + classement) n'est telecharge qu'a l'ouverture de sa fenetre
const GamePanel = dynamic(() => import('@/components/game/GamePanel').then((m) => m.GamePanel), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[340/480] max-w-[340px] mx-auto rounded-lg border border-[#e5e3de] bg-[#e8e6e0] flex items-center justify-center text-sm text-gray-500">
      Chargement du jeu…
    </div>
  ),
})
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
  /**
   * rail (defaut) : colonne / grille du hero desktop.
   * carousel      : rangee balayable avec pastilles (mobile, sous les partenaires).
   */
  variant?: 'rail' | 'carousel'
}

export function HeroCards({ counts, variant = 'rail' }: HeroCardsProps) {
  const [gameOpen, setGameOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Lien partage "A vous de jouer" (/?jeu=1) : ouvre le jeu. Deux instances existent (desktop / mobile) :
  // seule celle qui est visible reagit, puis le parametre est retire de l'adresse.
  const surpriseRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('jeu') !== '1' || surpriseRef.current?.offsetParent == null) return
    setGameOpen(true)
    url.searchParams.delete('jeu')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  }, [])

  // Jeu ouvert : focus piege dans la fenetre, Echap pour fermer, page figee, focus rendu a la carte Surprise
  const gamePanelRef = useRef<HTMLDivElement>(null)
  const closeGame = useCallback(() => setGameOpen(false), [])
  useDialog(gameOpen, gamePanelRef, closeGame)

  const modal = gameOpen && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4 touch-manipulation"
      onClick={() => setGameOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Mini-jeu Le Maître en cavale"
    >
      <div
        ref={gamePanelRef}
        className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-sm max-h-full overflow-y-auto select-none touch-manipulation [-webkit-touch-callout:none]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-0.5">Mini-jeu</p>
            <h2 className="text-base font-bold text-navy-800">Le Maître en cavale</h2>
          </div>
          <button
            onClick={() => setGameOpen(false)}
            className="p-2 -mr-1 sm:p-1.5 sm:mr-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M6 18L18 6"/>
            </svg>
          </button>
        </div>
        <GamePanel />
      </div>
    </div>
  )

  const cards = [
    ...CARDS.map((card, i) => {
      const count = counts[card.slug] ?? 0
      return (
        <FlipCard
          key={card.slug}
          {...CARD_PROPS}
          className={CARD_PROPS.className}
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
    }),

    /* Carte mystère : pas de verso, un clic ouvre directement le mini-jeu */
    <div key="surprise" ref={surpriseRef} className={CARD_PROPS.className} style={{ rotate: ROTATIONS[5] }}>
      <button
        type="button"
        onClick={() => setGameOpen(true)}
        aria-label="Surprise : ouvrir le mini-jeu"
        className={`${CARD_PROPS.frontClassName} h-full w-full flex flex-col items-center justify-center gap-3 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500 focus-visible:outline-offset-2`}
      >
        <Gift className={`${ICON_CLASS} text-navy-700`} strokeWidth={ICON_STROKE} aria-hidden="true" />
        <span className="text-[11px] font-semibold text-navy-600 text-center leading-tight px-3">Surprise</span>
      </button>
    </div>,
  ]

  return (
    <>
      {variant === 'carousel' ? (
        <Carousel itemWidth="108px" label="Nos catégories">{cards}</Carousel>
      ) : (
        /* 1 colonne sous 2xl (rail defilant), 2 colonnes au-dessus */
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">{cards}</div>
      )}

      {mounted && createPortal(modal, document.body)}
    </>
  )
}
