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

async function getPartners() {
  return prisma.partner.findMany({
    select: { id: true, name: true, logo: true },
    orderBy: { name: 'asc' },
  })
}

const HIGHLIGHTS = [
  'Voyages',
  'Vacances',
  'Restaurants',
  'Expériences',
  'Sports',
  'Arts & Culture',
]

function PivotDecoration() {
  return (
    <svg viewBox="0 0 240 580" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Beam */}
      <rect x="0" y="82" width="240" height="10" rx="5" fill="#1b2d5a" />
      {/* Pivot rings */}
      <circle cx="120" cy="82" r="42" stroke="#1b2d5a" strokeWidth="3" />
      <circle cx="120" cy="82" r="24" stroke="#1b2d5a" strokeWidth="2" />
      <circle cx="120" cy="82" r="10" fill="#1b2d5a" />
      {/* Column */}
      <rect x="114" y="124" width="12" height="456" rx="6" fill="#1b2d5a" />
    </svg>
  )
}

export default async function HomePage() {
  const [offers, categories, offerCount, partners] = await Promise.all([
    getFeaturedOffers(),
    getCategories(),
    getOfferCount(),
    getPartners(),
  ])

  const marqueeItems = partners.length > 0
    ? partners
    : HIGHLIGHTS.map((h, i) => ({ id: String(i), name: h, logo: null as string | null }))
  const doubled = [...marqueeItems, ...marqueeItems]

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen bg-white flex items-center overflow-hidden">
        {/* Pivot de la balance - decoration gauche */}
        <div className="absolute left-[-48px] top-1/2 -translate-y-1/2 w-52 h-[520px] opacity-[0.13] pointer-events-none select-none">
          <PivotDecoration />
        </div>

        {/* Content - deux colonnes */}
        <div className="relative z-10 max-w-6xl mx-auto px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center py-24">
          {/* Colonne gauche : titre + CTA */}
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-bold text-navy-800 leading-[1.05] mb-10">
              Profitez de chaque avantage
            </h1>
            <Link href="/login">
              <Button size="lg">Se connecter</Button>
            </Link>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gold-500">{offerCount}</span>
              <span className="text-gray-400 text-sm ml-2">offres disponibles</span>
            </div>
          </div>

          {/* Colonne droite : categories */}
          <div className="flex flex-col items-start gap-3">
            {HIGHLIGHTS.map((h) => (
              <span
                key={h}
                className="px-6 py-2.5 rounded-full border border-navy-200 text-navy-700 font-medium text-base"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Partenaires marquee */}
      <section className="bg-[#f7f6f3] border-y border-[#e5e3de] py-8 overflow-hidden">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-6">
          Partenaires
        </p>
        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((p, i) => (
            <span
              key={i}
              className="inline-flex items-center mx-10 text-navy-800 font-medium text-sm opacity-60 hover:opacity-100 transition-opacity shrink-0"
            >
              {p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo} alt={p.name} className="h-7 w-auto object-contain" />
              ) : (
                p.name
              )}
            </span>
          ))}
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
