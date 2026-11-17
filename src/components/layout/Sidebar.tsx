'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type SidebarRole = 'admin' | 'partner' | 'member'

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: Record<SidebarRole, NavItem[]> = {
  admin: [
    { href: '/admin', label: 'Tableau de bord', icon: '◈' },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: '◉' },
    { href: '/admin/partenaires', label: 'Partenaires', icon: '◎' },
    { href: '/admin/categories', label: 'Categories', icon: '◫' },
    { href: '/admin/offres', label: 'Offres', icon: '◆' },
    { href: '/admin/actualites', label: 'Actualites', icon: '◩' },
  ],
  partner: [
    { href: '/partenaire', label: 'Tableau de bord', icon: '◈' },
    { href: '/partenaire/offres', label: 'Mes offres', icon: '◆' },
    { href: '/partenaire/equipe', label: 'Mon equipe', icon: '◉' },
  ],
  member: [
    { href: '/tableau-de-bord', label: 'Tableau de bord', icon: '◈' },
    { href: '/mes-commandes', label: 'Mes commandes', icon: '◆' },
    { href: '/offres', label: 'Toutes les offres', icon: '◎' },
  ],
}

const titles: Record<SidebarRole, string> = {
  admin: 'Administration',
  partner: 'Espace partenaire',
  member: 'Mon espace',
}

interface SidebarProps {
  role: SidebarRole
  partnerName?: string
}

export function Sidebar({ role, partnerName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-[#e5e3de] min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-[#e5e3de]">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {titles[role]}
        </p>
        {partnerName && (
          <p className="text-sm font-semibold text-navy-800 mt-1 truncate">{partnerName}</p>
        )}
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {navItems[role].map((item) => {
            const active =
              item.href === '/admin' || item.href === '/partenaire' || item.href === '/tableau-de-bord'
                ? pathname === item.href
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    active
                      ? 'bg-navy-50 text-navy-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-navy-800',
                  )}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
