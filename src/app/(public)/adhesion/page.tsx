import Link from 'next/link'
import { Button } from '@/components/ui'

export const metadata = { title: 'Adherer - Maitre en Pause' }

const PLANS = [
  {
    id: 'classique',
    name: 'Classique',
    badge: null,
    price: '29,90',
    period: 'par an',
    description: "Pour l'avocat qui souhaite accéder aux avantages négociés du CE.",
    features: [
      'Acces a tout le catalogue partenaires',
      'Tarifs négociés exclusifs',
      'Restaurants, cinémas, sport, culture',
      'Livres et abonnements presse',
      'Acces a votre espace membre',
    ],
    note: 'Hors offres vacances et colonies enfants',
    cta: 'Choisir Classique',
    href: '/register',
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    badge: 'Recommandé',
    price: '69,90',
    period: 'par an',
    description: "Le catalogue complet : parcs, séjours, colonies de vacances inclus.",
    features: [
      'Tout l\'abonnement Classique',
      'Offres vacances et séjours',
      'Colonies et activités enfants',
      'Parcs d\'attractions et thermaux',
      'Accès prioritaire aux événements',
    ],
    note: 'Facturation annuelle — déductible en frais professionnels',
    cta: 'Choisir Premium',
    href: '/register',
    highlight: true,
  },
  {
    id: 'cabinet',
    name: 'Cabinet',
    badge: null,
    price: 'Sur devis',
    period: '',
    description: "Pour les cabinets souhaitant inscrire plusieurs avocats et collaborateurs.",
    features: [
      'Tarif dégressif par avocat',
      'Facturation unique annuelle',
      'Accès pour salariés du cabinet',
      'Gestionnaire de compte dédié',
      'Suivi des avantages par collaborateur',
    ],
    note: 'Passable en frais de cabinet',
    cta: 'Nous contacter',
    href: 'mailto:contact@maitre-en-pause.fr',
    highlight: false,
  },
]

export default function AdhesionPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">

      {/* En-tete */}
      <div className="text-center mb-14">
        <h1 className="text-3xl font-bold text-navy-800 mb-3">Adhérer à Maître en Pause</h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-sm">
          Un comité d&apos;entreprise pensé pour les avocats libéraux, les cabinets et leurs familles.
          Choisissez la formule qui vous correspond.
        </p>
        <p className="text-xs text-gray-400 mt-3">Abonnement annuel uniquement. Résiliable chaque année.</p>
      </div>

      {/* Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={[
              'rounded-lg border flex flex-col overflow-hidden',
              plan.highlight
                ? 'border-navy-800 shadow-lg shadow-navy-800/10'
                : 'border-[#e5e3de]',
            ].join(' ')}
          >
            <div className={['h-1 w-full', plan.highlight ? 'bg-gold-400' : 'bg-transparent'].join(' ')} />

            <div className="p-7 flex flex-col flex-1">
              {plan.badge && (
                <span className="self-start text-xs font-semibold uppercase tracking-widest text-gold-600 mb-3">
                  {plan.badge}
                </span>
              )}

              <h2 className="text-lg font-bold text-navy-800 mb-1">{plan.name}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{plan.description}</p>

              <div className="mb-7">
                {plan.period ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold text-navy-800">{plan.price}€</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-navy-800">{plan.price}</span>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.note && (
                <p className="text-xs text-gray-400 italic mb-6">{plan.note}</p>
              )}

              <Link href={plan.href}>
                <Button className="w-full" variant={plan.highlight ? 'primary' : 'outline'}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Eleve avocat */}
      <div className="mt-8 border border-[#e5e3de] rounded-lg px-7 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-navy-800">Élève avocat</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Tarif préférentiel pour les 4 132 élèves avocats en formation. Accès identique au Classique.
          </p>
        </div>
        <Link href="/register" className="shrink-0">
          <Button variant="outline" className="text-sm">Tarif élève</Button>
        </Link>
      </div>

      {/* CNB */}
      <div className="mt-4 border border-dashed border-[#e5e3de] rounded-lg px-7 py-5">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-500">Conseil National des Barreaux (CNB).</span>{' '}
          Une cotisation symbolique du CNB permettrait d&apos;afficher son soutien institutionnel et
          d&apos;augmenter la visibilité de la plateforme auprès des 81 640 avocats français.
          Un lien depuis le site du CNB représenterait un signal fort pour la profession.
        </p>
      </div>

    </div>
  )
}
