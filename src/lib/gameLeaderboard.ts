import { prisma } from '@/lib/db'
import { displayName } from '@/lib/displayName'

/** Score maximal accepte : garde-fou contre les valeurs absurdes (le jeu reste cote client) */
export const MAX_GAME_SCORE = 50_000

export interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  isMe: boolean
}

export interface LeaderboardData {
  top: LeaderboardEntry[]
  me: { best: number; rank: number | null }
}

export { displayName }

export async function getLeaderboard(userId: string, limit = 10): Promise<LeaderboardData> {
  const [rows, meRow] = await Promise.all([
    prisma.user.findMany({
      where: { gameBestScore: { gt: 0 } },
      orderBy: [{ gameBestScore: 'desc' }, { gameBestAt: 'asc' }], // a egalite : le premier a l'avoir atteint
      take: limit,
      select: { id: true, name: true, gameBestScore: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { gameBestScore: true } }),
  ])

  const best = meRow?.gameBestScore ?? 0
  const rank = best > 0 ? (await prisma.user.count({ where: { gameBestScore: { gt: best } } })) + 1 : null

  return {
    top: rows.map((r, i) => ({ rank: i + 1, name: displayName(r.name), score: r.gameBestScore, isMe: r.id === userId })),
    me: { best, rank },
  }
}
