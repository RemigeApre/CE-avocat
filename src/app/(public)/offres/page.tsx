import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { OfferGrid } from '@/components/offers/OfferGrid'
import { CategorySubNav } from '@/components/offers/CategorySubNav'
import { OfferFilters } from '@/components/offers/OfferFilters'
import { MobileFilters } from '@/components/offers/MobileFilters'
import { categoryPun } from '@/lib/categoryPuns'
import { searchItems } from '@/lib/search'
import { OfferSearchInput } from '@/components/offers/OfferSearchInput'
import { getDiscountPercent } from '@/lib/utils'
import type { OfferWithRelations } from '@/types'

export const metadata = {
  title: 'Offres',
  description: 'Toutes les offres négociées pour les avocats : gastronomie, culture, bien-être, voyages et loisirs.',
}

interface Props {
  searchParams: Promise<{ categorie?: string; prixMax?: string; reductionMin?: string; q?: string }>
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
  const { categorie, prixMax, reductionMin, q } = await searchParams

  const [offers, categories] = await Promise.all([
    getOffers(categorie),
    getCategories(),
  ])

  // Filtres JS (discount % non calculable proprement en SQL avec Prisma)
  const maxPrice = prixMax ? Number(prixMax) : undefined
  const minDiscount = reductionMin ? Number(reductionMin) : 0

  const query = (q ?? '').slice(0, 80)
  const filtered = searchItems(offers, query).filter((o) => {
    if (maxPrice && Number(o.discountedPrice) > maxPrice) return false
    if (minDiscount > 0) {
      const disc = getDiscountPercent(Number(o.originalPrice), Number(o.discountedPrice))
      if (!Number.isFinite(disc) || disc < minDiscount) return false
    }
    return true
  })

  // Categorie active affichee a cote du nombre d'offres (mobile : pas de sous-header)
  const activePun = categorie
    ? categoryPun(categorie)?.pun ?? categories.find((c) => c.slug === categorie)?.name ?? null
    : null

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
          {/* Recherche (titre, partenaire, description) */}
          <div className="mb-4 lg:mb-6 lg:max-w-md">
            <Suspense fallback={null}>
              <OfferSearchInput />
            </Suspense>
          </div>
          {query.trim() && (
            <p className="mb-4 text-sm text-gray-600" aria-live="polite">
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''} pour « <span className="font-semibold text-navy-800">{query.trim()}</span> »
            </p>
          )}

          {/* Mobile / tablette : nombre d'offres (+ categorie active) a gauche, lien Filtres a droite */}
          <div className="lg:hidden mb-5 flex items-center justify-between gap-3">
            <span className="text-sm text-gray-400 min-w-0 truncate">
              {filtered.length} offre{filtered.length > 1 ? 's' : ''}
              {activePun && <span className="text-navy-800 font-medium"> · {activePun}</span>}
            </span>
            <Suspense fallback={null}>
              <MobileFilters offerCount={filtered.length} categories={categories} />
            </Suspense>
          </div>

          <OfferGrid
            offers={filtered}
            emptyMessage={query.trim() ? `Aucune offre ne correspond à « ${query.trim()} ».` : 'Aucune offre ne correspond à ces critères.'}
          />
        </div>

      </div>
    </>
  )
}
