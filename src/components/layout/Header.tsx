'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { CATEGORY_PUNS, categoryHref } from '@/lib/categoryPuns'

const NAV_PUBLIC = [
  { href: '/offres', label: 'Offres' },
  { href: '/partenaires', label: 'Partenaires' },
  { href: '/actualites', label: 'Actualites' },
  { href: '/adhesion', label: 'Adherer' },
]

export function Header() {
  const { data: session } = useSession()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Menu mobile : sous-menu Offres deplie + categorie active (lue a l'ouverture, evite useSearchParams/Suspense)
  const [offersOpen, setOffersOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const pathname = usePathname()

  function openMobileMenu() {
    const onOffers = pathname === '/offres' || pathname.startsWith('/offres/')
    setActiveCategory(onOffers ? new URLSearchParams(window.location.search).get('categorie') : null)
    setOffersOpen(onOffers)
    setMobileMenuOpen(true)
  }
  const closeMobileMenu = () => setMobileMenuOpen(false)

  // Menu ouvert : bloque le defilement de la page et ferme avec Echap
  useEffect(() => {
    if (!mobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileMenuOpen])
  const role = session?.user?.role

  const dashboardHref =
    role === 'ADMIN' ? '/admin' :
    role === 'PARTNER_ADMIN' || role === 'PARTNER_USER' ? '/partenaire' :
    '/tableau-de-bord'

  const Logo = () => (
    <span className="flex items-center gap-2.5 shrink-0">
      <span className="w-8 h-8 rounded-full bg-white overflow-hidden shrink-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icone robe.png" alt="" className="w-7 h-7 object-contain" />
      </span>
      <span className="font-semibold text-white text-base tracking-wide">
        Maître en <span className="text-gold-400">Pause</span>
      </span>
    </span>
  )

  return (
    <>
      <header className="bg-navy-800 sticky top-0 z-40 border-b border-navy-700">
        <div className="w-full px-6 lg:px-16 h-[72px] flex items-center justify-between">

          {/* Gauche — burger mobile / logo desktop */}
          <div className="flex items-center">
            <button
              className="md:hidden p-1 text-white/80 hover:text-white transition-colors"
              onClick={openMobileMenu}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="hidden md:flex items-center gap-3 group hover:opacity-90 transition-opacity">
              <Logo />
            </Link>
          </div>

          {/* Centre — nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_PUBLIC.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'text-base font-medium transition-colors pb-0.5',
                    active
                      ? 'text-white border-b-2 border-gold-400'
                      : 'text-white/70 hover:text-white border-b-2 border-transparent',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              )
            })}
            {role === 'ADMIN' && (
              <Link
                href="/admin"
                className={[
                  'text-base font-medium transition-colors pb-0.5',
                  pathname.startsWith('/admin')
                    ? 'text-white border-b-2 border-gold-400'
                    : 'text-white/70 hover:text-white border-b-2 border-transparent',
                ].join(' ')}
              >
                Administration
              </Link>
            )}
          </nav>

          {/* Droite — logo mobile / actions desktop */}
          <div className="flex items-center gap-3">
            {/* Logo mobile (droite) */}
            <Link href="/" className="md:hidden" aria-label="Maître en Pause — accueil">
              {/* overflow-hidden + image < diametre/sqrt(2) : la robe reste entierement dans le cercle */}
              <span className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-sm ring-1 ring-gold-400/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icone robe.png" alt="" className="w-7 h-7 object-contain" />
              </span>
            </Link>

            {/* Actions desktop */}
            {session ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  <span className="max-w-[140px] truncate">{session.user.name}</span>
                  <svg className="h-4 w-4 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-[#e5e3de] shadow-md py-1 z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <Link href={dashboardHref} onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Mon espace</Link>
                    {(role === 'MEMBER' || role === 'ADMIN') && (
                      <Link href="/mes-favoris" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Mes favoris</Link>
                    )}
                    {(role === 'MEMBER' || role === 'ADMIN') && (
                      <Link href="/mes-commandes" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Mes commandes</Link>
                    )}
                    <hr className="my-1 border-[#e5e3de]" />
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Se deconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:block px-6 py-2.5 text-base font-semibold bg-gold-500 hover:bg-gold-400 text-white rounded-sm transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Menu mobile plein ecran */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-navy-800 flex flex-col overflow-y-auto overscroll-contain" role="dialog" aria-modal="true" aria-label="Menu">

          {/* Barre haute */}
          <div className="flex items-center justify-between px-6 h-[72px] border-b border-navy-700 shrink-0">
            <Link href="/" onClick={closeMobileMenu} className="font-semibold text-white text-base tracking-wide">
              Maître en <span className="text-gold-400">Pause</span>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-1 text-white/70 hover:text-white transition-colors"
              aria-label="Fermer le menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>

          {/* Nav principale */}
          <nav className="flex flex-col px-6 pt-6 gap-1">
            {/* Offres : sous-menu depliable (tout + chaque categorie) */}
            <div>
              <button
                type="button"
                onClick={() => setOffersOpen((o) => !o)}
                aria-expanded={offersOpen}
                aria-controls="mobile-offers-submenu"
                className={[
                  'w-full flex items-center justify-between px-4 py-3.5 rounded-md text-base font-medium transition-colors',
                  pathname === '/offres' || pathname.startsWith('/offres/') ? 'bg-navy-700 text-white' : 'text-white/70 hover:bg-navy-700 hover:text-white',
                ].join(' ')}
              >
                Offres
                <svg className={`w-4 h-4 text-white/40 transition-transform duration-200 ${offersOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              {/* Hauteur animee via grid-rows 0fr -> 1fr */}
              <div
                id="mobile-offers-submenu"
                className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${offersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                inert={!offersOpen}
              >
                <div className="overflow-hidden">
                  <ul className="ml-4 mt-1 mb-2 border-l border-navy-600 pl-2 space-y-0.5">
                    {[{ href: '/offres', label: 'Toutes les offres', sub: null as string | null, slug: null as string | null },
                      ...CATEGORY_PUNS.map((c) => ({ href: categoryHref(c.slug), label: c.pun, sub: c.category, slug: c.slug }))].map((item) => {
                      const active = pathname === '/offres' && activeCategory === item.slug
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={closeMobileMenu}
                            aria-current={active ? 'page' : undefined}
                            className={[
                              'flex items-baseline justify-between gap-3 px-3 py-2.5 rounded-md text-[15px] transition-colors',
                              active ? 'bg-navy-700 text-white' : 'text-white/65 hover:bg-navy-700 hover:text-white',
                            ].join(' ')}
                          >
                            <span className="flex items-center gap-2">
                              {active && <span className="w-1.5 h-1.5 rounded-full bg-gold-400" aria-hidden="true" />}
                              {item.label}
                            </span>
                            {item.sub && <span className="text-xs text-white/35">{item.sub}</span>}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>

            {NAV_PUBLIC.filter((item) => item.href !== '/offres').map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={[
                    'flex items-center justify-between px-4 py-3.5 rounded-md text-base font-medium transition-colors',
                    active ? 'bg-navy-700 text-white' : 'text-white/70 hover:bg-navy-700 hover:text-white',
                  ].join(' ')}
                >
                  {item.label}
                  <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              )
            })}
            {role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={closeMobileMenu}
                className={[
                  'flex items-center justify-between px-4 py-3.5 rounded-md text-base font-medium transition-colors',
                  pathname.startsWith('/admin') ? 'bg-navy-700 text-white' : 'text-white/70 hover:bg-navy-700 hover:text-white',
                ].join(' ')}
              >
                Administration
                <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            )}
          </nav>

          {/* QR code du site, seul */}
          <div className="mt-auto flex justify-center px-6 pt-8 pb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/api/qrcode?format=svg"
              alt="QR code de la page d'accueil de Maître en Pause"
              width={128}
              height={128}
              loading="lazy"
              className="w-32 h-32 rounded-sm bg-white"
            />
          </div>

          {/* Zone utilisateur en bas */}
          <div className="px-6 pb-10 border-t border-navy-700 pt-6">
            {session ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                  <span className="w-9 h-9 rounded-full bg-navy-600 border border-navy-500 flex items-center justify-center text-white font-semibold text-sm">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium">{session.user.name}</p>
                    <p className="text-white/40 text-xs">{session.user.email}</p>
                  </div>
                </div>
                <Link
                  href={dashboardHref}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-4 py-3 rounded-md text-sm text-white/70 hover:bg-navy-700 hover:text-white transition-colors"
                >
                  Mon espace
                  <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </Link>
                {(role === 'MEMBER' || role === 'ADMIN') && (
                  <Link
                    href="/mes-favoris"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-4 py-3 rounded-md text-sm text-white/70 hover:bg-navy-700 hover:text-white transition-colors"
                  >
                    Mes favoris
                    <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                  </Link>
                )}
                {(role === 'MEMBER' || role === 'ADMIN') && (
                  <Link
                    href="/mes-commandes"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-4 py-3 rounded-md text-sm text-white/70 hover:bg-navy-700 hover:text-white transition-colors"
                  >
                    Mes commandes
                    <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                  </Link>
                )}
                <button
                  onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                  className="w-full text-left px-4 py-3 rounded-md text-sm text-red-400 hover:bg-navy-700 hover:text-red-300 transition-colors"
                >
                  Se deconnecter
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="block w-full text-center px-6 py-3 text-base font-semibold bg-gold-500 hover:bg-gold-400 text-white rounded-sm transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>

        </div>
      )}
    </>
  )
}
