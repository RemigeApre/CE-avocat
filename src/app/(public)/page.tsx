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

            {/* Cartes collectibles - absolues a gauche, hors flux */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden 2xl:grid grid-cols-2 gap-3">
              {HIGHLIGHTS.map((h, i) => {
                const rotations = ['-2deg', '1.5deg', '-1.5deg', '2deg', '-1deg', '1.5deg']
                const icons = [
                  // Voyages - avion
                  <svg key="v" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.49 12 19.79 19.79 0 0 1 1.44 3.4a2 2 0 0 1 1.98-2.19h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
                  // Vacances - soleil
                  <svg key="va" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-7 h-7"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
                  // Restaurants - couverts
                  <svg key="r" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
                  // Experiences - etoile
                  <svg key="e" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                  // Sports - eclair
                  <svg key="s" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                  // Arts & Culture - note de musique
                  <svg key="a" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
                ]
                return (
                  <div
                    key={h}
                    className="w-[88px] h-[124px] bg-white border border-navy-100 rounded-[4px] flex flex-col items-center justify-center gap-2 transition-transform duration-200 hover:scale-105"
                    style={{
                      rotate: rotations[i],
                      boxShadow: '0 4px 18px rgba(27,45,90,0.11), 0 1px 4px rgba(27,45,90,0.07)',
                    }}
                  >
                    <div className="text-navy-700">{icons[i]}</div>
                    <span className="text-[10px] font-semibold text-navy-600 text-center leading-tight px-2">{h}</span>
                  </div>
                )
              })}
            </div>

            {/* Texte + CTA - non affectes par les cartes */}
            <div className="max-w-5xl mx-auto px-8 w-full">
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
