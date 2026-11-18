import { NextResponse } from 'next/server'
import { auth } from '../auth'

// Protection des espaces prives, en plus des verifications des layouts (defense en profondeur).
// Volontairement limite aux espaces deja reserves : offres, carte, partenaires, adhesion et
// actualites restent publics (demonstration). Aucun changement visible pour l'utilisateur :
// les memes redirections vers /login existaient deja dans les layouts.
export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role
  const toLogin = () => NextResponse.redirect(new URL('/login', req.url))

  if (pathname.startsWith('/admin')) {
    if (role !== 'ADMIN') return toLogin()
  } else if (pathname.startsWith('/partenaire')) {
    if (role !== 'PARTNER_ADMIN' && role !== 'PARTNER_USER') return toLogin()
  } else if (!req.auth) {
    // espace membre : /tableau-de-bord, /mes-commandes, /mes-favoris
    return toLogin()
  }
  return NextResponse.next()
})

export const config = {
  // Runtime Node.js : l'authentification s'appuie sur Prisma (indisponible en runtime Edge)
  runtime: 'nodejs',
  // Le middleware ne s'execute QUE sur ces routes (aucun cout sur les pages publiques).
  // '/partenaire/:path*' ne correspond pas a la page publique '/partenaires'.
  matcher: [
    '/tableau-de-bord/:path*',
    '/mes-commandes/:path*',
    '/mes-favoris/:path*',
    '/partenaire/:path*',
    '/admin/:path*',
  ],
}
