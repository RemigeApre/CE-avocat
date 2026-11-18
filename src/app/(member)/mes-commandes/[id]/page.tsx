import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/db'
import { Card, Badge } from '@/components/ui'
import { formatPrice, formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ confirmation?: string }>
}

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

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { confirmation } = await searchParams
  const session = await auth()

  const order = await prisma.order.findUnique({
    where: { id, userId: session!.user.id },
    include: {
      items: {
        include: {
          offer: {
            select: {
              title: true,
              imageUrl: true,
              partner: { select: { name: true, slug: true } },
              category: { select: { name: true, icon: true } },
            },
          },
        },
      },
    },
  })

  if (!order) notFound()

  return (
    <div className="max-w-2xl">
      {confirmation && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-4 mb-6 flex items-start gap-3">
          <span className="text-green-600 text-lg mt-0.5">✓</span>
          <div>
            <p className="text-sm font-semibold text-green-800">Commande enregistrée</p>
            <p className="text-sm text-green-700 mt-0.5">
              Un email de confirmation vous a été envoyé.
            </p>
          </div>
        </div>
      )}

      <Link href="/mes-commandes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-800 transition-colors mb-6">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" />
        </svg>
        Mes commandes
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy-800">
            Commande #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
      </div>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-navy-800 mb-4">Récapitulatif</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-navy-800">{item.offer.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.offer.category.icon} {item.offer.category.name} - {item.offer.partner.name}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm text-gray-500">x{item.quantity}</p>
                <p className="text-sm font-semibold text-navy-800">
                  {formatPrice(Number(item.unitPrice) * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-[#e5e3de] flex justify-between items-center">
          <span className="text-sm font-semibold text-navy-800">Total</span>
          <span className="text-lg font-bold text-navy-800">
            {formatPrice(Number(order.totalAmount))}
          </span>
        </div>
      </Card>

      <p className="text-xs text-gray-400 text-center">
        Ce récapitulatif est fourni à titre indicatif. Présentez-le lors de votre visite chez le partenaire.
      </p>
    </div>
  )
}
