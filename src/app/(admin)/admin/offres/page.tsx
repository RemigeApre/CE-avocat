import { prisma } from '@/lib/db'
import { Card, Badge } from '@/components/ui'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminOffresPage() {
  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      partner: { select: { name: true, slug: true } },
      category: { select: { name: true, icon: true } },
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">Toutes les offres</h1>
        <p className="text-sm text-gray-500 mt-1">{offers.length} offre{offers.length > 1 ? 's' : ''}</p>
      </div>

      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e3de]">
              {['Titre', 'Partenaire', 'Categorie', 'Prix', 'Statut', 'Cree le', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id} className="border-b border-[#e5e3de] last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-navy-800 max-w-[200px] truncate">
                  <Link href={`/offres/${o.id}`} className="hover:text-gold-600 transition-colors">
                    {o.title}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/partenaires/${o.partner.slug}`} className="text-gray-600 hover:text-navy-800 transition-colors">
                    {o.partner.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {o.category.icon} {o.category.name}
                </td>
                <td className="px-5 py-3">
                  <p className="font-semibold text-navy-800">{formatPrice(Number(o.discountedPrice))}</p>
                  <p className="text-xs text-gray-400 line-through">{formatPrice(Number(o.originalPrice))}</p>
                </td>
                <td className="px-5 py-3">
                  <Badge variant={o.isActive ? 'success' : 'default'}>
                    {o.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(o.createdAt)}</td>
                <td className="px-5 py-3">{o.isDemo && <Badge variant="default">Demo</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {offers.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">Aucune offre.</p>
        )}
      </Card>
    </div>
  )
}
