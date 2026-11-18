'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import { OfferFilters } from './OfferFilters'
import { categoryPun } from '@/lib/categoryPuns'

interface Category {
  id: string
  name: string
  slug: string
}

interface MobileFiltersProps {
  offerCount: number
  categories: Category[]
}

/**
 * Mobile : lien "Filtres" qui ouvre un panneau montant du bas (bottom sheet)
 * avec la categorie + les filtres existants (appliques en direct).
 */
export function MobileFilters({ offerCount, categories }: MobileFiltersProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSlug = searchParams.get('categorie')
  const activeCount = ['prixMax', 'reductionMin'].filter((k) => searchParams.get(k)).length

  // Panneau ouvert : page figee derriere, Echap pour fermer
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Changer de categorie en conservant les autres filtres
  function selectCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set('categorie', slug)
    else params.delete('categorie')
    const qs = params.toString()
    router.replace(qs ? `/offres?${qs}` : '/offres', { scroll: false })
  }

  const chip = (active: boolean) =>
    [
      'px-3.5 py-2 rounded-full text-sm border transition-colors',
      active ? 'bg-navy-800 border-navy-800 text-white' : 'border-[#e5e3de] text-gray-600 active:bg-gray-50',
    ].join(' ')

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-800 underline-offset-4 hover:underline"
      >
        <SlidersHorizontal className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
        Filtres
        {activeCount > 0 && (
          <span className="ml-0.5 min-w-5 h-5 px-1.5 rounded-full bg-gold-500 text-white text-[11px] font-semibold leading-5 text-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Filtres">
          {/* Fond */}
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px] animate-[fade-in_.2s_ease-out]" onClick={() => setOpen(false)} />

          {/* Panneau */}
          <div className="relative w-full max-h-[85svh] flex flex-col bg-white rounded-t-2xl shadow-2xl animate-[sheet-up_.28s_cubic-bezier(.2,.8,.3,1)] motion-reduce:animate-none">
            <div className="pt-2.5 pb-1 flex justify-center" aria-hidden="true">
              <span className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-6 pb-3 border-b border-[#e5e3de]">
              <h2 className="text-base font-bold text-navy-800">Filtres</h2>
              <button type="button" onClick={() => setOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600" aria-label="Fermer les filtres">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-7">
              {/* Categorie */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-3">Catégorie</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => selectCategory(null)} className={chip(!activeSlug)} aria-pressed={!activeSlug}>
                    Toutes
                  </button>
                  {categories.map((cat) => {
                    const entry = categoryPun(cat.slug)
                    const active = activeSlug === cat.slug
                    return (
                      <button key={cat.id} type="button" onClick={() => selectCategory(cat.slug)} className={chip(active)} aria-pressed={active}>
                        {entry?.pun ?? cat.name}
                        {entry && <span className={active ? 'ml-1.5 text-white/60 text-xs' : 'ml-1.5 text-gray-400 text-xs'}>{entry.category}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Filtres existants (prix, reduction) */}
              <OfferFilters offerCount={offerCount} />
            </div>

            <div className="px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[#e5e3de]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-sm bg-navy-800 text-white text-sm font-semibold hover:bg-navy-700 transition-colors"
              >
                Voir {offerCount} offre{offerCount > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
