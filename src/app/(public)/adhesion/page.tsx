import Link from 'next/link'
import { BadgeCheck, CalendarCheck, Check, ChevronDown, GraduationCap, Minus, Receipt, type LucideIcon } from 'lucide-react'
import { Carousel } from '@/components/ui'

export const metadata = { title: 'Adhérer - Maitre en Pause' }

// Encart sur le Conseil National des Barreaux, masque pour l'instant
const SHOW_CNB_NOTE = false

type PlanId = 'classique' | 'premium' | 'cabinet'

interface Plan {
  id: PlanId
  name: string
  badge: string | null
  /** Prix annuel en euros, ou null si sur devis */
  price: number | null
  description: string
  features: string[]
  note: string
  cta: string
  href: string
  highlight: boolean
}

const PLANS: Plan[] = [
  {
    id: 'classique',
    name: 'Classique',
    badge: null,
    price: 29.9,
    description: "Pour l'avocat qui souhaite accéder aux avantages négociés du Comité Professionnel.",
    features: [
      'Accès à tout le catalogue partenaires',
      'Tarifs négociés exclusifs',
      'Restaurants, cinémas, sport, culture',
      'Livres et abonnements presse',
      'Accès à votre espace membre',
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
    price: 69.9,
    description: 'Le catalogue complet : parcs, séjours, colonies de vacances inclus.',
    features: [
      "Tout l'abonnement Classique",
      'Offres vacances et séjours',
      'Colonies et activités enfants',
      "Parcs d'attractions et thermaux",
      'Accès prioritaire aux événements',
    ],
    note: 'Facturation annuelle, déductible en frais professionnels',
    cta: 'Choisir Premium',
    href: '/register',
    highlight: true,
  },
  {
    id: 'cabinet',
    name: 'Cabinet',
    badge: null,
    price: null,
    description: 'Pour les cabinets souhaitant inscrire plusieurs avocats et collaborateurs.',
    features: [
      'Tarif dégressif par avocat',
      'Facturation unique annuelle',
      'Accès pour salariés du cabinet',
      'Gestionnaire de compte dédié',
      'Suivi des avantages par collaborateur',
    ],
    note: 'Passable en frais de cabinet',
    cta: 'Nous contacter',
    href: 'mailto:contact@maitre-en-pause.fr?subject=Formule%20Cabinet',
    highlight: false,
  },
]

// Comparatif : true = inclus, false = non inclus, string = valeur affichee
type Cell = boolean | string
const COMPARISON: { group: string; rows: { label: string; values: Record<PlanId, Cell> }[] }[] = [
  {
    group: 'Catalogue',
    rows: [
      { label: 'Restaurants et gastronomie', values: { classique: true, premium: true, cabinet: true } },
      { label: 'Cinéma, théâtre, culture', values: { classique: true, premium: true, cabinet: true } },
      { label: 'Sport et bien-être', values: { classique: true, premium: true, cabinet: true } },
      { label: 'Livres et abonnements presse', values: { classique: true, premium: true, cabinet: true } },
      { label: 'Vacances et séjours', values: { classique: false, premium: true, cabinet: true } },
      { label: "Parcs d'attractions et thermaux", values: { classique: false, premium: true, cabinet: true } },
      { label: 'Colonies et activités enfants', values: { classique: false, premium: true, cabinet: true } },
    ],
  },
  {
    group: 'Services',
    rows: [
      { label: 'Espace membre', values: { classique: true, premium: true, cabinet: true } },
      { label: 'Accès prioritaire aux événements', values: { classique: false, premium: true, cabinet: true } },
      { label: 'Plusieurs avocats et salariés', values: { classique: false, premium: false, cabinet: true } },
      { label: 'Gestionnaire de compte dédié', values: { classique: false, premium: false, cabinet: true } },
      { label: 'Suivi par collaborateur', values: { classique: false, premium: false, cabinet: true } },
    ],
  },
  {
    group: 'Tarif',
    rows: [
      { label: 'Prix', values: { classique: '29,90 €/an', premium: '69,90 €/an', cabinet: 'Sur devis' } },
      { label: 'Facturation', values: { classique: 'Annuelle', premium: 'Annuelle', cabinet: 'Unique, annuelle' } },
    ],
  },
]

const REASSURANCE: { Icon: LucideIcon; label: string }[] = [
  { Icon: CalendarCheck, label: 'Résiliable chaque année' },
  { Icon: Receipt, label: 'Premium déductible en frais professionnels' },
  { Icon: BadgeCheck, label: 'Réservé aux avocats et élèves avocats' },
]

// Reponses construites uniquement a partir des informations deja presentes sur le site
const FAQ: { q: string; a: string }[] = [
  {
    q: 'Comment se passe l’adhésion ?',
    a: 'En quatre étapes : vous vous inscrivez gratuitement, vous prouvez votre inscription au barreau, vous choisissez votre cotisation, puis vous accédez aux offres et avantages.',
  },
  {
    q: 'Puis-je résilier mon adhésion ?',
    a: 'Oui. L’abonnement est annuel et résiliable chaque année.',
  },
  {
    q: 'La cotisation est-elle déductible ?',
    a: 'La formule Premium est déductible en frais professionnels, et la formule Cabinet est passable en frais de cabinet.',
  },
  {
    q: 'Je suis élève avocat, ai-je droit à un tarif ?',
    a: 'Oui : les élèves avocats bénéficient d’un tarif préférentiel, avec un accès identique à la formule Classique.',
  },
  {
    q: 'Ma famille peut-elle en profiter ?',
    a: 'Le Comité est pensé pour les avocats et leurs familles. Avec la formule Premium, vous accédez notamment aux séjours, aux parcs et aux colonies et activités pour enfants.',
  },
]

const euro = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      id={plan.id}
      className={[
        'h-full rounded-lg border flex flex-col overflow-hidden scroll-mt-24 bg-white',
        plan.highlight ? 'border-navy-800 shadow-xl shadow-navy-800/10 md:-translate-y-2' : 'border-[#e5e3de]',
      ].join(' ')}
    >
      <div className={['h-1 w-full', plan.highlight ? 'bg-gold-400' : 'bg-transparent'].join(' ')} />

      <div className="p-6 md:p-7 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h2 className="text-lg font-bold text-navy-800">{plan.name}</h2>
          {plan.badge && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-navy-900 bg-gold-400 rounded-full px-2.5 py-1">
              {plan.badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 leading-relaxed mb-6 min-h-[2.5rem]">{plan.description}</p>

        <div className="mb-6">
          {plan.price !== null ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-navy-800 tabular-nums">{euro(plan.price)}&nbsp;€</span>
                <span className="text-sm text-gray-400">par an</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">soit {euro(plan.price / 12)}&nbsp;€ par mois</p>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold text-navy-800">Sur devis</span>
              <p className="mt-1.5 text-xs text-gray-400">tarif dégressif selon la taille du cabinet</p>
            </>
          )}
        </div>

        <ul className="space-y-2.5 mb-6 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
              <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" strokeWidth={2.25} aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>

        <p className="text-xs text-gray-400 italic mb-6">{plan.note}</p>

        <Link
          href={plan.href}
          className={[
            'w-full inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            plan.highlight
              ? 'bg-navy-800 text-white hover:bg-navy-700'
              : 'border border-navy-800 text-navy-800 hover:bg-navy-50',
          ].join(' ')}
        >
          {plan.cta}
        </Link>
      </div>
    </div>
  )
}

function CellValue({ value, highlight }: { value: Cell; highlight: boolean }) {
  if (value === true) {
    return (
      <>
        <Check className={['w-4 h-4 mx-auto', highlight ? 'text-gold-600' : 'text-navy-700'].join(' ')} strokeWidth={2.25} aria-hidden="true" />
        <span className="sr-only">Inclus</span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <Minus className="w-4 h-4 mx-auto text-gray-300" aria-hidden="true" />
        <span className="sr-only">Non inclus</span>
      </>
    )
  }
  return <span className="text-xs sm:text-sm font-medium text-navy-800">{value}</span>
}

export default function AdhesionPage() {
  const recommended = PLANS.findIndex((p) => p.highlight)

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-6 pt-12 md:pt-16">

        {/* En-tete */}
        <div className="text-center mb-6 md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600 mb-3">Adhésion</p>
          <h1 className="text-3xl md:text-4xl font-bold text-navy-800 mb-3">Adhérer à Maître en Pause</h1>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-sm">
            Un comité d&apos;entreprise pensé pour les avocats libéraux, les cabinets et leurs familles.
            Choisissez la formule qui vous correspond.
          </p>
          <ul className="mt-6 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {REASSURANCE.map(({ Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2 text-xs text-gray-500">
                <Icon className="w-4 h-4 text-gold-500" strokeWidth={1.75} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Formules - mobile : carrousel centre sur l'offre recommandee ; md+ : 3 colonnes */}
        <div className="-mx-6 md:mx-0">
          <Carousel
            itemWidth="min(84vw, 340px)"
            label="Formules d'adhésion"
            initialIndex={recommended}
            className="md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pt-4 md:pb-0 md:[mask-image:none]"
            itemClassName="md:w-auto"
            dotsClassName="md:hidden"
          >
            {PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
          </Carousel>
        </div>

        {/* Eleve avocat */}
        <div className="mt-8 md:mt-10 rounded-lg bg-[#f7f6f3] border border-[#e5e3de] px-6 md:px-7 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-sm bg-navy-800 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-gold-400" strokeWidth={1.6} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-800">Élève avocat</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Tarif préférentiel pour les 4 132 élèves avocats en formation. Accès identique au Classique.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-navy-800 px-4 py-2 text-sm font-medium text-navy-800 hover:bg-white transition-colors"
          >
            Tarif élève
          </Link>
        </div>
      </div>

      {/* Comparatif */}
      <section className="mt-14 md:mt-20 bg-[#f7f6f3] border-y border-[#e5e3de] py-12 md:py-16" aria-labelledby="comparatif">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600 mb-3">Comparatif</p>
            <h2 id="comparatif" className="text-2xl md:text-3xl font-bold text-navy-800">Quelle formule pour vous ?</h2>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e3de] overflow-hidden">
            <table className="w-full table-fixed text-left">
              <caption className="sr-only">Comparatif des formules Classique, Premium et Cabinet</caption>
              <colgroup>
                <col className="w-[40%] sm:w-[46%]" />
                <col /><col /><col />
              </colgroup>
              <thead>
                <tr className="border-b border-[#e5e3de]">
                  <th scope="col" className="px-3 sm:px-5 py-4"><span className="sr-only">Caractéristique</span></th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      scope="col"
                      className={['px-1 sm:px-3 py-4 text-center text-xs sm:text-sm font-bold', p.highlight ? 'bg-navy-800 text-white' : 'text-navy-800'].join(' ')}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {COMPARISON.map(({ group, rows }) => (
                <tbody key={group}>
                  <tr>
                    <th colSpan={4} scope="colgroup" className="px-3 sm:px-5 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-600">
                      {group}
                    </th>
                  </tr>
                  {rows.map(({ label, values }) => (
                    <tr key={label} className="border-t border-[#f0eee9]">
                      <th scope="row" className="px-3 sm:px-5 py-3 text-xs sm:text-sm font-normal text-gray-600 leading-snug">{label}</th>
                      {PLANS.map((p) => (
                        <td key={p.id} className={['px-1 sm:px-3 py-3 text-center', p.highlight ? 'bg-gold-50/60' : ''].join(' ')}>
                          <CellValue value={values[p.id]} highlight={p.highlight} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
              <tfoot>
                <tr className="border-t border-[#e5e3de]">
                  <td className="px-3 sm:px-5 py-4" />
                  {PLANS.map((p) => (
                    <td key={p.id} className={['px-1 sm:px-3 py-4 text-center', p.highlight ? 'bg-gold-50/60' : ''].join(' ')}>
                      <Link
                        href={`#${p.id}`}
                        className={['inline-block text-[11px] sm:text-xs font-semibold underline-offset-4 hover:underline', p.highlight ? 'text-gold-700' : 'text-navy-700'].join(' ')}
                      >
                        Choisir
                      </Link>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-12 md:py-16" aria-labelledby="faq">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600 mb-3">Questions fréquentes</p>
          <h2 id="faq" className="text-2xl md:text-3xl font-bold text-navy-800">Avant de vous lancer</h2>
        </div>
        <div className="divide-y divide-[#e5e3de] border-y border-[#e5e3de]">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-sm font-semibold text-navy-800">{q}</span>
                <ChevronDown className="w-4 h-4 text-gold-600 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-4 -mt-1 text-sm text-gray-500 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>

        {/* CNB - masque pour l'instant : passer SHOW_CNB_NOTE a true pour le reafficher */}
        {SHOW_CNB_NOTE && (
        <div className="mt-10 border border-dashed border-[#e5e3de] rounded-lg px-6 md:px-7 py-5">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-500">Conseil National des Barreaux (CNB).</span>{' '}
            Une cotisation symbolique du CNB permettrait d&apos;afficher son soutien institutionnel et
            d&apos;augmenter la visibilité de la plateforme auprès des 81 640 avocats français.
            Un lien depuis le site du CNB représenterait un signal fort pour la profession.
          </p>
        </div>
        )}
      </section>

      {/* Appel final */}
      <section className="bg-navy-800">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-14 text-center">
          <h2 className="text-2xl font-bold text-white">Prêt à faire une pause ?</h2>
          <p className="mt-2 text-sm text-white/70">L&apos;inscription est gratuite, vous choisissez votre formule ensuite.</p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center justify-center w-full sm:w-auto rounded-md bg-gold-500 hover:bg-gold-400 px-8 py-3 text-sm font-semibold text-navy-900 transition-colors"
          >
            S&apos;inscrire gratuitement
          </Link>
        </div>
      </section>
    </div>
  )
}
