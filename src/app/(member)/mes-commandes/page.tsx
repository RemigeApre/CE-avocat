import { auth } from '../../../../auth'
import { prisma } from '@/lib/db'
import { Card, Badge } from '@/components/ui'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

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

export default async function MesCommandesPage() {
  const session = await auth()

  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          offer: {
            select: {
              title: true,
              partner: { select: { name: true } },
            },
          },
        },
      },
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">Mes commandes</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} commande{orders.length > 1 ? 's' : ''}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-400 text-center py-10">
            Aucune commande.{' '}
            <Link href="/offres" className="text-gold-600 hover:underline">
              Découvrir les offres
            </Link>
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/mes-commandes/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={statusVariant[order.status]}>
                        {statusLabel[order.status]}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <ul className="space-y-0.5">
                      {order.items.map((item) => (
                        <li key={item.id} className="text-sm text-navy-800">
                          {item.offer.title}
                          <span className="text-gray-400 ml-1.5">
                            via {item.offer.partner.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-bold text-navy-800">
                      {formatPrice(Number(order.totalAmount))}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
