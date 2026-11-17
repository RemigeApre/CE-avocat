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
const HEART_EVERY = 200   // metres entre chaque coeur
const NAVY = '#1b2d5a'
const NAVY_LIGHT = '#2d4a7a'
const GOLD = '#c9a84c'
const GOLD_LIGHT = '#e8c97a'
const BG2 = '#e8e6df'
const RED = '#dc2626'
const GREEN = '#3d6b4a'
const GREEN_LIGHT = '#d4e8a0'
const FEUILLE_COL = '#7c9e68'
const FEUILLE_BREAK_COL = '#a89880'

type PlatType = 'dossier' | 'feuille' | 'amende'
interface Plat { x: number; y: number; w: number; type: PlatType; timer: number; broken: boolean }
interface Player { x: number; y: number; vx: number; vy: number; hp: number; hurt: number; stun: number; face: number }
interface Heart { x: number; y: number; collected: boolean; bobOff: number }

// Garantit qu'une amende n'est jamais seule : si la précédente était amende, force dossier
function makePlat(y: number, lastWasAmende = false, force?: PlatType): Plat {
  const r = Math.random()
  let type: PlatType
  if (force) {
    type = force
  } else if (lastWasAmende) {
    type = r < 0.70 ? 'dossier' : 'feuille'
  } else {
    type = r < 0.55 ? 'dossier' : r < 0.80 ? 'feuille' : 'amende'
  }
  const w = 60 + Math.random() * 36
  return { x: Math.random() * (W - w - 10) + 5, y, w, type, timer: 0, broken: false }
}

function initPlats(): Plat[] {
  const ps: Plat[] = [{ x: W / 2 - 50, y: H - 60, w: 100, type: 'dossier', timer: 0, broken: false }]
  let lastAmende = false
  for (let i = 1; i < 14; i++) {
    const p = makePlat(H - 60 - i * 40, lastAmende)
    lastAmende = p.type === 'amende'
    ps.push(p)
  }
  return ps
}

function initPlayer(): Player {
  return { x: W / 2 - PW / 2, y: H - 60 - PH, vx: 0, vy: JUMP_V, hp: 3, hurt: 0, stun: 0, face: 1 }
}

function drawAvocat(ctx: CanvasRenderingContext2D, x: number, y: number, hurt: number, face: number) {
  ctx.save()
  if (face < 0) { ctx.translate(x + PW, y); ctx.scale(-1, 1); x = 0; y = 0 } else { ctx.translate(x, y); x = 0; y = 0 }
  const cx = PW / 2
  const shakeX = hurt > 0 ? (Math.random() - 0.5) * 3 : 0

  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.beginPath(); ctx.ellipse(cx + shakeX, PH + 4, 11, 4, 0, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = GREEN
  ctx.beginPath(); ctx.ellipse(cx + shakeX, y + PH * 0.62, 11, 15, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#3d6b4a'
  ctx.beginPath(); ctx.ellipse(cx + shakeX, y + PH * 0.28, 7, 10, 0, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = GREEN_LIGHT
  ctx.beginPath(); ctx.ellipse(cx + shakeX, y + PH * 0.6, 8, 11, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(cx + shakeX, y + PH * 0.28, 5, 7, 0, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = GOLD
  ctx.beginPath(); ctx.ellipse(cx + shakeX, y + PH * 0.72, 5, 6.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = GOLD_LIGHT
  ctx.beginPath(); ctx.ellipse(cx + shakeX - 1, y + PH * 0.68, 2, 3, 0, 0, Math.PI * 2); ctx.fill()

  ctx.strokeStyle = GREEN; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx + shakeX, y + 1); ctx.lineTo(cx + shakeX + 2, y - 5); ctx.stroke()

  if (hurt > 0) {
    ctx.fillStyle = RED; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('x  x', cx + shakeX, y + 14)
  } else {
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx - 3.5 + shakeX, y + 13, 3, 3.5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1a1a2e'
    ctx.beginPath(); ctx.ellipse(cx - 3 + shakeX, y + 13.5, 1.8, 2, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx - 2.5 + shakeX, y + 12.5, 0.7, 0.7, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx + 3.5 + shakeX, y + 13, 3, 3.5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1a1a2e'
    ctx.beginPath(); ctx.ellipse(cx + 4 + shakeX, y + 13.5, 1.8, 2, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx + 4.5 + shakeX, y + 12.5, 0.7, 0.7, 0, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.arc(cx + shakeX, y + 16, 3, 0.1, Math.PI - 0.1); ctx.stroke()
  }

  ctx.restore()
}

function drawPlat(ctx: CanvasRenderingContext2D, p: Plat, cam: number) {
  const sy = p.y - cam
  const r = 4

  if (p.type === 'dossier') {
    ctx.fillStyle = 'rgba(27,45,90,0.15)'
    ctx.beginPath(); ctx.roundRect(p.x + 2, sy + 4, p.w, PLAT_H, r); ctx.fill()
    ctx.fillStyle = NAVY
    ctx.beginPath(); ctx.roundRect(p.x, sy, p.w, PLAT_H, r); ctx.fill()
    ctx.fillStyle = NAVY_LIGHT
    ctx.beginPath(); ctx.roundRect(p.x + 5, sy - 7, 22, 8, [3, 3, 0, 0]); ctx.fill()
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
    ctx.fillStyle = 'rgba(220,38,38,0.2)'
    ctx.beginPath(); ctx.roundRect(p.x + 2, sy + 4, p.w, PLAT_H, r); ctx.fill()
    ctx.fillStyle = RED
    ctx.beginPath(); ctx.roundRect(p.x, sy, p.w, PLAT_H, r); ctx.fill()
    ctx.fillStyle = 'white'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('⚠ AMENDE', p.x + p.w / 2, sy + 9.5)
  }
}

function drawHeartPickup(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, bobOff: number) {
  const bob = Math.sin(frame * 0.06 + bobOff) * 3
  const cy = y + bob
  const s = 9

  ctx.save()
  // Halo
  ctx.fillStyle = 'rgba(239,68,68,0.15)'
  ctx.beginPath(); ctx.ellipse(x, cy + 2, s + 5, s + 2, 0, 0, Math.PI * 2); ctx.fill()
  // Coeur
  ctx.fillStyle = '#ef4444'
  ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x, cy + s * 0.3)
  ctx.bezierCurveTo(x, cy - s * 0.5, x - s, cy - s * 0.5, x - s, cy + s * 0.1)
  ctx.bezierCurveTo(x - s, cy + s * 0.65, x, cy + s * 1.05, x, cy + s * 1.05)
  ctx.bezierCurveTo(x, cy + s * 1.05, x + s, cy + s * 0.65, x + s, cy + s * 0.1)
  ctx.bezierCurveTo(x + s, cy - s * 0.5, x, cy - s * 0.5, x, cy + s * 0.3)
  ctx.fill(); ctx.stroke()
  // Reflet
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.beginPath(); ctx.ellipse(x - 3, cy - 2, 2.5, 2, -0.4, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawScoreHUD(ctx: CanvasRenderingContext2D, score: number, best: number, hp: number) {
  // Vies
  ctx.font = '17px sans-serif'; ctx.textAlign = 'left'
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = i < hp ? 1 : 0.18
    ctx.fillText('🥑', 7 + i * 24, 26)
  }
  ctx.globalAlpha = 1

  // Score live
  ctx.fillStyle = NAVY
  ctx.font = 'bold 14px "Courier New", monospace'; ctx.textAlign = 'right'
  ctx.fillText(String(score).padStart(5, '0') + 'm', W - 8, 22)

  // Best score
  if (best > 0) {
    ctx.fillStyle = GOLD
    ctx.font = '9px system-ui'; ctx.textAlign = 'right'
    ctx.fillText('best ' + best + 'm', W - 8, 35)
  }

  // Légende
  ctx.fillStyle = 'rgba(27,45,90,0.35)'; ctx.font = '8px system-ui'; ctx.textAlign = 'left'
  ctx.fillText('📁 solide   🌿 fragile   ⚠ amende', 8, H - 6)
}

function drawGameOver(ctx: CanvasRenderingContext2D, score: number, best: number, isRecord: boolean) {
  // Fond sombre
  ctx.fillStyle = 'rgba(10,15,30,0.72)'
  ctx.fillRect(0, 0, W, H)

  // Carte centrale
  const bx = W / 2 - 130, by = H / 2 - 110
  ctx.fillStyle = '#fafaf8'
  ctx.beginPath(); ctx.roundRect(bx, by, 260, 220, 12); ctx.fill()
  ctx.strokeStyle = isRecord ? GOLD : 'rgba(27,45,90,0.15)'
  ctx.lineWidth = isRecord ? 2 : 1
  ctx.beginPath(); ctx.roundRect(bx, by, 260, 220, 12); ctx.stroke()

  // Titre
  ctx.fillStyle = NAVY; ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center'
  ctx.fillText('Plaidoirie terminée', W / 2, by + 38)

  // Score
  ctx.fillStyle = GOLD; ctx.font = 'bold 48px "Courier New", monospace'; ctx.textAlign = 'center'
  ctx.fillText(String(score) + 'm', W / 2, by + 100)

  if (isRecord) {
    // Badge record
    ctx.fillStyle = GOLD
    ctx.beginPath(); ctx.roundRect(W / 2 - 60, by + 112, 120, 22, 11); ctx.fill()
    ctx.fillStyle = 'white'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('✦ NOUVEAU RECORD ✦', W / 2, by + 127)
  } else {
    // Meilleur score
    ctx.fillStyle = 'rgba(27,45,90,0.4)'; ctx.font = '11px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('record : ' + best + 'm', W / 2, by + 125)
  }

  // Séparateur
  ctx.strokeStyle = 'rgba(27,45,90,0.1)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(bx + 24, by + 148); ctx.lineTo(bx + 236, by + 148); ctx.stroke()

  // CTA
  ctx.fillStyle = NAVY; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'
  ctx.fillText('[ Espace ou clic pour rejouer ]', W / 2, by + 174)
}

export function LawyerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useRef({ left: false, right: false })

  const st = useRef({
    phase: 'idle' as 'idle' | 'playing' | 'dead',
    player: initPlayer(),
    plats: initPlats(),
    hearts: [] as Heart[],
    cam: 0,
    score: 0,
    bestScore: 0,
    isRecord: false,
    maxY: H - 60 - PH,
    frame: 0,
    animId: 0,
    lastPlatWasAmende: false,
    nextHeartScore: HEART_EVERY,
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lawyergame_best')
      if (saved) st.current.bestScore = parseInt(saved, 10)
    } catch { /* SSR ou privacy */ }
  }, [])

  const loop = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const s = st.current
    const p = s.player

    // Fond
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#e8e6e0'); grad.addColorStop(1, BG2)
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(27,45,90,0.04)'; ctx.lineWidth = 1
    for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    // ── IDLE ────────────────────────────────────────────────
    if (s.phase === 'idle') {
      s.frame++
      for (const pl of s.plats) drawPlat(ctx, pl, s.cam)
      drawAvocat(ctx, p.x, p.y - s.cam, 0, 1)

      ctx.fillStyle = 'rgba(240,239,233,0.90)'; ctx.fillRect(28, H / 2 - 85, W - 56, 158)
      ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.roundRect(28, H / 2 - 85, W - 56, 158, 8); ctx.stroke()

      ctx.fillStyle = NAVY; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center'
      ctx.fillText('Le Maître en cavale', W / 2, H / 2 - 50)
      ctx.fillStyle = '#6b7280'; ctx.font = '11px system-ui'
      ctx.fillText('Sautez de plateforme en plateforme', W / 2, H / 2 - 25)
      ctx.fillText('← → ou clic gauche/droit', W / 2, H / 2 - 5)
      ctx.fillStyle = RED; ctx.font = '10px system-ui'
      ctx.fillText('⚠ Évitez les amendes rouges !', W / 2, H / 2 + 18)
      if (s.bestScore > 0) {
        ctx.fillStyle = GOLD; ctx.font = 'bold 10px system-ui'
        ctx.fillText('record : ' + s.bestScore + 'm', W / 2, H / 2 + 38)
      }
      ctx.fillStyle = NAVY; ctx.font = 'bold 12px system-ui'
      ctx.fillText('[ Clic ou Espace pour démarrer ]', W / 2, H / 2 + 58)

      s.animId = requestAnimationFrame(loop)
      return
    }

    // ── PLAYING ─────────────────────────────────────────────
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

      if (p.y < s.maxY) {
        s.maxY = p.y
        s.score = Math.floor((H - 60 - PH - s.maxY) / 7)
      }

      // Génération de plateformes (avec garantie anti-amende consécutive)
      const topY = Math.min(...s.plats.map(pl => pl.y))
      if (topY > s.cam - 20) {
        const newPlat = makePlat(topY - 36 - Math.random() * 22, s.lastPlatWasAmende)
        s.lastPlatWasAmende = newPlat.type === 'amende'
        s.plats.push(newPlat)
        if (s.plats.length > 32) s.plats.splice(0, 1)
      }

      // Spawn coeurs tous les HEART_EVERY mètres
      if (s.score >= s.nextHeartScore) {
        const heartY = Math.min(...s.plats.map(pl => pl.y)) - 30
        s.hearts.push({ x: 20 + Math.random() * (W - 40), y: heartY, collected: false, bobOff: Math.random() * Math.PI * 2 })
        s.nextHeartScore += HEART_EVERY
      }

      // Collecte des coeurs (coordonnées monde)
      const pcx = p.x + PW / 2
      for (const h of s.hearts) {
        if (h.collected) continue
        if (Math.abs(pcx - h.x) < 22 && Math.abs(p.y + PH / 2 - h.y) < 22) {
          h.collected = true
          p.hp = Math.min(3, p.hp + 1)
        }
      }
      // Nettoyage coeurs trop loin en dessous
      s.hearts = s.hearts.filter(h => !h.collected && h.y - s.cam < H + 60)

      if (p.y - s.cam > H + 80 || p.hp <= 0) {
        // Mise à jour best score
        if (s.score > s.bestScore) {
          s.bestScore = s.score
          s.isRecord = true
          try { localStorage.setItem('lawyergame_best', String(s.score)) } catch { /* */ }
        } else {
          s.isRecord = false
        }
        s.phase = 'dead'
      }
    }

    // ── DESSIN COMMUN (playing + dead) ──────────────────────
    for (const pl of s.plats) {
      const sy = pl.y - s.cam
      if (sy > -30 && sy < H + 20 && !pl.broken) drawPlat(ctx, pl, s.cam)
    }

    for (const h of s.hearts) {
      if (!h.collected) drawHeartPickup(ctx, h.x, h.y - s.cam, s.frame, h.bobOff)
    }

    drawAvocat(ctx, p.x, p.y - s.cam, p.hurt, p.face)
    drawScoreHUD(ctx, s.score, s.bestScore, p.hp)

    if (s.phase === 'dead') {
      drawGameOver(ctx, s.score, s.bestScore, s.isRecord)
      return
    }

    s.animId = requestAnimationFrame(loop)
  }, [])

  const startOrRestart = useCallback(() => {
    const s = st.current
    if (s.phase === 'dead' || s.phase === 'idle') {
      const best = s.bestScore
      s.player = initPlayer(); s.plats = initPlats()
      s.hearts = []; s.cam = 0; s.score = 0
      s.maxY = H - 60 - PH; s.frame = 0
      s.bestScore = best; s.isRecord = false
      s.lastPlatWasAmende = false
      s.nextHeartScore = HEART_EVERY
      s.phase = 'playing'
      s.animId = requestAnimationFrame(loop)
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
