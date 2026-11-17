import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-navy-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 rounded bg-navy-700 flex items-center justify-center">
                <span className="text-gold-400 font-bold text-sm">CE</span>
              </span>
              <span className="font-semibold text-white text-sm">CE Avocats</span>
            </div>
            <p className="text-sm text-navy-200 leading-relaxed">
              Le comite d'entreprise de votre ecole d'avocats. Des avantages negocies pour vous.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-navy-300 uppercase tracking-wider mb-3">Navigation</p>
            <ul className="space-y-2">
              {[
                { href: '/offres', label: 'Les offres' },
                { href: '/partenaires', label: 'Partenaires' },
                { href: '/login', label: 'Connexion' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-navy-200 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-navy-300 uppercase tracking-wider mb-3">Contact</p>
            <p className="text-sm text-navy-200">
              Pour toute question, contactez le bureau du CE.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-navy-700 text-center">
          <p className="text-xs text-navy-400">
            CE Avocats {new Date().getFullYear()}. Projet pedagogique.
          </p>
        </div>
      </div>
    </footer>
  )
}
