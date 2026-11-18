import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { sendWelcome } from '@/lib/mail'
import { clientIp, rateLimit } from '@/lib/antibot'

const ALLOWED_DOMAINS = ['avocat.fr', 'avocat-conseil.fr']

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  // 5 inscriptions / heure par IP : evite la creation de comptes en masse et l'envoi d'e-mails a des tiers
  if (!rateLimit(`register:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 })
  }
  try {
    const body = await req.json()
    const data = schema.safeParse(body)

    if (!data.success) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
    }

    const domain = data.data.email.split('@')[1]
    if (!ALLOWED_DOMAINS.includes(domain)) {
      return NextResponse.json(
        { error: 'Seules les adresses @avocat.fr et @avocat-conseil.fr sont acceptees.' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email: data.data.email } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(data.data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.data.name,
        email: data.data.email,
        password: hashed,
        role: 'MEMBER',
      },
    })

    sendWelcome({ to: user.email, name: user.name }).catch(() => {})

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
