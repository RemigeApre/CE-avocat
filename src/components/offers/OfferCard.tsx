import Image from 'next/image'
import { Card } from '@/components/ui'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import type { OfferWithRelations } from '@/types'

const CATEGORY_IMAGES: Record<string, string> = {
  'restauration':    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  'sport-bien-etre': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
  'culture':         'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
  'voyages':         'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
  'shopping':        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
  'services':        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
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
                alt={offer.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            </>
          )}

          {/* Badge reduction : carre colle haut gauche */}
          {showDiscount && (
            <div className="absolute top-0 left-0 bg-navy-800 text-white text-xs font-bold px-2.5 py-1.5 leading-none tracking-wide">
              -{discount}%
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-navy-800 mb-1.5 line-clamp-2 group-hover:text-gold-600 transition-colors leading-snug text-center">
            {offer.title}
          </h3>

          <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1 leading-relaxed">
            {offer.description}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-[#e5e3de]">
            <span className="text-xs text-gray-400 truncate max-w-[55%]">{offer.partner.name}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-navy-800">
                {formatPrice(Number(offer.discountedPrice))}
              </span>
              {Number(offer.originalPrice) > 0 && (
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
