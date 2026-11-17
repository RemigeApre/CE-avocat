import Image from 'next/image'
import { Badge, Card } from '@/components/ui'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import type { OfferWithRelations } from '@/types'

interface OfferCardProps {
  offer: OfferWithRelations
}

export function OfferCard({ offer }: OfferCardProps) {
  const discount = getDiscountPercent(
    Number(offer.originalPrice),
    Number(offer.discountedPrice),
  )

  return (
    <a href={`/offres/${offer.id}`} className="block h-full">
      <Card padding="none" className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full cursor-pointer">
        <div className="relative h-44 bg-gray-100 shrink-0">
          {offer.imageUrl ? (
            <Image src={offer.imageUrl} alt={offer.title} fill className="object-cover" />
          ) : (
            <div className="h-full flex items-center justify-center text-5xl select-none">
              {offer.category.icon ?? '🏷️'}
            </div>
          )}
          <div className="absolute top-2.5 right-2.5">
            <Badge variant="gold" className="font-semibold">-{discount}%</Badge>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Badge>{offer.category.name}</Badge>
          </div>

          <h3 className="font-semibold text-navy-800 mb-1.5 line-clamp-2 group-hover:text-gold-600 transition-colors leading-snug">
            {offer.title}
          </h3>

          <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1 leading-relaxed">
            {offer.description}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-[#e5e3de]">
            <div>
              <span className="text-xs text-gray-400 line-through mr-1.5">
                {formatPrice(Number(offer.originalPrice))}
              </span>
              <span className="text-base font-bold text-navy-800">
                {formatPrice(Number(offer.discountedPrice))}
              </span>
            </div>
            <span className="text-sm font-medium text-gold-600 group-hover:text-gold-700 transition-colors">
              Voir l'offre
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-2">Par {offer.partner.name}</p>
        </div>
      </Card>
    </a>
  )
}
