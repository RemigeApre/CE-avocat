import { Download } from 'lucide-react'
import { getHomeUrl, qrSvg } from '@/lib/qrcode'

export const metadata = { title: 'QR code - Maitre en Pause' }

// L'URL vient de l'environnement d'execution (AUTH_URL) : rendu a la requete, pas au build
export const dynamic = 'force-dynamic'

export default async function QrCodePage() {
  const url = await getHomeUrl()
  const svg = await qrSvg(url)
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-2">Partager le site</p>
        <h1 className="text-3xl font-bold text-navy-800">QR code</h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
          Scannez ce code avec l&apos;appareil photo de votre téléphone pour accéder à la page d&apos;accueil de Maître en Pause.
        </p>
      </div>

      <div className="flex flex-col items-center">
        {/* SVG genere cote serveur par la bibliotheque qrcode a partir de notre propre URL */}
        <div
          role="img"
          aria-label={`QR code menant à ${displayUrl}`}
          className="w-full max-w-[320px] bg-white border border-[#e5e3de] rounded-sm p-3 shadow-sm [&>svg]:block [&>svg]:w-full [&>svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <a href={url} className="mt-5 text-sm font-medium text-navy-700 hover:text-gold-600 transition-colors break-all text-center">
          {displayUrl}
        </a>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <a
            href="/api/qrcode?format=svg&download=1"
            download
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            SVG <span className="text-white/60 font-normal">— impression</span>
          </a>
          <a
            href="/api/qrcode?format=png&download=1"
            download
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm border border-navy-800 text-navy-800 text-sm font-medium hover:bg-navy-50 transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            PNG <span className="text-navy-400 font-normal">— web, documents</span>
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center max-w-sm leading-relaxed">
          Pour une affiche ou un flyer, préférez le SVG : il reste net à toute taille.
          Imprimez-le foncé sur fond clair, sans le recadrer.
        </p>
      </div>
    </div>
  )
}
