/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function upsertPartner(email, hashedPwd, userName, partnerData) {
  const admin = await prisma.user.upsert({
    where:  { email },
    update: {},
    create: { email, password: hashedPwd, name: userName, role: 'PARTNER_ADMIN', isDemo: true },
  })
  const partner = await prisma.partner.upsert({
    where:  { slug: partnerData.slug },
    update: {},
    create: { ...partnerData, adminId: admin.id, isDemo: true },
  })
  await prisma.user.update({ where: { id: admin.id }, data: { partnerId: partner.id } })
  return partner
}

async function main() {
  console.log('[seed] Demarrage...')

  const hashedAdmin   = await bcrypt.hash('Admin123!',   12)
  const hashedPartner = await bcrypt.hash('Partner123!', 12)
  const hashedMember  = await bcrypt.hash('Member123!',  12)

  // ── Utilisateurs systeme ──────────────────────────────────────────────
  await prisma.user.upsert({
    where:  { email: 'admin@ce-avocats.fr' },
    update: {},
    create: { email: 'admin@ce-avocats.fr', password: hashedAdmin, name: 'Administrateur', role: 'ADMIN' },
  })
  await prisma.user.upsert({
    where:  { email: 'membre@ce-avocats.fr' },
    update: {},
    create: { email: 'membre@ce-avocats.fr', password: hashedMember, name: 'Sophie Bernard', role: 'MEMBER', isDemo: true },
  })

  // ── Categories ────────────────────────────────────────────────────────
  const cats = await Promise.all([
    prisma.category.upsert({ where: { slug: 'restauration' },    update: {}, create: { name: 'Restauration',      slug: 'restauration',    icon: '🍽️' } }),
    prisma.category.upsert({ where: { slug: 'sport-bien-etre' }, update: {}, create: { name: 'Sport et bien-etre', slug: 'sport-bien-etre', icon: '🏋️' } }),
    prisma.category.upsert({ where: { slug: 'culture' },         update: {}, create: { name: 'Culture',           slug: 'culture',         icon: '🎭' } }),
    prisma.category.upsert({ where: { slug: 'voyages' },         update: {}, create: { name: 'Voyages',           slug: 'voyages',         icon: '✈️' } }),
    prisma.category.upsert({ where: { slug: 'shopping' },        update: {}, create: { name: 'Shopping',          slug: 'shopping',        icon: '🛍️' } }),
    prisma.category.upsert({ where: { slug: 'services' },        update: {}, create: { name: 'Services',          slug: 'services',        icon: '🔧' } }),
  ])
  const [CAT_RESTO, CAT_SPORT, CAT_CULTURE, CAT_VOYAGE, CAT_SHOPPING, CAT_SERVICES] = cats

  // ── Partenaire 1 : Resto du Palais ────────────────────────────────────
  const restoPalais = await upsertPartner(
    'resto@ce-avocats.fr', hashedPartner, 'Marie Dupont',
    { name: 'Resto du Palais', slug: 'resto-du-palais', description: 'Restaurant gastronomique au coeur du quartier judiciaire. Cuisine francaise de qualite dans un cadre elegant.', website: 'https://restdupalais.fr' }
  )
  await prisma.offer.upsert({ where: { id: 'offer-menu-midi' },  update: {}, create: { id: 'offer-menu-midi',  title: 'Menu du midi 3 plats',   description: 'Entree, plat et dessert au choix parmi notre selection du moment.',   originalPrice: 38,  discountedPrice: 24,  conditions: 'Lundi-vendredi, sur reservation.', isActive: true, isDemo: true, partnerId: restoPalais.id, categoryId: CAT_RESTO.id } })
  await prisma.offer.upsert({ where: { id: 'offer-brunch' },     update: {}, create: { id: 'offer-brunch',     title: 'Brunch du dimanche',      description: 'Brunch copieux : viennoiseries, oeufs, charcuterie, desserts a volonte.',   originalPrice: 45,  discountedPrice: 30,  conditions: 'Le dimanche 10h-14h, sur reservation.', isActive: true, isDemo: true, partnerId: restoPalais.id, categoryId: CAT_RESTO.id } })
  await prisma.offer.upsert({ where: { id: 'offer-soiree-diner' }, update: {}, create: { id: 'offer-soiree-diner', title: 'Diner prestige 5 plats', description: 'Experience gastronomique complete avec accords mets-vins.', originalPrice: 95, discountedPrice: 65, conditions: 'Sur reservation 48h a l\'avance.', isActive: true, isDemo: true, partnerId: restoPalais.id, categoryId: CAT_RESTO.id } })

  // ── Partenaire 2 : Sport et Forme ────────────────────────────────────
  const sportForme = await upsertPartner(
    'sport@ce-avocats.fr', hashedPartner, 'Thomas Martin',
    { name: 'Sport et Forme', slug: 'sport-et-forme', description: 'Votre salle de sport premium avec coaches certifies, piscine et espace bien-etre.', website: 'https://sportetforme.fr' }
  )
  await prisma.offer.upsert({ where: { id: 'offer-abonnement-mensuel' }, update: {}, create: { id: 'offer-abonnement-mensuel', title: 'Abonnement mensuel sans engagement', description: 'Acces illimite salle + cours collectifs + piscine. Bilan fitness offert.', originalPrice: 79, discountedPrice: 49, conditions: 'Premier mois. Renouvellement a 59 EUR/mois.', isActive: true, isDemo: true, partnerId: sportForme.id, categoryId: CAT_SPORT.id } })
  await prisma.offer.upsert({ where: { id: 'offer-coaching' },           update: {}, create: { id: 'offer-coaching',           title: 'Pack 5 seances de coaching',         description: 'Cinq seances individuelles avec un coach certifie pour atteindre vos objectifs.', originalPrice: 250, discountedPrice: 160, conditions: 'Valable 3 mois.', isActive: true, isDemo: true, partnerId: sportForme.id, categoryId: CAT_SPORT.id } })
  await prisma.offer.upsert({ where: { id: 'offer-yoga-annuel' },        update: {}, create: { id: 'offer-yoga-annuel',        title: 'Abonnement yoga annuel',             description: 'Cours de yoga et pilates en illimite toute l\'annee.', originalPrice: 480, discountedPrice: 320, conditions: 'Prelevement mensuel possible.', isActive: true, isDemo: true, partnerId: sportForme.id, categoryId: CAT_SPORT.id } })

  // ── Partenaire 3 : Cinema le Palais ───────────────────────────────────
  const cinema = await upsertPartner(
    'cinema@demo-ce.fr', hashedPartner, 'Aurelie Fontaine',
    { name: 'Cinema le Palais', slug: 'cinema-le-palais', description: 'Complexe cinematographique 8 salles en plein coeur de ville. Programmation art et essai et blockbusters.' }
  )
  await prisma.offer.upsert({ where: { id: 'offer-seance-cinema' },      update: {}, create: { id: 'offer-seance-cinema',      title: 'Seance plein tarif',                 description: 'Acces a toutes les seances en 2D ou 3D, sans supplement.', originalPrice: 13.50, discountedPrice: 8.50, conditions: 'Non cumulable avec d\'autres reductions.', isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id } })
  await prisma.offer.upsert({ where: { id: 'offer-pass-cinema' },        update: {}, create: { id: 'offer-pass-cinema',        title: 'Carnet 10 seances',                  description: 'Dix entrees valables 12 mois, utilisables par la famille.', originalPrice: 110, discountedPrice: 72, conditions: 'Valable 1 an. Transmissible.', isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id } })
  await prisma.offer.upsert({ where: { id: 'offer-avant-premiere' },     update: {}, create: { id: 'offer-avant-premiere',     title: 'Avant-premiere + cocktail',          description: 'Invitation a une avant-premiere exclusive suivie d\'un cocktail avec l\'equipe du film.', originalPrice: 45, discountedPrice: 28, conditions: 'Sur invitation, dans la limite des places disponibles.', isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id } })

  // ── Partenaire 4 : Hotel Prestige ─────────────────────────────────────
  const hotel = await upsertPartner(
    'hotel@demo-ce.fr', hashedPartner, 'Philippe Renard',
    { name: 'Hotel Prestige', slug: 'hotel-prestige', description: 'Hotel 4 etoiles avec spa, piscine interieure et restaurant gastronomique. Idéal pour vos escapades.' }
  )
  await prisma.offer.upsert({ where: { id: 'offer-nuit-hotel' },         update: {}, create: { id: 'offer-nuit-hotel',         title: 'Nuit chambre double petit-dejeuner', description: 'Chambre superieure pour 2 personnes avec petit-dejeuner buffet inclus.', originalPrice: 185, discountedPrice: 125, conditions: 'Sous reserve de disponibilite. Non remboursable.', isActive: true, isDemo: true, partnerId: hotel.id, categoryId: CAT_VOYAGE.id } })
  await prisma.offer.upsert({ where: { id: 'offer-weekend-hotel' },      update: {}, create: { id: 'offer-weekend-hotel',      title: 'Week-end 2 nuits spa offert',        description: 'Deux nuits avec petits-dejeuners et 1 acces spa par personne.', originalPrice: 420, discountedPrice: 280, conditions: 'Du vendredi au dimanche uniquement.', isActive: true, isDemo: true, partnerId: hotel.id, categoryId: CAT_VOYAGE.id } })
  await prisma.offer.upsert({ where: { id: 'offer-sejour-hotel' },       update: {}, create: { id: 'offer-sejour-hotel',       title: 'Sejour 3 nuits demi-pension',        description: 'Trois nuits en chambre superieure avec petits-dejeuners et diners au restaurant.', originalPrice: 720, discountedPrice: 480, conditions: 'Minimum 3 nuits. Hors vacances scolaires.', isActive: true, isDemo: true, partnerId: hotel.id, categoryId: CAT_VOYAGE.id } })
  await prisma.offer.upsert({ where: { id: 'offer-journee-spa' },        update: {}, create: { id: 'offer-journee-spa',        title: 'Journee detente spa & piscine',      description: 'Acces illimite au spa, hammam, sauna et piscine interieure pour la journee.', originalPrice: 75, discountedPrice: 48, conditions: 'Sur reservation. Serviette et peignoir fournis.', isActive: true, isDemo: true, partnerId: hotel.id, categoryId: CAT_VOYAGE.id } })

  // ── Partenaire 5 : Librairie du Barreau ───────────────────────────────
  const librairie = await upsertPartner(
    'librairie@demo-ce.fr', hashedPartner, 'Isabelle Moreau',
    { name: 'Librairie du Barreau', slug: 'librairie-du-barreau', description: 'Librairie juridique specialisee : codes, doctrine, revues et ouvrages pratiques pour les professionnels du droit.' }
  )
  await prisma.offer.upsert({ where: { id: 'offer-livres-juridiques' },  update: {}, create: { id: 'offer-livres-juridiques',  title: '15% sur tous les ouvrages juridiques', description: 'Reduction permanente sur l\'ensemble du catalogue : codes annotes, traites, manuels.', originalPrice: 100, discountedPrice: 85, conditions: 'Sur presentation de la carte membre CE.', isActive: true, isDemo: true, partnerId: librairie.id, categoryId: CAT_SHOPPING.id } })
  await prisma.offer.upsert({ where: { id: 'offer-abonnement-revue' },   update: {}, create: { id: 'offer-abonnement-revue',   title: 'Abonnement Revue juridique annuel',    description: 'Acces illimite a la revue juridique en version numerique + 4 numeros papier.', originalPrice: 148, discountedPrice: 95, conditions: 'Abonnement annuel. Renouvellement automatique.', isActive: true, isDemo: true, partnerId: librairie.id, categoryId: CAT_SHOPPING.id } })
  await prisma.offer.upsert({ where: { id: 'offer-pack-codes' },         update: {}, create: { id: 'offer-pack-codes',         title: 'Pack codes essentiels edition 2025',   description: 'Code civil, code de procedure civile, code penal et code du travail en edition annotee.', originalPrice: 165, discountedPrice: 110, conditions: 'Pack non separable. Derniere edition en date.', isActive: true, isDemo: true, partnerId: librairie.id, categoryId: CAT_SHOPPING.id } })

  // ── Partenaire 6 : Mutuelle Juridis ───────────────────────────────────
  const mutuelle = await upsertPartner(
    'mutuelle@demo-ce.fr', hashedPartner, 'Laurent Duval',
    { name: 'Mutuelle Juridis', slug: 'mutuelle-juridis', description: 'Mutuelle sante et prevoyance con\u00e7ue pour les professions juridiques. Garanties adaptees au statut liberal.' }
  )
  await prisma.offer.upsert({ where: { id: 'offer-mutuelle-solo' },      update: {}, create: { id: 'offer-mutuelle-solo',      title: 'Couverture sante individuelle',       description: 'Formule sante complete avec remboursements optique, dentaire et hospitalisation.', originalPrice: 68, discountedPrice: 48, conditions: 'Tarif mensuel. Adhesion sans frais de dossier.', isActive: true, isDemo: true, partnerId: mutuelle.id, categoryId: CAT_SERVICES.id } })
  await prisma.offer.upsert({ where: { id: 'offer-mutuelle-famille' },   update: {}, create: { id: 'offer-mutuelle-famille',   title: 'Couverture sante famille',            description: 'Extension du contrat individuel a toute la famille. Memes garanties, tarif degressif.', originalPrice: 145, discountedPrice: 98, conditions: 'Jusqu\'a 3 enfants inclus.', isActive: true, isDemo: true, partnerId: mutuelle.id, categoryId: CAT_SERVICES.id } })
  await prisma.offer.upsert({ where: { id: 'offer-prevoyance' },         update: {}, create: { id: 'offer-prevoyance',         title: 'Prevoyance incapacite-invalidite',    description: 'Protection du revenu en cas d\'arret de travail, avec maintien a 90% du chiffre d\'affaires.', originalPrice: 92, discountedPrice: 65, conditions: 'Franchise de 30 jours. Resiliable annuellement.', isActive: true, isDemo: true, partnerId: mutuelle.id, categoryId: CAT_SERVICES.id } })
  await prisma.offer.upsert({ where: { id: 'offer-retraite' },           update: {}, create: { id: 'offer-retraite',           title: 'Plan epargne retraite liberal',       description: 'PER individual avec avantage fiscal optimise pour les professions liberales.', originalPrice: 0, discountedPrice: 0, conditions: 'Versements libres a partir de 50 EUR/mois. Frais de gestion reduits.', isActive: true, isDemo: true, partnerId: mutuelle.id, categoryId: CAT_SERVICES.id } })

  console.log('[seed] Termine.')
  console.log('  Admin       : admin@ce-avocats.fr / Admin123!')
  console.log('  Partenaire  : resto@ce-avocats.fr / Partner123!')
  console.log('  Partenaire  : sport@ce-avocats.fr / Partner123!')
  console.log('  Membre      : membre@ce-avocats.fr / Member123!')
}

main()
  .catch((e) => { console.error('[seed] Erreur:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
