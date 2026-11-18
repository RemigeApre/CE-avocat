import { prisma } from '@/lib/db'
import { cityCoords } from '@/lib/cityCoords'
import { categoryPun } from '@/lib/categoryPuns'
import { getDiscountPercent } from '@/lib/utils'
import { OffersMap, type CityGroup } from '@/components/map/OffersMap'

export const metadata = {
  title: 'Carte des offres',
  description: 'Trouvez les offres négociées pour les avocats près de chez vous : restaurants, culture, bien-être, séjours et loisirs.',
}

export const dynamic = 'force-dynamic'

export default async function CartePage() {
  const offers = await prisma.offer.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, originalPrice: true, discountedPrice: true,
      locationCity: true, locationCountry: true, addresses: true,
      partner: { select: { name: true } },
      category: { select: { slug: true, name: true } },
    },
  })

  // Regroupement par ville (une ville = un repere)
  const byCity = new Map<string, CityGroup>()
  for (const o of offers) {
    const fromAddress = o.addresses.map((a) => a.split(',').pop()?.trim()).find(Boolean)
    const city = o.locationCity ?? fromAddress ?? null
    const coords = cityCoords(city)
    if (!city || !coords) continue
    const discount = getDiscountPercent(Number(o.originalPrice), Number(o.discountedPrice))
    const group = byCity.get(city) ?? { city, country: o.locationCountry, lat: coords[0], lng: coords[1], offers: [] }
    group.offers.push({
      id: o.id,
      title: o.title,
      partner: o.partner.name,
      category: categoryPun(o.category.slug)?.pun ?? o.category.name,
      price: Number(o.discountedPrice),
      discount: Number.isFinite(discount) && discount > 0 ? discount : null,
    })
    byCity.set(city, group)
  }
  const groups = [...byCity.values()]
  const located = groups.reduce((n, g) => n + g.offers.length, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-6 md:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700 mb-2">Autour de vous</p>
        <h1 className="text-3xl font-bold text-navy-800">Carte des offres</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-2xl leading-relaxed">
          {located} offres dans {groups.length} villes. Touchez « Autour de moi » pour les classer par distance :
          votre position reste approximative et n&apos;est jamais enregistrée.
        </p>
      </div>
      <OffersMap groups={groups} />
    </div>
  )
}
