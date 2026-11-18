import QRCode, { type QRCodeToStringOptions, type QRCodeToBufferOptions } from 'qrcode'
import { headers } from 'next/headers'

/**
 * URL de la page d'accueil encodee dans le QR code.
 *
 * QR code STATIQUE : l'URL est inscrite directement dans l'image, sans service
 * de redirection intermediaire -> il n'expire jamais. En contrepartie, si le
 * domaine change, les QR codes deja imprimes ne fonctionneront plus.
 *
 * Source : AUTH_URL (domaine de production, deja requis par Auth.js), sinon
 * l'hote de la requete (utile en local).
 */
export async function getHomeUrl(): Promise<string> {
  const fromEnv = process.env.AUTH_URL
  if (fromEnv) return new URL('/', fromEnv).toString()

  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}/`
}

// Fonce sur clair, contraste maximal ; marge de 4 modules (zone de silence standard) ;
// correction d'erreur H : reste lisible meme abime ou partiellement masque.
const COMMON = {
  errorCorrectionLevel: 'H',
  margin: 4,
  color: { dark: '#0e1a3f', light: '#ffffff' },
} as const

/** QR code en SVG (vectoriel : net a toute taille, ideal pour l'impression) */
export function qrSvg(url: string): Promise<string> {
  const opts: QRCodeToStringOptions = { ...COMMON, type: 'svg' }
  return QRCode.toString(url, opts)
}

/** QR code en PNG haute definition (web, documents) */
export function qrPng(url: string): Promise<Buffer> {
  const opts: QRCodeToBufferOptions = { ...COMMON, type: 'png', width: 1200 }
  return QRCode.toBuffer(url, opts)
}
