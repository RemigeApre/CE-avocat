import type { NextConfig } from 'next'

// Politique de securite du contenu. Publiee d'abord en "Report-Only" : le navigateur signale
// dans la console ce qui serait bloque, sans rien bloquer. Apres verification en production
// (carte, jeu, recherche, connexion), passer CSP_ENFORCE=true pour l'appliquer reellement.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // scripts d'hydratation de Next.js (inline)
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:", // images des offres (Unsplash, partenaires)
  "font-src 'self' data:",
  "connect-src 'self' https://tiles.openfreemap.org https://tile.openstreetmap.org", // fond de carte
  "worker-src 'self' blob:", // MapLibre
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' }, // pas d'affichage dans une iframe (clickjacking)
  // Localisation autorisee pour la carte (sur demande) ; tout le reste coupe
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()' },
  // HTTPS impose pendant 1 an (sans includeSubDomains : n'affecte pas les autres sous-domaines)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: process.env.CSP_ENFORCE === 'true' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only', value: CSP },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false, // ne pas annoncer la technologie du serveur
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Images et icones du dossier public : mises en cache 7 jours par le navigateur
      {
        source: '/:all*(webp|png|jpg|jpeg|svg|ico)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ]
  },
}

export default nextConfig
