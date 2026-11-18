'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { LawyerGame } from '@/components/ui/LawyerGame'
import { CATEGORY_PUNS, categoryHref, type CategoryPunSlug } from '@/lib/categoryPuns'

// Icone par categorie ; libelles et slugs viennent de CATEGORY_PUNS
const ICONS: Record<CategoryPunSlug, ReactNode> = {
  'gastronomie': (
    // Couteau + fourchette
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6h3v7"/>
    </svg>
  ),
  'culture': (
    // Masques de théâtre
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
      <path d="M2 10s3-3 3-8h14c0 5 3 8 3 8"/><path d="M6 17c.83.83 1.94 1 3 1s2.17-.17 3-1"/><path d="M13 17c.83.83 1.94 1 3 1s2.17-.17 3-1"/><path d="M2 10s0 8 7 8"/><path d="M22 10s0 8-7 8"/>
    </svg>
  ),
  'bien-etre': (
    // Lotus / fleur zen
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
      <path d="M12 22c0 0-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><path d="M12 22s-4-3-4-7c0-2.2 1.8-4 4-4s4 1.8 4 4c0 4-4 7-4 7z"/>
    </svg>
  ),
  'voyages': (
    // Avion
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2a.5.5 0 0 0-.3.8l1.6 1.6a1 1 0 0 0 .9.3l5-1 1.5 1.5-5.5 4.5a.5.5 0 0 0 0 .8l1.5 1.5a1 1 0 0 0 .9.3l4.5-1 1.5 1.5-1 5a1 1 0 0 0 .3.9l1.6 1.6a.5.5 0 0 0 .8-.3z"/>
    </svg>
  ),
  'loisirs': (
    // Ticket / billet
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
    </svg>
  ),
}

const CARDS = CATEGORY_PUNS.map(({ pun, slug }) => ({
  label: pun,
  slug,
  href: categoryHref(slug),
  icon: ICONS[slug],
}))

const ROTATIONS = ['-2deg', '1.5deg', '-1.5deg', '2deg', '-1deg', '1.5deg']

const CARD_SHADOW = '0 6px 24px rgba(27,45,90,0.14), 0 2px 6px rgba(27,45,90,0.08)'
const FACE = 'absolute inset-0 backface-hidden rounded-[4px] border flex flex-col items-center justify-center'

const plural = (n: number) => `offre${n > 1 ? 's' : ''}`

interface FlipCardProps {
  rotation: string
  label: string
  flipped: boolean
  onToggle: () => void
  front: ReactNode
  /** Contenu du verso ; `action` est un element interactif pose au-dessus de la zone de retournement */
  back: ReactNode
  action: ReactNode
}

/**
 * Carte qui se retourne au clic (recto <-> verso).
 * Chaque face a son propre bouton plein cadre ; la face cachee est `inert`
 * pour ne pas etre atteignable au clavier ni par les lecteurs d'ecran.
 */
function FlipCard({ rotation, label, flipped, onToggle, front, back, action }: FlipCardProps) {
  return (
    <div
      className="w-[108px] h-[152px] perspective-800 transition-transform duration-200 hover:scale-105"
      style={{ rotate: rotation }}
    >
      <div
        className={`relative h-full w-full preserve-3d transition-transform duration-500 ease-[cubic-bezier(.2,.7,.3,1)] motion-reduce:transition-none ${flipped ? 'rotate-y-180' : ''}`}
      >
        {/* Recto */}
        <div className={`${FACE} bg-white border-navy-100`} style={{ boxShadow: CARD_SHADOW }} inert={flipped}>
          <button
            type="button"
            onClick={onToggle}
            aria-label={`${label} : voir le nombre d'offres`}
            className="absolute inset-0 rounded-[4px] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500 focus-visible:outline-offset-2"
          />
          <div className="pointer-events-none flex flex-col items-center gap-3">{front}</div>
        </div>

        {/* Verso */}
        <div className={`${FACE} rotate-y-180 bg-navy-800 border-navy-700`} style={{ boxShadow: CARD_SHADOW }} inert={!flipped}>
          <button
            type="button"
            onClick={onToggle}
            aria-label={`${label} : revenir au recto`}
            className="absolute inset-0 rounded-[4px] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500 focus-visible:outline-offset-2"
          />
          <div className="pointer-events-none flex flex-col items-center px-2 text-center">{back}</div>
          <div className="relative mt-3">{action}</div>
        </div>
      </div>
    </div>
  )
}

const ACTION_CLASS = 'inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-semibold text-navy-900 bg-gold-500 hover:bg-gold-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2'

interface HeroCardsProps {
  /** Nombre d'offres actives par slug de categorie */
  counts: Record<string, number>
  /** Nombre total d'offres actives (verso de la carte Surprise) */
  total: number
}

export function HeroCards({ counts, total }: HeroCardsProps) {
  const [gameOpen, setGameOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  // Cartes retournees, par cle (slug ou 'surprise') ; chacune se retourne independamment
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const toggle = (key: string) => setFlipped((f) => ({ ...f, [key]: !f[key] }))

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
              rotation={ROTATIONS[i]}
              label={card.label}
              flipped={!!flipped[card.slug]}
              onToggle={() => toggle(card.slug)}
              front={
                <>
                  <div className="text-navy-700">{card.icon}</div>
                  <span className="text-[11px] font-semibold text-navy-600 text-center leading-tight px-3">{card.label}</span>
                </>
              }
              back={
                <>
                  <span className="text-3xl font-bold text-gold-400 leading-none tabular-nums">{count}</span>
                  <span className="mt-1 text-[11px] text-white/70">{plural(count)}</span>
                </>
              }
              action={
                <a href={card.href} className={ACTION_CLASS}>
                  Voir
                </a>
              }
            />
          )
        })}

        {/* Carte mystère : verso = total des offres + acces au mini-jeu */}
        <FlipCard
          rotation={ROTATIONS[5]}
          label="Surprise"
          flipped={!!flipped.surprise}
          onToggle={() => toggle('surprise')}
          front={
            <>
              <span className="text-4xl font-bold text-navy-200 leading-none select-none">?</span>
              <span className="text-[11px] font-semibold text-navy-300 text-center leading-tight px-3">Surprise</span>
            </>
          }
          back={
            <>
              <span className="text-3xl font-bold text-gold-400 leading-none tabular-nums">{total}</span>
              <span className="mt-1 text-[11px] text-white/70">{plural(total)} au total</span>
            </>
          }
          action={
            <button type="button" onClick={() => setGameOpen(true)} className={ACTION_CLASS}>
              Jouer <span aria-hidden="true">▶</span>
            </button>
          }
        />
      </div>

      {mounted && createPortal(modal, document.body)}
    </>
  )
}
