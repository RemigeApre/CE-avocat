import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '../../../../auth'
import { prisma } from '@/lib/db'
import { sendOrderConfirmation } from '@/lib/mail'

const schema = z.object({
  offerId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
    }

    const body = await req.json()
    const data = schema.safeParse(body)
    if (!data.success) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
    }

    const offer = await prisma.offer.findUnique({
      where: { id: data.data.offerId, isActive: true },
      include: { partner: { select: { name: true } } },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offre introuvable.' }, { status: 404 })
    }

    const unitPrice = Number(offer.discountedPrice)
    const totalAmount = unitPrice * data.data.quantity

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'CONFIRMED',
        totalAmount,
        items: {
          create: {
            offerId: offer.id,
            quantity: data.data.quantity,
            unitPrice,
          },
        },
      },
    })

    sendOrderConfirmation({
      to: session.user.email,
      name: session.user.name,
      orderId: order.id,
      items: [{ title: offer.title, unitPrice, quantity: data.data.quantity }],
      totalAmount,
    }).catch(() => {})

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
