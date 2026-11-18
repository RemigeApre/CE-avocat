'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Check, ChevronDown, Download, Share2, Trophy } from 'lucide-react'
import { displayName } from '@/lib/displayName'
import { cardQuery, formatMeters } from '@/lib/gameCard'
import { LawyerGame } from '@/components/ui/LawyerGame'
import type { LeaderboardData } from '@/lib/gameLeaderboard'

const MEDALS = ['🥇', '🥈', '🥉']

/**
 * Contenu de la fenetre du mini-jeu : le jeu, la consigne, et pour les membres connectes
 * l'enregistrement du record sur le compte + le classement entre membres.
 */
export function GamePanel() {
  const { status, data: session } = useSession()
  const [last, setLast] = useState<{ score: number; record: boolean } | null>(null)
  const [copied, setCopied] = useState(false)
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
    setLast(score > 0 ? { score, record: false } : null)
    setCopied(false)
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
        if (d.isNewRecord) setLast({ score, record: true })
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

      {/* Carte de score a partager : lien (apercu image) ou image a telecharger */}
      {last && (() => {
        const name = session?.user?.name ? displayName(session.user.name) : undefined
        const q = cardQuery({ score: last.score, name, record: last.record })
        const shareLink = async () => {
          const url = `${window.location.origin}/jeu?${q}`
          const text = `J’ai atteint ${formatMeters(last.score)} au Maître en cavale. Saurez-vous faire mieux ?`
          if (navigator.share) {
            try { await navigator.share({ title: 'Le Maître en cavale', text, url }); return }
            catch (err) { if (err instanceof DOMException && err.name === 'AbortError') return }
          }
          try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 2500) }
          catch { window.open(url, '_blank', 'noopener') }
        }
        return (
          <div className="mt-4 rounded-lg bg-[#f7f6f3] border border-[#e5e3de] p-3">
            <p className="text-sm text-navy-800 text-center">
              Votre partie : <span className="font-bold tabular-nums">{formatMeters(last.score)}</span>
              {last.record && <span className="text-gold-700 font-semibold"> · nouveau record</span>}
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={shareLink}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-navy-800 hover:bg-navy-700 px-3 py-2 text-xs font-semibold text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Share2 className="w-4 h-4" aria-hidden="true" />}
                <span aria-live="polite">{copied ? 'Lien copié !' : 'Partager le lien'}</span>
              </button>
              <a
                href={`/api/game/card?${q}&download=1`}
                download={`maitre-en-cavale-${last.score}m.png`}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-navy-800 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-white transition-colors"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Télécharger l’image
              </a>
            </div>
          </div>
        )
      })()}

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
