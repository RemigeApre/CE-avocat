import Link from 'next/link'

const NAV_LINKS = [
  { href: '/offres', label: 'Offres' },
  { href: '/partenaires', label: 'Partenaires' },
  { href: '/actualites', label: 'Actualites' },
  { href: '/adhesion', label: 'Adherer' },
  { href: '/login', label: 'Connexion' },
]

const EXTRA_LINKS = [
  { href: '/evolutions', label: 'Evolutions envisagees' },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Marque */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
              <span className="w-9 h-9 bg-navy-700 border border-navy-600 flex items-center justify-center rounded-[3px]">
                <span className="text-gold-400 font-bold text-sm tracking-tight">CE</span>
              </span>
              <span className="font-semibold text-white text-base group-hover:text-gold-300 transition-colors">
                CE Avocats
              </span>
            </Link>
            <p className="text-sm text-navy-300 leading-relaxed max-w-xs">
              Le comite d'entreprise de votre ecole d'avocats. Des avantages negocies, des partenaires selectionnes.
            </p>
            <p className="mt-4 text-xs text-navy-500 italic">Site de demonstration</p>
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
              <li className="pt-2 border-t border-navy-700">
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
          <p className="text-xs text-navy-500">
            CE Avocats &copy; {new Date().getFullYear()}
          </p>
          <p className="text-xs text-navy-500">
            Realise benevole par{' '}
            <span className="text-navy-300 font-medium">Le Geai</span>
          </p>
        </div>

      </div>
    </footer>
  )
}
