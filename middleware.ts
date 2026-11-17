import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isAuthenticated = !!session
  const role = session?.user?.role

  if (
    pathname.startsWith('/offres') ||
    pathname.startsWith('/tableau-de-bord') ||
    pathname.startsWith('/mes-commandes')
  ) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if (pathname.startsWith('/partenaire')) {
    if (!isAuthenticated || (role !== 'PARTNER_ADMIN' && role !== 'PARTNER_USER')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated || role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
