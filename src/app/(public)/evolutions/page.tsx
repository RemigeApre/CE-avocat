import { EvolutionsCarousel } from './EvolutionsCarousel'

const EVOLUTIONS = [
  {
    id: 'simulateur',
    title: 'Simulateur d\'economie',
    description: 'Calculez en temps reel vos economies annuelles selon vos habitudes de consommation et les offres disponibles.',
    icon: '◈',
  },
  {
    id: 'carte-membre',
    title: 'Carte membre numerique',
    description: 'Une carte membre avec QR code unique pour justifier de son adhesion directement depuis le telephone.',
    icon: '◉',
  },
  {
    id: 'compteur-adherents',
    title: 'Compteur de mutualisation',
    description: 'Affichage en temps reel du nombre d\'adherents actifs, pour mesurer l\'impact collectif et renforcer la dynamique.',
    icon: '◎',
  },
  {
    id: 'suggerer-partenariat',
    title: 'Suggerer un partenariat',
    description: 'Un formulaire pour proposer une entreprise comme partenaire, et une page dediee aux entreprises souhaitant rejoindre le reseau.',
    icon: '◫',
  },
  {
    id: 'localisation-offres',
    title: 'Offres personnalisees',
    description: 'Mise en avant automatique des offres proches de la localisation de l\'utilisateur. Pertinence geographique.',
    icon: '◆',
  },
  {
    id: 'carte-interactive',
    title: 'Carte interactive',
    description: 'Visualiser tous les partenaires sur une carte. Trouver facilement ce qui est disponible autour de soi.',
    icon: '◩',
  },
  {
    id: 'activites-proches',
    title: 'Activites a proximite',
    description: 'Une page recensant des activites disponibles non loin — restaurants, salles de sport, culture — independamment des offres CE.',
    icon: '◇',
  },
  {
    id: 'agenda-juridique',
    title: 'Agenda du droit',
    description: 'Salons, portes ouvertes, afterworks, evenements de la profession juridique a travers la France. Un calendrier vivant.',
    icon: '◔',
  },
  {
    id: 'parrainage',
    title: 'Parrainage entre confreres',
    description: 'Un systeme de parrainage permettant a un adherent de recommander le Comité Professionnela un confrere, avec avantages a la cle.',
    icon: '◑',
  },
  {
    id: 'cheques-vacances',
    title: 'Conversion en cheques-vacances',
    description: 'Permettre aux adherents de convertir leurs avantages en cheques-vacances ANCV pour plus de flexibilite.',
    icon: '◐',
  },
  {
    id: 'services-specialises',
    title: 'Services specialises',
    description: 'Conciergerie, deplacement, coworking, garde d\'enfant, bureaux partages, prets preferentiels, formations, accompagnement psychologique.',
    icon: '◒',
  },
  {
    id: 'transparence',
    title: 'Transparence budgetaire',
    description: 'Une page publiant les comptes du CE : cotisations, depenses, budget alloue aux partenariats. Gouvernance ouverte.',
    icon: '◓',
  },
  {
    id: 'newsletter',
    title: 'Newsletter',
    description: 'Une lettre d\'information periodique retrancant les nouvelles offres, les evenements a venir et la vie du Comité Professionnel.',
    icon: '◕',
  },
  {
    id: 'representants-barreaux',
    title: 'Representants par barreau',
    description: 'Un annuaire des referents CE dans chaque barreau, pour faciliter le contact local et le deploiement territorial.',
    icon: '◖',
  },
]

export default function EvolutionsPage() {
  return (
    <div className="py-16">

      <div className="max-w-4xl mx-auto px-6 lg:px-16 mb-12 text-center">
        <h1 className="text-3xl font-bold text-navy-800 mb-4">Evolutions envisagees</h1>
        <p className="text-gray-500 leading-relaxed max-w-2xl mx-auto">
          Ce site est une base. Voici les pistes identifiees pour enrichir le Comité Professionnelau fil du temps.
          Certaines seront realisees, d'autres resteront des idees. Toutes ont ete pensees pour
          les avocats.
        </p>
      </div>

      <EvolutionsCarousel items={EVOLUTIONS} />

      <p className="text-center text-xs text-gray-400 mt-10 px-6">
        {EVOLUTIONS.length} pistes de developpement recencees
      </p>

    </div>
  )
}
