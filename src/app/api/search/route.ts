import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { searchItems } from '@/lib/search'
import { categoryPun } from '@/lib/categoryPuns'
import { getDiscountPercent } from '@/lib/utils'

// Recherche instantanee (header) : 6 meilleurs resultats + nombre total
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get('q') ?? '').slice(0, 80)
  if (q.trim().length < 2) return NextResponse.json({ total: 0, results: [] })

  const offers = await prisma.offer.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, description: true, locationCity: true, originalPrice: true, discountedPrice: true,
      partner: { select: { name: true } },
      category: { select: { slug: true, name: true } },
    },
  })
  const found = searchItems(offers, q)

  return NextResponse.json({
    total: found.length,
    results: found.slice(0, 6).map((o) => {
      const discount = getDiscountPercent(Number(o.originalPrice), Number(o.discountedPrice))
      return {
        id: o.id,
        title: o.title,
        partner: o.partner.name,
        category: categoryPun(o.category.slug)?.pun ?? o.category.name,
        price: Number(o.discountedPrice),
        discount: Number.isFinite(discount) && discount > 0 ? discount : null,
      }
    }),
  })
}
