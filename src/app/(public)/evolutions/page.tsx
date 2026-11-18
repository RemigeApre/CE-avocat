import { EvolutionsCarousel } from './EvolutionsCarousel'

export const metadata = {
  title: 'Évolutions envisagées',
  description: 'Les pistes de développement du Comité Professionnel des avocats.',
}

const EVOLUTIONS = [
  {
    id: 'simulateur',
    title: 'Simulateur d\'économie',
    description: 'Calculez en temps réel vos économies annuelles selon vos habitudes de consommation et les offres disponibles.',
    icon: '◈',
  },
  {
    id: 'carte-membre',
    title: 'Carte membre numérique',
    description: 'Une carte membre avec QR code unique pour justifier de son adhésion directement depuis le téléphone.',
    icon: '◉',
  },
  {
    id: 'compteur-adherents',
    title: 'Compteur de mutualisation',
    description: 'Affichage en temps réel du nombre d\'adhérents actifs, pour mesurer l\'impact collectif et renforcer la dynamique.',
    icon: '◎',
  },
  {
    id: 'suggerer-partenariat',
    title: 'Suggérer un partenariat',
    description: 'Un formulaire pour proposer une entreprise comme partenaire, et une page dédiée aux entreprises souhaitant rejoindre le réseau.',
    icon: '◫',
  },
  {
    id: 'localisation-offres',
    title: 'Offres personnalisées',
    description: 'Mise en avant automatique des offres proches de la localisation de l\'utilisateur. Pertinence géographique.',
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
    title: 'Activités à proximité',
    description: 'Une page recensant des activités disponibles non loin — restaurants, salles de sport, culture — indépendamment des offres CE.',
    icon: '◇',
  },
  {
    id: 'agenda-juridique',
    title: 'Agenda du droit',
    description: 'Salons, portes ouvertes, afterworks, événements de la profession juridique à travers la France. Un calendrier vivant.',
    icon: '◔',
  },
  {
    id: 'parrainage',
    title: 'Parrainage entre confrères',
    description: 'Un système de parrainage permettant à un adhérent de recommander le Comité Professionnel à un confrère, avec avantages à la clé.',
    icon: '◑',
  },
  {
    id: 'chèques-vacances',
    title: 'Conversion en chèques-vacances',
    description: 'Permettre aux adhérents de convertir leurs avantages en chèques-vacances ANCV pour plus de flexibilité.',
    icon: '◐',
  },
  {
    id: 'services-specialises',
    title: 'Services spécialisés',
    description: 'Conciergerie, déplacement, coworking, garde d\'enfant, bureaux partagés, prêts préférentiels, formations, accompagnement psychologique.',
    icon: '◒',
  },
  {
    id: 'transparence',
    title: 'Transparence budgétaire',
    description: 'Une page publiant les comptes du CE : cotisations, dépenses, budget alloué aux partenariats. Gouvernance ouverte.',
    icon: '◓',
  },
  {
    id: 'newsletter',
    title: 'Newsletter',
    description: 'Une lettre d\'information périodique retraçant les nouvelles offres, les événements à venir et la vie du Comité Professionnel.',
    icon: '◕',
  },
  {
    id: 'representants-barreaux',
    title: 'Représentants par barreau',
    description: 'Un annuaire des référents CE dans chaque barreau, pour faciliter le contact local et le déploiement territorial.',
    icon: '◖',
  },
]

export default function EvolutionsPage() {
  return (
    <div className="py-16">

      <div className="max-w-4xl mx-auto px-6 lg:px-16 mb-12 text-center">
        <h1 className="text-3xl font-bold text-navy-800 mb-4">Évolutions envisagées</h1>
        <p className="text-gray-500 leading-relaxed max-w-2xl mx-auto">
          Ce site est une base. Voici les pistes identifiées pour enrichir le Comité Professionnel au fil du temps.
          Certaines seront réalisées, d'autres resteront des idées. Toutes ont été pensées pour
          les avocats.
        </p>
      </div>

      <EvolutionsCarousel items={EVOLUTIONS} />

      <p className="text-center text-xs text-gray-400 mt-10 px-6">
        {EVOLUTIONS.length} pistes de développement recensées
      </p>

    </div>
  )
}
