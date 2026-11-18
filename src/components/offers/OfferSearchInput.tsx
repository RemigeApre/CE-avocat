'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

/** Champ de recherche de la page Offres : met a jour ?q= pendant la frappe (conserve categorie et filtres) */
export function OfferSearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    const t = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (q.trim()) params.set('q', q.trim())
      else params.delete('q')
      const qs = params.toString()
      router.replace(qs ? `/offres?${qs}` : '/offres', { scroll: false })
    }, 300)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on ne relance que sur la frappe
  }, [q])

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
      <label htmlFor="offer-search" className="sr-only">Rechercher une offre par titre, partenaire ou description</label>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" aria-hidden="true" />
      <input
        id="offer-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher une offre, un partenaire…"
        enterKeyHint="search"
        className="w-full h-11 pl-10 pr-10 rounded-md border border-[#e5e3de] bg-white text-base sm:text-sm text-navy-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-transparent [&::-webkit-search-cancel-button]:hidden"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ('')}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-navy-800 rounded-md"
          aria-label="Effacer la recherche"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </form>
  )
}
