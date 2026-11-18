'use client'

import { useEffect, useId, useState } from 'react'
import { Check, ChevronDown, Copy, ExternalLink, Navigation } from 'lucide-react'

interface App {
  id: 'google' | 'apple' | 'waze'
  label: string
  url: (destination: string) => string
}

// Liens universels : ouvrent l'application si elle est installee, sinon sa version web
const APPS: App[] = [
  { id: 'google', label: 'Google Maps', url: (d) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(d)}` },
  { id: 'apple', label: 'Plans (Apple)', url: (d) => `https://maps.apple.com/?daddr=${encodeURIComponent(d)}` },
  { id: 'waze', label: 'Waze', url: (d) => `https://waze.com/ul?q=${encodeURIComponent(d)}&navigate=yes` },
]

/**
 * Bouton "S'y rendre" : deplie le choix de l'application d'itineraire (et de l'adresse s'il y en a plusieurs).
 * Le panneau s'ouvre dans la carte, sous le bouton : fiable sur telephone comme sur ordinateur.
 */
export function DirectionsButton({ destinations }: { destinations: string[] }) {
  const uid = useId()
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [apps, setApps] = useState(APPS)

  // Sur iPhone / iPad / Mac, Plans en premier
  useEffect(() => {
    if (/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) {
      setApps([APPS[1], APPS[0], APPS[2]])
    }
  }, [])

  if (destinations.length === 0) return null
  const destination = destinations[index] ?? destinations[0]

  async function copy() {
    try { await navigator.clipboard.writeText(destination); setCopied(true); window.setTimeout(() => setCopied(false), 2000) } catch { /* */ }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-navy-800 hover:bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
      >
        <Navigation className="w-4 h-4" aria-hidden="true" />
        S’y rendre
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div id={`${uid}-panel`} className="mt-2 rounded-md border border-[#e5e3de] bg-white overflow-hidden">
          {destinations.length > 1 && (
            <fieldset className="px-3 pt-3 pb-2 border-b border-[#f0eee9]">
              <legend className="sr-only">Adresse de destination</legend>
              <p className="text-xs font-semibold text-gray-500 mb-1.5" aria-hidden="true">Destination</p>
              <div className="space-y-1">
                {destinations.map((d, i) => (
                  <label key={d} className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name={`${uid}-dest`}
                      checked={i === index}
                      onChange={() => setIndex(i)}
                      className="mt-1 accent-navy-800"
                    />
                    {d}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <ul className="py-1">
            {apps.map((app) => (
              <li key={app.id}>
                <a
                  href={app.url(destination)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-3 py-3 text-sm font-medium text-navy-800 hover:bg-gray-50"
                >
                  {app.label}
                  <ExternalLink className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  <span className="sr-only">(s’ouvre dans une nouvelle fenêtre)</span>
                </a>
              </li>
            ))}
            <li className="border-t border-[#f0eee9]">
              <button type="button" onClick={copy} className="w-full flex items-center justify-between gap-3 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50">
                <span aria-live="polite">{copied ? 'Adresse copiée' : 'Copier l’adresse'}</span>
                {copied ? <Check className="w-4 h-4 text-gold-600" aria-hidden="true" /> : <Copy className="w-4 h-4 text-gray-400" aria-hidden="true" />}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
