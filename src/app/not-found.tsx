import Link from 'next/link'

export const metadata = { title: 'Page introuvable' }

export default function NotFound() {
  return (
    <main id="contenu" className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600 mb-3">Erreur 404</p>
        <h1 className="text-3xl font-bold text-navy-800">Pièce introuvable au dossier</h1>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          Cette page n’existe pas ou a été déplacée.
        </p>
        <Link href="/" className="mt-8 inline-flex items-center justify-center rounded-md bg-navy-800 hover:bg-navy-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors">
          Retour à l’accueil
        </Link>
      </div>
    </main>
  )
}
