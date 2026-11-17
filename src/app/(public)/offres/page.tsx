import { prisma } from '@/lib/db'
import { OfferGrid } from '@/components/offers/OfferGrid'
import type { OfferWithRelations } from '@/types'

interface Props {
  searchParams: Promise<{ categorie?: string }>
}

async function getOffers(categorySlug?: string): Promise<OfferWithRelations[]> {
  const offers = await prisma.offer.findMany({
    where: {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: { createdAt: 'desc' },
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

export default async function OffresPage({ searchParams }: Props) {
  const { categorie } = await searchParams
  const [offers, categories] = await Promise.all([getOffers(categorie), getCategories()])

  const activeCategory = categories.find((c) => c.slug === categorie)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800 mb-1">
          {activeCategory ? activeCategory.name : 'Toutes les offres'}
        </h1>
        <p className="text-sm text-gray-500">
          {offers.length} offre{offers.length > 1 ? 's' : ''} disponible{offers.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="/offres"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            !categorie
              ? 'bg-navy-800 text-white border-navy-800'
              : 'border-[#e5e3de] text-gray-600 hover:border-navy-800 hover:text-navy-800'
          }`}
        >
          Tout
        </a>
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/offres?categorie=${cat.slug}`}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              categorie === cat.slug
                ? 'bg-navy-800 text-white border-navy-800'
                : 'border-[#e5e3de] text-gray-600 hover:border-navy-800 hover:text-navy-800'
            }`}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.name}
          </a>
        ))}
      </div>

      <OfferGrid offers={offers} emptyMessage="Aucune offre dans cette categorie pour le moment." />
    </div>
  )
}
