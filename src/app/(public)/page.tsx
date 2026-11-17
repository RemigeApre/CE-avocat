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
  'Experiences',
  'Sports',
  'Arts & Culture',
]

function ScalesIllustration() {
  return (
    <svg viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="#fdf8ec" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="300" fill="url(#skyGrad)" />

      {/* Beam */}
      <rect x="228" y="58" width="744" height="10" rx="5" fill="#1b2d5a" />

      {/* Pivot */}
      <circle cx="600" cy="53" r="22" stroke="#1b2d5a" strokeWidth="3" />
      <circle cx="600" cy="53" r="11" fill="#1b2d5a" />

      {/* Column */}
      <rect x="594" y="75" width="12" height="192" rx="6" fill="#1b2d5a" />

      {/* Base */}
      <rect x="558" y="265" width="84" height="13" rx="4" fill="#1b2d5a" />
      <rect x="522" y="276" width="156" height="11" rx="4" fill="#1b2d5a" />
      <rect x="492" y="285" width="216" height="9" rx="3" fill="#c9a84c" />

      {/* Left chain */}
      <line x1="254" y1="68" x2="254" y2="224" stroke="#1b2d5a" strokeWidth="2.5" />
      <ellipse cx="254" cy="102" rx="5" ry="8" stroke="#1b2d5a" strokeWidth="1.5" />
      <ellipse cx="254" cy="134" rx="5" ry="8" stroke="#1b2d5a" strokeWidth="1.5" />
      <ellipse cx="254" cy="166" rx="5" ry="8" stroke="#1b2d5a" strokeWidth="1.5" />
      <ellipse cx="254" cy="198" rx="5" ry="8" stroke="#1b2d5a" strokeWidth="1.5" />

      {/* Left pan */}
      <ellipse cx="254" cy="240" rx="106" ry="16" stroke="#1b2d5a" strokeWidth="2.5" />
      <path d="M 148 240 Q 254 262 360 240" stroke="#1b2d5a" strokeWidth="1.5" />

      {/* Right chain */}
      <line x1="946" y1="68" x2="946" y2="224" stroke="#1b2d5a" strokeWidth="2.5" />
      <ellipse cx="946" cy="102" rx="5" ry="8" stroke="#1b2d5a" strokeWidth="1.5" />
      <ellipse cx="946" cy="134" rx="5" ry="8" stroke="#1b2d5a" strokeWidth="1.5" />
      <ellipse cx="946" cy="166" rx="5" ry="8" stroke="#1b2d5a" strokeWidth="1.5" />
      <ellipse cx="946" cy="198" rx="5" ry="8" stroke="#1b2d5a" strokeWidth="1.5" />

      {/* Right pan */}
      <ellipse cx="946" cy="240" rx="106" ry="16" stroke="#1b2d5a" strokeWidth="2.5" />
      <path d="M 840 240 Q 946 262 1052 240" stroke="#1b2d5a" strokeWidth="1.5" />
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

  const marqueeItems = partners.length > 0 ? partners : HIGHLIGHTS.map((h, i) => ({ id: String(i), name: h, logo: null }))
  const doubled = [...marqueeItems, ...marqueeItems]

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen bg-white flex flex-col overflow-hidden">
        {/* Text content */}
        <div className="flex flex-col items-center text-center px-6 pt-24 pb-10 z-10">
          <p className="text-gold-600 text-xs font-semibold uppercase tracking-[0.2em] mb-6">
            Comite d'entreprise
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold text-navy-800 leading-[1.05] mb-8 max-w-4xl">
            Profitez de chaque avantage.
          </h1>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {HIGHLIGHTS.map((h) => (
              <span
                key={h}
                className="px-4 py-1.5 rounded-full text-sm font-medium border border-navy-200 text-navy-600"
              >
                {h}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-8">
            <Link href="/login">
              <Button size="lg">Se connecter &rarr;</Button>
            </Link>
            <div className="text-left">
              <div className="text-4xl font-bold text-gold-500 leading-none">{offerCount}</div>
              <div className="text-gray-400 text-sm mt-1">offres disponibles</div>
            </div>
          </div>
        </div>

        {/* Illustration */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <ScalesIllustration />
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
                <img src={p.logo} alt={p.name} className="h-6 object-contain" />
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
