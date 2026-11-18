import { readFile } from 'fs/promises'
import path from 'path'
import { ImageResponse } from 'next/og'
import { parseCardParams, formatMeters } from '@/lib/gameCard'

// Carte de score du mini-jeu (1200 x 630) : apercu des liens partages et image a telecharger.
//   /api/game/card?score=1240&nom=Sophie%20B.&record=1[&download=1]
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const { score, name, record } = parseCardParams(params)
  const avocado = await readFile(path.join(process.cwd(), 'public', 'avocat-ravi.svg'))
  const avocadoSrc = `data:image/svg+xml;base64,${avocado.toString('base64')}`
  const who = name || 'Quelqu’un'

  const image = new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#1b2d5a', padding: 28 }}>
        <div style={{ flex: 1, display: 'flex', border: '2px solid rgba(201,168,76,0.55)', borderRadius: 24, padding: '48px 56px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', fontSize: 24, letterSpacing: 6, color: '#ebbc43', textTransform: 'uppercase' }}>
              Le Maître en cavale
            </div>
            {record && (
              <div style={{ display: 'flex', alignSelf: 'flex-start', marginTop: 20, background: '#c9a84c', color: '#0e1a3f', fontSize: 22, fontWeight: 700, borderRadius: 999, padding: '6px 18px' }}>
                Nouveau record
              </div>
            )}
            <div style={{ display: 'flex', fontSize: 150, fontWeight: 700, color: 'white', lineHeight: 1, marginTop: 24 }}>
              {formatMeters(score)}
            </div>
            <div style={{ display: 'flex', fontSize: 34, color: 'rgba(255,255,255,0.85)', marginTop: 22 }}>
              {`${who} a grimpé jusqu’ici.`}
            </div>
            <div style={{ display: 'flex', fontSize: 28, color: '#ebbc43', marginTop: 10 }}>Saurez-vous faire mieux ?</div>
            <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.6)', marginTop: 'auto' }}>
              Maître en Pause · Le Comité Professionnel des avocats
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avocadoSrc} width={300} height={390} alt="" style={{ alignSelf: 'center' }} />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )

  const headers = new Headers(image.headers)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable') // meme parametres = meme image
  if (params.get('download') === '1') headers.set('Content-Disposition', `attachment; filename="maitre-en-cavale-${score}m.png"`)
  return new Response(image.body, { status: 200, headers })
}
