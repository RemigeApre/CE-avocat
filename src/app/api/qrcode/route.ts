import { getHomeUrl, qrPng, qrSvg } from '@/lib/qrcode'

// Telechargement du QR code : /api/qrcode?format=svg (defaut) ou ?format=png
export async function GET(req: Request) {
  const format = new URL(req.url).searchParams.get('format') === 'png' ? 'png' : 'svg'
  const url = await getHomeUrl()
  const filename = `qrcode-maitre-en-pause.${format}`
  const common = {
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'public, max-age=86400',
  }

  if (format === 'png') {
    const png = await qrPng(url)
    return new Response(new Uint8Array(png), { headers: { ...common, 'Content-Type': 'image/png' } })
  }

  const svg = await qrSvg(url)
  return new Response(svg, { headers: { ...common, 'Content-Type': 'image/svg+xml; charset=utf-8' } })
}
