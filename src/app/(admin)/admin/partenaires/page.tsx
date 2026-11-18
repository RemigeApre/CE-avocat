import { prisma } from '@/lib/db'
import { Card, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminPartenairesPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      admin: { select: { name: true, email: true } },
      _count: { select: { offers: true, members: true } },
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">Partenaires</h1>
        <p className="text-sm text-gray-500 mt-1">{partners.length} partenaire{partners.length > 1 ? 's' : ''}</p>
      </div>

      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e3de]">
              {['Nom', 'Responsable', 'Offres', 'Équipe', 'Créé le', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-b border-[#e5e3de] last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <Link href={`/partenaires/${p.slug}`} className="font-medium text-navy-800 hover:text-gold-600 transition-colors">
                    {p.name}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <p className="text-navy-800">{p.admin.name}</p>
                  <p className="text-xs text-gray-400">{p.admin.email}</p>
                </td>
                <td className="px-5 py-3">
                  <Badge variant="info">{p._count.offers} offre{p._count.offers > 1 ? 's' : ''}</Badge>
                </td>
                <td className="px-5 py-3 text-gray-500">{p._count.members} / 3</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(p.createdAt)}</td>
                <td className="px-5 py-3">{p.isDemo && <Badge variant="default">Demo</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {partners.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">Aucun partenaire enregistré.</p>
        )}
      </Card>
    </div>
  )
}
