'use client'

import { useEffect, useRef, useCallback } from 'react'

const W = 300
const H = 460
const PW = 20
const PH = 30
const GRAVITY = 0.38
const JUMP_V = -11
const MOVE_SPEED = 3.5
const PLAT_H = 11
const FEUILLE_BREAK = 70  // frames before feuille breaks
const NAVY = '#1b2d5a'
const GOLD = '#c9a84c'
const BG = '#f7f6f3'
const RED = '#dc2626'

type PlatType = 'dossier' | 'feuille' | 'amende'

interface Plat { x: number; y: number; w: number; type: PlatType; timer: number; broken: boolean }
interface Player { x: number; y: number; vx: number; vy: number; hp: number; hurt: number; stun: number }

function makePlat(y: number, force?: PlatType): Plat {
  const r = Math.random()
  const type: PlatType = force ?? (r < 0.58 ? 'dossier' : r < 0.82 ? 'feuille' : 'amende')
  const w = 52 + Math.random() * 32
  return { x: Math.random() * (W - w), y, w, type, timer: 0, broken: false }
}

function initPlats(): Plat[] {
  const ps: Plat[] = [{ x: W / 2 - 40, y: H - 60, w: 80, type: 'dossier', timer: 0, broken: false }]
  for (let i = 1; i < 14; i++) ps.push(makePlat(H - 60 - i * 38))
  return ps
}

function initPlayer(): Player {
  return { x: W / 2 - PW / 2, y: H - 60 - PH, vx: 0, vy: JUMP_V, hp: 3, hurt: 0, stun: 0 }
}

function drawLawyer(ctx: CanvasRenderingContext2D, x: number, y: number, hurt: number) {
  const c = hurt > 0 ? '#ef4444' : NAVY
  // robe
  ctx.fillStyle = c
  ctx.fillRect(x + 2, y + 13, PW - 4, PH - 13)
  // col blanc
  ctx.fillStyle = 'white'
  ctx.fillRect(x + 6, y + 12, PW - 12, 6)
  // tête
  ctx.fillStyle = '#f5d7b0'
  ctx.beginPath(); ctx.ellipse(x + PW / 2, y + 8, 7, 8, 0, 0, Math.PI * 2); ctx.fill()
  // perruque
  ctx.fillStyle = '#dedad3'
  ctx.beginPath(); ctx.ellipse(x + PW / 2, y + 3, 8.5, 6, 0, 0, Math.PI); ctx.fill()
  ctx.beginPath(); ctx.ellipse(x + 2, y + 8, 3.5, 6, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(x + PW - 2, y + 8, 3.5, 6, 0, 0, Math.PI * 2); ctx.fill()
  // yeux
  ctx.fillStyle = hurt > 0 ? '#dc2626' : '#1a1a2e'
  if (hurt > 0) {
    ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('x x', x + PW / 2, y + 11)
  } else {
    ctx.fillRect(x + 6, y + 7, 3, 3); ctx.fillRect(x + 12, y + 7, 3, 3)
  }
}

function drawPlat(ctx: CanvasRenderingContext2D, p: Plat, cam: number) {
  const sy = p.y - cam
  if (p.type === 'dossier') {
    ctx.fillStyle = NAVY
    ctx.fillRect(p.x, sy, p.w, PLAT_H)
    ctx.fillRect(p.x + 3, sy - 5, 18, 6)
    ctx.fillStyle = GOLD
    ctx.fillRect(p.x + 7, sy + 3, p.w - 14, 2)
    ctx.fillRect(p.x + 7, sy + 7, p.w - 14, 1)
  } else if (p.type === 'feuille') {
    const breaking = p.timer > FEUILLE_BREAK * 0.6
    const shake = breaking ? (Math.random() - 0.5) * 3 : 0
    ctx.fillStyle = breaking ? '#c9c5be' : '#e0ddd7'
    ctx.fillRect(p.x + shake, sy, p.w, PLAT_H)
    ctx.fillStyle = breaking ? '#9e9a94' : '#b5b1aa'
    for (let i = 0; i < 3; i++) ctx.fillRect(p.x + 5 + shake, sy + 2 + i * 3, p.w - 10, 1)
    if (breaking) {
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.beginPath()
      ctx.moveTo(p.x + p.w * 0.4 + shake, sy); ctx.lineTo(p.x + p.w * 0.5 + shake, sy + PLAT_H); ctx.stroke()
    }
  } else {
    // amende : avis rouge
    ctx.fillStyle = RED
    ctx.fillRect(p.x, sy, p.w, PLAT_H)
    ctx.fillStyle = 'white'; ctx.font = 'bold 7px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('AMENDE', p.x + p.w / 2, sy + 8)
  }
}

export function LawyerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useRef({ left: false, right: false })

  const st = useRef({
    phase: 'idle' as 'idle' | 'playing' | 'dead',
    player: initPlayer(),
    plats: initPlats(),
    cam: 0,
    score: 0,
    maxY: H - 60 - PH,
    frame: 0,
    animId: 0,
  })

  const loop = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const s = st.current
    const p = s.player

    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H)

    if (s.phase === 'idle') {
      s.frame++
      for (const pl of s.plats) drawPlat(ctx, pl, s.cam)
      drawLawyer(ctx, p.x, p.y - s.cam, 0)
      ctx.fillStyle = NAVY; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center'
      ctx.fillText('Grimper jusqu\'au sommet !', W / 2, H / 2 - 30)
      ctx.fillStyle = '#6b7280'; ctx.font = '11px system-ui'
      ctx.fillText('← → ou clic gauche / droit', W / 2, H / 2 - 10)
      ctx.fillText('Évitez les amendes rouges', W / 2, H / 2 + 8)
      ctx.fillStyle = NAVY; ctx.font = 'bold 12px system-ui'
      ctx.fillText('[ Clic ou Espace pour démarrer ]', W / 2, H / 2 + 32)
      s.animId = requestAnimationFrame(loop); return
    }

    if (s.phase === 'playing') {
      s.frame++
      if (p.hurt > 0) p.hurt--
      if (p.stun > 0) p.stun--

      // Mouvement horizontal
      if (!p.stun) {
        if (keys.current.left) p.vx = -MOVE_SPEED
        else if (keys.current.right) p.vx = MOVE_SPEED
        else p.vx *= 0.75
      } else {
        p.vx *= 0.75
      }

      p.vy += GRAVITY
      p.x += p.vx; p.y += p.vy

      // Wrap
      if (p.x > W) p.x = -PW
      if (p.x < -PW) p.x = W

      // Collisions plateformes (seulement en chute)
      if (p.vy > 0) {
        for (const pl of s.plats) {
          if (pl.broken) continue
          if (p.x + PW - 3 > pl.x && p.x + 3 < pl.x + pl.w &&
              p.y + PH >= pl.y && p.y + PH <= pl.y + PLAT_H + p.vy + 2) {
            if (pl.type === 'amende') {
              if (p.hurt === 0) { p.hp--; p.hurt = 50; p.stun = 30; p.vy = JUMP_V * 0.4 }
            } else {
              p.y = pl.y - PH; p.vy = JUMP_V
              if (pl.type === 'feuille') {
                if (pl.timer === 0) pl.timer = 1  // activer le décompte
              }
            }
          }
        }
      }

      // Avancer les timers feuille
      for (const pl of s.plats) {
        if (pl.type === 'feuille' && pl.timer > 0) pl.timer++
        if (pl.timer > FEUILLE_BREAK) pl.broken = true
      }

      // Caméra
      const target = p.y - H * 0.55
      if (target < s.cam) s.cam = target

      // Score = hauteur max atteinte
      if (p.y < s.maxY) { s.maxY = p.y; s.score = Math.floor((H - 60 - PH - s.maxY) / 8) }

      // Générer nouvelles plateformes
      const topY = Math.min(...s.plats.map(pl => pl.y))
      if (topY > s.cam - 20) {
        s.plats.push(makePlat(topY - 32 - Math.random() * 24))
        if (s.plats.length > 30) s.plats.splice(0, 1)
      }

      // Mort
      if (p.y - s.cam > H + 60 || p.hp <= 0) { s.phase = 'dead'; return }
    }

    // Dessin
    for (const pl of s.plats) {
      const sy = pl.y - s.cam
      if (sy > -20 && sy < H + 20 && !pl.broken) drawPlat(ctx, pl, s.cam)
    }
    drawLawyer(ctx, p.x, p.y - s.cam, p.hurt)

    // HUD vies
    ctx.font = '15px sans-serif'; ctx.textAlign = 'left'
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = i < p.hp ? 1 : 0.2
      ctx.fillStyle = GOLD; ctx.fillText('⚖', 6 + i * 22, 24)
    }
    ctx.globalAlpha = 1

    // HUD score
    ctx.fillStyle = NAVY; ctx.font = 'bold 12px "Courier New", monospace'; ctx.textAlign = 'right'
    ctx.fillText(String(s.score).padStart(4, '0') + 'm', W - 8, 22)

    // Légende petite
    ctx.font = '8px system-ui'; ctx.fillStyle = '#aaa'; ctx.textAlign = 'center'
    ctx.fillText('← clic gauche / clic droit →', W / 2, H - 4)

    if (s.phase === 'dead') {
      ctx.fillStyle = 'rgba(247,246,243,0.9)'; ctx.fillRect(40, H / 2 - 65, W - 80, 120)
      ctx.strokeStyle = '#e5e3de'; ctx.lineWidth = 1; ctx.strokeRect(40, H / 2 - 65, W - 80, 120)
      ctx.fillStyle = NAVY; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center'
      ctx.fillText('Plaidoirie terminée', W / 2, H / 2 - 32)
      ctx.fillStyle = GOLD; ctx.font = '13px system-ui'
      ctx.fillText(`Hauteur : ${s.score}m`, W / 2, H / 2 - 10)
      ctx.fillStyle = '#6b7280'; ctx.font = '11px system-ui'
      ctx.fillText('Clic ou Espace pour rejouer', W / 2, H / 2 + 14)
      return
    }

    s.animId = requestAnimationFrame(loop)
  }, [])

  const startOrRestart = useCallback(() => {
    const s = st.current
    if (s.phase === 'dead') {
      s.player = initPlayer(); s.plats = initPlats()
      s.cam = 0; s.score = 0; s.maxY = H - 60 - PH; s.frame = 0
      s.phase = 'playing'
      s.animId = requestAnimationFrame(loop)
    } else if (s.phase === 'idle') {
      s.phase = 'playing'
    }
  }, [loop])

  useEffect(() => {
    st.current.animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(st.current.animId)
  }, [loop])

  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = true
      if (e.code === 'Space') { e.preventDefault(); startOrRestart() }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = false
    }
    window.addEventListener('keydown', dn); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up) }
  }, [startOrRestart])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = st.current
    if (s.phase !== 'playing') { startOrRestart(); return }
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const cx = e.clientX - rect.left
    if (cx < rect.width / 2) { keys.current.left = true; setTimeout(() => { keys.current.left = false }, 160) }
    else { keys.current.right = true; setTimeout(() => { keys.current.right = false }, 160) }
  }, [startOrRestart])

  return (
    <canvas
      ref={canvasRef} width={W} height={H} onClick={handleClick}
      className="cursor-pointer w-full rounded-sm border border-[#e5e3de]"
      style={{ maxWidth: W }}
    />
  )
}
