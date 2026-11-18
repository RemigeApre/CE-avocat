import { NextResponse } from 'next/server'
import { clientIp, rateLimit, verifyChallenge } from '@/lib/antibot'
import { CONTACT_EMAIL } from '@/lib/contactConfig'

// Revele l'adresse e-mail apres un defi resolu (preuve de travail), avec limite de debit
export async function POST(req: Request) {
  const ip = clientIp(req)
  if (!rateLimit(`reveal:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 })
  }
  const body = await req.json().catch(() => null) as { token?: unknown; nonce?: unknown } | null
  const check = verifyChallenge('reveal', body?.token, body?.nonce)
  if (!check.ok) return NextResponse.json({ error: 'Vérification échouée. Réessayez.' }, { status: 400 })
  return NextResponse.json({ email: CONTACT_EMAIL }, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
}
