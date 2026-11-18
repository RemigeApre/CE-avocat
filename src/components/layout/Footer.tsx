import Link from 'next/link'
import { CATEGORY_PUNS, categoryHref } from '@/lib/categoryPuns'

const NAV_LINKS = [
  { href: '/offres', label: 'Offres' },
  { href: '/partenaires', label: 'Partenaires' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/adhesion', label: 'Adhérer' },
  { href: '/login', label: 'Connexion' },
]

const EXTRA_LINKS = [
  { href: '/evolutions', label: 'Évolutions envisagées' },
  { href: '/qr-code', label: 'QR code du site' },
  { href: '/le-geai', label: 'Le Geai, concepteur du site' },
  { href: '/contact', label: 'Contact' },
]

const LEGAL_LINKS = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/politique-confidentialite', label: 'Politique de confidentialité' },
]

export function Footer() {
  return (
    <footer className="bg-navy-800">
      {/* Ligne d'accent */}
      <div className="h-px bg-gold-400 opacity-40" />

      <div className="max-w-7xl mx-auto px-10 lg:px-16 pt-14 pb-10">

        {/* Contenu principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">

          {/* Marque */}
          <div>
            <Link href="/" className="inline-flex mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-complet.webp" loading="lazy" alt="Maître en Pause" className="h-10 w-auto object-contain rounded-sm" />
            </Link>
            <p className="text-sm text-navy-300 leading-relaxed max-w-xs">
              Le Comité Professionnel des avocats. Des avantages négociés, des partenaires sélectionnés.
            </p>
            <p className="mt-4 text-xs text-navy-300 italic">Site de démonstration</p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold text-gold-400 uppercase tracking-[0.15em] mb-5">
              Navigation
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-navy-300 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories : jeu de mot -> categorie reelle */}
          <div>
            <p className="text-xs font-semibold text-gold-400 uppercase tracking-[0.15em] mb-5">
              Nos catégories
            </p>
            <ul className="space-y-3">
              {CATEGORY_PUNS.map(({ pun, category, slug }) => (
                <li key={slug}>
                  <Link
                    href={categoryHref(slug)}
                    className="group inline-flex flex-wrap items-baseline gap-x-1.5 text-sm"
                  >
                    <span className="text-navy-300 group-hover:text-white transition-colors">{pun}</span>
                    <span className="text-xs text-navy-300 group-hover:text-gold-400 transition-colors">
                      <span aria-hidden="true">· </span>{category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal + extra */}
          <div>
            <p className="text-xs font-semibold text-gold-400 uppercase tracking-[0.15em] mb-5">
              Informations légales
            </p>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-navy-300 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
              <li className="pt-3 border-t border-navy-700 flex flex-col items-start gap-3">
                {EXTRA_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href} className="text-sm text-navy-300 hover:text-white transition-colors">
                    {label}
                  </Link>
                ))}
              </li>
            </ul>
          </div>

        </div>

        {/* Barre de bas */}
        <div className="border-t border-navy-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-navy-300">
            Maitre en Pause &copy; {new Date().getFullYear()}
          </p>
          <p className="text-xs text-navy-300">
            Réalisé bénévolement par{' '}
            <Link href="/le-geai" className="text-navy-300 font-medium hover:text-white transition-colors">Le Geai</Link>
          </p>
        </div>

      </div>
    </footer>
  )
}
