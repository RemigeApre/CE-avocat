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

export default async function HomePage() {
  const [offers, categories] = await Promise.all([getFeaturedOffers(), getCategories()])

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-4">
              Comite d'entreprise
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
              Vos avantages,<br />
              <span className="text-gold-400">rien que pour vous</span>
            </h1>
            <p className="text-navy-200 text-lg leading-relaxed mb-8">
              Restauration, sport, culture, voyages... Profitez des offres negociees
              par votre CE aupres de partenaires selectionnes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/offres">
                <Button size="lg" variant="secondary">Voir toutes les offres</Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Creer mon compte
                </Button>
              </Link>
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
