'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ChevronDown, Trophy } from 'lucide-react'
import { LawyerGame } from '@/components/ui/LawyerGame'
import type { LeaderboardData } from '@/lib/gameLeaderboard'

const MEDALS = ['🥇', '🥈', '🥉']

/**
 * Contenu de la fenetre du mini-jeu : le jeu, la consigne, et pour les membres connectes
 * l'enregistrement du record sur le compte + le classement entre membres.
 */
export function GamePanel() {
  const { status } = useSession()
  const [board, setBoard] = useState<LeaderboardData | null>(null)
  const [newRecord, setNewRecord] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    fetch('/api/game/leaderboard', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: LeaderboardData) => { if (!cancelled) setBoard(d) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [status])

  const handleGameOver = useCallback((score: number) => {
    if (status !== 'authenticated' || score <= 0) return
    setNewRecord(false)
    fetch('/api/game/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: LeaderboardData & { isNewRecord: boolean }) => {
        setBoard(d)
        setNewRecord(d.isNewRecord)
        setError(false)
      })
      .catch(() => setError(true))
  }, [status])

  return (
    <div>
      <LawyerGame initialBest={board?.me.best ?? 0} onGameOver={handleGameOver} />

      {/* Consigne selon l'appareil : souris/clavier ou ecran tactile */}
      <p className="text-xs text-gray-400 text-center mt-3 [@media(pointer:coarse)]:hidden">← → ou clic gauche / droit · P pour pause · sautez sur l’huissier !</p>
      <p className="text-xs text-gray-400 text-center mt-3 hidden [@media(pointer:coarse)]:block">Gardez le doigt à gauche ou à droite · sautez sur l’huissier !</p>

      {/* Classement : reserve aux membres connectes */}
      <div className="mt-4 border-t border-[#e5e3de] pt-3">
        {status === 'authenticated' ? (
          <details className="group" open>
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy-800">
                <Trophy className="w-4 h-4 text-gold-500" strokeWidth={1.75} aria-hidden="true" />
                Classement des membres
              </span>
              <span className="flex items-center gap-2">
                {board && board.me.best > 0 && (
                  <span className="text-xs text-gray-500">
                    Vous : <span className="font-semibold text-navy-800 tabular-nums">{board.me.best} m</span>
                    {board.me.rank && <span className="text-gray-400"> · {board.me.rank}<sup>e</sup></span>}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>

            {newRecord && (
              <p className="mt-3 text-xs font-semibold text-gold-700 bg-gold-50 border border-gold-200 rounded-md px-3 py-2 text-center">
                Nouveau record enregistré sur votre profil !
              </p>
            )}

            {error && !board && <p className="mt-3 text-xs text-gray-400">Classement indisponible pour le moment.</p>}
            {!board && !error && <p className="mt-3 text-xs text-gray-400">Chargement…</p>}

            {board && (
              board.top.length === 0 ? (
                <p className="mt-3 text-xs text-gray-500">Personne au classement pour l’instant : faites la première partie !</p>
              ) : (
                <ol className="mt-3 space-y-1">
                  {board.top.map((e) => (
                    <li
                      key={e.rank}
                      className={[
                        'flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm',
                        e.isMe ? 'bg-navy-800 text-white' : 'text-gray-600',
                      ].join(' ')}
                    >
                      <span className="w-6 text-center tabular-nums text-xs font-semibold">{MEDALS[e.rank - 1] ?? e.rank}</span>
                      <span className="flex-1 truncate">{e.name}{e.isMe && <span className="text-white/60"> (vous)</span>}</span>
                      <span className={['tabular-nums font-semibold', e.isMe ? 'text-gold-400' : 'text-navy-800'].join(' ')}>{e.score} m</span>
                    </li>
                  ))}
                </ol>
              )
            )}
            {board && board.me.rank && board.me.rank > board.top.length && (
              <p className="mt-2 text-xs text-gray-500 text-center">
                Vous êtes <span className="font-semibold text-navy-800">{board.me.rank}<sup>e</sup></span> avec {board.me.best} m.
              </p>
            )}
          </details>
        ) : status === 'unauthenticated' ? (
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            <Link href="/login" className="font-semibold text-navy-800 underline underline-offset-2 hover:text-gold-600">Connectez-vous</Link>{' '}
            pour enregistrer votre record sur votre profil et entrer dans le classement des membres.
          </p>
        ) : null}
      </div>
    </div>
  )
}
