import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { OfferGrid } from '@/components/offers/OfferGrid'
import { CategorySubNav } from '@/components/offers/CategorySubNav'
import { OfferFilters } from '@/components/offers/OfferFilters'
import { getDiscountPercent } from '@/lib/utils'
import type { OfferWithRelations } from '@/types'

interface Props {
  searchParams: Promise<{ categorie?: string; prixMax?: string; reductionMin?: string }>
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, icon: true },
  })
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

export default async function OffresPage({ searchParams }: Props) {
  const { categorie, prixMax, reductionMin } = await searchParams

  const [offers, categories] = await Promise.all([
    getOffers(categorie),
    getCategories(),
  ])

  // Filtres JS (discount % non calculable proprement en SQL avec Prisma)
  const maxPrice = prixMax ? Number(prixMax) : undefined
  const minDiscount = reductionMin ? Number(reductionMin) : 0

  const filtered = offers.filter((o) => {
    if (maxPrice && Number(o.discountedPrice) > maxPrice) return false
    if (minDiscount > 0) {
      const disc = getDiscountPercent(Number(o.originalPrice), Number(o.discountedPrice))
      if (!Number.isFinite(disc) || disc < minDiscount) return false
    }
    return true
  })

  return (
    <>
      <CategorySubNav categories={categories} activeSlug={categorie} />

      <div className="flex min-h-[calc(100vh-72px-45px)]">

        {/* Sidebar filtres */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-[117px] h-[calc(100vh-117px)] overflow-y-auto border-r border-[#e5e3de] bg-white py-7 px-5">
          <Suspense fallback={null}>
            <OfferFilters offerCount={filtered.length} />
          </Suspense>
        </aside>

        {/* Grille */}
        <div className="flex-1 min-w-0 px-6 py-8">

          {/* Mobile : filtres condensés */}
          <div className="lg:hidden mb-5 flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {filtered.length} offre{filtered.length > 1 ? 's' : ''}
            </span>
          </div>

          <OfferGrid
            offers={filtered}
            emptyMessage="Aucune offre ne correspond a ces criteres."
          />
        </div>

      </div>
    </>
  )
}
