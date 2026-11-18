'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useId } from 'react'

interface OfferFiltersProps {
  offerCount: number
}

const REDUCTION_OPTIONS = [
  { label: 'Toutes', value: '' },
  { label: '10% et +', value: '10' },
  { label: '20% et +', value: '20' },
  { label: '30% et +', value: '30' },
  { label: '50% et +', value: '50' },
]

export function OfferFilters({ offerCount }: OfferFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const uid = useId() // composant present deux fois (barre laterale + panneau mobile) : ids uniques

  const [prixMax, setPrixMax] = useState(searchParams.get('prixMax') ?? '')
  const [reductionMin, setReductionMin] = useState(searchParams.get('reductionMin') ?? '')

  function apply(newPrixMax: string, newReductionMin: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (newPrixMax) params.set('prixMax', newPrixMax)
    else params.delete('prixMax')
    if (newReductionMin) params.set('reductionMin', newReductionMin)
    else params.delete('reductionMin')
    router.replace(`/offres?${params.toString()}`)
  }

  function reset() {
    setPrixMax('')
    setReductionMin('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('prixMax')
    params.delete('reductionMin')
    router.replace(`/offres?${params.toString()}`)
  }

  const hasActiveFilters = !!(prixMax || reductionMin)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-1">
          {offerCount} offre{offerCount > 1 ? 's' : ''}
        </p>
        {hasActiveFilters && (
          <button
            onClick={reset}
            className="text-xs text-gold-600 hover:text-gold-700 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Prix maximum */}
      <div>
        <label htmlFor={`${uid}-prix`} className="block text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-3">
          Prix maximum
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`${uid}-prix`}
            type="number"
            inputMode="numeric"
            min="0"
            step="10"
            placeholder="ex. 100"
            value={prixMax}
            onChange={(e) => setPrixMax(e.target.value)}
            onBlur={() => apply(prixMax, reductionMin)}
            onKeyDown={(e) => e.key === 'Enter' && apply(prixMax, reductionMin)}
            className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-transparent"
          />
          <span className="text-sm text-gray-400 shrink-0">EUR</span>
        </div>
      </div>

      {/* Reduction minimale */}
      <div>
        <p id={`${uid}-reduction`} className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-3">
          Réduction
        </p>
        <div className="flex flex-col gap-1" role="group" aria-labelledby={`${uid}-reduction`}>
          {REDUCTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              aria-pressed={reductionMin === opt.value}
              onClick={() => {
                setReductionMin(opt.value)
                apply(prixMax, opt.value)
              }}
              className={[
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left',
                reductionMin === opt.value
                  ? 'bg-navy-50 text-navy-800 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-navy-800',
              ].join(' ')}
            >
              {reductionMin === opt.value && (
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
              )}
              {reductionMin !== opt.value && (
                <span className="w-1.5 h-1.5 shrink-0" />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
