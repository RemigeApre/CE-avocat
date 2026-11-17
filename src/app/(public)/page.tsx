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
    <svg viewBox="0 0 400 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="0" y="152" width="400" height="13" rx="6.5" fill="#1b2d5a" />
      <circle cx="140" cy="158" r="72" stroke="#1b2d5a" strokeWidth="4" />
      <circle cx="140" cy="158" r="44" stroke="#1b2d5a" strokeWidth="3" />
      <circle cx="140" cy="158" r="20" fill="#1b2d5a" />
      <rect x="133" y="230" width="14" height="470" rx="7" fill="#1b2d5a" />
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
      {/* Hero + marquee = exactement le viewport moins le header */}
      <section
        className="flex flex-col overflow-hidden bg-white"
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        {/* Zone principale */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">

          {/* Pivot - coupe par le bord gauche */}
          <div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.18]"
            style={{ left: '-140px', width: '400px', height: '700px' }}
          >
            <PivotDecoration />
          </div>

          {/* Contenu centré */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-navy-800 leading-[1.05] mb-8">
              Profitez de chaque avantage
            </h1>

            {/* Categories + compteur fusionnes */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {HIGHLIGHTS.map((h) => (
                <span
                  key={h}
                  className="px-5 py-2 rounded-full border border-navy-200 text-navy-700 font-medium text-sm"
                >
                  {h}
                </span>
              ))}
              <span className="px-5 py-2 rounded-full bg-gold-50 border border-gold-300 text-gold-700 font-semibold text-sm">
                {offerCount} offres
              </span>
            </div>

            <Link href="/login">
              <Button
                size="lg"
                className="px-12 py-4 text-base h-auto rounded-full"
              >
                Se connecter
              </Button>
            </Link>
          </div>
        </div>

        {/* Partenaires - dans le hero, visible sans scroll */}
        <div className="border-t border-[#e5e3de] bg-[#f7f6f3] py-5 overflow-hidden shrink-0">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4">
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
