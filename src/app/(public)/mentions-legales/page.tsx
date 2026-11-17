export const metadata = { title: 'Mentions légales - Maitre en Pause' }

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-2">Informations légales</p>
        <h1 className="text-3xl font-bold text-navy-800">Mentions légales</h1>
      </div>

      <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold-200 text-gold-800 text-sm px-4 py-2.5 rounded-sm mb-10">
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
        Ce site est une démonstration réalisée dans un cadre pédagogique. Il ne constitue pas un service commercial actif.
      </div>

      <div className="space-y-10 text-sm text-gray-600 leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Editeur du site</h2>
          <p><strong className="text-navy-700">Dénomination :</strong> Maitre en Pause (projet de démonstration)</p>
          <p className="mt-1"><strong className="text-navy-700">Nature :</strong> Site de démonstration, sans personnalité morale propre</p>
          <p className="mt-1"><strong className="text-navy-700">Conception et développement :</strong> Le Geai</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Développeur</h2>
          <p><strong className="text-navy-700">Entreprise :</strong> Le Geai</p>
          <p className="mt-1">
            Conception, développement et hébergement du présent site de démonstration.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Hébergement</h2>
          <p><strong className="text-navy-700">Hébergeur :</strong> OVH SAS</p>
          <p className="mt-1">2 rue Kellermann, 59100 Roubaix, France</p>
          <p className="mt-1"><a href="https://www.ovh.com" className="text-navy-600 underline hover:text-navy-800">www.ovh.com</a></p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Propriété intellectuelle</h2>
          <p>
            La propriété du site et de ses contenus est partagée entre l'entreprise Le Geai et l'équipe
            commanditaire ayant sollicité sa réalisation. Ce site a été conçu et développé bénévolement
            par l'entreprise Le Geai.
          </p>
          <p className="mt-2">
            Toute reproduction, même partielle, est interdite sans l'accord conjoint des deux parties.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Données personnelles</h2>
          <p>
            Les données collectées lors de la création d'un compte (nom, adresse email) sont utilisées uniquement
            dans le cadre de la démonstration. Elles ne sont pas transmises à des tiers et peuvent être supprimées
            sur simple demande.
          </p>
          <p className="mt-2">
            Pour toute demande relative à vos données : contactez Le Geai.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Cookies</h2>
          <p>
            Ce site n'utilise pas de cookies de tracking ou de publicité. Un cookie de session est utilisé
            pour maintenir votre connexion. Il est supprimé à la fermeture de votre navigateur.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-navy-800 mb-3 pb-2 border-b border-[#e5e3de]">Responsabilité</h2>
          <p>
            Ce site étant une démonstration, les offres, partenaires et tarifs présentés sont fictifs.
            Le Geai ne saurait être tenu responsable d'une utilisation du contenu présenté comme une offre réelle.
          </p>
        </section>

      </div>

      <p className="mt-12 text-xs text-gray-400">Dernière mise à jour : novembre 2026</p>

      {/* rien à voir ici */}
      <span className="text-[0px] select-none opacity-0 pointer-events-none" aria-hidden="true">🥑</span>
    </div>
  )
}
