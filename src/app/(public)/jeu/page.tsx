import type { Metadata } from 'next'
import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'
import { cardQuery, formatMeters, parseCardParams } from '@/lib/gameCard'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

// Page ouverte depuis un lien partage : affiche la carte de score, et invite a jouer
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const card = parseCardParams(await searchParams)
  const title = `${card.name || 'Quelqu’un'} a atteint ${formatMeters(card.score)} au Maître en cavale`
  const image = `/api/game/card?${cardQuery(card)}`
  return {
    title,
    description: 'Le mini-jeu de Maître en Pause : sautez de dossier en dossier, évitez les amendes et les huissiers. Saurez-vous faire mieux ?',
    robots: { index: false }, // une page par score : inutile de l'indexer
    openGraph: { title, images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, images: [image] },
  }
}

export default async function JeuPage({ searchParams }: Props) {
  const card = parseCardParams(await searchParams)
  const title = `${card.name || 'Quelqu’un'} a atteint ${formatMeters(card.score)}`

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-700 mb-3">Le Maître en cavale</p>
      <h1 className="text-2xl md:text-3xl font-bold text-navy-800">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">Saurez-vous faire mieux ?</p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/game/card?${cardQuery(card)}`}
        alt={`Carte de score : ${title} au Maître en cavale`}
        width={1200}
        height={630}
        className="mt-8 w-full h-auto rounded-xl shadow-xl"
      />

      <Link
        href="/?jeu=1"
        className="mt-8 inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-md bg-gold-500 hover:bg-gold-400 px-8 py-3 text-sm font-semibold text-navy-900 transition-colors"
      >
        <Gamepad2 className="w-4 h-4" aria-hidden="true" />
        À vous de jouer
      </Link>
    </div>
  )
}
