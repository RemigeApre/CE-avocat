import { redirect } from 'next/navigation'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/db'
import { OffersManager } from './OffersManager'

export default async function PartnerOffresPage() {
  const session = await auth()
  if (!session?.user.partnerId) redirect('/login')

  const [offers, categories] = await Promise.all([
    prisma.offer.findMany({
      where: { partnerId: session.user.partnerId },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true, icon: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true, icon: true } }),
  ])

  return (
    <OffersManager
      offers={offers.map((o) => ({
        ...o,
        originalPrice: Number(o.originalPrice),
        discountedPrice: Number(o.discountedPrice),
      }))}
      categories={categories}
    />
  )
}
