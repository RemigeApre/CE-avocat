import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Badge, Card } from '@/components/ui'
import { formatPrice, formatDate, getDiscountPercent } from '@/lib/utils'
import { CATEGORY_IMAGES } from '@/lib/categoryImages'
import { OrderButton } from './OrderButton'
import { SaveButton } from '@/components/offers/SaveButton'
import { auth } from '../../../../../auth'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OfferPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const [offer, savedEntry] = await Promise.all([
    prisma.offer.findUnique({
      where: { id, isActive: true },
      include: {
        partner: { select: { id: true, name: true, slug: true, logo: true, description: true, website: true } },
        category: { select: { id: true, name: true, slug: true, icon: true } },
      },
    }),
    session
      ? prisma.savedOffer.findUnique({
          where: { userId_offerId: { userId: session.user.id, offerId: id } },
        })
      : null,
  ])

  if (!offer) notFound()

  const discount = getDiscountPercent(Number(offer.originalPrice), Number(offer.discountedPrice))
  const showDiscount = Number.isFinite(discount) && discount > 0
  const isSaved = savedEntry !== null
  const imageUrl = offer.imageUrl ?? CATEGORY_IMAGES[offer.category.slug] ?? null

  // Metadonnées de localisation selon la catégorie
  const slug = offer.category.slug
  const hasLocation =
    (slug === 'restauration' && offer.addresses.length > 0) ||
    ((slug === 'voyages' || slug === 'culture') && offer.locationCity) ||
    (slug === 'shopping' && offer.contactEmail)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/offres" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-800 transition-colors mb-6">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" />
        </svg>
        Retour aux offres
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-[#f7f6f3]">
            {imageUrl && (
              <>
                <Image src={imageUrl} alt={offer.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </>
            )}
            {showDiscount && (
              <div className="absolute top-0 left-0 bg-navy-800 text-white text-xs font-bold px-3 py-2 leading-none tracking-wide">
                -{discount}%
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge>{offer.category.name}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-navy-800 mb-3">{offer.title}</h1>
            <p className="text-gray-600 leading-relaxed">{offer.description}</p>
          </div>

          {offer.conditions && (
            <Card>
              <h2 className="text-sm font-semibold text-navy-800 mb-2">Conditions</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{offer.conditions}</p>
            </Card>
          )}
        </div>

        {/* Panneau lateral */}
        <div className="space-y-4">
          <Card>
            <div className="mb-4">
              <p className="text-3xl font-bold text-navy-800">
                {formatPrice(Number(offer.discountedPrice))}
              </p>
              {Number(offer.originalPrice) > 0 && showDiscount && (
                <p className="text-sm text-gray-400 line-through mt-0.5">
                  {formatPrice(Number(offer.originalPrice))}
                </p>
              )}
            </div>

            {offer.validUntil && (
              <p className="text-xs text-gray-400 mb-4">
                Valable jusqu&apos;au {formatDate(offer.validUntil)}
              </p>
            )}

            <div className="space-y-2">
              <OrderButton offerId={offer.id} price={Number(offer.discountedPrice)} />
              {session && <SaveButton offerId={offer.id} initialSaved={isSaved} />}
            </div>
          </Card>

          {/* Localisation / contact */}
          {hasLocation && (
            <Card>
              {slug === 'restauration' && offer.addresses.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {offer.addresses.length > 1 ? 'Adresses' : 'Adresse'}
                  </p>
                  <ul className="space-y-1.5">
                    {offer.addresses.map((addr, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M8 1.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM2 6a6 6 0 1110.9 3.428l2.336 2.336a.75.75 0 11-1.06 1.06l-2.335-2.335A6 6 0 012 6z" />
                        </svg>
                        {addr}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {(slug === 'voyages' || slug === 'culture') && offer.locationCity && (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Lieu
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                    {offer.locationCity}
                    {offer.locationCountry && slug === 'voyages' && `, ${offer.locationCountry}`}
                  </p>
                </>
              )}

              {slug === 'shopping' && offer.contactEmail && (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Contact
                  </p>
                  <a
                    href={`mailto:${offer.contactEmail}`}
                    className="text-sm text-gold-600 hover:text-gold-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 4l6 5 6-5M2 4h12v9H2V4z" />
                    </svg>
                    {offer.contactEmail}
                  </a>
                </>
              )}
            </Card>
          )}

          <Card>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Partenaire
            </p>
            <Link href={`/partenaires/${offer.partner.slug}`} className="group">
              <p className="font-semibold text-navy-800 group-hover:text-gold-600 transition-colors mb-1">
                {offer.partner.name}
              </p>
              {offer.partner.description && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {offer.partner.description}
                </p>
              )}
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
