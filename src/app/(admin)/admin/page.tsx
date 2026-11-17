import { prisma } from '@/lib/db'
import { Card } from '@/components/ui'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const [users, partners, offers, orders] = await Promise.all([
    prisma.user.count(),
    prisma.partner.count(),
    prisma.offer.count({ where: { isActive: true } }),
    prisma.order.count(),
  ])

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { offer: { select: { title: true } } } },
    },
  })

  const stats = [
    { label: 'Utilisateurs', value: users, href: '/admin/utilisateurs' },
    { label: 'Partenaires', value: partners, href: '/admin/partenaires' },
    { label: 'Offres actives', value: offers, href: '/admin/offres' },
    { label: 'Commandes', value: orders, href: '#' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">Administration</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-navy-800">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-base font-semibold text-navy-800 mb-4">Dernieres commandes</h2>
        {recentOrders.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-400 text-center py-6">Aucune commande.</p>
          </Card>
        ) : (
          <Card padding="none">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e3de]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Membre</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Offre</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-[#e5e3de] last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy-800">{o.user.name}</p>
                      <p className="text-xs text-gray-400">{o.user.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {o.items.map((i) => i.offer.title).join(', ')}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{o.status}</td>
                    <td className="px-5 py-3 text-right font-semibold text-navy-800">
                      {Number(o.totalAmount).toFixed(2)} EUR
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}
