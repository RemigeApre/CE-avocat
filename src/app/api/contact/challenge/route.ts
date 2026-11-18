import { NextResponse } from 'next/server'
import { clientIp, issueChallenge, rateLimit, type Purpose } from '@/lib/antibot'

// Delivre un defi (jeton signe + difficulte) pour le formulaire de contact ou l'affichage de l'adresse
export async function GET(req: Request) {
  const purpose: Purpose = new URL(req.url).searchParams.get('for') === 'reveal' ? 'reveal' : 'contact'
  if (!rateLimit(`challenge:${clientIp(req)}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 })
  }
  return NextResponse.json(issueChallenge(purpose), { headers: { 'Cache-Control': 'no-store' } })
}
