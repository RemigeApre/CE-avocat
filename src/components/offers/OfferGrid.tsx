import { OfferCard } from './OfferCard'
import type { OfferWithRelations } from '@/types'

interface OfferGridProps {
  offers: OfferWithRelations[]
  emptyMessage?: string
}

export function OfferGrid({ offers, emptyMessage = 'Aucune offre disponible.' }: OfferGridProps) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">{emptyMessage}</div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  )
}
