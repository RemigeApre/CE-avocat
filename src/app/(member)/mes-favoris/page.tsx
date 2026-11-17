import { auth } from '../../../../auth'
import { prisma } from '@/lib/db'
import { OfferGrid } from '@/components/offers/OfferGrid'
import type { OfferWithRelations } from '@/types'
import Link from 'next/link'

export default async function MesFavorisPage() {
  const session = await auth()
  const userId = session!.user.id

  const saved = await prisma.savedOffer.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      offer: {
        include: {
          partner: { select: { id: true, name: true, slug: true, logo: true } },
          category: { select: { id: true, name: true, slug: true, icon: true } },
        },
      },
    },
  })

  const offers = saved
    .map((s) => s.offer)
    .filter((o) => o.isActive) as unknown as OfferWithRelations[]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">Mes favoris</h1>
        <p className="text-sm text-gray-500 mt-1">
          {offers.length} offre{offers.length > 1 ? 's' : ''} enregistree{offers.length > 1 ? 's' : ''}
        </p>
      </div>

      <OfferGrid
        offers={offers}
        emptyMessage=""
      />

      {offers.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm mb-4">Vous n&apos;avez pas encore enregistre d&apos;offres.</p>
          <Link
            href="/offres"
            className="text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
          >
            Parcourir les offres
          </Link>
        </div>
      )}
    </div>
  )
}
