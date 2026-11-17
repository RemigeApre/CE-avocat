'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Passer à true quand des cookies de tracking seront ajoutés au site
const COOKIES_ENABLED = false

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!COOKIES_ENABLED) return
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  if (!COOKIES_ENABLED || !visible) return null

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function refuse() {
    localStorage.setItem('cookie-consent', 'refused')
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-900 border-t border-navy-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-sm text-navy-200 leading-relaxed max-w-2xl">
          Ce site utilise des cookies pour améliorer votre expérience.{' '}
          <Link href="/politique-confidentialite" className="text-gold-400 underline hover:text-gold-300">
            En savoir plus
          </Link>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={refuse}
            className="text-sm text-navy-300 hover:text-white transition-colors px-4 py-2 border border-navy-600 hover:border-navy-400 rounded-sm"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="text-sm font-medium bg-gold-500 hover:bg-gold-400 text-white px-5 py-2 rounded-sm transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
