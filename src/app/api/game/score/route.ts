import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/db'
import { MAX_GAME_SCORE, getLeaderboard } from '@/lib/gameLeaderboard'

const schema = z.object({ score: z.number().int().min(0).max(MAX_GAME_SCORE) })

// Enregistre le score d'une partie : ne remplace le record que s'il est battu
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Score invalide.' }, { status: 400 })
  const { score } = parsed.data

  // Mise a jour conditionnelle et atomique : deux parties simultanees ne peuvent pas faire baisser le record
  const { count } = await prisma.user.updateMany({
    where: { id: session.user.id, gameBestScore: { lt: score } },
    data: { gameBestScore: score, gameBestAt: new Date() },
  })

  const data = await getLeaderboard(session.user.id)
  return NextResponse.json({ ...data, isNewRecord: count > 0 }, { headers: { 'Cache-Control': 'private, no-store' } })
}
