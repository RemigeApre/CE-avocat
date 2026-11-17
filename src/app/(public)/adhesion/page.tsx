import Link from 'next/link'
import { Button } from '@/components/ui'

export const metadata = { title: 'Adherer - Maitre en Pause' }

const PLANS = [
  {
    id: 'membre',
    name: 'Membre',
    price: '24',
    period: 'par an',
    description: "Pour l'avocat qui souhaite profiter des avantages negocies du CE.",
    features: [
      'Acces a toutes les offres partenaires',
      'Tarifs negocies exclusifs',
      'Newsletter mensuelle',
      'Acces a l\'espace membre',
    ],
    cta: 'Rejoindre',
    href: '/register',
    highlight: false,
  },
  {
    id: 'soutien',
    name: 'Membre soutien',
    price: '48',
    period: 'par an',
    description: "Pour ceux qui souhaitent soutenir activement le CE et ses initiatives.",
    features: [
      'Tous les avantages Membre',
      'Badge soutien visible',
      'Acces prioritaire aux nouvelles offres',
      'Participation aux votes du CE',
      'Contribue au financement des aides',
    ],
    cta: 'Rejoindre',
    href: '/register',
    highlight: true,
  },
  {
    id: 'cabinet',
    name: 'Cabinet',
    price: 'Sur devis',
    period: '',
    description: "Pour les cabinets et structures souhaitant inscrire plusieurs avocats.",
    features: [
      'Tarif degressif par avocat',
      'Facturation unique annuelle',
      'Gestionnaire de compte dedie',
      'Adhesions individuelles incluses',
      'Suivi des avantages par collaborateur',
    ],
    cta: 'Nous contacter',
    href: 'mailto:contact@ce-avocats.fr',
    highlight: false,
  },
]

export default function AdhesionPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">

      {/* En-tete */}
      <div className="text-center mb-14">
        <h1 className="text-3xl font-bold text-navy-800 mb-3">Adherer au Maitre en Pause</h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-sm">
          Un comite d'entreprise pense pour les avocats. Choisissez la formule qui vous correspond.
        </p>
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
            {/* Badge recommande */}
            <div className={['h-1 w-full', plan.highlight ? 'bg-gold-400' : 'bg-transparent'].join(' ')} />

            <div className="p-7 flex flex-col flex-1">
              {plan.highlight && (
                <span className="self-start text-xs font-semibold uppercase tracking-widest text-gold-600 mb-3">
                  Recommande
                </span>
              )}

              <h2 className="text-lg font-bold text-navy-800 mb-1">{plan.name}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{plan.description}</p>

              {/* Prix */}
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

              {/* Fonctionnalites */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  className="w-full"
                  variant={plan.highlight ? 'primary' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Note bas */}
      <p className="text-center text-xs text-gray-400 mt-10">
        Tarifs indicatifs pour la demonstration. L'adhesion est gerable depuis votre espace membre.
      </p>

    </div>
  )
}
