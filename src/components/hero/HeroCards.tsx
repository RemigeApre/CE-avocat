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

export function HeroCards() {
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
        {CARDS.map((card, i) => (
          <a
            key={card.slug}
            href={card.href}
            className="w-[108px] h-[152px] bg-white border border-navy-100 rounded-[4px] flex flex-col items-center justify-center gap-3 transition-transform duration-200 hover:scale-105 no-underline"
            style={{
              rotate: ROTATIONS[i],
              boxShadow: '0 6px 24px rgba(27,45,90,0.14), 0 2px 6px rgba(27,45,90,0.08)',
            }}
          >
            <div className="text-navy-700">{card.icon}</div>
            <span className="text-[11px] font-semibold text-navy-600 text-center leading-tight px-3">{card.label}</span>
          </a>
        ))}

        {/* Carte mystère */}
        <button
          onClick={() => setGameOpen(true)}
          className="w-[108px] h-[152px] bg-white border border-navy-100 rounded-[4px] flex flex-col items-center justify-center gap-3 transition-transform duration-200 hover:scale-105 cursor-pointer"
          style={{
            rotate: ROTATIONS[5],
            boxShadow: '0 6px 24px rgba(27,45,90,0.14), 0 2px 6px rgba(27,45,90,0.08)',
          }}
        >
          <span className="text-4xl font-bold text-navy-200 leading-none select-none">?</span>
          <span className="text-[11px] font-semibold text-navy-300 text-center leading-tight px-3">Surprise</span>
        </button>
      </div>

      {mounted && createPortal(modal, document.body)}
    </>
  )
}
