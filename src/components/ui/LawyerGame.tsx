'use client'

import { useEffect, useRef, useCallback } from 'react'

const W = 340
const H = 480
const PW = 28
const PH = 36
const GRAVITY = 0.36
const JUMP_V = -11.5
const MOVE_SPEED = 3.8
const PLAT_H = 14
const FEUILLE_BREAK = 80
const NAVY = '#1b2d5a'
const NAVY_LIGHT = '#2d4a7a'
const GOLD = '#c9a84c'
const GOLD_LIGHT = '#e8c97a'
const BG = '#f0efe9'
const BG2 = '#e8e6df'
const RED = '#dc2626'
const RED_LIGHT = '#fca5a5'
const GREEN = '#3d6b4a'
const GREEN_LIGHT = '#d4e8a0'
const FEUILLE_COL = '#7c9e68'
const FEUILLE_BREAK_COL = '#a89880'

type PlatType = 'dossier' | 'feuille' | 'amende'
interface Plat { x: number; y: number; w: number; type: PlatType; timer: number; broken: boolean }
interface Player { x: number; y: number; vx: number; vy: number; hp: number; hurt: number; stun: number; face: number }

function makePlat(y: number, force?: PlatType): Plat {
  const r = Math.random()
  const type: PlatType = force ?? (r < 0.55 ? 'dossier' : r < 0.80 ? 'feuille' : 'amende')
  const w = 60 + Math.random() * 36
  return { x: Math.random() * (W - w - 10) + 5, y, w, type, timer: 0, broken: false }
}

function initPlats(): Plat[] {
  const ps: Plat[] = [{ x: W / 2 - 50, y: H - 60, w: 100, type: 'dossier', timer: 0, broken: false }]
  for (let i = 1; i < 14; i++) ps.push(makePlat(H - 60 - i * 40))
  return ps
}

function initPlayer(): Player {
  return { x: W / 2 - PW / 2, y: H - 60 - PH, vx: 0, vy: JUMP_V, hp: 3, hurt: 0, stun: 0, face: 1 }
}

// Dessine l'avocat-fruit (inspiré du SVG de la page évolutions)
function drawAvocat(ctx: CanvasRenderingContext2D, x: number, y: number, hurt: number, face: number) {
  ctx.save()
  if (face < 0) { ctx.translate(x + PW, y); ctx.scale(-1, 1); x = 0; y = 0 } else { ctx.translate(x, y) ; x = 0; y = 0 }

  const cx = PW / 2
  const shakeX = hurt > 0 ? (Math.random() - 0.5) * 3 : 0

  // ombre légère
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.beginPath(); ctx.ellipse(cx + shakeX, PH + 4, 11, 4, 0, 0, Math.PI * 2); ctx.fill()

  // corps (poire)
  ctx.fillStyle = GREEN
  ctx.beginPath(); ctx.ellipse(cx + shakeX, y + PH * 0.62, 11, 15, 0, 0, Math.PI * 2); ctx.fill()
  // haut plus étroit
  ctx.fillStyle = '#3d6b4a'
  ctx.beginPath(); ctx.ellipse(cx + shakeX, y + PH * 0.28, 7, 10, 0, 0, Math.PI * 2); ctx.fill()

  // chair intérieure
  ctx.fillStyle = GREEN_LIGHT
  ctx.beginPath(); ctx.ellipse(cx + shakeX, y + PH * 0.6, 8, 11, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(cx + shakeX, y + PH * 0.28, 5, 7, 0, 0, Math.PI * 2); ctx.fill()

  // noyau
  ctx.fillStyle = GOLD
  ctx.beginPath(); ctx.ellipse(cx + shakeX, y + PH * 0.72, 5, 6.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = GOLD_LIGHT
  ctx.beginPath(); ctx.ellipse(cx + shakeX - 1, y + PH * 0.68, 2, 3, 0, 0, Math.PI * 2); ctx.fill()

  // queue
  ctx.strokeStyle = GREEN; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx + shakeX, y + 1); ctx.lineTo(cx + shakeX + 2, y - 5); ctx.stroke()

  // yeux
  if (hurt > 0) {
    ctx.fillStyle = RED; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('x  x', cx + shakeX, y + 14)
  } else {
    // oeil gauche
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx - 3.5 + shakeX, y + 13, 3, 3.5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1a1a2e'
    ctx.beginPath(); ctx.ellipse(cx - 3 + shakeX, y + 13.5, 1.8, 2, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx - 2.5 + shakeX, y + 12.5, 0.7, 0.7, 0, 0, Math.PI * 2); ctx.fill()
    // oeil droit
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx + 3.5 + shakeX, y + 13, 3, 3.5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1a1a2e'
    ctx.beginPath(); ctx.ellipse(cx + 4 + shakeX, y + 13.5, 1.8, 2, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx + 4.5 + shakeX, y + 12.5, 0.7, 0.7, 0, 0, Math.PI * 2); ctx.fill()
    // sourire
    ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.arc(cx + shakeX, y + 16, 3, 0.1, Math.PI - 0.1); ctx.stroke()
  }

  ctx.restore()
}

function drawPlat(ctx: CanvasRenderingContext2D, p: Plat, cam: number) {
  const sy = p.y - cam
  const r = 4

  if (p.type === 'dossier') {
    // ombre
    ctx.fillStyle = 'rgba(27,45,90,0.15)'
    ctx.beginPath(); ctx.roundRect(p.x + 2, sy + 4, p.w, PLAT_H, r); ctx.fill()
    // corps
    ctx.fillStyle = NAVY
    ctx.beginPath(); ctx.roundRect(p.x, sy, p.w, PLAT_H, r); ctx.fill()
    // onglet
    ctx.fillStyle = NAVY_LIGHT
    ctx.beginPath(); ctx.roundRect(p.x + 5, sy - 7, 22, 8, [3, 3, 0, 0]); ctx.fill()
    // lignes dossier
    ctx.fillStyle = GOLD; ctx.globalAlpha = 0.7
    ctx.fillRect(p.x + 8, sy + 4, p.w - 16, 2)
    ctx.fillRect(p.x + 8, sy + 8, p.w - 20, 1.5)
    ctx.globalAlpha = 1

  } else if (p.type === 'feuille') {
    const breaking = p.timer > FEUILLE_BREAK * 0.55
    const shk = breaking ? (Math.random() - 0.5) * 2.5 : 0
    ctx.fillStyle = 'rgba(0,0,0,0.08)'
    ctx.beginPath(); ctx.roundRect(p.x + 2 + shk, sy + 4, p.w, PLAT_H, r); ctx.fill()
    ctx.fillStyle = breaking ? FEUILLE_BREAK_COL : FEUILLE_COL
    ctx.beginPath(); ctx.roundRect(p.x + shk, sy, p.w, PLAT_H, r); ctx.fill()
    // nervures
    ctx.strokeStyle = breaking ? '#8a7060' : '#5a7a46'
    ctx.lineWidth = 1; ctx.globalAlpha = 0.6
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(p.x + 8 + shk, sy + 2 + i * 4); ctx.lineTo(p.x + p.w - 8 + shk, sy + 2 + i * 4); ctx.stroke()
    }
    ctx.globalAlpha = 1
    if (breaking) {
      ctx.strokeStyle = '#6b5a4a'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.8
      ctx.beginPath(); ctx.moveTo(p.x + p.w * 0.42 + shk, sy); ctx.lineTo(p.x + p.w * 0.52 + shk, sy + PLAT_H); ctx.stroke()
      ctx.globalAlpha = 1
    }

  } else {
    // amende
    ctx.fillStyle = 'rgba(220,38,38,0.2)'
    ctx.beginPath(); ctx.roundRect(p.x + 2, sy + 4, p.w, PLAT_H, r); ctx.fill()
    ctx.fillStyle = RED
    ctx.beginPath(); ctx.roundRect(p.x, sy, p.w, PLAT_H, r); ctx.fill()
    ctx.fillStyle = 'white'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('⚠ AMENDE', p.x + p.w / 2, sy + 9.5)
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

    // Fond dégradé
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#e8e6e0')
    grad.addColorStop(1, BG2)
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

    // Grille discrète
    ctx.strokeStyle = 'rgba(27,45,90,0.04)'; ctx.lineWidth = 1
    for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    if (s.phase === 'idle') {
      s.frame++
      for (const pl of s.plats) drawPlat(ctx, pl, s.cam)
      drawAvocat(ctx, p.x, p.y - s.cam, 0, 1)

      // Overlay semi-transparent
      ctx.fillStyle = 'rgba(240,239,233,0.88)'; ctx.fillRect(30, H / 2 - 80, W - 60, 150)
      ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.roundRect(30, H / 2 - 80, W - 60, 150, 8); ctx.stroke()

      ctx.fillStyle = NAVY; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center'
      ctx.fillText('Le Maître en cavale', W / 2, H / 2 - 46)
      ctx.fillStyle = '#6b7280'; ctx.font = '11px system-ui'
      ctx.fillText('Sautez de plateforme en plateforme', W / 2, H / 2 - 20)
      ctx.fillText('← → ou clic gauche/droit', W / 2, H / 2)
      ctx.fillStyle = RED; ctx.font = '10px system-ui'
      ctx.fillText('Évitez les amendes rouges !', W / 2, H / 2 + 20)
      ctx.fillStyle = NAVY; ctx.font = 'bold 12px system-ui'
      ctx.fillText('[ Clic ou Espace pour démarrer ]', W / 2, H / 2 + 50)
      s.animId = requestAnimationFrame(loop); return
    }

    if (s.phase === 'playing') {
      s.frame++
      if (p.hurt > 0) p.hurt--
      if (p.stun > 0) p.stun--

      if (!p.stun) {
        if (keys.current.left) { p.vx = -MOVE_SPEED; p.face = -1 }
        else if (keys.current.right) { p.vx = MOVE_SPEED; p.face = 1 }
        else p.vx *= 0.72
      } else { p.vx *= 0.72 }

      p.vy += GRAVITY; p.x += p.vx; p.y += p.vy

      if (p.x > W) p.x = -PW
      if (p.x < -PW) p.x = W

      if (p.vy > 0) {
        for (const pl of s.plats) {
          if (pl.broken) continue
          if (p.x + PW - 4 > pl.x && p.x + 4 < pl.x + pl.w &&
              p.y + PH >= pl.y && p.y + PH <= pl.y + PLAT_H + p.vy + 2) {
            if (pl.type === 'amende') {
              if (p.hurt === 0) { p.hp--; p.hurt = 55; p.stun = 32; p.vy = JUMP_V * 0.5 }
            } else {
              p.y = pl.y - PH; p.vy = JUMP_V
              if (pl.type === 'feuille' && pl.timer === 0) pl.timer = 1
            }
          }
        }
      }

      for (const pl of s.plats) {
        if (pl.type === 'feuille' && pl.timer > 0) pl.timer++
        if (pl.timer > FEUILLE_BREAK) pl.broken = true
      }

      const target = p.y - H * 0.52
      if (target < s.cam) s.cam = target

      if (p.y < s.maxY) { s.maxY = p.y; s.score = Math.floor((H - 60 - PH - s.maxY) / 7) }

      const topY = Math.min(...s.plats.map(pl => pl.y))
      if (topY > s.cam - 20) {
        s.plats.push(makePlat(topY - 36 - Math.random() * 22))
        if (s.plats.length > 32) s.plats.splice(0, 1)
      }

      if (p.y - s.cam > H + 80 || p.hp <= 0) { s.phase = 'dead'; return }
    }

    // Dessin plateformes
    for (const pl of s.plats) {
      const sy = pl.y - s.cam
      if (sy > -30 && sy < H + 20 && !pl.broken) drawPlat(ctx, pl, s.cam)
    }

    // Dessin avocat
    drawAvocat(ctx, p.x, p.y - s.cam, p.hurt, p.face)

    // HUD — vies
    ctx.font = '17px sans-serif'; ctx.textAlign = 'left'
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = i < p.hp ? 1 : 0.18
      ctx.fillText('🥑', 7 + i * 24, 26)
    }
    ctx.globalAlpha = 1

    // Légende plateformes
    ctx.font = '8px system-ui'; ctx.fillStyle = 'rgba(27,45,90,0.35)'; ctx.textAlign = 'left'
    ctx.fillText('📁 solide   🌿 fragile   ⚠ amende', 8, H - 6)

    // HUD — score
    ctx.fillStyle = NAVY; ctx.font = 'bold 13px "Courier New", monospace'; ctx.textAlign = 'right'
    ctx.fillText(String(s.score).padStart(4, '0') + 'm', W - 8, 24)

    if (s.phase === 'dead') {
      ctx.fillStyle = 'rgba(240,239,233,0.92)'
      ctx.beginPath(); ctx.roundRect(W / 2 - 110, H / 2 - 70, 220, 130, 10); ctx.fill()
      ctx.strokeStyle = RED; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.roundRect(W / 2 - 110, H / 2 - 70, 220, 130, 10); ctx.stroke()
      ctx.fillStyle = NAVY; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center'
      ctx.fillText('Plaidoirie terminée', W / 2, H / 2 - 36)
      ctx.fillStyle = GOLD; ctx.font = 'bold 20px system-ui'
      ctx.fillText(`${s.score}m`, W / 2, H / 2 - 6)
      ctx.fillStyle = '#6b7280'; ctx.font = '11px system-ui'
      ctx.fillText('Clic ou Espace pour rejouer', W / 2, H / 2 + 22)
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
      className="cursor-pointer w-full rounded-lg border border-[#e5e3de]"
      style={{ maxWidth: W }}
    />
  )
}
