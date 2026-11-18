'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Search, X } from 'lucide-react'
import { useDialog } from '@/lib/useDialog'
import { formatPrice } from '@/lib/utils'

interface Result {
  id: string
  title: string
  partner: string
  category: string
  price: number
  discount: number | null
}

/**
 * Bouton "Rechercher" du header + fenetre de recherche instantanee (Ctrl/Cmd + K).
 * Mobile : plein ecran ; desktop : panneau centre. Navigation au clavier (fleches, Entree).
 */
export function SearchButton({ variant }: { variant: 'desktop' | 'mobile' }) {
  const [open, setOpen] = useState(false)

  // Raccourci global Ctrl/Cmd + K (un seul bouton l'ecoute : la version desktop, toujours montee)
  useEffect(() => {
    if (variant !== 'desktop') return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [variant])

  return (
    <>
      {variant === 'desktop' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hidden md:inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          aria-haspopup="dialog"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          <span className="hidden lg:inline">Rechercher</span>
          <kbd className="hidden xl:inline rounded border border-white/20 px-1.5 text-[10px] font-sans text-white/50">Ctrl K</kbd>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
          aria-label="Rechercher une offre"
          aria-haspopup="dialog"
        >
          <Search className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
      {open && createPortal(<SearchDialog onClose={() => setOpen(false)} />, document.body)}
    </>
  )
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(-1)

  useDialog(true, panelRef, onClose)

  // Recherche avec un leger delai pendant la frappe
  useEffect(() => {
    const query = q.trim()
    if (query.length < 2) { setResults([]); setTotal(0); setLoading(false); return }
    setLoading(true)
    const ctrl = new AbortController()
    const t = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d: { total: number; results: Result[] }) => { setResults(d.results); setTotal(d.total); setActive(-1) })
        .catch(() => { /* requete annulee ou hors ligne */ })
        .finally(() => setLoading(false))
    }, 180)
    return () => { window.clearTimeout(t); ctrl.abort() }
  }, [q])

  const go = useCallback((href: string) => { onClose(); router.push(href) }, [onClose, router])
  const allHref = `/offres?q=${encodeURIComponent(q.trim())}`

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)) }
    else if (e.key === 'Enter' && q.trim().length >= 2) {
      e.preventDefault()
      go(active >= 0 && results[active] ? `/offres/${results[active].id}` : allHref)
    }
  }

  const query = q.trim()

  return (
    <div className="fixed inset-0 z-[60] md:flex md:items-start md:justify-center md:pt-[12vh] md:px-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px] hidden md:block" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Rechercher une offre"
        className="relative h-full md:h-auto w-full md:max-w-xl bg-white md:rounded-xl md:shadow-2xl flex flex-col md:max-h-[70vh] overflow-hidden"
      >
        {/* Champ */}
        <div className="flex items-center gap-3 px-4 md:px-5 h-16 border-b border-[#e5e3de] shrink-0 pt-[env(safe-area-inset-top)] box-content md:pt-0">
          <Search className="w-5 h-5 text-gray-500 shrink-0" aria-hidden="true" />
          <input
            data-autofocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Offre, partenaire, mot-clé…"
            aria-label="Rechercher une offre par titre, partenaire ou description"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            enterKeyHint="search"
            className="flex-1 min-w-0 h-full bg-transparent text-base text-navy-900 placeholder:text-gray-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          <button type="button" onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-navy-800 rounded-md" aria-label="Fermer la recherche">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Resultats */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <p className="sr-only" aria-live="polite">
            {query.length >= 2 && !loading ? `${total} résultat${total > 1 ? 's' : ''}` : ''}
          </p>

          {query.length < 2 ? (
            <p className="px-5 py-8 text-sm text-gray-500 text-center">
              Tapez au moins deux lettres : titre d&apos;offre, partenaire ou description.
            </p>
          ) : !loading && results.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500 text-center">
              Aucune offre ne correspond à « {query} ».
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Offres trouvées" className="py-2">
              {results.map((r, i) => (
                <li key={r.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <a
                    href={`/offres/${r.id}`}
                    onClick={(e) => { e.preventDefault(); go(`/offres/${r.id}`) }}
                    onMouseEnter={() => setActive(i)}
                    tabIndex={-1}
                    className={['flex items-center gap-3 px-4 md:px-5 py-3 transition-colors', i === active ? 'bg-navy-50' : 'hover:bg-gray-50'].join(' ')}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-800 truncate">{r.title}</p>
                      <p className="text-xs text-gray-500 truncate">{r.partner} · {r.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-navy-800">{formatPrice(r.price)}</p>
                      {r.discount && <p className="text-[11px] font-semibold text-gold-700">-{r.discount} %</p>}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tous les resultats */}
        {query.length >= 2 && total > 0 && (
          <div className="border-t border-[#e5e3de] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
            <a
              href={allHref}
              onClick={(e) => { e.preventDefault(); go(allHref) }}
              className="flex items-center justify-center gap-2 w-full rounded-md bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold py-2.5 transition-colors"
            >
              Voir {total > 1 ? `les ${total} résultats` : 'le résultat'}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
