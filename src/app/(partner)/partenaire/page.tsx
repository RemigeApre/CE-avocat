import { redirect } from 'next/navigation'
import { auth } from '../../../../auth'
import { prisma } from '@/lib/db'
import { Card, Badge } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default async function PartnerDashboardPage() {
  const session = await auth()
  if (!session?.user.partnerId) redirect('/login')

  const partner = await prisma.partner.findUnique({
    where: { id: session.user.partnerId },
    include: {
      _count: { select: { offers: true, members: true } },
      offers: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true, title: true, discountedPrice: true, originalPrice: true,
          category: { select: { name: true, icon: true } },
        },
      },
    },
  })

  if (!partner) redirect('/login')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">{partner.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Tableau de bord partenaire</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Offres actives</p>
          <p className="text-2xl font-bold text-navy-800">{partner._count.offers}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Membres equipe</p>
          <p className="text-2xl font-bold text-navy-800">{partner._count.members}</p>
          <p className="text-xs text-gray-400 mt-1">3 max</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Actions rapides</p>
          <Link href="/partenaire/offres" className="text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors">
            Gerer les offres
          </Link>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-navy-800">Dernieres offres</h2>
          <Link href="/partenaire/offres" className="text-sm text-gold-600 hover:text-gold-700 transition-colors">
            Tout gerer
          </Link>
        </div>

        {partner.offers.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-400 text-center py-6">
              Aucune offre.{' '}
              <Link href="/partenaire/offres" className="text-gold-600 hover:underline">
                Creer la premiere
              </Link>
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {partner.offers.map((offer) => (
              <Card key={offer.id} padding="sm" className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-navy-800">{offer.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {offer.category.icon} {offer.category.name}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge variant="gold">{formatPrice(Number(offer.discountedPrice))}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
