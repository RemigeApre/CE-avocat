'use client'

import { useEffect } from 'react'
import Link from 'next/link'

// Erreur inattendue dans une page : message clair + nouvel essai, sans exposer de details techniques
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <main id="contenu" className="min-h-[60vh] flex items-center justify-center bg-white px-6 py-16">
      <div className="text-center max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600 mb-3">Suspension d’audience</p>
        <h1 className="text-3xl font-bold text-navy-800">Un incident est survenu</h1>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          La page n’a pas pu s’afficher. Réessayez dans un instant.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={reset} className="rounded-md bg-navy-800 hover:bg-navy-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors">
            Réessayer
          </button>
          <Link href="/" className="rounded-md border border-navy-800 px-6 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50 transition-colors">
            Retour à l’accueil
          </Link>
        </div>
        {error.digest && <p className="mt-6 text-xs text-gray-500">Référence : {error.digest}</p>}
      </div>
    </main>
  )
}
