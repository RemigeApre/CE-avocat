import { auth } from '../../../../auth'
import { prisma } from '@/lib/db'
import { Card, Badge } from '@/components/ui'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function MemberDashboardPage() {
  const session = await auth()
  const userId = session!.user.id

  const [recentOrders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        items: {
          include: { offer: { select: { title: true } } },
        },
      },
    }),
    prisma.order.count({ where: { userId } }),
  ])

  const statusLabel: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirme',
    CANCELLED: 'Annule',
  }
  const statusVariant: Record<string, 'warning' | 'success' | 'danger'> = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    CANCELLED: 'danger',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">
          Bonjour, {session!.user.name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Bienvenue dans votre espace Maître en Pause</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Commandes totales</p>
          <p className="text-2xl font-bold text-navy-800">{totalOrders}</p>
        </Card>
        <Card className="sm:col-span-2 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Découvrir</p>
            <p className="text-sm font-medium text-navy-800">Nouvelles offres disponibles</p>
          </div>
          <Link
            href="/offres"
            className="text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors shrink-0"
          >
            Voir tout
          </Link>
        </Card>
      </div>

      {/* Commandes recentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-navy-800">Commandes recentes</h2>
          <Link href="/mes-commandes" className="text-sm text-gold-600 hover:text-gold-700 transition-colors">
            Tout voir
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-400 text-center py-6">
              Aucune commande pour le moment.{' '}
              <Link href="/offres" className="text-gold-600 hover:underline">
                Parcourir les offres
              </Link>
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Card key={order.id} padding="sm" className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-navy-800">
                    {order.items.map((i) => i.offer.title).join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={statusVariant[order.status]}>
                    {statusLabel[order.status]}
                  </Badge>
                  <span className="text-sm font-semibold text-navy-800">
                    {formatPrice(Number(order.totalAmount))}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
