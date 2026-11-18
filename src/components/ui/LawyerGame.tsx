'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Maximize2, Pause, Play, X } from 'lucide-react'

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
const STEP_MS = 1000 / 60 // physique a pas fixe : meme vitesse a 60, 90, 120 Hz
const TAP_MIN_MS = 160    // un appui bref deplace au moins ce temps (comme avant au clic)
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

// ── Difficulte progressive ──────────────────────────────────
const SAFE_START = 300     // m : aucune amende avant
const RAMP = 1700          // m : de SAFE_START a SAFE_START + RAMP, la difficulte passe de 0 a 1
const SAFE_REACH = 140     // px : ecart max entre deux plateformes utilisables (saut max ~183 px)
// ── Bonus ───────────────────────────────────────────────────
const BONUS_MIN = 700      // m : bonus seulement dans les niveaux plus durs
const BONUS_GAP = 300      // m : ecart minimal entre deux bonus
const BONUS_CHANCE = 0.035 // par plateforme eligible : rares
const CODE_FRAMES = 360    // 6 s d'invincibilite
const ROBE_FRAMES = 300    // 5 s de vol plane
const CAFE_FRAMES = 75     // propulsion (~180 m)
const CAFE_VY = -17
const GLIDE_VY = 1.3
// ── Huissier (ennemi) ───────────────────────────────────────
const HUISSIER_MIN = 900   // m : apparait seulement dans les niveaux durs
const HUISSIER_GAP = 350   // m : ecart minimal entre deux huissiers
const EW = 22              // largeur
const EH = 30              // hauteur

type PlatType = 'dossier' | 'feuille' | 'amende'
type BonusKind = 'code' | 'cafe' | 'robe'
interface Plat { x: number; y: number; w: number; vx: number; type: PlatType; timer: number; broken: boolean }
interface Player { x: number; y: number; vx: number; vy: number; hp: number; hurt: number; stun: number; face: number; squash: number }
interface Heart { x: number; y: number; collected: boolean; bobOff: number }
interface Bonus { x: number; y: number; kind: BonusKind; bobOff: number }
interface Power { kind: BonusKind; t: number; total: number }
interface FloatText { text: string; x: number; y: number; t: number }
/** Huissier : patrouille sur un dossier (minX..maxX), ou tombe une fois deboute (deadT > 0) */
interface Enemy { x: number; y: number; vx: number; minX: number; maxX: number; deadT: number; walk: number }

const BONUS_INFO: Record<BonusKind, { label: string; pickup: string; color: string }> = {
  code: { label: 'Intouchable', pickup: 'Code civil : intouchable !', color: '#b91c1c' },
  cafe: { label: 'Café', pickup: 'Café : décollage !', color: '#7c4a2d' },
  robe: { label: 'Vol plané', pickup: 'Robe : vol plané !', color: '#111827' },
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
/** 0 avant SAFE_START, puis monte lineairement jusqu'a 1 */
const difficulty = (score: number) => clamp01((score - SAFE_START) / RAMP)
/** Ecart vertical avant la prochaine plateforme : se creuse avec la difficulte (max ~92 px) */
const platGap = (score: number) => {
  const d = difficulty(score)
  return 36 + 16 * d + Math.random() * (22 + 18 * d)
}

// Amende jamais seule (jamais deux de suite), et aucune avant SAFE_START
function makePlat(y: number, score: number, lastWasAmende = false, force?: PlatType): Plat {
  const d = difficulty(score)
  const amendeP = score < SAFE_START ? 0 : 0.08 + 0.22 * d
  const feuilleP = 0.22 + 0.13 * d
  const r = Math.random()
  let type: PlatType
  if (force) type = force
  else if (lastWasAmende) type = r < 0.7 ? 'dossier' : 'feuille'
  else type = r < amendeP ? 'amende' : r < amendeP + feuilleP ? 'feuille' : 'dossier'

  const w = (60 + Math.random() * 36) * (1 - 0.2 * d)
  // Dossiers mobiles a partir d'un certain niveau
  const moving = type === 'dossier' && !force && score > 500 && Math.random() < 0.28 * d
  const vx = moving ? (Math.random() < 0.5 ? -1 : 1) * (0.6 + 1.0 * d) : 0
  return { x: Math.random() * (W - w - 10) + 5, y, w, vx, type, timer: 0, broken: false }
}

function initPlats(): Plat[] {
  const ps: Plat[] = [{ x: W / 2 - 50, y: H - 60, w: 100, vx: 0, type: 'dossier', timer: 0, broken: false }]
  for (let i = 1; i < 14; i++) ps.push(makePlat(H - 60 - i * 40, 0))
  return ps
}

function initPlayer(): Player {
  return { x: W / 2 - PW / 2, y: H - 60 - PH, vx: 0, vy: JUMP_V, hp: 3, hurt: 0, stun: 0, face: 1, squash: 0 }
}

interface AvocatFx { hp: number; squash: number; vy: number; power: BonusKind | null; frame: number }

function drawAvocat(ctx: CanvasRenderingContext2D, x: number, y: number, hurt: number, face: number, fx: AvocatFx = { hp: 3, squash: 0, vy: 0, power: null, frame: 0 }) {
  const cx = PW / 2
  const shakeX = hurt > 0 ? (Math.random() - 0.5) * 3 : 0

  // Etirement en montee, ecrasement a la reception (ancre aux pieds)
  const rise = clamp01(-fx.vy / -JUMP_V)
  const sx = 1 - 0.08 * rise + 0.2 * fx.squash
  const sy = 1 + 0.1 * rise - 0.24 * fx.squash

  ctx.save()
  ctx.translate(x, y)

  // Aura du Code civil (non deformee)
  if (fx.power === 'code') {
    const pulse = 0.5 + 0.5 * Math.sin(fx.frame * 0.2)
    ctx.strokeStyle = `rgba(201,168,76,${0.45 + 0.35 * pulse})`
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.ellipse(cx, PH * 0.55, 21 + pulse * 2, 25 + pulse * 2, 0, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = 'rgba(201,168,76,0.10)'; ctx.fill()
  }
  // Trainee de vapeur du cafe
  if (fx.power === 'cafe') {
    for (let i = 0; i < 4; i++) {
      const k = (fx.frame * 0.15 + i * 0.25) % 1
      ctx.fillStyle = `rgba(124,74,45,${0.28 * (1 - k)})`
      ctx.beginPath(); ctx.arc(cx + Math.sin(fx.frame * 0.3 + i) * 4, PH + 6 + k * 34, 4 + k * 6, 0, Math.PI * 2); ctx.fill()
    }
  }

  ctx.translate(cx, PH); ctx.scale(sx, sy); ctx.translate(-cx, -PH)
  if (face < 0) { ctx.translate(PW, 0); ctx.scale(-1, 1) }

  // Robe d'avocat qui flotte (derriere le corps)
  if (fx.power === 'robe') {
    const flap = Math.sin(fx.frame * 0.35) * 3
    ctx.fillStyle = '#111827'
    ctx.beginPath()
    ctx.moveTo(cx - 6, PH * 0.38)
    ctx.lineTo(cx - 19 - flap, PH * 0.95)
    ctx.quadraticCurveTo(cx, PH * 1.08 + flap, cx + 19 + flap, PH * 0.95)
    ctx.lineTo(cx + 6, PH * 0.38)
    ctx.closePath(); ctx.fill()
  }

  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.beginPath(); ctx.ellipse(cx + shakeX, PH + 4, 11, 4, 0, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = GREEN
  ctx.beginPath(); ctx.ellipse(cx + shakeX, PH * 0.62, 11, 15, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#3d6b4a'
  ctx.beginPath(); ctx.ellipse(cx + shakeX, PH * 0.28, 7, 10, 0, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = GREEN_LIGHT
  ctx.beginPath(); ctx.ellipse(cx + shakeX, PH * 0.6, 8, 11, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(cx + shakeX, PH * 0.28, 5, 7, 0, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = GOLD
  ctx.beginPath(); ctx.ellipse(cx + shakeX, PH * 0.72, 5, 6.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = GOLD_LIGHT
  ctx.beginPath(); ctx.ellipse(cx + shakeX - 1, PH * 0.68, 2, 3, 0, 0, Math.PI * 2); ctx.fill()

  ctx.strokeStyle = GREEN; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx + shakeX, 1); ctx.lineTo(cx + shakeX + 2, -5); ctx.stroke()

  // Rabat blanc de la robe, par-dessus le corps
  if (fx.power === 'robe') {
    ctx.fillStyle = 'white'
    ctx.fillRect(cx - 3 + shakeX, PH * 0.4, 2.5, 6); ctx.fillRect(cx + 0.5 + shakeX, PH * 0.4, 2.5, 6)
  }

  // L'avocat s'abime avec les degats (subtil)
  if (fx.hp <= 2) {
    // tache brune sur la chair
    ctx.fillStyle = 'rgba(122,92,46,0.55)'
    ctx.beginPath(); ctx.ellipse(cx - 4.5 + shakeX, PH * 0.5, 2.2, 1.6, 0.4, 0, Math.PI * 2); ctx.fill()
    // pansement
    ctx.save()
    ctx.translate(cx + 6 + shakeX, PH * 0.2); ctx.rotate(-0.6)
    ctx.fillStyle = '#f1d3a8'; ctx.beginPath(); ctx.roundRect(-5, -2, 10, 4, 2); ctx.fill()
    ctx.fillStyle = '#d9b483'; ctx.fillRect(-1.5, -2, 3, 4)
    ctx.restore()
  }
  if (fx.hp <= 1) {
    // fissure + seconde tache
    ctx.strokeStyle = 'rgba(40,60,40,0.7)'; ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx - 9 + shakeX, PH * 0.56); ctx.lineTo(cx - 6 + shakeX, PH * 0.62)
    ctx.lineTo(cx - 8.5 + shakeX, PH * 0.67); ctx.lineTo(cx - 5.5 + shakeX, PH * 0.74)
    ctx.stroke()
    ctx.fillStyle = 'rgba(122,92,46,0.5)'
    ctx.beginPath(); ctx.ellipse(cx + 5 + shakeX, PH * 0.82, 1.8, 1.3, 0, 0, Math.PI * 2); ctx.fill()
  }

  if (hurt > 0) {
    ctx.fillStyle = RED; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('x  x', cx + shakeX, 14)
  } else {
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx - 3.5 + shakeX, 13, 3, 3.5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1a1a2e'
    ctx.beginPath(); ctx.ellipse(cx - 3 + shakeX, 13.5, 1.8, 2, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx - 2.5 + shakeX, 12.5, 0.7, 0.7, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx + 3.5 + shakeX, 13, 3, 3.5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1a1a2e'
    ctx.beginPath(); ctx.ellipse(cx + 4 + shakeX, 13.5, 1.8, 2, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.ellipse(cx + 4.5 + shakeX, 12.5, 0.7, 0.7, 0, 0, Math.PI * 2); ctx.fill()
    if (fx.hp <= 1) {
      // paupieres lourdes : il est fatigue
      ctx.fillStyle = GREEN_LIGHT
      ctx.fillRect(cx - 7 + shakeX, 9, 6.5, 3.2); ctx.fillRect(cx + 0.5 + shakeX, 9, 6.5, 3.2)
      ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 0.9
      ctx.beginPath(); ctx.moveTo(cx - 6.5 + shakeX, 12.2); ctx.lineTo(cx - 0.5 + shakeX, 12.2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx + 0.5 + shakeX, 12.2); ctx.lineTo(cx + 6.5 + shakeX, 12.2); ctx.stroke()
    }
    ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 1.2
    ctx.beginPath()
    if (fx.hp <= 1) ctx.arc(cx + shakeX, 19, 2.6, Math.PI + 0.3, -0.3) // bouche triste
    else ctx.arc(cx + shakeX, 16, 3, 0.1, Math.PI - 0.1)
    ctx.stroke()
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

function drawBonus(ctx: CanvasRenderingContext2D, b: Bonus, cam: number, frame: number) {
  const x = b.x
  const y = b.y - cam + Math.sin(frame * 0.06 + b.bobOff) * 3
  ctx.save()
  // halo dore : il se remarque sans crier
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.1 + b.bobOff)
  ctx.fillStyle = `rgba(201,168,76,${0.16 + 0.12 * pulse})`
  ctx.beginPath(); ctx.arc(x, y, 15 + pulse * 2, 0, Math.PI * 2); ctx.fill()

  if (b.kind === 'code') {
    // Code civil : livre rouge
    ctx.fillStyle = '#b91c1c'; ctx.beginPath(); ctx.roundRect(x - 8, y - 10, 16, 20, 2); ctx.fill()
    ctx.fillStyle = '#7f1d1d'; ctx.fillRect(x - 8, y - 10, 3, 20)
    ctx.fillStyle = GOLD_LIGHT; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'
    ctx.fillText('C', x + 1.5, y + 3)
  } else if (b.kind === 'cafe') {
    // Cafe : tasse fumante
    ctx.strokeStyle = 'rgba(124,74,45,0.6)'; ctx.lineWidth = 1.3; ctx.lineCap = 'round'
    for (const dx of [-3, 2]) {
      ctx.beginPath(); ctx.moveTo(x + dx, y - 6)
      ctx.quadraticCurveTo(x + dx + 3, y - 10, x + dx, y - 13); ctx.stroke()
    }
    ctx.fillStyle = 'white'; ctx.strokeStyle = '#7c4a2d'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.roundRect(x - 7, y - 4, 13, 12, [1, 1, 4, 4]); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.arc(x + 7, y + 1.5, 3, -Math.PI / 2, Math.PI / 2); ctx.stroke()
    ctx.fillStyle = '#7c4a2d'; ctx.fillRect(x - 6, y - 3, 11, 2.5)
  } else {
    // Robe d'avocat noire a rabat blanc
    ctx.fillStyle = '#111827'
    ctx.beginPath()
    ctx.moveTo(x - 4, y - 10); ctx.lineTo(x + 4, y - 10)
    ctx.lineTo(x + 9, y - 4); ctx.lineTo(x + 6, y - 2); ctx.lineTo(x + 6, y + 10)
    ctx.lineTo(x - 6, y + 10); ctx.lineTo(x - 6, y - 2); ctx.lineTo(x - 9, y - 4)
    ctx.closePath(); ctx.fill()
    ctx.fillStyle = 'white'; ctx.fillRect(x - 2.5, y - 9, 2, 6); ctx.fillRect(x + 0.5, y - 9, 2, 6)
  }
  ctx.restore()
}

function drawHuissier(ctx: CanvasRenderingContext2D, e: Enemy, cam: number) {
  ctx.save()
  ctx.translate(e.x + EW / 2, e.y - cam + EH)
  if (e.deadT > 0) { ctx.rotate(Math.min(1.6, e.deadT * 0.08)); ctx.globalAlpha = Math.max(0, 1 - e.deadT / 40) }
  if (e.vx < 0) ctx.scale(-1, 1)
  const step = Math.sin(e.walk * 0.25) * 2.5
  // jambes
  ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 3; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-3, -9); ctx.lineTo(-3 - step, 0); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(3, -9); ctx.lineTo(3 + step, 0); ctx.stroke()
  // costume
  ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.roundRect(-8, -21, 16, 13, 3); ctx.fill()
  ctx.fillStyle = 'white'; ctx.beginPath(); ctx.moveTo(-3, -21); ctx.lineTo(3, -21); ctx.lineTo(0, -15); ctx.closePath(); ctx.fill()
  ctx.fillStyle = RED; ctx.fillRect(-0.8, -19, 1.6, 5)
  // serviette a documents
  ctx.fillStyle = '#7c4a2d'; ctx.beginPath(); ctx.roundRect(7, -14, 7, 6, 1); ctx.fill()
  ctx.strokeStyle = '#7c4a2d'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(10.5, -14, 1.8, Math.PI, 0); ctx.stroke()
  // tete
  ctx.fillStyle = '#f1c9a5'; ctx.beginPath(); ctx.arc(0, -25, 5, 0, Math.PI * 2); ctx.fill()
  // chapeau melon
  ctx.fillStyle = '#111827'
  ctx.beginPath(); ctx.ellipse(0, -28.5, 7, 1.6, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(0, -29, 4.5, Math.PI, 0); ctx.fill()
  // sourcils fronces, moustache
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(-3.5, -27); ctx.lineTo(-0.8, -26); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(3.5, -27); ctx.lineTo(0.8, -26); ctx.stroke()
  ctx.fillStyle = '#111827'; ctx.fillRect(-2.4, -23.2, 4.8, 1.2)
  ctx.restore()
}

function drawPause(ctx: CanvasRenderingContext2D, touch: boolean) {
  ctx.fillStyle = 'rgba(10,15,30,0.55)'
  ctx.fillRect(0, 0, W, H)
  const bx = W / 2 - 110, by = H / 2 - 52
  ctx.fillStyle = '#fafaf8'
  ctx.beginPath(); ctx.roundRect(bx, by, 220, 104, 12); ctx.fill()
  ctx.fillStyle = NAVY; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'
  ctx.fillText('Pause', W / 2, by + 40)
  ctx.fillStyle = '#6b7280'; ctx.font = '11px system-ui'
  ctx.fillText('Suspension d’audience', W / 2, by + 60)
  ctx.fillStyle = NAVY; ctx.font = 'bold 12px system-ui'
  ctx.fillText(touch ? '[ Touchez pour reprendre ]' : '[ Espace, P ou clic pour reprendre ]', W / 2, by + 86)
}

function drawPowerHUD(ctx: CanvasRenderingContext2D, power: Power) {
  const info = BONUS_INFO[power.kind]
  const bw = 84, bx = W / 2 - bw / 2, by = 30
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.beginPath(); ctx.roundRect(bx - 6, by - 16, bw + 12, 24, 6); ctx.fill()
  ctx.fillStyle = info.color; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'
  ctx.fillText(info.label, W / 2, by - 6)
  ctx.fillStyle = 'rgba(27,45,90,0.12)'
  ctx.beginPath(); ctx.roundRect(bx, by, bw, 4, 2); ctx.fill()
  ctx.fillStyle = GOLD
  ctx.beginPath(); ctx.roundRect(bx, by, Math.max(2, bw * (power.t / power.total)), 4, 2); ctx.fill()
}

function drawScoreHUD(ctx: CanvasRenderingContext2D, score: number, best: number, hp: number, lost?: { index: number; t: number }) {
  // Vies ; la vie qui vient d'etre perdue gonfle puis s'efface (subtil)
  ctx.font = '17px sans-serif'; ctx.textAlign = 'left'
  for (let i = 0; i < 3; i++) {
    if (lost && lost.t > 0 && i === lost.index) {
      const k = 1 - lost.t / 40 // 0 -> 1
      const scale = 1 + 0.55 * Math.sin(Math.min(1, k * 1.6) * Math.PI)
      ctx.save()
      ctx.globalAlpha = 0.18 + 0.82 * (1 - k)
      ctx.translate(7 + i * 24 + 9, 20); ctx.scale(scale, scale); ctx.rotate(k * 0.5)
      ctx.fillText('🥑', -9, 6)
      ctx.restore()
      continue
    }
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

function drawGameOver(ctx: CanvasRenderingContext2D, score: number, best: number, isRecord: boolean, touch: boolean) {
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
  ctx.fillText(touch ? '[ Touchez pour rejouer ]' : '[ Espace ou clic pour rejouer ]', W / 2, by + 174)
}

// Etat d'une partie neuve (le record et la phase sont conserves a part)
const freshState = () => ({
  player: initPlayer(),
  plats: initPlats(),
  hearts: [] as Heart[],
  bonuses: [] as Bonus[],
  power: null as Power | null,
  coffeeSafe: false,     // apres un cafe : amendes inoffensives et plateformes solides jusqu'a l'atterrissage
  floats: [] as FloatText[],
  enemies: [] as Enemy[],
  lastEnemyScore: 0,
  paused: false,
  lost: { index: -1, t: 0 },
  hurtFlash: 0,
  cam: 0,
  score: 0,
  maxY: H - 60 - PH,
  frame: 0,
  lastPlatWasAmende: false,
  lastUsableY: H - 60 - 13 * 40,
  lastBonusScore: 0,
  nextHeartScore: HEART_EVERY,
})

interface LawyerGameProps {
  /** Record deja connu (compte de l'utilisateur) : affiche comme record si superieur au record local */
  initialBest?: number
  /** Appele a chaque fin de partie avec le score (metres) */
  onGameOver?: (score: number) => void
}

export function LawyerGame({ initialBest = 0, onGameOver }: LawyerGameProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useRef({ left: false, right: false })      // clavier
  const ptrKeys = useRef({ left: false, right: false })   // souris / doigts
  const pointers = useRef(new Map<number, { side: 'left' | 'right'; at: number }>())
  const touchRef = useRef(false)  // ecran tactile : textes adaptes
  const dprRef = useRef(1)
  const lastTs = useRef<number | null>(null)
  const acc = useRef(0)
  const deadAt = useRef(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const fsRef = useRef(false)
  const onGameOverRef = useRef(onGameOver)
  useEffect(() => { onGameOverRef.current = onGameOver }, [onGameOver])


  const st = useRef({
    phase: 'idle' as 'idle' | 'playing' | 'dead',
    bestScore: 0,
    isRecord: false,
    animId: 0,
    ...freshState(),
  })

  useEffect(() => {
    touchRef.current = window.matchMedia('(pointer: coarse)').matches
    const canvas = canvasRef.current
    if (canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      dprRef.current = dpr
      canvas.width = W * dpr
      canvas.height = H * dpr
    }
  }, [])

  // Tactile : bloque le zoom au double appui, la selection de texte et la loupe.
  // Listeners natifs NON passifs : ceux de React le sont, leur preventDefault serait ignore.
  // Les evenements pointer (deplacement) continuent d'arriver normalement.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const block = (e: Event) => e.preventDefault()
    const opts = { passive: false } as const
    canvas.addEventListener('touchstart', block, opts)
    canvas.addEventListener('touchend', block, opts)
    canvas.addEventListener('dblclick', block)
    canvas.addEventListener('selectstart', block)
    return () => {
      canvas.removeEventListener('touchstart', block)
      canvas.removeEventListener('touchend', block)
      canvas.removeEventListener('dblclick', block)
      canvas.removeEventListener('selectstart', block)
    }
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lawyergame_best')
      if (saved) st.current.bestScore = Math.max(st.current.bestScore, parseInt(saved, 10) || 0)
    } catch { /* SSR ou privacy */ }
  }, [])

  // Record du compte (connecte) : prend le dessus s'il est meilleur que le record de ce navigateur
  useEffect(() => {
    if (initialBest > st.current.bestScore) st.current.bestScore = initialBest
  }, [initialBest])

  // Une iteration de jeu (mise a jour + dessin). La planification est dans `tick`.
  const step = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0)
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
      ctx.fillText(touchRef.current ? 'Touchez à gauche ou à droite' : '← → ou clic gauche/droit', W / 2, H / 2 - 5)
      ctx.fillStyle = RED; ctx.font = '10px system-ui'
      ctx.fillText('⚠ Évitez les amendes rouges !', W / 2, H / 2 + 18)
      if (s.bestScore > 0) {
        ctx.fillStyle = GOLD; ctx.font = 'bold 10px system-ui'
        ctx.fillText('record : ' + s.bestScore + 'm', W / 2, H / 2 + 38)
      }
      ctx.fillStyle = NAVY; ctx.font = 'bold 12px system-ui'
      ctx.fillText(touchRef.current ? '[ Touchez pour démarrer ]' : '[ Clic ou Espace pour démarrer ]', W / 2, H / 2 + 58)
      return
    }

    // ── PLAYING ─────────────────────────────────────────────
    if (s.phase === 'playing' && !s.paused) {
      s.frame++
      if (p.hurt > 0) p.hurt--
      if (p.stun > 0) p.stun--
      if (s.lost.t > 0) s.lost.t--
      if (s.hurtFlash > 0) s.hurtFlash--
      p.squash *= 0.82

      // Bonus actif
      const power = s.power
      if (power) {
        power.t--
        if (power.t <= 0) {
          if (power.kind === 'cafe') {
            // Fin du decollage : plateforme solide large posee sous l'avocat, atterrissage garanti
            const lw = 110
            s.plats.push({ x: Math.max(5, Math.min(W - lw - 5, p.x + PW / 2 - lw / 2)), y: p.y + PH + 120, w: lw, vx: 0, type: 'dossier', timer: 0, broken: false })
            p.vy = JUMP_V * 0.6
          }
          s.power = null
        }
      }

      const left = keys.current.left || ptrKeys.current.left
      const right = keys.current.right || ptrKeys.current.right
      if (!p.stun) {
        if (left) { p.vx = -MOVE_SPEED; p.face = -1 }
        else if (right) { p.vx = MOVE_SPEED; p.face = 1 }
        else p.vx *= 0.72
      } else { p.vx *= 0.72 }

      if (s.power?.kind === 'cafe') p.vy = CAFE_VY
      else {
        p.vy += GRAVITY
        if (s.power?.kind === 'robe' && p.vy > GLIDE_VY) p.vy = GLIDE_VY
      }
      p.x += p.vx; p.y += p.vy
      if (p.x > W) p.x = -PW
      if (p.x < -PW) p.x = W

      // Plateformes mobiles
      for (const pl of s.plats) {
        if (!pl.vx) continue
        pl.x += pl.vx
        if (pl.x < 5 || pl.x + pl.w > W - 5) pl.vx = -pl.vx
      }

      if (p.vy > 0) {
        const invincible = s.coffeeSafe || s.power?.kind === 'code'
        for (const pl of s.plats) {
          if (pl.broken) continue
          if (p.x + PW - 4 > pl.x && p.x + 4 < pl.x + pl.w &&
              p.y + PH >= pl.y && p.y + PH <= pl.y + PLAT_H + p.vy + 2) {
            if (pl.type === 'amende' && !invincible) {
              if (p.hurt === 0) {
                p.hp--; p.hurt = 55; p.stun = 32; p.vy = JUMP_V * 0.5
                s.lost = { index: p.hp, t: 40 }
                s.hurtFlash = 14
              }
            } else {
              p.y = pl.y - PH; p.vy = JUMP_V
              p.squash = 1
              s.coffeeSafe = false
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

      // Generation : difficulte progressive, toujours une echappatoire a portee de saut
      const topY = Math.min(...s.plats.map(pl => pl.y))
      if (topY > s.cam - 20) {
        let y = topY - platGap(s.score)
        if (s.lastPlatWasAmende) y = Math.max(y, s.lastUsableY - SAFE_REACH)
        const prevUsableY = s.lastUsableY
        const newPlat = makePlat(y, s.score, s.lastPlatWasAmende, s.coffeeSafe ? 'dossier' : undefined)
        s.lastPlatWasAmende = newPlat.type === 'amende'
        if (newPlat.type !== 'amende') s.lastUsableY = newPlat.y
        s.plats.push(newPlat)
        if (s.plats.length > 32) s.plats.splice(0, 1)

        // Huissier : rare, niveaux durs, patrouille sur un dossier fixe assez large.
        // Ce dossier devient un "danger" : la plateforme suivante sera sure et a portee (comme apres une amende).
        if (s.score >= HUISSIER_MIN && !s.coffeeSafe && s.enemies.length === 0 &&
            s.score - s.lastEnemyScore >= HUISSIER_GAP && newPlat.type === 'dossier' && !newPlat.vx &&
            newPlat.w >= 56 && Math.random() < 0.03 + 0.04 * difficulty(s.score)) {
          const d = difficulty(s.score)
          s.enemies.push({
            x: newPlat.x + newPlat.w / 2 - EW / 2, y: newPlat.y - EH,
            vx: (Math.random() < 0.5 ? -1 : 1) * (0.5 + 0.7 * d),
            minX: newPlat.x, maxX: newPlat.x + newPlat.w - EW, deadT: 0, walk: 0,
          })
          s.lastEnemyScore = s.score
          s.lastPlatWasAmende = true
          s.lastUsableY = prevUsableY
        }

        // Bonus : rares, seulement dans les niveaux durs, un seul a la fois, pose sur un dossier fixe
        if (s.score >= BONUS_MIN && !s.power && !s.coffeeSafe && s.bonuses.length === 0 && !s.lastPlatWasAmende &&
            s.score - s.lastBonusScore >= BONUS_GAP && newPlat.type === 'dossier' && !newPlat.vx &&
            Math.random() < BONUS_CHANCE) {
          const r = Math.random()
          const kind: BonusKind = r < 0.4 ? 'code' : r < 0.75 ? 'robe' : 'cafe'
          s.bonuses.push({ x: newPlat.x + newPlat.w / 2, y: newPlat.y - 24, kind, bobOff: Math.random() * Math.PI * 2 })
          s.lastBonusScore = s.score
        }
      }

      // Spawn coeurs tous les HEART_EVERY mètres
      if (s.score >= s.nextHeartScore) {
        const heartY = Math.min(...s.plats.map(pl => pl.y)) - 30
        s.hearts.push({ x: 20 + Math.random() * (W - 40), y: heartY, collected: false, bobOff: Math.random() * Math.PI * 2 })
        s.nextHeartScore += HEART_EVERY
      }

      // Collecte des coeurs (coordonnées monde)
      const pcx = p.x + PW / 2
      const pcy = p.y + PH / 2
      for (const h of s.hearts) {
        if (h.collected) continue
        if (Math.abs(pcx - h.x) < 22 && Math.abs(pcy - h.y) < 22) {
          h.collected = true
          p.hp = Math.min(3, p.hp + 1)
          s.floats.push({ text: '+1 ❤', x: h.x, y: h.y, t: 50 })
        }
      }
      // Nettoyage coeurs trop loin en dessous
      s.hearts = s.hearts.filter(h => !h.collected && h.y - s.cam < H + 60)

      // Collecte des bonus
      for (const b of s.bonuses) {
        if (Math.abs(pcx - b.x) < 22 && Math.abs(pcy - b.y) < 24) {
          const total = b.kind === 'code' ? CODE_FRAMES : b.kind === 'robe' ? ROBE_FRAMES : CAFE_FRAMES
          s.power = { kind: b.kind, t: total, total }
          if (b.kind === 'cafe') s.coffeeSafe = true
          s.floats.push({ text: BONUS_INFO[b.kind].pickup, x: Math.max(70, Math.min(W - 70, b.x)), y: b.y, t: 70 })
          b.y = Infinity // ramasse
        }
      }
      s.bonuses = s.bonuses.filter(b => b.y !== Infinity && b.y - s.cam < H + 60)

      // Huissier : patrouille, deboute si on lui saute dessus, sinon il fait mal
      for (const e of s.enemies) {
        if (e.deadT > 0) { e.deadT++; e.y += 4; continue }
        e.walk++
        e.x += e.vx
        if (e.x < e.minX || e.x > e.maxX) { e.vx = -e.vx; e.x = Math.max(e.minX, Math.min(e.maxX, e.x)) }
        const overlap = p.x + PW - 5 > e.x && p.x + 5 < e.x + EW && p.y + PH > e.y + 2 && p.y < e.y + EH
        if (!overlap) continue
        const stomp = p.vy > 0 && p.y + PH - p.vy <= e.y + 8
        const invincible = s.coffeeSafe || s.power?.kind === 'code' || s.power?.kind === 'cafe'
        if (stomp || invincible) {
          e.deadT = 1
          if (stomp) { p.vy = JUMP_V * 1.1; p.squash = 1 }
          s.floats.push({ text: 'Huissier débouté !', x: Math.max(60, Math.min(W - 60, e.x + EW / 2)), y: e.y, t: 60 })
        } else if (p.hurt === 0) {
          p.hp--; p.hurt = 55; p.stun = 32
          p.vx = (p.x + PW / 2 < e.x + EW / 2 ? -1 : 1) * MOVE_SPEED * 1.4
          p.vy = Math.min(p.vy, JUMP_V * 0.4)
          s.lost = { index: p.hp, t: 40 }
          s.hurtFlash = 14
          s.floats.push({ text: 'Saisie !', x: Math.max(40, Math.min(W - 40, e.x + EW / 2)), y: e.y, t: 45 })
        }
      }
      s.enemies = s.enemies.filter(e => e.deadT < 40 && e.y - s.cam < H + 60)

      // Textes flottants
      for (const f of s.floats) { f.t--; f.y -= 0.6 }
      s.floats = s.floats.filter(f => f.t > 0)

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
        deadAt.current = performance.now()
        onGameOverRef.current?.(s.score)
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
    for (const b of s.bonuses) drawBonus(ctx, b, s.cam, s.frame)
    for (const e of s.enemies) drawHuissier(ctx, e, s.cam)

    drawAvocat(ctx, p.x, p.y - s.cam, p.hurt, p.face, { hp: p.hp, squash: p.squash, vy: p.vy, power: s.power?.kind ?? null, frame: s.frame })

    // Textes flottants (bonus, coeur)
    for (const f of s.floats) {
      ctx.globalAlpha = Math.min(1, f.t / 20)
      ctx.fillStyle = NAVY; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'
      ctx.fillText(f.text, f.x, f.y - s.cam)
    }
    ctx.globalAlpha = 1

    // Voile rouge tres leger quand on perd une vie
    if (s.hurtFlash > 0) {
      ctx.fillStyle = `rgba(220,38,38,${0.10 * (s.hurtFlash / 14)})`
      ctx.fillRect(0, 0, W, H)
    }

    drawScoreHUD(ctx, s.score, s.bestScore, p.hp, s.lost)
    if (s.power) drawPowerHUD(ctx, s.power)

    if (s.phase === 'playing' && s.paused) drawPause(ctx, touchRef.current)
    if (s.phase === 'dead') {
      drawGameOver(ctx, s.score, s.bestScore, s.isRecord, touchRef.current)
    }
  }, [])

  // Boucle d'animation a pas fixe : la vitesse du jeu ne depend plus de l'ecran (60/90/120 Hz)
  const tick = useCallback((ts: number) => {
    const s = st.current
    if (lastTs.current === null) { lastTs.current = ts; acc.current = STEP_MS }
    acc.current += Math.min(ts - lastTs.current, 100) // onglet en arriere-plan : pas de rattrapage geant
    lastTs.current = ts
    while (acc.current >= STEP_MS) {
      step()
      acc.current -= STEP_MS
      if (s.phase === 'dead' || s.paused) return // ecran fige (fin ou pause) : plus de planification
    }
    s.animId = requestAnimationFrame(tick)
  }, [step])

  // Une seule boucle a la fois (corrige le double rythme au demarrage depuis l'ecran d'accueil)
  const schedule = useCallback(() => {
    cancelAnimationFrame(st.current.animId)
    lastTs.current = null
    st.current.animId = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    const s = st.current
    if (s.phase !== 'playing' || s.paused) return
    s.paused = true
    pointers.current.clear(); ptrKeys.current = { left: false, right: false }
    keys.current = { left: false, right: false }
    setPaused(true)
  }, [])

  const resume = useCallback(() => {
    const s = st.current
    if (!s.paused) return
    s.paused = false
    setPaused(false)
    schedule()
  }, [schedule])

  const togglePause = useCallback(() => {
    if (st.current.paused) resume(); else pause()
  }, [pause, resume])

  // Plein ecran : API native quand elle existe (Android, ordinateur), sinon affichage couvrant (iPhone)
  const enterFullscreen = useCallback(() => {
    fsRef.current = true
    setFullscreen(true)
    const el = wrapRef.current
    if (el?.requestFullscreen) el.requestFullscreen({ navigationUI: 'hide' }).catch(() => { /* repli : affichage couvrant */ })
  }, [])

  const exitFullscreen = useCallback(() => {
    fsRef.current = false
    setFullscreen(false)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => { /* deja sorti */ })
  }, [])

  // Sortie par le systeme (Echap natif, geste retour...) : on se resynchronise
  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement && fsRef.current) { fsRef.current = false; setFullscreen(false) } }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // Pause automatique : onglet cache, application en arriere-plan, fenetre qui perd le focus
  useEffect(() => {
    const onHide = () => { if (document.hidden) pause() }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('blur', pause)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('blur', pause)
    }
  }, [pause])

  // Echap en plein ecran (repli) : quitte le plein ecran sans fermer la fenetre du jeu.
  // Phase de capture : passe avant l'ecouteur qui ferme la fenetre.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fsRef.current) { e.stopImmediatePropagation(); exitFullscreen() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [exitFullscreen])

  // A la fermeture du jeu : on sort proprement du plein ecran natif
  useEffect(() => () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) }, [])

  const startOrRestart = useCallback(() => {
    const s = st.current
    if (s.phase === 'dead' || s.phase === 'idle') {
      Object.assign(s, freshState())
      s.isRecord = false
      s.phase = 'playing'
      schedule()
    }
  }, [schedule])

  useEffect(() => {
    schedule()
    const s = st.current
    return () => cancelAnimationFrame(s.animId)
  }, [schedule])

  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = true
      // Un bouton a le focus : Espace l'active normalement, sans doubler l'action
      if (e.code === 'Space' && e.target instanceof HTMLButtonElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (st.current.paused) resume()
        else if (st.current.phase !== 'playing') startOrRestart()
      }
      if (e.key === 'p' || e.key === 'P') togglePause()
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = false
    }
    window.addEventListener('keydown', dn); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up) }
  }, [startOrRestart, resume, togglePause])

  // Souris et doigts : moitie gauche / droite, appui maintenu, plusieurs doigts geres
  const syncPointers = () => {
    let left = false, right = false
    for (const { side } of pointers.current.values()) { if (side === 'left') left = true; else right = true }
    ptrKeys.current = { left, right }
  }

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const s = st.current
    if (s.paused) { resume(); return }
    if (s.phase !== 'playing') {
      // Evite de relancer par accident avec le doigt encore pose au moment de la chute
      if (s.phase === 'dead' && performance.now() - deadAt.current < 600) return
      startOrRestart()
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    const side = e.clientX - rect.left < rect.width / 2 ? 'left' : 'right'
    pointers.current.set(e.pointerId, { side, at: performance.now() })
    syncPointers()
  }, [startOrRestart, resume])

  const handlePointerEnd = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const ptr = pointers.current.get(e.pointerId)
    if (!ptr) return
    const release = () => { pointers.current.delete(e.pointerId); syncPointers() }
    const held = performance.now() - ptr.at
    if (held < TAP_MIN_MS) setTimeout(release, TAP_MIN_MS - held)
    else release()
  }, [])

  const toolBtn = 'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500'

  return (
    <div
      ref={wrapRef}
      className={
        fullscreen
          ? 'fixed inset-0 z-[10000] bg-navy-950 flex flex-col items-center justify-center gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] select-none touch-manipulation'
          : 'flex flex-col items-center'
      }
    >
      {/* Barre du plein ecran : titre + pause + sortie toujours visible */}
      {fullscreen && (
        <div className="w-[min(100%,calc((100dvh-7rem)*0.7083))] flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white truncate">Le Maître en cavale</p>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={togglePause} className={`${toolBtn} bg-white/10 text-white hover:bg-white/20`} aria-label={paused ? 'Reprendre' : 'Pause'}>
              {paused ? <Play className="w-4 h-4" aria-hidden="true" /> : <Pause className="w-4 h-4" aria-hidden="true" />}
              <span className="hidden min-[380px]:inline">{paused ? 'Reprendre' : 'Pause'}</span>
            </button>
            <button type="button" onClick={exitFullscreen} className={`${toolBtn} bg-gold-500 text-navy-900 hover:bg-gold-400`}>
              <X className="w-4 h-4" aria-hidden="true" />
              Quitter
            </button>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef} width={W} height={H}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onContextMenu={(e) => e.preventDefault()}
        className={[
          'cursor-pointer h-auto rounded-lg touch-none select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent]',
          // plein ecran : le plus grand possible sans deformer (ratio 340/480)
          fullscreen ? 'w-[min(100%,calc((100dvh-7rem)*0.7083))]' : 'w-full border border-[#e5e3de]',
        ].join(' ')}
        style={fullscreen ? undefined : { maxWidth: W }}
        aria-label="Mini-jeu Le Maître en cavale"
      />

      {/* Barre normale : pause + plein ecran */}
      {!fullscreen && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button type="button" onClick={togglePause} className={`${toolBtn} border border-[#e5e3de] text-navy-800 hover:bg-gray-50`}>
            {paused ? <Play className="w-4 h-4" aria-hidden="true" /> : <Pause className="w-4 h-4" aria-hidden="true" />}
            {paused ? 'Reprendre' : 'Pause'}
          </button>
          <button type="button" onClick={enterFullscreen} className={`${toolBtn} border border-[#e5e3de] text-navy-800 hover:bg-gray-50`}>
            <Maximize2 className="w-4 h-4" aria-hidden="true" />
            Plein écran
          </button>
        </div>
      )}
    </div>
  )
}
