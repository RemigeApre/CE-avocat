// Protection anti-bot, sans service tiers ni cle d'API. UNIQUEMENT cote serveur (routes API).
//
// 1. Jeton signe (HMAC) : date + alea + usage, valable 2 h, utilisable une seule fois.
// 2. Preuve de travail : le navigateur doit trouver un nombre tel que SHA-256(jeton:nombre)
//    commence par N bits a zero (~1 s pour un visiteur, prohibitif pour un robot a grande echelle).
// 3. Delai minimal entre l'obtention du jeton et l'envoi (un humain met plusieurs secondes a ecrire).
// 4. Limites de debit par adresse IP et globales (memoire du serveur : un seul conteneur).
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'

export type Purpose = 'contact' | 'reveal'

export const POW_DIFFICULTY: Record<Purpose, number> = { contact: 16, reveal: 15 }
const MIN_AGE_MS: Record<Purpose, number> = { contact: 4_000, reveal: 600 }
const MAX_AGE_MS = 2 * 60 * 60 * 1000

const SECRET = process.env.AUTH_SECRET ?? process.env.ANTIBOT_SECRET ?? 'dev-only-secret'

const b64url = (buf: Buffer) => buf.toString('base64url')
const sign = (data: string) => b64url(createHmac('sha256', SECRET).update(data).digest())

export function issueChallenge(purpose: Purpose) {
  const ts = Date.now().toString(36)
  const rand = b64url(randomBytes(12))
  const token = `${ts}.${rand}.${sign(`${ts}.${rand}.${purpose}`)}`
  return { token, difficulty: POW_DIFFICULTY[purpose] }
}

// Jetons deja utilises (anti-rejeu), purges a l'expiration
const used = new Map<string, number>()

function leadingZeroBits(buf: Buffer) {
  let bits = 0
  for (const byte of buf) {
    if (byte === 0) { bits += 8; continue }
    bits += Math.clz32(byte) - 24
    break
  }
  return bits
}

export type VerifyResult = { ok: true } | { ok: false; reason: 'invalid' | 'too-fast' | 'expired' | 'replay' | 'pow' }

export function verifyChallenge(purpose: Purpose, token: unknown, nonce: unknown): VerifyResult {
  if (typeof token !== 'string' || typeof nonce !== 'string' || nonce.length > 20) return { ok: false, reason: 'invalid' }
  const [ts, rand, sig] = token.split('.')
  if (!ts || !rand || !sig) return { ok: false, reason: 'invalid' }
  const expected = Buffer.from(sign(`${ts}.${rand}.${purpose}`))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: 'invalid' }

  const age = Date.now() - parseInt(ts, 36)
  if (!(age >= 0)) return { ok: false, reason: 'invalid' }
  if (age < MIN_AGE_MS[purpose]) return { ok: false, reason: 'too-fast' }
  if (age > MAX_AGE_MS) return { ok: false, reason: 'expired' }

  const hash = createHash('sha256').update(`${token}:${nonce}`).digest()
  if (leadingZeroBits(hash) < POW_DIFFICULTY[purpose]) return { ok: false, reason: 'pow' }

  const now = Date.now()
  for (const [t, exp] of used) if (exp < now) used.delete(t)
  if (used.has(token)) return { ok: false, reason: 'replay' }
  used.set(token, now + MAX_AGE_MS)
  return { ok: true }
}

// ── Limites de debit (fenetres glissantes) ──────────────────
const hits = new Map<string, number[]>()

/** true si l'action est autorisee (et la comptabilise) */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (list.length >= limit) { hits.set(key, list); return false }
  list.push(now)
  hits.set(key, list)
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < 24 * 3600_000)) hits.delete(k)
  return true
}

/** Adresse IP du visiteur (derriere le reverse proxy) */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  return (fwd?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'inconnue').trim()
}
