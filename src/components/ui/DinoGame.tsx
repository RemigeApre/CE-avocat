'use client'

import { useEffect, useRef, useCallback } from 'react'

const W = 520
const H = 160
const GROUND_Y = 128
const DINO_X = 50
const DINO_W = 22
const DINO_H = 28
const GRAVITY = 0.75
const JUMP_V = -13.5
const BASE_SPEED = 5

const NAVY = '#1b2d5a'
const GOLD = '#c9a84c'
const BG = '#f7f6f3'

interface Obstacle { x: number; w: number; h: number }

interface State {
  phase: 'idle' | 'running' | 'dead'
  dinoY: number
  velY: number
  onGround: boolean
  obstacles: Obstacle[]
  score: number
  frame: number
  speed: number
  animId: number
}

function drawDino(ctx: CanvasRenderingContext2D, y: number, frame: number, onGround: boolean, running: boolean) {
  ctx.fillStyle = NAVY
  // corps
  ctx.fillRect(DINO_X, y + 4, 20, DINO_H - 8)
  // tête
  ctx.fillRect(DINO_X + 6, y - 10, 18, 14)
  // museau
  ctx.fillRect(DINO_X + 22, y - 5, 5, 5)
  // oeil
  ctx.fillStyle = BG
  ctx.fillRect(DINO_X + 20, y - 8, 4, 4)
  ctx.fillStyle = NAVY
  ctx.fillRect(DINO_X + 21, y - 7, 2, 2)
  // dos
  ctx.fillRect(DINO_X + 2, y - 2, 6, 7)
  // queue
  ctx.fillRect(DINO_X - 7, y + 8, 10, 6)
  ctx.fillRect(DINO_X - 11, y + 12, 6, 4)
  // jambes
  const leg = running && onGround ? Math.floor(frame / 5) % 2 : 0
  ctx.fillRect(DINO_X + 3, y + DINO_H - 8, 6, leg === 0 ? 10 : 6)
  ctx.fillRect(DINO_X + 11, y + DINO_H - 8, 6, leg === 0 ? 6 : 10)
}

function drawCactus(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.fillStyle = NAVY
  const mx = o.x + o.w / 2
  // tronc
  ctx.fillRect(mx - 4, GROUND_Y - o.h, 8, o.h)
  // bras gauche
  const armY = GROUND_Y - o.h * 0.6
  ctx.fillRect(o.x, armY, o.w / 2 - 2, 5)
  ctx.fillRect(o.x, armY - 14, 5, 14)
  // bras droit
  ctx.fillRect(mx + 2, armY, o.w / 2 - 2, 5)
  ctx.fillRect(o.x + o.w - 5, armY - 10, 5, 10)
}

export function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const s = useRef<State>({
    phase: 'idle',
    dinoY: GROUND_Y - DINO_H,
    velY: 0,
    onGround: true,
    obstacles: [],
    score: 0,
    frame: 0,
    speed: BASE_SPEED,
    animId: 0,
  })

  const loop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const st = s.current

    ctx.fillStyle = BG
    ctx.fillRect(0, 0, W, H)

    // sol
    ctx.fillStyle = NAVY
    ctx.fillRect(0, GROUND_Y, W, 2)
    // petits cailloux déco
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(60 + i * 80 + (st.frame * (st.phase === 'running' ? st.speed * 0.3 : 0)) % (W - 20), GROUND_Y + 5, 3, 2)
    }

    if (st.phase === 'idle') {
      drawDino(ctx, st.dinoY, st.frame, true, false)
      ctx.fillStyle = NAVY
      ctx.font = '13px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Espace ou clic pour jouer', W / 2, 55)
      st.frame++
      st.animId = requestAnimationFrame(loop)
      return
    }

    if (st.phase === 'running') {
      st.frame++
      st.speed = BASE_SPEED + st.score / 600

      // physique
      if (!st.onGround) {
        st.velY += GRAVITY
        st.dinoY += st.velY
        if (st.dinoY >= GROUND_Y - DINO_H) {
          st.dinoY = GROUND_Y - DINO_H
          st.velY = 0
          st.onGround = true
        }
      }

      // spawn
      const interval = Math.max(55, 100 - st.score / 15)
      if (st.frame % Math.floor(interval) === 0) {
        const h = 24 + Math.random() * 22
        const w = 18 + Math.random() * 12
        st.obstacles.push({ x: W + 10, w, h })
      }

      // déplacer + nettoyer
      for (const o of st.obstacles) o.x -= st.speed
      st.obstacles = st.obstacles.filter(o => o.x > -60)

      // collision
      for (const o of st.obstacles) {
        if (
          DINO_X + 4 < o.x + o.w - 2 &&
          DINO_X + DINO_W - 4 > o.x + 2 &&
          st.dinoY + 4 < GROUND_Y - o.h + 4 + o.h &&
          st.dinoY + DINO_H - 2 > GROUND_Y - o.h + 4
        ) {
          st.phase = 'dead'
        }
      }

      st.score += st.speed * 0.1
    }

    // dessiner obstacles
    for (const o of st.obstacles) drawCactus(ctx, o)

    // dessiner dino
    if (st.phase === 'dead') {
      // dino yeux X
      ctx.fillStyle = NAVY
      ctx.fillRect(DINO_X + 6, st.dinoY - 10, 18, 14)
      ctx.fillRect(DINO_X + 2, st.dinoY + 4, 20, DINO_H - 8)
      ctx.fillRect(DINO_X + 2, st.dinoY - 2, 6, 7)
      ctx.fillRect(DINO_X - 7, st.dinoY + 8, 10, 6)
      ctx.fillRect(DINO_X - 11, st.dinoY + 12, 6, 4)
      ctx.fillRect(DINO_X + 22, st.dinoY - 5, 5, 5)
      ctx.fillRect(DINO_X + 3, st.dinoY + DINO_H - 8, 6, 8)
      ctx.fillRect(DINO_X + 11, st.dinoY + DINO_H - 8, 6, 8)
      // yeux X
      ctx.fillStyle = GOLD
      ctx.font = 'bold 11px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText('x', DINO_X + 17, st.dinoY - 3)
      ctx.fillText('x', DINO_X + 23, st.dinoY - 3)
    } else {
      drawDino(ctx, st.dinoY, st.frame, st.onGround, st.phase === 'running')
    }

    // score
    ctx.fillStyle = NAVY
    ctx.font = 'bold 13px "Courier New", monospace'
    ctx.textAlign = 'right'
    ctx.fillText(String(Math.floor(st.score)).padStart(5, '0'), W - 12, 20)

    if (st.phase === 'dead') {
      ctx.fillStyle = NAVY
      ctx.font = 'bold 15px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', W / 2, 48)
      ctx.fillStyle = GOLD
      ctx.font = '12px system-ui, sans-serif'
      ctx.fillText(`Score : ${Math.floor(st.score)}`, W / 2, 66)
      ctx.fillStyle = NAVY
      ctx.font = '11px system-ui, sans-serif'
      ctx.fillText('Rejouer — Espace ou clic', W / 2, 84)
      return // stop loop
    }

    st.animId = requestAnimationFrame(loop)
  }, [])

  const jump = useCallback(() => {
    const st = s.current
    if (st.phase === 'dead') {
      st.phase = 'running'
      st.dinoY = GROUND_Y - DINO_H
      st.velY = 0
      st.onGround = true
      st.obstacles = []
      st.score = 0
      st.frame = 0
      st.speed = BASE_SPEED
      st.animId = requestAnimationFrame(loop)
      return
    }
    if (st.phase === 'idle') {
      st.phase = 'running'
    }
    if (st.onGround) {
      st.velY = JUMP_V
      st.onGround = false
    }
  }, [loop])

  useEffect(() => {
    s.current.animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(s.current.animId)
  }, [loop])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [jump])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      onClick={jump}
      className="cursor-pointer w-full rounded-sm"
      style={{ maxWidth: W, imageRendering: 'pixelated' }}
    />
  )
}
