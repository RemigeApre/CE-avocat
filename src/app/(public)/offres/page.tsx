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
    <div className="flex min-h-[calc(100vh-72px)]">

      {/* Sidebar filtres */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto border-r border-[#e5e3de] bg-white py-7 px-5">

        <h1 className="text-base font-bold text-navy-800 mb-0.5">
          {activeCategory ? activeCategory.name : 'Toutes les offres'}
        </h1>
        <p className="text-xs text-gray-400 mb-6">
          {offers.length} offre{offers.length > 1 ? 's' : ''}
        </p>

        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-3">
          Categories
        </p>

        <nav className="flex flex-col gap-0.5">
          <a
            href="/offres"
            className={[
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
              !categorie
                ? 'bg-navy-50 text-navy-800 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-navy-800',
            ].join(' ')}
          >
            <span className="text-base leading-none">◎</span>
            Tout
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/offres?categorie=${cat.slug}`}
              className={[
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                categorie === cat.slug
                  ? 'bg-navy-50 text-navy-800 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-navy-800',
              ].join(' ')}
            >
              {cat.icon && <span className="text-base leading-none">{cat.icon}</span>}
              {cat.name}
            </a>
          ))}
        </nav>
      </aside>

      {/* Grille d'offres */}
      <div className="flex-1 min-w-0 px-6 py-8">
        {/* Mobile : titre + filtres scrollables */}
        <div className="lg:hidden mb-6">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-navy-800 mb-0.5">
              {activeCategory ? activeCategory.name : 'Toutes les offres'}
            </h1>
            <p className="text-sm text-gray-400">
              {offers.length} offre{offers.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 scrollbar-hide">
            <a
              href="/offres"
              className={[
                'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
                !categorie ? 'bg-navy-800 text-white border-navy-800' : 'border-[#e5e3de] text-gray-600 hover:border-navy-800 hover:text-navy-800',
              ].join(' ')}
            >
              Tout
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/offres?categorie=${cat.slug}`}
                className={[
                  'shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
                  categorie === cat.slug ? 'bg-navy-800 text-white border-navy-800' : 'border-[#e5e3de] text-gray-600 hover:border-navy-800 hover:text-navy-800',
                ].join(' ')}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </a>
            ))}
          </div>
        </div>

        <OfferGrid offers={offers} emptyMessage="Aucune offre dans cette categorie pour le moment." />
      </div>

    </div>
  )
}
