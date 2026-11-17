'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

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
  const pathname = usePathname()
  const role = session?.user?.role

  const dashboardHref =
    role === 'ADMIN' ? '/admin' :
    role === 'PARTNER_ADMIN' || role === 'PARTNER_USER' ? '/partenaire' :
    '/tableau-de-bord'

  const Logo = () => (
    <span className="flex items-center gap-3 shrink-0">
      <span className="w-9 h-9 bg-navy-700 border border-navy-600 flex items-center justify-center rounded-[3px]">
        <span className="text-gold-400 font-bold text-sm tracking-tight">CE</span>
      </span>
      <span className="font-semibold text-white text-base">
        CE Avocats
        <span className="text-gold-500 font-normal"> : demo</span>
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
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
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
            <Link href="/" className="md:hidden flex items-center gap-2.5">
              <span className="w-8 h-8 bg-navy-700 border border-navy-600 flex items-center justify-center rounded-[3px]">
                <span className="text-gold-400 font-bold text-xs tracking-tight">CE</span>
              </span>
              <span className="font-semibold text-white text-sm">
                CE Avocats
              </span>
            </Link>

            {/* Actions desktop */}
            {session ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-navy-600 border border-navy-500 flex items-center justify-center text-white font-semibold text-xs">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden lg:block max-w-[120px] truncate">{session.user.name}</span>
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
        <div className="md:hidden fixed inset-0 z-50 bg-navy-800 flex flex-col">

          {/* Barre haute */}
          <div className="flex items-center justify-between px-6 h-[72px] border-b border-navy-700 shrink-0">
            <span className="font-semibold text-white text-base">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-white/70 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>

          {/* Nav principale */}
          <nav className="flex flex-col px-6 pt-6 gap-1">
            {NAV_PUBLIC.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
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
                onClick={() => setMobileMenuOpen(false)}
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

          {/* Zone utilisateur en bas */}
          <div className="mt-auto px-6 pb-10 border-t border-navy-700 pt-6">
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
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-md text-sm text-white/70 hover:bg-navy-700 hover:text-white transition-colors"
                >
                  Mon espace
                  <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </Link>
                {(role === 'MEMBER' || role === 'ADMIN') && (
                  <Link
                    href="/mes-commandes"
                    onClick={() => setMobileMenuOpen(false)}
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
                onClick={() => setMobileMenuOpen(false)}
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
