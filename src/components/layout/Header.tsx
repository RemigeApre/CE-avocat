'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

const NAV_PUBLIC = [
  { href: '/offres', label: 'Offres' },
  { href: '/partenaires', label: 'Partenaires' },
  { href: '/adhesion', label: 'Adherer' },
]

export function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const role = session?.user?.role

  const dashboardHref =
    role === 'ADMIN' ? '/admin' :
    role === 'PARTNER_ADMIN' || role === 'PARTNER_USER' ? '/partenaire' :
    '/tableau-de-bord'

  return (
    <header className="bg-navy-800 sticky top-0 z-40 border-b border-navy-700">
      <div className="w-full px-10 lg:px-16 h-[72px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <span className="w-9 h-9 bg-navy-700 border border-navy-600 flex items-center justify-center rounded-[3px]">
            <span className="text-gold-400 font-bold text-sm tracking-tight">CE</span>
          </span>
          <span className="font-semibold text-white text-base hidden sm:block group-hover:text-gold-300 transition-colors">
            CE Avocats
          </span>
        </Link>

        {/* Nav public */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_PUBLIC.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white/65 hover:text-white transition-colors font-medium"
            >
              {item.label}
            </Link>
          ))}
          {role === 'ADMIN' && (
            <Link
              href="/admin"
              className="text-sm text-white/65 hover:text-white transition-colors font-medium"
            >
              Administration
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-navy-600 border border-navy-500 flex items-center justify-center text-white font-semibold text-xs">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:block max-w-[120px] truncate">
                  {session.user.name}
                </span>
                <svg className="h-4 w-4 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-[#e5e3de] shadow-md py-1 z-50"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link
                    href={dashboardHref}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Mon espace
                  </Link>
                  {(role === 'MEMBER' || role === 'ADMIN') && (
                    <Link
                      href="/mes-commandes"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Mes commandes
                    </Link>
                  )}
                  <hr className="my-1 border-[#e5e3de]" />
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
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
              className="px-5 py-2 text-sm font-semibold bg-gold-500 hover:bg-gold-400 text-white rounded-sm transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
