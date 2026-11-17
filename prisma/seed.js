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
  const existing = await prisma.partner.findUnique({ where: { adminId: admin.id } })
  const partner = existing
    ? await prisma.partner.update({ where: { id: existing.id }, data: { ...partnerData, isDemo: true } })
    : await prisma.partner.create({ data: { ...partnerData, adminId: admin.id, isDemo: true } })
  await prisma.user.update({ where: { id: admin.id }, data: { partnerId: partner.id } })
  return partner
}

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
    prisma.category.upsert({ where: { slug: 'gastronomie' }, update: { name: 'Gastronomie',          icon: '🍽️' }, create: { name: 'Gastronomie',          slug: 'gastronomie', icon: '🍽️' } }),
    prisma.category.upsert({ where: { slug: 'culture' },     update: { name: 'Culture',               icon: '🎭' }, create: { name: 'Culture',               slug: 'culture',     icon: '🎭' } }),
    prisma.category.upsert({ where: { slug: 'bien-etre' },   update: { name: 'Bien-etre',             icon: '🧘' }, create: { name: 'Bien-etre',             slug: 'bien-etre',   icon: '🧘' } }),
    prisma.category.upsert({ where: { slug: 'voyages' },     update: { name: 'Voyages',               icon: '✈️' }, create: { name: 'Voyages',               slug: 'voyages',     icon: '✈️' } }),
    prisma.category.upsert({ where: { slug: 'loisirs' },     update: { name: 'Loisirs',               icon: '🎡' }, create: { name: 'Loisirs',               slug: 'loisirs',     icon: '🎡' } }),
    prisma.category.upsert({ where: { slug: 'services' },    update: { name: 'Services',              icon: '🔧' }, create: { name: 'Services',              slug: 'services',    icon: '🔧' } }),
    // migration : mettre a jour les anciens slugs en base
    prisma.category.upsert({ where: { slug: 'restauration'    }, update: { name: 'Gastronomie', slug: 'gastronomie' }, create: { name: 'Gastronomie', slug: 'restauration' } }).catch(() => null),
    prisma.category.upsert({ where: { slug: 'sport-bien-etre' }, update: { name: 'Bien-etre',   slug: 'bien-etre'   }, create: { name: 'Bien-etre',   slug: 'sport-bien-etre' } }).catch(() => null),
    prisma.category.upsert({ where: { slug: 'shopping'        }, update: { name: 'Culture',     slug: 'culture'     }, create: { name: 'Culture',     slug: 'shopping' } }).catch(() => null),
  ])
  const [CAT_GASTRO, CAT_CULTURE, CAT_BIEN_ETRE, CAT_VOYAGE, CAT_LOISIRS, CAT_SERVICES] = cats

  // ── 1. La Table du Palais — Gastronomie ──────────────────────────────
  const tablePalais = await upsertPartner(
    'resto@ce-avocats.fr', hashedPartner, 'Marie Dupont',
    { name: 'La Table du Palais', slug: 'table-du-palais', description: 'Brasserie traditionnelle face au tribunal de grande instance. Cuisine du marche, vins de proprietaires. La cantine des robes noires depuis 1987.', website: 'https://table-du-palais.fr' }
  )
  const restoAddr = ['4 rue de Harlay, Paris 1er', '12 place Dauphine, Paris 1er']
  await upsertOffer('offer-menu-midi',    { title: 'Formule dejeuner 2 plats',       description: 'Plat du jour + dessert maison, change chaque semaine selon le marche. Verre de vin inclus.',           originalPrice: 26,  discountedPrice: 17,  conditions: 'Lundi au vendredi, service 12h-14h30.',           isActive: true, isDemo: true, partnerId: tablePalais.id, categoryId: CAT_GASTRO.id, addresses: restoAddr })
  await upsertOffer('offer-brunch',       { title: 'Brunch dominical a volonte',      description: 'Charcuteries, fromages, oeufs cocotte, viennoiseries et desserts maison. Jus presses inclus.',      originalPrice: 42,  discountedPrice: 28,  conditions: 'Dimanche 10h30-14h, sur reservation.',            isActive: true, isDemo: true, partnerId: tablePalais.id, categoryId: CAT_GASTRO.id, addresses: restoAddr })
  await upsertOffer('offer-soiree-diner', { title: 'Diner gastronomique 4 services',  description: 'Menu prestige avec accord mets-vins : amuse-bouche, entree, plat et mignardises signes du chef.',  originalPrice: 88,  discountedPrice: 60,  conditions: 'Sur reservation 48h a l\'avance. Hors samedi soir.', isActive: true, isDemo: true, partnerId: tablePalais.id, categoryId: CAT_GASTRO.id, addresses: restoAddr })
  await upsertOffer('offer-plateau-vins', { title: 'Plateau fromages & degustation vins', description: 'Selection de 5 fromages de France avec 3 vins de producteurs accompagnes de notes de degustation.', originalPrice: 38, discountedPrice: 25, conditions: 'Disponible en dejeuner et diner. Sur reservation.', isActive: true, isDemo: true, partnerId: tablePalais.id, categoryId: CAT_GASTRO.id, addresses: restoAddr })

  // ── 2. Terroir Direct — Gastronomie ──────────────────────────────────
  const terroir = await upsertPartner(
    'terroir@demo-ce.fr', hashedPartner, 'Benoit Aubert',
    { name: 'Terroir Direct', slug: 'terroir-direct', description: 'Visites de domaines viticoles, exploitations agricoles et producteurs artisanaux. Degustations, paniers de saison et coffrets livres a domicile.', website: 'https://terroir-direct.fr' }
  )
  await upsertOffer('offer-visite-domaine',  { title: 'Visite domaine viticole + degustation', description: 'Visite guidee d\'un domaine en Bourgogne ou Loire : caves, vignes et degustation de 6 vins accompagnee du vigneron.', originalPrice: 55, discountedPrice: 35, conditions: 'Week-ends d\'avril a octobre. Sur reservation. Transport non inclus.', isActive: true, isDemo: true, partnerId: terroir.id, categoryId: CAT_GASTRO.id, locationCity: 'Beaune', locationCountry: 'France' })
  await upsertOffer('offer-panier-bio',      { title: 'Panier producteurs bio hebdomadaire',    description: 'Fruits, legumes et produits laitiers de saison issus d\'exploitations en agriculture biologique a moins de 100 km de Paris.', originalPrice: 42, discountedPrice: 29, conditions: 'Abonnement semaine ou ponctuel. Livraison Paris intramuros le jeudi.', isActive: true, isDemo: true, partnerId: terroir.id, categoryId: CAT_GASTRO.id })
  await upsertOffer('offer-coffret-artisan', { title: 'Coffret prestige producteurs',           description: 'Selection artisanale : huiles, confitures, miels et condiments de producteurs regionaux. Coffret cadeau avec livret de recettes.', originalPrice: 65, discountedPrice: 44, conditions: 'Disponible en livraison ou retrait a Paris.', isActive: true, isDemo: true, partnerId: terroir.id, categoryId: CAT_GASTRO.id })

  // ── 3. CinePanoramas — Culture ────────────────────────────────────────
  const cinema = await upsertPartner(
    'cinema@demo-ce.fr', hashedPartner, 'Aurelie Fontaine',
    { name: 'CinePanoramas', slug: 'cine-panoramas', description: 'Reseau de 92 complexes cinematographiques en France. Toutes les sorties en salle, films d\'art et essai, avant-premieres et projections speciales IMAX.', website: 'https://cinepanoramas.fr' }
  )
  await upsertOffer('offer-seance-cinema',  { title: 'Place de cinema tarif CE',       description: 'Acces a toutes les seances en 2D, 3D ou IMAX dans tous les complexes du reseau. Valable semaine et weekend.', originalPrice: 14.50, discountedPrice: 8.00,  conditions: 'Non cumulable avec d\'autres reductions. 1 place par transaction.', isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-pass-cinema',    { title: 'Carnet 10 places',                description: 'Dix entrees valables 12 mois, utilisables par toute la famille. Economisez 65 EUR sur le plein tarif.', originalPrice: 145, discountedPrice: 75,    conditions: 'Valable 1 an. Places transmissibles.',                             isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-pass-famille',   { title: 'Pack famille 4 places',           description: 'Quatre entrees a utiliser en une seule sortie. Ideal pour une soiree en famille ou entre collegues.',     originalPrice: 54,    discountedPrice: 29,    conditions: 'A utiliser en une seule fois. Valable 6 mois.',                    isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-avant-premiere', { title: 'Avant-premiere + cocktail',       description: 'Invitation a une avant-premiere exclusive suivie d\'un cocktail. Programme annonce chaque mois aux membres.', originalPrice: 48, discountedPrice: 28, conditions: 'Sur invitation. Dans la limite des places disponibles.', isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })

  // ── 4. Scene Ouverte — Culture ────────────────────────────────────────
  const scene = await upsertPartner(
    'scene@demo-ce.fr', hashedPartner, 'Laurent Girard',
    { name: 'Scene Ouverte', slug: 'scene-ouverte', description: 'Billetterie spectacle vivant : theatre, opera, concerts classiques et contemporains, comedie musicale. Plus de 400 representations par saison dans toute la France.', website: 'https://scene-ouverte.fr' }
  )
  await upsertOffer('offer-theatre-ce',     { title: 'Place de theatre tarif CE',       description: 'Acces a toutes les representations de la saison dans les theatres partenaires : comedie, drame, theatre contemporain.', originalPrice: 38, discountedPrice: 22, conditions: 'Sur reservation. Non remboursable apres confirmation.', isActive: true, isDemo: true, partnerId: scene.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-abonnement-5',   { title: 'Abonnement saison 5 spectacles',  description: 'Cinq places au choix parmi la programmation de la saison : theatre, opera, concerts. Flexibilite totale.', originalPrice: 190, discountedPrice: 110, conditions: 'Valable sur toute la saison septembre-juin.',  isActive: true, isDemo: true, partnerId: scene.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-concert-classi', { title: 'Concert classique salle Gaveau',  description: 'Soiree orchestre philharmonique : programme romantique ou baroque dans la prestigieuse salle Gaveau. Champagne offert a l\'entracte.', originalPrice: 65, discountedPrice: 38, conditions: 'Programme mensuel. Tenue correcte exigee.', isActive: true, isDemo: true, partnerId: scene.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })

  // ── 5. Lexis Editions — Culture ───────────────────────────────────────
  const lexis = await upsertPartner(
    'librairie@demo-ce.fr', hashedPartner, 'Isabelle Moreau',
    { name: 'Lexis Editions', slug: 'lexis-editions', description: 'Librairie juridique de reference et editeur specialise. Codes annotes, doctrine, revues et abonnements numeriques pour les professionnels du droit. Livraison en 24h.', website: 'https://lexis-editions.fr' }
  )
  await upsertOffer('offer-livres-juridiques', { title: '20% sur tout le catalogue',          description: 'Reduction permanente sur tous les ouvrages : codes annotes, traites, manuels universitaires et ouvrages pratiques. Sans minimum d\'achat.',    originalPrice: 100, discountedPrice: 80,  conditions: 'Sur presentation de la carte membre CE. Livraison offerte des 50 EUR.', isActive: true, isDemo: true, partnerId: lexis.id, categoryId: CAT_CULTURE.id, contactEmail: 'commandes@lexis-editions.fr' })
  await upsertOffer('offer-abonnement-revue',  { title: 'Abonnement Recueil Dalloz annuel',   description: 'Acces numerique illimite + 24 numeros papier par an. Jurisprudence, doctrine, chroniques et actualites legislatives.',                          originalPrice: 198, discountedPrice: 128, conditions: 'Abonnement annuel. Renouvellement automatique.',                      isActive: true, isDemo: true, partnerId: lexis.id, categoryId: CAT_CULTURE.id, contactEmail: 'commandes@lexis-editions.fr' })
  await upsertOffer('offer-pack-codes',        { title: 'Pack 4 codes essentiels 2025',        description: 'Code civil, code de procedure civile, code penal et code de commerce. Editions annotees 2025 avec index thematique.',                           originalPrice: 178, discountedPrice: 118, conditions: 'Pack non separable. Derniere edition uniquement.',                    isActive: true, isDemo: true, partnerId: lexis.id, categoryId: CAT_CULTURE.id, contactEmail: 'commandes@lexis-editions.fr' })
  await upsertOffer('offer-revue-presse',      { title: 'Abonnement presse juridique 1 an',   description: 'Acces illimite a 8 revues specialisees en ligne : droit des affaires, droit social, droit fiscal, procedure penale.',                          originalPrice: 240, discountedPrice: 155, conditions: 'Acces numerique immediat apres abonnement.',                          isActive: true, isDemo: true, partnerId: lexis.id, categoryId: CAT_CULTURE.id, contactEmail: 'commandes@lexis-editions.fr' })

  // ── 6. Studio Serenite — Bien-etre ───────────────────────────────────
  const studio = await upsertPartner(
    'sport@ce-avocats.fr', hashedPartner, 'Thomas Martin',
    { name: 'Studio Serenite', slug: 'studio-serenite', description: 'Centre holistique dedie aux avocats et professions liberales : yoga, pilates, sophrologie, meditation et coaching mental. Cours en petit groupe et seances individuelles.', website: 'https://studio-serenite.fr' }
  )
  await upsertOffer('offer-abonnement-mensuel', { title: 'Abonnement mensuel illimite',         description: 'Acces illimite a tous les cours : yoga vinyasa, pilates, sophrologie, meditation pleine conscience et fitness doux.',          originalPrice: 95,  discountedPrice: 58,  conditions: 'Sans engagement. 1 bilan bien-etre offert a l\'inscription.',    isActive: true, isDemo: true, partnerId: studio.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Paris' })
  await upsertOffer('offer-coaching',           { title: 'Seance sophrologie individuelle',     description: 'Seance personnalisee avec un sophrologue certifie : gestion du stress, preparation aux plaidoiries, equilibre pro-perso.', originalPrice: 90,  discountedPrice: 58,  conditions: 'Duree 1h. Sur rendez-vous. 1re seance decouverte a 35 EUR.',    isActive: true, isDemo: true, partnerId: studio.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Paris' })
  await upsertOffer('offer-yoga-annuel',        { title: 'Abonnement yoga annuel',              description: 'Cours de yoga en illimite toute l\'annee : vinyasa, hatha, yin yoga. Cours en salle et en ligne inclus.',                    originalPrice: 780, discountedPrice: 490, conditions: 'Prelevement mensuel de 42 EUR possible.',                        isActive: true, isDemo: true, partnerId: studio.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Paris' })
  await upsertOffer('offer-retraite-weekend',   { title: 'Retraite bien-etre weekend',          description: 'Weekend de ressourcement : yoga du matin, sophrologie, meditation, repas ayurvediques. En pleine nature a 1h de Paris.',     originalPrice: 320, discountedPrice: 199, conditions: 'Hebergement inclus. Depart vendredi 18h, retour dimanche 17h.',  isActive: true, isDemo: true, partnerId: studio.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Fontainebleau', locationCountry: 'France' })

  // ── 7. Thermae Evasion — Bien-etre ───────────────────────────────────
  const thermae = await upsertPartner(
    'thermes@demo-ce.fr', hashedPartner, 'Valerie Rousseau',
    { name: 'Thermae Evasion', slug: 'thermae-evasion', description: 'Reseau de spas thermaux et instituts de bien-etre haut de gamme. Bassins naturels, soins signatures, hammam et restauration legere.', website: 'https://thermae-evasion.fr' }
  )
  await upsertOffer('offer-journee-thermes',  { title: 'Journee thermes & spa',          description: 'Acces illimite aux bassins interieurs et exterieurs, hammam, sauna, jacuzzi et espace fitness. Serviette et peignoir fournis.', originalPrice: 65, discountedPrice: 40, conditions: 'Sur reservation. Restauration legere sur place (non incluse).', isActive: true, isDemo: true, partnerId: thermae.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Vichy', locationCountry: 'France' })
  await upsertOffer('offer-soin-signature',   { title: 'Soin signature 1h30',            description: 'Soin corps complet avec bain thermal, massage aux huiles essentielles et enveloppement mineralisant. Moment de pure detente.', originalPrice: 110, discountedPrice: 72, conditions: 'Sur reservation 48h a l\'avance. Deconseille aux femmes enceintes.', isActive: true, isDemo: true, partnerId: thermae.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Vichy', locationCountry: 'France' })
  await upsertOffer('offer-rituel-duo',       { title: 'Rituel duo 2h',                  description: 'Journee thermes pour 2 personnes avec soin en duo : gommage, massage 45 min et soin visage. Coupe de champagne offerte.', originalPrice: 240, discountedPrice: 155, conditions: 'Sur reservation. Valable 2 personnes, non separable.', isActive: true, isDemo: true, partnerId: thermae.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Vichy', locationCountry: 'France' })
  await upsertOffer('offer-weekend-thermes',  { title: 'Weekend thermes 2 nuits',        description: '2 nuits en chambre superieure, petits-dejeuners, 2 acces journee thermes et 1 soin par personne.', originalPrice: 480, discountedPrice: 310, conditions: 'Du vendredi au dimanche. Sur disponibilite. Hors periodes speciales.', isActive: true, isDemo: true, partnerId: thermae.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Vichy', locationCountry: 'France' })

  // ── 8. Horizons Sejours — Voyages ─────────────────────────────────────
  const horizons = await upsertPartner(
    'hotel@demo-ce.fr', hashedPartner, 'Philippe Renard',
    { name: 'Horizons Sejours', slug: 'horizons-sejours', description: 'Leader des residences de vacances et clubs tout inclus en France et en Mediterranee. Mer, montagne, campagne : plus de 200 destinations negociees pour les membres CE.', website: 'https://horizons-sejours.fr' }
  )
  await upsertOffer('offer-weekend-cote',     { title: 'Weekend cote atlantique (2 nuits)', description: 'Studio ou 2 pieces en residence 3* face a l\'ocean. Acces piscine couverte et activites nautiques.',           originalPrice: 320,  discountedPrice: 199,  conditions: 'Du vendredi au dimanche. Hors periodes scolaires.',           isActive: true, isDemo: true, partnerId: horizons.id, categoryId: CAT_VOYAGE.id, locationCity: 'La Baule', locationCountry: 'France' })
  await upsertOffer('offer-semaine-mer',      { title: 'Semaine en residence bord de mer',  description: 'Appartement 2 pieces pour 4, piscine, acces direct plage, menage inclus. Cote atlantique ou mediterranee.',      originalPrice: 890,  discountedPrice: 549,  conditions: 'Du samedi au samedi. Charge de linge 50 EUR incluse.',       isActive: true, isDemo: true, partnerId: horizons.id, categoryId: CAT_VOYAGE.id, locationCity: 'Arcachon', locationCountry: 'France' })
  await upsertOffer('offer-ski-alpes',        { title: 'Semaine ski Alpes tout compris',    description: 'Appartement 6p a 200m des pistes, forfait skieur 6 jours et cours collectifs adultes inclus.',                  originalPrice: 1850, discountedPrice: 1190, conditions: 'Fevrier-mars hors zone A. Materiel non inclus.',              isActive: true, isDemo: true, partnerId: horizons.id, categoryId: CAT_VOYAGE.id, locationCity: 'Les Deux Alpes', locationCountry: 'France' })
  await upsertOffer('offer-club-tout-inclus', { title: 'Village club tout inclus 7 nuits',  description: 'Hebergement, repas midi et soir, boissons, animations et sports inclus. Espagne, Maroc ou Tunisie.',            originalPrice: 1380, discountedPrice: 890,  conditions: 'Vols non inclus depuis Paris CDG. Enfants -12 ans reduits.',  isActive: true, isDemo: true, partnerId: horizons.id, categoryId: CAT_VOYAGE.id, locationCity: 'Marrakech', locationCountry: 'Maroc' })
  await upsertOffer('offer-city-break',       { title: 'City break Europe 3 nuits',         description: 'Hotel 4* en centre-ville : Rome, Barcelone, Lisbonne ou Prague. Petit-dejeuner inclus, visite guidee offerte.', originalPrice: 580,  discountedPrice: 365,  conditions: 'Vols non inclus. Destination au choix parmi 12 villes.',    isActive: true, isDemo: true, partnerId: horizons.id, categoryId: CAT_VOYAGE.id, locationCity: 'Rome', locationCountry: 'Italie' })

  // ── 9. Cap Jeunes — Voyages ───────────────────────────────────────────
  const capJeunes = await upsertPartner(
    'colonie@demo-ce.fr', hashedPartner, 'Caroline Petit',
    { name: 'Cap Jeunes', slug: 'cap-jeunes', description: 'Organisateur de sejours educatifs et colonies de vacances pour enfants et adolescents. 35 ans d\'experience, encadrants diplomes, destinations France et etranger.', website: 'https://cap-jeunes.fr' }
  )
  await upsertOffer('offer-colonie-ete',      { title: 'Colonie ete mer (1 semaine)',      description: 'Sejour 7 jours en bord de mer pour enfants 6-12 ans : nautisme, plage, veillees, excursions. Encadrement 1 pour 8.', originalPrice: 650,  discountedPrice: 420, conditions: 'Juillet ou aout. Depart en car depuis Paris. Assurance incluse.', isActive: true, isDemo: true, partnerId: capJeunes.id, categoryId: CAT_VOYAGE.id, locationCity: 'Hendaye', locationCountry: 'France' })
  await upsertOffer('offer-sejour-lingui',    { title: 'Sejour linguistique Angleterre',   description: 'Immersion anglaise 2 semaines pour ados 13-17 ans : cours le matin, activites sportives l\'apres-midi, familles d\'accueil.', originalPrice: 1850, discountedPrice: 1190, conditions: 'Juillet uniquement. Vol depuis Paris inclus. Niveau scolaire exige.', isActive: true, isDemo: true, partnerId: capJeunes.id, categoryId: CAT_VOYAGE.id, locationCity: 'Brighton', locationCountry: 'Royaume-Uni' })
  await upsertOffer('offer-camp-montagne',    { title: 'Camp montagne aventure (10 jours)', description: 'Randonnee, escalade, via ferrata et bivouac pour ados 12-16 ans dans les Alpes. Encadrants BAFA et moniteurs brevetat.', originalPrice: 980, discountedPrice: 630, conditions: 'Aout uniquement. Equipement technique fourni.', isActive: true, isDemo: true, partnerId: capJeunes.id, categoryId: CAT_VOYAGE.id, locationCity: 'Chamonix', locationCountry: 'France' })

  // ── 10. Plaisirs France — Loisirs ─────────────────────────────────────
  const plaisirs = await upsertPartner(
    'loisirs@demo-ce.fr', hashedPartner, 'Romain Leclerc',
    { name: 'Plaisirs France', slug: 'plaisirs-france', description: 'Centrale d\'achat CE pour les grands parcs de loisirs, parcs animaliers et centres d\'activites en France. Tarifs negocies, valables toute l\'annee sans contrainte de date.', website: 'https://plaisirs-france.fr' }
  )
  await upsertOffer('offer-parc-aventure',   { title: 'Parc aventure & attractions 1j',    description: 'Journee illimitee dans un parc de loisirs technologiques : simulateurs, spectacles 4D, attractions familles. 2e parc inclus.', originalPrice: 58,  discountedPrice: 35,  conditions: 'Valable 1 an. Hors evenements speciaux. Enfants -4 ans gratuits.', isActive: true, isDemo: true, partnerId: plaisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Poitiers', locationCountry: 'France' })
  await upsertOffer('offer-parc-magie',      { title: 'Parc magie & feerie billet 1j',     description: 'Journee dans le plus grand parc de feerie d\'Europe : attractions, spectacles, personnages, feux d\'artifice le soir.', originalPrice: 109, discountedPrice: 72,  conditions: 'Valable 6 mois. Acces aux 2 zones inclus. Hors supplement fastpass.', isActive: true, isDemo: true, partnerId: plaisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Chessy', locationCountry: 'France' })
  await upsertOffer('offer-zoo-famille',     { title: 'Zoo parc animalier (pack famille)',  description: 'Entree 2 adultes + 2 enfants au 1er zoo de France : pandas geants, lions blancs, hippopotames, 10 000 animaux.', originalPrice: 134, discountedPrice: 88,  conditions: 'Pack 4 personnes non separable. Enfants 3-12 ans.',                  isActive: true, isDemo: true, partnerId: plaisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Saint-Aignan', locationCountry: 'France' })
  await upsertOffer('offer-aquapark',        { title: 'Aquapark journee famille',           description: 'Acces illimite a un parc aquatique indoor & outdoor : toboggans, riviere lente, espace enfants et espace detente.', originalPrice: 92,  discountedPrice: 58,  conditions: 'Pack 2 adultes + 2 enfants. Valable semaine et weekend.',            isActive: true, isDemo: true, partnerId: plaisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Paris', locationCountry: 'France' })
  await upsertOffer('offer-karting',         { title: 'Session karting + bowling',          description: 'Sortie groupe : 2 sessions karting 10 min + 1 partie bowling pour 4 personnes. Boissons incluses.', originalPrice: 120, discountedPrice: 75,  conditions: 'Sur reservation. Valable semaine uniquement pour bowling.',          isActive: true, isDemo: true, partnerId: plaisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Paris', locationCountry: 'France' })

  // ── 11. Juridis Prevoyance — Services ────────────────────────────────
  const juridis = await upsertPartner(
    'mutuelle@demo-ce.fr', hashedPartner, 'Laurent Duval',
    { name: 'Juridis Prevoyance', slug: 'juridis-prevoyance', description: 'Mutuelle sante et prevoyance specialisee pour les avocats liberaux. Garanties adaptees au statut d\'independant, sans frais de dossier, demarche 100% en ligne.' }
  )
  await upsertOffer('offer-mutuelle-solo',    { title: 'Couverture sante individuelle',      description: 'Formule sante complete : optique, dentaire, hospitalisation et medecines douces. Remboursements au-dela de la Secu.',  originalPrice: 72,  discountedPrice: 51,  conditions: 'Tarif mensuel. Sans frais de dossier. Resiliable a tout moment.', isActive: true, isDemo: true, partnerId: juridis.id, categoryId: CAT_SERVICES.id })
  await upsertOffer('offer-mutuelle-famille', { title: 'Couverture sante famille',           description: 'Extension du contrat individuel a toute la famille : conjoint et enfants. Memes garanties, tarif degressif.',          originalPrice: 155, discountedPrice: 105, conditions: 'Jusqu\'a 3 enfants inclus. Au-dela : 10 EUR/enfant/mois.',         isActive: true, isDemo: true, partnerId: juridis.id, categoryId: CAT_SERVICES.id })
  await upsertOffer('offer-prevoyance',       { title: 'Prevoyance incapacite-invalidite',   description: 'Protection du revenu en cas d\'arret : maintien a 90% du CA apres 30 jours de franchise. Deductible des charges.', originalPrice: 98,  discountedPrice: 68,  conditions: 'Franchise 30 jours. Resiliable annuellement.',                   isActive: true, isDemo: true, partnerId: juridis.id, categoryId: CAT_SERVICES.id })

  console.log('[seed] Termine.')
  console.log('  Admin       : admin@ce-avocats.fr    / Admin123!')
  console.log('  Partenaires : resto@ce-avocats.fr    / Partner123!')
  console.log('  Partenaires : terroir@demo-ce.fr     / Partner123!')
  console.log('  Partenaires : cinema@demo-ce.fr      / Partner123!')
  console.log('  Partenaires : scene@demo-ce.fr       / Partner123!')
  console.log('  Partenaires : librairie@demo-ce.fr   / Partner123!')
  console.log('  Partenaires : sport@ce-avocats.fr    / Partner123!')
  console.log('  Partenaires : thermes@demo-ce.fr     / Partner123!')
  console.log('  Partenaires : hotel@demo-ce.fr       / Partner123!')
  console.log('  Partenaires : colonie@demo-ce.fr     / Partner123!')
  console.log('  Partenaires : loisirs@demo-ce.fr     / Partner123!')
  console.log('  Partenaires : mutuelle@demo-ce.fr    / Partner123!')
  console.log('  Membre      : membre@ce-avocats.fr   / Member123!')
}

main()
  .catch((e) => { console.error('[seed] Erreur:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
