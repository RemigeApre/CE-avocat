import { NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { getLeaderboard } from '@/lib/gameLeaderboard'

// Classement du mini-jeu : visible uniquement par les utilisateurs connectes
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  const data = await getLeaderboard(session.user.id)
  return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } })
}
