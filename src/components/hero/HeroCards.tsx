'use client'

import { useState } from 'react'
import { LawyerGame } from '@/components/ui/LawyerGame'

const CARDS = [
  {
    label: 'Flagrant délice',
    slug: 'gastronomie',
    href: '/offres?categorie=gastronomie',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
  },
  {
    label: 'Culture',
    slug: 'culture',
    href: '/offres?categorie=culture',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
        <path d="M2 20h20M4 20V10l8-7 8 7v10"/><path d="M10 20v-5h4v5"/>
      </svg>
    ),
  },
  {
    label: 'Abandon de poste',
    slug: 'bien-etre',
    href: '/offres?categorie=bien-etre',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
        <path d="M12 22a1 1 0 0 1-1-1v-1H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4v1a1 1 0 0 1-1 1z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    label: 'Délit de fuite',
    slug: 'voyages',
    href: '/offres?categorie=voyages',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.49 12 19.79 19.79 0 0 1 1.44 3.4a2 2 0 0 1 1.98-2.19h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    label: 'Mise en liberté',
    slug: 'loisirs',
    href: '/offres?categorie=loisirs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    ),
  },
]

const ROTATIONS = ['-2deg', '1.5deg', '-1.5deg', '2deg', '-1deg', '1.5deg']

export function HeroCards() {
  const [gameOpen, setGameOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-2 gap-5">
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

      {/* Pop-up jeu */}
      {gameOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setGameOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg"
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
            <p className="text-xs text-gray-400 text-center mt-3">Espace ou clic pour sauter</p>
          </div>
        </div>
      )}
    </>
  )
}
