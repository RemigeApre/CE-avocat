import Link from 'next/link'
import { prisma } from '@/lib/db'

export const metadata = { title: 'Partenaires - CE Avocats' }

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
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-navy-800">Nos partenaires</h1>
        <p className="text-sm text-gray-400 mt-1">
          {partenaires.length} partenaire{partenaires.length > 1 ? 's' : ''} selectionne{partenaires.length > 1 ? 's' : ''}
        </p>
      </div>

      {partenaires.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">Aucun partenaire pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {partenaires.map((p) => (
            <Link
              key={p.id}
              href={`/partenaires/${p.slug}`}
              className="group bg-white border border-[#e5e3de] rounded-lg overflow-hidden hover:shadow-md hover:border-navy-200 transition-all flex flex-col"
            >
              {/* En-tête visuelle */}
              <div className="h-24 bg-[#f7f6f3] flex items-center justify-center shrink-0 border-b border-[#e5e3de]">
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt={p.name} className="h-12 w-auto object-contain" />
                ) : (
                  <span className="text-4xl font-bold text-navy-200 select-none tracking-tighter">
                    {p.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Contenu */}
              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-semibold text-navy-800 group-hover:text-gold-600 transition-colors leading-snug mb-1">
                  {p.name}
                </h2>
                {p.description ? (
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {p.description}
                  </p>
                ) : (
                  <div className="flex-1" />
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#e5e3de]">
                  <div className="flex flex-wrap gap-1.5">
                    {p.offers.map((o) => (
                      <span
                        key={o.category.slug}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 bg-[#f7f6f3] px-2 py-0.5 rounded-full"
                      >
                        {o.category.icon && <span>{o.category.icon}</span>}
                        {o.category.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-3">
                    {p._count.offers} offre{p._count.offers > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
