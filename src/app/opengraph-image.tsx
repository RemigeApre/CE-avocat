import { readFile } from 'fs/promises'
import path from 'path'
import { ImageResponse } from 'next/og'

// Image d'apercu des liens partages (WhatsApp, LinkedIn, Messages...). Generee au build.
export const alt = 'Maître en Pause — Le Comité Professionnel des avocats'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  const cover = await readFile(path.join(process.cwd(), 'public', 'og-cover.jpg'))
  const coverSrc = `data:image/jpeg;base64,${cover.toString('base64')}`

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#1b2d5a' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px' }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 6, color: '#ebbc43', textTransform: 'uppercase', marginBottom: 24 }}>
            Comité Professionnel
          </div>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, color: 'white', lineHeight: 1.05 }}>
            Maître en<span style={{ color: '#ebbc43', marginLeft: 20 }}>Pause</span>
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: 'rgba(255,255,255,0.78)', marginTop: 28, lineHeight: 1.35, maxWidth: 540 }}>
            Des avantages négociés pour les avocats libéraux, les cabinets et leurs familles.
          </div>
          <div style={{ display: 'flex', width: 80, height: 4, background: '#c9a84c', marginTop: 40 }} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverSrc} width={560} height={630} alt="" style={{ objectFit: 'cover' }} />
      </div>
    ),
    size,
  )
}
