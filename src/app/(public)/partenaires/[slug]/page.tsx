import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { OfferGrid } from '@/components/offers/OfferGrid'
import type { OfferWithRelations } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PartenaireDetailPage({ params }: Props) {
  const { slug } = await params

  const partenaire = await prisma.partner.findUnique({
    where: { slug },
    include: {
      offers: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          partner: { select: { id: true, name: true, slug: true, logo: true } },
          category: { select: { id: true, name: true, slug: true, icon: true } },
        },
      },
    },
  })

  if (!partenaire) notFound()

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link href="/partenaires" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-800 transition-colors mb-6">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" />
        </svg>
        Tous les partenaires
      </Link>

      {/* En-tete partenaire */}
      <div className="flex items-start gap-5 mb-10 pb-8 border-b border-[#e5e3de]">
        <div className="w-16 h-16 rounded-xl bg-navy-50 flex items-center justify-center shrink-0 font-bold text-navy-800 text-2xl">
          {partenaire.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-800 mb-1">{partenaire.name}</h1>
          {partenaire.description && (
            <p className="text-gray-600 leading-relaxed max-w-2xl">{partenaire.description}</p>
          )}
          {partenaire.website && (
            <a
              href={partenaire.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-gold-600 hover:text-gold-700 transition-colors mt-2"
            >
              {partenaire.website}
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zM10 4.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V6.31l-6.22 6.22a.75.75 0 11-1.06-1.06L13.69 5.5h-2.94a.75.75 0 01-.75-.75z" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Offres */}
      <div>
        <h2 className="text-lg font-bold text-navy-800 mb-6">
          Offres disponibles
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({partenaire.offers.length})
          </span>
        </h2>
        <OfferGrid
          offers={partenaire.offers as unknown as OfferWithRelations[]}
          emptyMessage="Ce partenaire n'a pas encore d'offres actives."
        />
      </div>
    </div>
  )
}
