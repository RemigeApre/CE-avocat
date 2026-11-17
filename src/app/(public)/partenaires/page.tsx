import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Card, Badge } from '@/components/ui'

export default async function PartenairesPage() {
  const partenaires = await prisma.partner.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { offers: { where: { isActive: true } } } },
      offers: {
        where: { isActive: true },
        select: { category: { select: { name: true, slug: true, icon: true } } },
        distinct: ['categoryId'],
        take: 3,
      },
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800 mb-1">Nos partenaires</h1>
        <p className="text-sm text-gray-500">
          {partenaires.length} partenaire{partenaires.length > 1 ? 's' : ''} selectionne{partenaires.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {partenaires.map((p) => (
          <Link key={p.id} href={`/partenaires/${p.slug}`}>
            <Card className="hover:shadow-md transition-shadow h-full cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-navy-50 flex items-center justify-center shrink-0 font-bold text-navy-800 text-lg">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-navy-800 group-hover:text-gold-600 transition-colors truncate">
                    {p.name}
                  </h2>
                  {p.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {p.offers.map((o) => (
                      <Badge key={o.category.slug}>
                        {o.category.icon} {o.category.name}
                      </Badge>
                    ))}
                    <span className="text-xs text-gray-400 ml-auto">
                      {p._count.offers} offre{p._count.offers > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {partenaires.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucun partenaire pour le moment.
        </div>
      )}
    </div>
  )
}
