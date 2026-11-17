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

// upsert avec memes donnees en create et update (pour propager les nouveaux champs)
async function upsertOffer(id, data) {
  return prisma.offer.upsert({
    where:  { id },
    update: data,
    create: { id, ...data },
  })
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
    prisma.category.upsert({ where: { slug: 'restauration' },    update: { name: 'Restauration' },      create: { name: 'Restauration',      slug: 'restauration',    icon: '🍽️' } }),
    prisma.category.upsert({ where: { slug: 'sport-bien-etre' }, update: { name: 'Sport et bien-etre' }, create: { name: 'Sport et bien-etre', slug: 'sport-bien-etre', icon: '🏋️' } }),
    prisma.category.upsert({ where: { slug: 'culture' },         update: { name: 'Culture' },            create: { name: 'Culture',           slug: 'culture',         icon: '🎭' } }),
    prisma.category.upsert({ where: { slug: 'voyages' },         update: { name: 'Voyages' },            create: { name: 'Voyages',           slug: 'voyages',         icon: '✈️' } }),
    prisma.category.upsert({ where: { slug: 'loisirs' },         update: { name: 'Loisirs' },            create: { name: 'Loisirs',           slug: 'loisirs',         icon: '🎡' } }),
    prisma.category.upsert({ where: { slug: 'shopping' },        update: { name: 'Shopping' },           create: { name: 'Shopping',          slug: 'shopping',        icon: '🛍️' } }),
    prisma.category.upsert({ where: { slug: 'services' },        update: { name: 'Services' },           create: { name: 'Services',          slug: 'services',        icon: '🔧' } }),
  ])
  const [CAT_RESTO, CAT_SPORT, CAT_CULTURE, CAT_VOYAGE, CAT_LOISIRS, CAT_SHOPPING, CAT_SERVICES] = cats

  // ── Partenaire 1 : Le Zinc du Barreau ────────────────────────────────
  const resto = await upsertPartner(
    'resto@ce-avocats.fr', hashedPartner, 'Marie Dupont',
    { name: 'Le Zinc du Barreau', slug: 'zinc-du-barreau', description: 'Brasserie traditionnelle en face du tribunal de grande instance. Cuisine du marche, vins de proprietaires. La cantine des robes noires depuis 1987.', website: 'https://zinc-du-barreau.fr' }
  )
  const restoAddresses = ['4 rue de Harlay, Paris 1er', '12 place Dauphine, Paris 1er']
  await upsertOffer('offer-menu-midi',    { title: 'Formule dejeuner 2 plats',      description: 'Plat du jour + dessert, change chaque semaine selon le marche. Verre de vin inclus.',              originalPrice: 24,  discountedPrice: 16,  conditions: 'Lundi au vendredi, service 12h-14h30. Sur reservation recommandee.', isActive: true, isDemo: true, partnerId: resto.id, categoryId: CAT_RESTO.id, addresses: restoAddresses })
  await upsertOffer('offer-brunch',       { title: 'Brunch du dimanche',             description: 'Brunch a volonte : charcuteries, fromages, oeufs cocotte, viennoiseries et desserts maison.',    originalPrice: 42,  discountedPrice: 28,  conditions: 'Dimanche 10h30-14h, sur reservation. Enfants -12 ans : 15 EUR.',    isActive: true, isDemo: true, partnerId: resto.id, categoryId: CAT_RESTO.id, addresses: restoAddresses })
  await upsertOffer('offer-soiree-diner', { title: 'Diner gastronomique 4 services', description: 'Menu prestige avec accord mets-vins : amuse-bouche, entree, plat et dessert signes du chef.',   originalPrice: 85,  discountedPrice: 58,  conditions: 'Sur reservation 48h a l\'avance. Hors samedi soir.',                isActive: true, isDemo: true, partnerId: resto.id, categoryId: CAT_RESTO.id, addresses: restoAddresses })

  // ── Partenaire 2 : Basic-Fit / On Air type ───────────────────────────
  const sport = await upsertPartner(
    'sport@ce-avocats.fr', hashedPartner, 'Thomas Martin',
    { name: 'On Air Fitness', slug: 'on-air-fitness', description: 'Reseau de salles de sport premium en France. Acces 24h/24, plus de 200 cours collectifs par semaine, espace cardio, musculation et bien-etre.', website: 'https://onairfitness.fr' }
  )
  await upsertOffer('offer-abonnement-mensuel', { title: 'Abonnement mensuel sans engagement', description: 'Acces illimite a toutes les salles du reseau, cours collectifs inclus (yoga, pilates, HIIT, spinning).', originalPrice: 49,  discountedPrice: 29,  conditions: 'Premier mois offert, puis 39 EUR/mois sans engagement. 1 bilan fitness inclus.', isActive: true, isDemo: true, partnerId: sport.id, categoryId: CAT_SPORT.id, locationCity: 'Paris' })
  await upsertOffer('offer-coaching',           { title: 'Pack 5 seances coaching personnel',  description: 'Cinq seances avec un coach certifie, programme sur mesure selon vos objectifs de forme.',               originalPrice: 200, discountedPrice: 125, conditions: 'Valable 3 mois a compter de l\'achat. Prise de rendez-vous obligatoire.',       isActive: true, isDemo: true, partnerId: sport.id, categoryId: CAT_SPORT.id, locationCity: 'Paris' })
  await upsertOffer('offer-yoga-annuel',        { title: 'Abonnement annuel yoga & pilates',   description: 'Cours de yoga vinyasa, hatha, pilates et meditation en illimite sur toute l\'annee.',                     originalPrice: 540, discountedPrice: 350, conditions: 'Prelevement mensuel de 29 EUR possible. Cours en salle et en ligne.',           isActive: true, isDemo: true, partnerId: sport.id, categoryId: CAT_SPORT.id, locationCity: 'Paris' })

  // ── Partenaire 3 : Ciné Alliance (type Pathe/CGR) ─────────────────────
  const cinema = await upsertPartner(
    'cinema@demo-ce.fr', hashedPartner, 'Aurelie Fontaine',
    { name: 'Cine Alliance', slug: 'cine-alliance', description: 'Reseau de 85 complexes cinematographiques en France. Toutes les sorties en salle, films d\'art et essai, avant-premieres et projections speciales.', website: 'https://cinealliance.fr' }
  )
  await upsertOffer('offer-seance-cinema',  { title: 'Place de cinema tarif CE',          description: 'Acces a toutes les seances en 2D, 3D ou IMAX, dans tous les complexes du reseau, sans supplement 3D.', originalPrice: 14.50, discountedPrice: 8.00,  conditions: 'Non cumulable avec d\'autres reductions. Valable en semaine et weekend.', isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-pass-cinema',    { title: 'Carnet 10 places',                  description: 'Dix entrees valables 12 mois, utilisables par la famille et les proches. Economisez 44 EUR.',             originalPrice: 145,   discountedPrice: 75,    conditions: 'Valable 1 an. Places transmissibles a la famille.',                    isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-pass-famille',   { title: 'Pack famille 4 places',             description: 'Quatre entrees a utiliser en une seule sortie, pour toute la famille ou entre collegues.',                 originalPrice: 54,    discountedPrice: 29,    conditions: 'A utiliser en une seule fois. Valable 6 mois.',                        isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })

  // ── Partenaire 4 : Residences du Soleil (type Pierre et Vacances) ─────
  const residences = await upsertPartner(
    'hotel@demo-ce.fr', hashedPartner, 'Philippe Renard',
    { name: 'Residences du Soleil', slug: 'residences-du-soleil', description: 'Leader francais des residences de vacances avec plus de 150 destinations en France et en Europe. Montagne, mer, campagne : choisissez votre sejour.', website: 'https://residences-du-soleil.fr' }
  )
  await upsertOffer('offer-weekend-cote',   { title: 'Weekend cote atlantique (2 nuits)',    description: 'Studio ou 2 pieces en residence 3* face a l\'ocean. Petit-dejeuner buffet inclus, piscine couverte.', originalPrice: 320, discountedPrice: 199, conditions: 'Du vendredi soir au dimanche. Hors periodes scolaires. Sur disponibilite.', isActive: true, isDemo: true, partnerId: residences.id, categoryId: CAT_VOYAGE.id, locationCity: 'La Baule', locationCountry: 'France' })
  await upsertOffer('offer-semaine-mer',    { title: 'Semaine en residence bord de mer',     description: 'Appartement 2 pieces pour 4 personnes, piscine, acces direct a la plage. Menage inclus.',           originalPrice: 890, discountedPrice: 549, conditions: 'Sejour du samedi au samedi. Charge de 50 EUR incluse.', isActive: true, isDemo: true, partnerId: residences.id, categoryId: CAT_VOYAGE.id, locationCity: 'Arcachon', locationCountry: 'France' })
  await upsertOffer('offer-ski-alpes',      { title: 'Semaine ski Alpes (tout compris)',      description: 'Appartement 6 personnes a 200m des pistes, forfait skieur 6 jours inclus, cours de ski collectifs.', originalPrice: 1850, discountedPrice: 1190, conditions: 'Fevrier / mars hors vacances zone A. Materiel non inclus.', isActive: true, isDemo: true, partnerId: residences.id, categoryId: CAT_VOYAGE.id, locationCity: 'Les Deux Alpes', locationCountry: 'France' })
  await upsertOffer('offer-club-tout-inclus', { title: 'Sejour club tout inclus 7 nuits',   description: 'Village club en Espagne ou Maroc : hebergement, repas, boissons, animations et sports inclus.', originalPrice: 1380, discountedPrice: 890, conditions: 'Vols non inclus. Depart de Paris CDG. Enfants -12 ans : tarif reduit.', isActive: true, isDemo: true, partnerId: residences.id, categoryId: CAT_VOYAGE.id, locationCity: 'Marrakech', locationCountry: 'Maroc' })

  // ── Partenaire 5 : Loisirs France (parcs, zoos, spas) ─────────────────
  const loisirs = await upsertPartner(
    'loisirs@demo-ce.fr', hashedPartner, 'Caroline Petit',
    { name: 'Loisirs France', slug: 'loisirs-france', description: 'Billetterie CE pour les principaux parcs de loisirs, parcs animaliers et centres de bien-etre en France. Tarifs negocies, valables toute l\'annee.' }
  )
  await upsertOffer('offer-futuroscope',   { title: 'Futuroscope : entree adulte 1 jour', description: 'Acces illimite a toutes les attractions du Futuroscope : simulateurs, spectacles nocturnes, nouveautes 2025.', originalPrice: 54, discountedPrice: 32, conditions: 'Valable 1 an. Hors evenements speciaux. Enfants -5 ans gratuits.', isActive: true, isDemo: true, partnerId: loisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Poitiers', locationCountry: 'France' })
  await upsertOffer('offer-disneyland',    { title: 'Disneyland Paris : billet 1 jour',   description: 'Entree pour 1 jour dans les 2 parcs : Disneyland Park et Walt Disney Studios. Magie garantie.', originalPrice: 109, discountedPrice: 72, conditions: 'Valable 6 mois. Hors vacances scolaires. Acces aux 2 parcs inclus.', isActive: true, isDemo: true, partnerId: loisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Chessy', locationCountry: 'France' })
  await upsertOffer('offer-beauval',       { title: 'ZooParc de Beauval : entree famille', description: 'Billet famille 2 adultes + 2 enfants au ZooParc de Beauval, 1er zoo de France. Les pandas, les lions, les hippopotames...', originalPrice: 134, discountedPrice: 88, conditions: 'Pack famille non separable. Enfants 3-10 ans. Valable 1 an.', isActive: true, isDemo: true, partnerId: loisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Saint-Aignan', locationCountry: 'France' })
  await upsertOffer('offer-royatonic',     { title: 'Royatonic : journee spa & thermes',   description: 'Acces illimite au parc thermal de Royat : bassins exterieurs, hammam, sauna, jacuzzi, espace fitness.', originalPrice: 36, discountedPrice: 22, conditions: 'Sur reservation. Serviette et peignoir fournis. Restauration sur place.', isActive: true, isDemo: true, partnerId: loisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Royat', locationCountry: 'France' })

  // ── Partenaire 6 : Librairie du Barreau ───────────────────────────────
  const librairie = await upsertPartner(
    'librairie@demo-ce.fr', hashedPartner, 'Isabelle Moreau',
    { name: 'Librairie du Barreau', slug: 'librairie-du-barreau', description: 'Librairie juridique de reference : codes annotes, doctrine, revues specialisees et ouvrages pratiques pour les professionnels du droit. Livraison en 24h.' }
  )
  await upsertOffer('offer-livres-juridiques', { title: '20% sur tout le catalogue juridique', description: 'Reduction permanente sur tous les ouvrages : codes annotes, traites, manuels universitaires et ouvrages pratiques.',   originalPrice: 100, discountedPrice: 80,  conditions: 'Sur presentation de la carte membre CE. Livraison offerte des 50 EUR.', isActive: true, isDemo: true, partnerId: librairie.id, categoryId: CAT_SHOPPING.id, contactEmail: 'commandes@librairie-du-barreau.fr' })
  await upsertOffer('offer-abonnement-revue',  { title: 'Abonnement Recueil Dalloz annuel',   description: 'Acces numerique illimite + 24 numeros papier par an. Jurisprudence, doctrine, actualites legislatives.',               originalPrice: 198, discountedPrice: 128, conditions: 'Abonnement annuel. Renouvellement a dematerialise.',                  isActive: true, isDemo: true, partnerId: librairie.id, categoryId: CAT_SHOPPING.id, contactEmail: 'commandes@librairie-du-barreau.fr' })
  await upsertOffer('offer-pack-codes',        { title: 'Pack codes essentiels edition 2025',  description: 'Code civil, code de procedure civile, code penal et code de commerce en editions annotees 2025.',                       originalPrice: 178, discountedPrice: 118, conditions: 'Pack non separable. Edition 2025 uniquement.',                        isActive: true, isDemo: true, partnerId: librairie.id, categoryId: CAT_SHOPPING.id, contactEmail: 'commandes@librairie-du-barreau.fr' })

  // ── Partenaire 7 : Mutuelle Juridis ───────────────────────────────────
  const mutuelle = await upsertPartner(
    'mutuelle@demo-ce.fr', hashedPartner, 'Laurent Duval',
    { name: 'Mutuelle Juridis', slug: 'mutuelle-juridis', description: 'Mutuelle sante et prevoyance concue pour les avocats liberaux et les professions juridiques. Garanties adaptees au statut d\'independant, sans frais de dossier.' }
  )
  await upsertOffer('offer-mutuelle-solo',    { title: 'Couverture sante individuelle',      description: 'Formule sante complete : remboursements optique, dentaire, hospitalisation et medecines douces. Demarche 100% en ligne.', originalPrice: 72,  discountedPrice: 51, conditions: 'Tarif mensuel. Adhesion sans frais de dossier. Resiliable a tout moment.', isActive: true, isDemo: true, partnerId: mutuelle.id, categoryId: CAT_SERVICES.id })
  await upsertOffer('offer-mutuelle-famille', { title: 'Couverture sante famille',           description: "Extension du contrat individuel a toute la famille (conjoint + enfants). Memes garanties, tarif degressif.",             originalPrice: 155, discountedPrice: 105, conditions: "Jusqu'a 3 enfants inclus. Au-dela : 10 EUR/enfant/mois.",               isActive: true, isDemo: true, partnerId: mutuelle.id, categoryId: CAT_SERVICES.id })
  await upsertOffer('offer-prevoyance',       { title: 'Prevoyance incapacite-invalidite',   description: "Protection du revenu en cas d'arret de travail. Maintien a 90% du chiffre d'affaires apres franchise.",                  originalPrice: 98,  discountedPrice: 68, conditions: 'Franchise de 30 jours. Resiliable annuellement. Deductible des charges.', isActive: true, isDemo: true, partnerId: mutuelle.id, categoryId: CAT_SERVICES.id })

  console.log('[seed] Termine.')
  console.log('  Admin      : admin@ce-avocats.fr    / Admin123!')
  console.log('  Partenaire : resto@ce-avocats.fr    / Partner123!')
  console.log('  Partenaire : sport@ce-avocats.fr    / Partner123!')
  console.log('  Partenaire : cinema@demo-ce.fr      / Partner123!')
  console.log('  Partenaire : hotel@demo-ce.fr       / Partner123!')
  console.log('  Partenaire : loisirs@demo-ce.fr     / Partner123!')
  console.log('  Partenaire : librairie@demo-ce.fr   / Partner123!')
  console.log('  Partenaire : mutuelle@demo-ce.fr    / Partner123!')
  console.log('  Membre     : membre@ce-avocats.fr   / Member123!')
}

main()
  .catch((e) => { console.error('[seed] Erreur:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
