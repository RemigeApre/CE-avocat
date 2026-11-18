import { getHomeUrl, qrPng, qrSvg } from '@/lib/qrcode'

// QR code de la page d'accueil.
//   /api/qrcode?format=svg (defaut) | ?format=png
//   &download=1 : force le telechargement (sinon affichable dans une balise <img>)
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const format = params.get('format') === 'png' ? 'png' : 'svg'
  const download = params.get('download') === '1'
  const url = await getHomeUrl()

  const common: Record<string, string> = { 'Cache-Control': 'public, max-age=86400' }
  if (download) common['Content-Disposition'] = `attachment; filename="qrcode-maitre-en-pause.${format}"`

  if (format === 'png') {
    const png = await qrPng(url)
    return new Response(new Uint8Array(png), { headers: { ...common, 'Content-Type': 'image/png' } })
  }

  const svg = await qrSvg(url)
  return new Response(svg, { headers: { ...common, 'Content-Type': 'image/svg+xml; charset=utf-8' } })
}
