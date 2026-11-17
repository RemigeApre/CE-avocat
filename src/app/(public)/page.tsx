import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui'
import { OfferGrid } from '@/components/offers/OfferGrid'
import type { OfferWithRelations } from '@/types'

async function getFeaturedOffers(): Promise<OfferWithRelations[]> {
  const offers = await prisma.offer.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: {
      partner: { select: { id: true, name: true, slug: true, logo: true } },
      category: { select: { id: true, name: true, slug: true, icon: true } },
    },
  })
  return offers as unknown as OfferWithRelations[]
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, icon: true },
  })
}

async function getOfferCount() {
  return prisma.offer.count({ where: { isActive: true } })
}

const HIGHLIGHTS = [
  { label: 'Voyages' },
  { label: 'Vacances' },
  { label: 'Restaurants' },
  { label: 'Experiences' },
  { label: 'Sports' },
  { label: 'Arts & Culture' },
]

function ScalesIcon() {
  return (
    <svg viewBox="0 0 320 420" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Base */}
      <rect x="148" y="358" width="24" height="44" rx="4" />
      <rect x="96" y="394" width="128" height="14" rx="7" />

      {/* Column */}
      <rect x="156" y="78" width="8" height="284" rx="4" />

      {/* Top pivot */}
      <circle cx="160" cy="68" r="14" />

      {/* Beam */}
      <rect x="20" y="60" width="280" height="10" rx="5" />

      {/* Left chain */}
      <rect x="48" y="70" width="4" height="110" rx="2" />

      {/* Left pan */}
      <rect x="10" y="178" width="84" height="6" rx="3" />
      <path d="M 10 184 Q 52 206 94 184" strokeWidth="0" />

      {/* Right chain */}
      <rect x="268" y="70" width="4" height="110" rx="2" />

      {/* Right pan */}
      <rect x="226" y="178" width="84" height="6" rx="3" />
      <path d="M 226 184 Q 268 206 310 184" strokeWidth="0" />
    </svg>
  )
}

export default async function HomePage() {
  const [offers, categories, offerCount] = await Promise.all([
    getFeaturedOffers(),
    getCategories(),
    getOfferCount(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen bg-navy-800 text-white flex items-center overflow-hidden">
        {/* Balance de justice en fond */}
        <div className="absolute right-[-4rem] top-1/2 -translate-y-1/2 w-[520px] h-[520px] text-gold-400 opacity-10 pointer-events-none select-none">
          <ScalesIcon />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-24 w-full">
          <div className="max-w-2xl">
            <p className="text-gold-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
              Comite d'entreprise
            </p>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-8">
              Profitez de<br />
              <span className="text-gold-400">chaque avantage</span>
            </h1>

            {/* Categories highlights */}
            <div className="flex flex-wrap gap-2 mb-10">
              {HIGHLIGHTS.map((h) => (
                <span
                  key={h.label}
                  className="px-4 py-1.5 rounded-full text-sm font-medium border border-white/20 text-white/80"
                >
                  {h.label}
                </span>
              ))}
            </div>

            {/* CTA + compteur */}
            <div className="flex items-center gap-8">
              <Link href="/login">
                <Button size="lg" variant="secondary">Se connecter</Button>
              </Link>
              <div>
                <div className="text-4xl font-bold text-gold-400 leading-none">{offerCount}</div>
                <div className="text-navy-200 text-sm mt-1">offres disponibles</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-white border-b border-[#e5e3de]">
          <div className="max-w-7xl mx-auto px-6 py-4 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              <Link
                href="/offres"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-navy-800 text-white shrink-0"
              >
                Tout voir
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/offres?categorie=${cat.slug}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-[#e5e3de] text-gray-600 hover:border-navy-800 hover:text-navy-800 transition-colors shrink-0"
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Offres en vedette */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-navy-800">Dernieres offres</h2>
          <Link href="/offres" className="text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors">
            Tout voir
          </Link>
        </div>
        <OfferGrid offers={offers} emptyMessage="Aucune offre disponible pour le moment." />
      </section>
    </>
  )
}
