import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui'
import { OfferGrid } from '@/components/offers/OfferGrid'
import { cn } from '@/lib/utils'
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
  const groupItems = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems]

  return (
    <>
      {/* Hero + marquee = exactement le viewport moins le header */}
      <section
        className="flex flex-col overflow-hidden bg-white"
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        {/* Zone principale */}
        <div className="relative flex-1 overflow-hidden">

          {/* Image droite - habillage, rien par dessus */}
          <div className="absolute right-0 top-0 h-full w-[44%] pointer-events-none select-none">
            {/* Fondu blanc a gauche */}
            <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-white to-transparent z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Sans titre.png"
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>

          {/* Contenu principal */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-5xl mx-auto px-8 w-full flex items-center gap-12">

              {/* Cartes collectibles - gauche du flux */}
              <div className="hidden xl:grid grid-cols-2 gap-3 shrink-0">
                {HIGHLIGHTS.map((h, i) => {
                  const rotations = ['-2deg', '1.5deg', '-1.5deg', '2deg', '-1deg', '1.5deg']
                  return (
                    <div
                      key={h}
                      className={cn(
                        'w-[86px] h-[122px] bg-white border border-navy-100',
                        'rounded-[4px] flex flex-col overflow-hidden',
                        'transition-transform duration-200 hover:scale-105',
                      )}
                      style={{
                        rotate: rotations[i],
                        boxShadow: '0 4px 18px rgba(27,45,90,0.13), 0 1px 4px rgba(27,45,90,0.08)',
                      }}
                    >
                      <div className="h-1 bg-gold-400 shrink-0" />
                      <div className="flex-1 flex items-center justify-center px-2 text-center">
                        <span className="text-[11px] font-semibold text-navy-700 leading-tight">{h}</span>
                      </div>
                      <div className="h-1 bg-navy-100 shrink-0" />
                    </div>
                  )
                })}
              </div>

              {/* Titre + CTA */}
              <div className="max-w-lg">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-navy-800 leading-[1.05] mb-10">
                  Profitez de chaque avantage
                </h1>
                <div className="flex items-center gap-8">
                  <Link href="/login">
                    <Button size="lg" className="px-10 py-3 h-auto rounded-sm">
                      Se connecter
                    </Button>
                  </Link>
                  <div>
                    <span className="text-4xl font-bold text-gold-500 leading-none">{offerCount}</span>
                    <span className="block text-xs text-gray-400 mt-0.5 uppercase tracking-wider">offres disponibles</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Partenaires - dans le hero, visible sans scroll */}
        <div className="border-t border-[#e5e3de] bg-[#f7f6f3] py-5 shrink-0">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-navy-800">
              Partenaires
            </p>
            <div className="h-px w-8 bg-gold-400" />
          </div>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f7f6f3] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f7f6f3] to-transparent z-10 pointer-events-none" />
            <div className="animate-marquee">
              <div className="marquee-group">
                {groupItems.map((p, i) => (
                  <span key={`a-${i}`} className="inline-flex items-center mx-10 text-navy-800 font-medium text-sm opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
                    {p.logo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.logo} alt={p.name} className="h-7 w-auto object-contain" />
                      : p.name}
                  </span>
                ))}
              </div>
              <div className="marquee-group" aria-hidden="true">
                {groupItems.map((p, i) => (
                  <span key={`b-${i}`} className="inline-flex items-center mx-10 text-navy-800 font-medium text-sm opacity-60 whitespace-nowrap">
                    {p.logo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.logo} alt={p.name} className="h-7 w-auto object-contain" />
                      : p.name}
                  </span>
                ))}
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
