export const metadata = { title: 'Politique de confidentialité - CE Avocats' }

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-2">Vos données</p>
        <h1 className="text-3xl font-bold text-navy-800">Politique de confidentialité</h1>
      </div>

      <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold-200 text-gold-800 text-sm px-4 py-2.5 rounded-sm mb-10">
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
        Ce site est une démonstration. Les données saisies ne sont pas utilisées à des fins commerciales.
      </div>

      <div className="space-y-10 text-sm text-gray-600 leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Responsable du traitement</h2>
          <p>Le Geai, développeur et opérateur de ce site de démonstration.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Données collectées</h2>
          <p>Lors de la création d'un compte, les données suivantes sont collectées :</p>
          <ul className="mt-2 space-y-1 list-none pl-0">
            {['Nom et prénom', 'Adresse email', 'Mot de passe (chiffré, non lisible)', 'Date de création du compte'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gold-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3">Aucune donnée de paiement réelle n'est collectée. Les commandes sont fictives.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Finalités du traitement</h2>
          <p>Les données sont utilisées exclusivement pour :</p>
          <ul className="mt-2 space-y-1 list-none pl-0">
            {[
              'Permettre l\'authentification sur le site',
              'Afficher votre nom dans votre espace personnel',
              'Simuler l\'envoi d\'emails de confirmation (démonstration)',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gold-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Conservation des données</h2>
          <p>
            Les données sont conservées le temps nécessaire à la démonstration. Dans le cadre d'un déploiement
            réel, une durée de conservation conforme au RGPD serait définie (maximum 3 ans d'inactivité).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Partage des données</h2>
          <p>
            Les données ne sont partagées avec aucun tiers. Aucun outil d'analyse, de publicité
            ou de suivi comportemental n'est utilisé sur ce site.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Cookies</h2>
          <p>
            Ce site utilise uniquement un cookie de session nécessaire au fonctionnement de l'authentification.
            Ce cookie ne contient aucune information personnelle identifiable et est supprimé à la fermeture du navigateur.
          </p>
          <p className="mt-2">Aucun cookie publicitaire ou analytique n'est déposé.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Vos droits (RGPD)</h2>
          <p>Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :</p>
          <ul className="mt-2 space-y-1 list-none pl-0">
            {[
              'Droit d\'accès à vos données',
              'Droit de rectification',
              'Droit à l\'effacement ("droit à l\'oubli")',
              'Droit à la limitation du traitement',
              'Droit à la portabilité',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gold-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3">Pour exercer ces droits, contactez Le Geai.</p>
        </section>

      </div>

      <p className="mt-12 text-xs text-gray-400">Dernière mise à jour : novembre 2026</p>
    </div>
  )
}
