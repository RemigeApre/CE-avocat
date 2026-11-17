'use client'

import { useRef } from 'react'

interface Item {
  id: string
  title: string
  description: string
  icon: string
}

interface Props {
  items: Item[]
}

export function EvolutionsCarousel({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  function scroll(direction: 'left' | 'right') {
    if (!ref.current) return
    ref.current.scrollBy({ left: direction === 'left' ? -600 : 600, behavior: 'smooth' })
  }

  return (
    <div className="relative">

      {/* Bouton gauche */}
      <button
        onClick={() => scroll('left')}
        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white border border-[#e5e3de] rounded-full shadow-sm hover:border-navy-300 hover:shadow-md transition-all"
        aria-label="Precedent"
      >
        <svg className="w-4 h-4 text-navy-800" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Bouton droit */}
      <button
        onClick={() => scroll('right')}
        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white border border-[#e5e3de] rounded-full shadow-sm hover:border-navy-300 hover:shadow-md transition-all"
        aria-label="Suivant"
      >
        <svg className="w-4 h-4 text-navy-800" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Piste de défilement */}
      <div
        ref={ref}
        className="flex gap-5 overflow-x-auto scrollbar-hide px-6 lg:px-20 pb-4 scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="shrink-0 w-72 bg-white border border-[#e5e3de] rounded-lg p-6 flex flex-col gap-4 hover:shadow-md hover:border-navy-200 transition-all"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="w-10 h-10 bg-[#f7f6f3] border border-[#e5e3de] flex items-center justify-center rounded-md">
              <span className="text-navy-800 text-lg leading-none">{item.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-navy-800 mb-2 leading-snug">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}

        {/* Carte avocat-fruit */}
        <div
          className="shrink-0 w-72 bg-white border border-[#e5e3de] rounded-lg p-6 flex flex-col items-center justify-center gap-3"
          style={{ scrollSnapAlign: 'start' }}
        >
          <svg viewBox="0 0 120 150" className="w-32 h-40" xmlns="http://www.w3.org/2000/svg">
            {/* corps avocat (fruit) */}
            <ellipse cx="60" cy="90" rx="38" ry="52" fill="#4a7c59" />
            {/* bosse du haut */}
            <ellipse cx="60" cy="45" rx="22" ry="30" fill="#3d6b4a" />
            {/* noyau */}
            <ellipse cx="60" cy="100" rx="18" ry="24" fill="#c9a84c" />
            {/* chair intérieure */}
            <ellipse cx="60" cy="88" rx="30" ry="42" fill="#d4e8a0" />
            {/* noyau sur chair */}
            <ellipse cx="60" cy="100" rx="16" ry="22" fill="#c9a84c" />
            {/* yeux asymétriques moches */}
            <circle cx="48" cy="78" r="9" fill="white" />
            <circle cx="74" cy="72" r="7" fill="white" />
            <circle cx="50" cy="80" r="4" fill="#1a1a2e" />
            <circle cx="75" cy="73" r="3.5" fill="#1a1a2e" />
            {/* pupilles pas alignées */}
            <circle cx="51" cy="79" r="1.5" fill="white" />
            <circle cx="76" cy="72" r="1" fill="white" />
            {/* sourcils moches pas pareils */}
            <line x1="42" y1="67" x2="56" y2="71" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="68" y1="62" x2="80" y2="65" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-8,74,63)" />
            {/* bouche tordue */}
            <path d="M 48 95 Q 55 90 65 96 Q 70 99 75 94" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* petites jambes ridicules */}
            <rect x="46" y="138" width="10" height="14" rx="4" fill="#4a7c59" transform="rotate(10,51,145)" />
            <rect x="66" y="138" width="10" height="14" rx="4" fill="#4a7c59" transform="rotate(-8,71,145)" />
            {/* petits bras */}
            <line x1="22" y1="88" x2="38" y2="95" stroke="#4a7c59" strokeWidth="8" strokeLinecap="round" />
            <line x1="82" y1="92" x2="98" y2="84" stroke="#4a7c59" strokeWidth="8" strokeLinecap="round" />
          </svg>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Et pourquoi pas un avocat (le fruit) ?<br />
            <span className="text-[10px] text-gray-300">Idée non retenue.</span>
          </p>
        </div>
      </div>

    </div>
  )
}
