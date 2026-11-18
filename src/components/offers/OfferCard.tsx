import Image from 'next/image'
import { Card } from '@/components/ui'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import { CATEGORY_IMAGES } from '@/lib/categoryImages'
import type { OfferWithRelations } from '@/types'

function OfferMeta({ offer }: { offer: OfferWithRelations }) {
  if (offer.addresses.length > 0) {
    const cities = [...new Set(offer.addresses.map((a) => a.split(',').pop()?.trim()).filter(Boolean))]
    return <span>{cities.join(' · ')}</span>
  }
  if (offer.locationCity) {
    return (
      <span>
        {offer.locationCity}
        {offer.locationCountry ? `, ${offer.locationCountry}` : ''}
      </span>
    )
  }
  if (offer.contactEmail) {
    return <span className="truncate">{offer.contactEmail}</span>
  }
  return null
}

interface OfferCardProps {
  offer: OfferWithRelations
}

export function OfferCard({ offer }: OfferCardProps) {
  const discount = getDiscountPercent(
    Number(offer.originalPrice),
    Number(offer.discountedPrice),
  )
  const showDiscount = Number.isFinite(discount) && discount > 0
  const imageUrl = offer.imageUrl ?? CATEGORY_IMAGES[offer.category.slug] ?? null

  return (
    <a href={`/offres/${offer.id}`} className="block h-full">
      <Card padding="none" className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full cursor-pointer">

        {/* Zone image */}
        <div className="relative h-44 bg-[#f7f6f3] shrink-0 overflow-hidden">
          {imageUrl && (
            <>
              <Image
                src={imageUrl}
                alt=""
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            </>
          )}
          {showDiscount && (
            <div className="absolute top-0 left-0 bg-navy-800 text-white text-xs font-bold px-2.5 py-1.5 leading-none tracking-wide">
              <span className="sr-only">Réduction de </span>-{discount}%
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-navy-800 mb-1.5 line-clamp-2 group-hover:text-gold-600 transition-colors leading-snug text-center">
            {offer.title}
          </h3>

          <p className="text-sm text-gray-500 mb-2 line-clamp-2 flex-1 leading-relaxed">
            {offer.description}
          </p>

          <div className="text-xs text-gray-400 mb-3 h-4 truncate">
            <OfferMeta offer={offer} />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#e5e3de]">
            <span className="text-xs text-gray-400 truncate max-w-[55%]">{offer.partner.name}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-navy-800">
                {formatPrice(Number(offer.discountedPrice))}
              </span>
              {Number(offer.originalPrice) > 0 && showDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(Number(offer.originalPrice))}
                </span>
              )}
            </div>
          </div>
        </div>

      </Card>
    </a>
  )
}
