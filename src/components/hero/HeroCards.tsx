'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
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
  /**
   * rail (defaut) : colonne / grille du hero desktop.
   * carousel      : rangee balayable avec pastilles (mobile, sous les partenaires).
   */
  variant?: 'rail' | 'carousel'
}

const CARD_W = 108
const CAROUSEL_GAP = 16

export function HeroCards({ counts, variant = 'rail' }: HeroCardsProps) {
  const [gameOpen, setGameOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Jeu ouvert : page figee derriere, Echap pour fermer
  useEffect(() => {
    if (!gameOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setGameOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [gameOpen])

  const modal = gameOpen && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4"
      onClick={() => setGameOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Mini-jeu Le Maître en cavale"
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-sm max-h-full overflow-y-auto"
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
        <LawyerGame />
        {/* Consigne selon l'appareil : souris/clavier ou ecran tactile */}
        <p className="text-xs text-gray-400 text-center mt-3 [@media(pointer:coarse)]:hidden">← → ou clic gauche / droit pour se déplacer</p>
        <p className="text-xs text-gray-400 text-center mt-3 hidden [@media(pointer:coarse)]:block">Gardez le doigt à gauche ou à droite pour vous déplacer</p>
      </div>
    </div>
  )

  // En carrousel : chaque carte s'aligne au centre lors du balayage
  const itemClass = variant === 'carousel' ? 'snap-center shrink-0' : ''

  const cards = [
    ...CARDS.map((card, i) => {
      const count = counts[card.slug] ?? 0
      return (
        <FlipCard
          key={card.slug}
          {...CARD_PROPS}
          className={`${CARD_PROPS.className} ${itemClass}`}
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
    <div key="surprise" className={`${CARD_PROPS.className} ${itemClass}`} style={{ rotate: ROTATIONS[5] }}>
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
        <CardCarousel>{cards}</CardCarousel>
      ) : (
        /* 1 colonne sous 2xl (rail defilant), 2 colonnes au-dessus */
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">{cards}</div>
      )}

      {mounted && createPortal(modal, document.body)}
    </>
  )
}

/** Rangee balayable, cartes centrees (scroll-snap), pastilles de position cliquables */
function CardCarousel({ children }: { children: ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const pitch = CARD_W + CAROUSEL_GAP

  const onScroll = () => {
    const el = ref.current
    if (el) setActive(Math.max(0, Math.min(children.length - 1, Math.round(el.scrollLeft / pitch))))
  }
  const goTo = (i: number) => ref.current?.scrollTo({ left: i * pitch, behavior: 'smooth' })

  return (
    <div>
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-20px),transparent)]"
        // Marges laterales = premiere et derniere carte centrables
        style={{ gap: CAROUSEL_GAP, paddingInline: `calc(50% - ${CARD_W / 2}px)` }}
      >
        {children}
      </div>
      <div className="flex justify-center gap-1.5 mt-1">
        {children.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Carte ${i + 1} sur ${children.length}`}
            aria-current={i === active ? 'true' : undefined}
            className="p-1.5 -m-0.5"
          >
            <span className={`block h-1.5 rounded-full transition-all duration-200 ${i === active ? 'w-5 bg-gold-500' : 'w-1.5 bg-navy-200'}`} />
          </button>
        ))}
      </div>
    </div>
  )
}
