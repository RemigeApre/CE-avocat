'use client'

import { useRef } from 'react'
import { Avocado } from '@/components/ui/Avocado'

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
        aria-label="Précédent"
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
          <Avocado className="w-32 h-[166px]" />
          <p className="text-sm font-semibold text-navy-800">Avocat</p>
        </div>
      </div>

    </div>
  )
}
