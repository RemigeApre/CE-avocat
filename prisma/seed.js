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

// Migre les offres d'un ancien slug vers le nouveau, puis supprime l'ancienne catégorie
async function cleanupCategory(oldSlug, newSlug) {
  const oldCat = await prisma.category.findUnique({ where: { slug: oldSlug } })
  if (!oldCat) return
  if (newSlug) {
    const newCat = await prisma.category.findUnique({ where: { slug: newSlug } })
    if (newCat) {
      await prisma.offer.updateMany({ where: { categoryId: oldCat.id }, data: { categoryId: newCat.id } })
    }
  } else {
    await prisma.offer.deleteMany({ where: { categoryId: oldCat.id, isDemo: true } })
  }
  const remaining = await prisma.offer.count({ where: { categoryId: oldCat.id } })
  if (remaining === 0) await prisma.category.delete({ where: { id: oldCat.id } })
}

async function main() {
  console.log('[seed] Démarrage...')

  const hashedAdmin   = await bcrypt.hash('Admin123!',   12)
  const hashedPartner = await bcrypt.hash('Partner123!', 12)
  const hashedMember  = await bcrypt.hash('Member123!',  12)

  // ── Utilisateurs système ──────────────────────────────────────────────
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

  // ── Catégories ────────────────────────────────────────────────────────
  const cats = await Promise.all([
    prisma.category.upsert({ where: { slug: 'gastronomie' }, update: { name: 'Flagrant délice',  icon: '🍽️' }, create: { name: 'Flagrant délice',  slug: 'gastronomie', icon: '🍽️' } }),
    prisma.category.upsert({ where: { slug: 'culture' },     update: { name: 'Plagiat',          icon: '🎭' }, create: { name: 'Plagiat',          slug: 'culture',     icon: '🎭' } }),
    prisma.category.upsert({ where: { slug: 'bien-etre' },   update: { name: 'Abandon de poste', icon: '🧘' }, create: { name: 'Abandon de poste', slug: 'bien-etre',   icon: '🧘' } }),
    prisma.category.upsert({ where: { slug: 'voyages' },     update: { name: 'Délit de fuite',   icon: '✈️' }, create: { name: 'Délit de fuite',   slug: 'voyages',     icon: '✈️' } }),
    prisma.category.upsert({ where: { slug: 'loisirs' },     update: { name: 'Mise en liberté',  icon: '🎡' }, create: { name: 'Mise en liberté',  slug: 'loisirs',     icon: '🎡' } }),
  ])
  const [CAT_GASTRO, CAT_CULTURE, CAT_BIEN_ETRE, CAT_VOYAGE, CAT_LOISIRS] = cats

  // Nettoyage des anciens slugs (doublons)
  await cleanupCategory('restauration',    'gastronomie')
  await cleanupCategory('sport-bien-etre', 'bien-etre')
  await cleanupCategory('shopping',        'culture')
  await cleanupCategory('services',        null)

  // ── 1. La Table du Palais — Gastronomie ──────────────────────────────
  const tablePalais = await upsertPartner(
    'resto@ce-avocats.fr', hashedPartner, 'Marie Dupont',
    { name: 'La Table du Palais', slug: 'table-du-palais', description: 'Brasserie traditionnelle face au tribunal de grande instance. Cuisine du marché, vins de propriétaires. La cantine des robes noires depuis 1987.', website: 'https://table-du-palais.fr' }
  )
  const restoAddr = ['4 rue de Harlay, Paris 1er', '12 place Dauphine, Paris 1er']
  await upsertOffer('offer-menu-midi',    { title: 'Formule déjeuner 2 plats',         description: 'Plat du jour + dessert maison, changé chaque semaine selon le marché. Verre de vin inclus.',              originalPrice: 26,  discountedPrice: 17,  conditions: 'Lundi au vendredi, service 12h-14h30.',              isActive: true, isDemo: true, partnerId: tablePalais.id, categoryId: CAT_GASTRO.id, addresses: restoAddr })
  await upsertOffer('offer-brunch',       { title: 'Brunch dominical à volonté',        description: 'Charcuteries, fromages, œufs cocotte, viennoiseries et desserts maison. Jus pressés inclus.',           originalPrice: 42,  discountedPrice: 28,  conditions: 'Dimanche 10h30-14h, sur réservation.',               isActive: true, isDemo: true, partnerId: tablePalais.id, categoryId: CAT_GASTRO.id, addresses: restoAddr })
  await upsertOffer('offer-soiree-diner', { title: 'Dîner gastronomique 4 services',    description: 'Menu prestige avec accord mets-vins : amuse-bouche, entrée, plat et mignardises signés du chef.',      originalPrice: 88,  discountedPrice: 60,  conditions: "Sur réservation 48h à l'avance. Hors samedi soir.", isActive: true, isDemo: true, partnerId: tablePalais.id, categoryId: CAT_GASTRO.id, addresses: restoAddr })
  await upsertOffer('offer-plateau-vins', { title: 'Plateau fromages & dégustation vins', description: 'Sélection de 5 fromages de France avec 3 vins de producteurs accompagnés de notes de dégustation.',  originalPrice: 38,  discountedPrice: 25,  conditions: 'Disponible en déjeuner et dîner. Sur réservation.',   isActive: true, isDemo: true, partnerId: tablePalais.id, categoryId: CAT_GASTRO.id, addresses: restoAddr })

  // ── 2. Terroir Direct — Gastronomie ──────────────────────────────────
  const terroir = await upsertPartner(
    'terroir@demo-ce.fr', hashedPartner, 'Benoît Aubert',
    { name: 'Terroir Direct', slug: 'terroir-direct', description: 'Visites de domaines viticoles, exploitations agricoles et producteurs artisanaux. Dégustations, paniers de saison et coffrets livrés à domicile.', website: 'https://terroir-direct.fr' }
  )
  await upsertOffer('offer-visite-domaine',  { title: 'Visite domaine viticole + dégustation', description: "Visite guidée d'un domaine en Bourgogne ou Loire : caves, vignes et dégustation de 6 vins accompagnée du vigneron.", originalPrice: 55, discountedPrice: 35, conditions: "Week-ends d'avril à octobre. Sur réservation. Transport non inclus.", isActive: true, isDemo: true, partnerId: terroir.id, categoryId: CAT_GASTRO.id, locationCity: 'Beaune', locationCountry: 'France' })
  await upsertOffer('offer-panier-bio',      { title: 'Panier producteurs bio hebdomadaire',    description: 'Fruits, légumes et produits laitiers de saison issus d\'exploitations biologiques à moins de 100 km de Paris.', originalPrice: 42, discountedPrice: 29, conditions: 'Abonnement semaine ou ponctuel. Livraison Paris intramuros le jeudi.', isActive: true, isDemo: true, partnerId: terroir.id, categoryId: CAT_GASTRO.id })
  await upsertOffer('offer-coffret-artisan', { title: 'Coffret prestige producteurs',           description: 'Sélection artisanale : huiles, confitures, miels et condiments de producteurs régionaux. Coffret cadeau avec livret de recettes.', originalPrice: 65, discountedPrice: 44, conditions: 'Disponible en livraison ou retrait à Paris.', isActive: true, isDemo: true, partnerId: terroir.id, categoryId: CAT_GASTRO.id })

  // ── 3. CinéPanoramas — Culture ────────────────────────────────────────
  const cinema = await upsertPartner(
    'cinema@demo-ce.fr', hashedPartner, 'Aurélie Fontaine',
    { name: 'CinéPanoramas', slug: 'cine-panoramas', description: 'Réseau de 92 complexes cinématographiques en France. Toutes les sorties en salle, films d\'art et essai, avant-premières et projections spéciales IMAX.', website: 'https://cinepanoramas.fr' }
  )
  await upsertOffer('offer-seance-cinema',  { title: 'Place de cinéma tarif CE',        description: 'Accès à toutes les séances en 2D, 3D ou IMAX dans tous les complexes du réseau. Valable semaine et weekend.', originalPrice: 14.50, discountedPrice: 8.00,  conditions: "Non cumulable avec d'autres réductions. 1 place par transaction.", isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-pass-cinema',    { title: 'Carnet 10 places',                 description: 'Dix entrées valables 12 mois, utilisables par toute la famille. Économisez 65 EUR sur le plein tarif.', originalPrice: 145, discountedPrice: 75,    conditions: 'Valable 1 an. Places transmissibles.',                             isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-pass-famille',   { title: 'Pack famille 4 places',            description: 'Quatre entrées à utiliser en une seule sortie. Idéal pour une soirée en famille ou entre collègues.',    originalPrice: 54,    discountedPrice: 29,    conditions: 'À utiliser en une seule fois. Valable 6 mois.',                    isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-avant-premiere', { title: 'Avant-première + cocktail',        description: "Invitation à une avant-première exclusive suivie d'un cocktail. Programme annoncé chaque mois aux membres.", originalPrice: 48, discountedPrice: 28, conditions: 'Sur invitation. Dans la limite des places disponibles.', isActive: true, isDemo: true, partnerId: cinema.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })

  // ── 4. Scène Ouverte — Culture ────────────────────────────────────────
  const scene = await upsertPartner(
    'scene@demo-ce.fr', hashedPartner, 'Laurent Girard',
    { name: 'Scène Ouverte', slug: 'scene-ouverte', description: 'Billetterie spectacle vivant : théâtre, opéra, concerts classiques et contemporains, comédie musicale. Plus de 400 représentations par saison dans toute la France.', website: 'https://scene-ouverte.fr' }
  )
  await upsertOffer('offer-theatre-ce',     { title: 'Place de théâtre tarif CE',        description: 'Accès à toutes les représentations de la saison dans les théâtres partenaires : comédie, drame, théâtre contemporain.', originalPrice: 38, discountedPrice: 22, conditions: 'Sur réservation. Non remboursable après confirmation.', isActive: true, isDemo: true, partnerId: scene.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-abonnement-5',   { title: 'Abonnement saison 5 spectacles',   description: 'Cinq places au choix parmi la programmation de la saison : théâtre, opéra, concerts. Flexibilité totale.', originalPrice: 190, discountedPrice: 110, conditions: 'Valable sur toute la saison septembre-juin.',  isActive: true, isDemo: true, partnerId: scene.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })
  await upsertOffer('offer-concert-classi', { title: 'Concert classique salle Gaveau',   description: 'Soirée orchestre philharmonique : programme romantique ou baroque dans la prestigieuse salle Gaveau. Champagne offert à l\'entracte.', originalPrice: 65, discountedPrice: 38, conditions: 'Programme mensuel. Tenue correcte exigée.', isActive: true, isDemo: true, partnerId: scene.id, categoryId: CAT_CULTURE.id, locationCity: 'Paris' })

  // ── 5. Lexis Éditions — Culture ───────────────────────────────────────
  const lexis = await upsertPartner(
    'librairie@demo-ce.fr', hashedPartner, 'Isabelle Moreau',
    { name: 'Lexis Éditions', slug: 'lexis-editions', description: 'Librairie juridique de référence et éditeur spécialisé. Codes annotés, doctrine, revues et abonnements numériques pour les professionnels du droit. Livraison en 24h.', website: 'https://lexis-editions.fr' }
  )
  await upsertOffer('offer-livres-juridiques', { title: '20% sur tout le catalogue',           description: 'Réduction permanente sur tous les ouvrages : codes annotés, traités, manuels universitaires et ouvrages pratiques. Sans minimum d\'achat.',    originalPrice: 100, discountedPrice: 80,  conditions: 'Sur présentation de la carte membre CE. Livraison offerte dès 50 EUR.', isActive: true, isDemo: true, partnerId: lexis.id, categoryId: CAT_CULTURE.id, contactEmail: 'commandes@lexis-editions.fr' })
  await upsertOffer('offer-abonnement-revue',  { title: 'Abonnement Recueil Dalloz annuel',    description: 'Accès numérique illimité + 24 numéros papier par an. Jurisprudence, doctrine, chroniques et actualités législatives.',                          originalPrice: 198, discountedPrice: 128, conditions: 'Abonnement annuel. Renouvellement automatique.',                       isActive: true, isDemo: true, partnerId: lexis.id, categoryId: CAT_CULTURE.id, contactEmail: 'commandes@lexis-editions.fr' })
  await upsertOffer('offer-pack-codes',        { title: 'Pack 4 codes essentiels 2025',         description: 'Code civil, code de procédure civile, code pénal et code de commerce. Éditions annotées 2025 avec index thématique.',                           originalPrice: 178, discountedPrice: 118, conditions: 'Pack non séparable. Dernière édition uniquement.',                    isActive: true, isDemo: true, partnerId: lexis.id, categoryId: CAT_CULTURE.id, contactEmail: 'commandes@lexis-editions.fr' })
  await upsertOffer('offer-revue-presse',      { title: 'Abonnement presse juridique 1 an',    description: 'Accès illimité à 8 revues spécialisées en ligne : droit des affaires, droit social, droit fiscal, procédure pénale.',                          originalPrice: 240, discountedPrice: 155, conditions: 'Accès numérique immédiat après abonnement.',                           isActive: true, isDemo: true, partnerId: lexis.id, categoryId: CAT_CULTURE.id, contactEmail: 'commandes@lexis-editions.fr' })

  // ── 6. Studio Sérénité — Bien-être ───────────────────────────────────
  const studio = await upsertPartner(
    'sport@ce-avocats.fr', hashedPartner, 'Thomas Martin',
    { name: 'Studio Sérénité', slug: 'studio-serenite', description: 'Centre holistique dédié aux avocats et professions libérales : yoga, pilates, sophrologie, méditation et coaching mental. Cours en petit groupe et séances individuelles.', website: 'https://studio-serenite.fr' }
  )
  await upsertOffer('offer-abonnement-mensuel', { title: 'Abonnement mensuel illimité',         description: 'Accès illimité à tous les cours : yoga vinyasa, pilates, sophrologie, méditation pleine conscience et fitness doux.',          originalPrice: 95,  discountedPrice: 58,  conditions: "Sans engagement. 1 bilan bien-être offert à l'inscription.",    isActive: true, isDemo: true, partnerId: studio.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Paris' })
  await upsertOffer('offer-coaching',           { title: 'Séance sophrologie individuelle',     description: 'Séance personnalisée avec un sophrologue certifié : gestion du stress, préparation aux plaidoiries, équilibre pro-perso.', originalPrice: 90,  discountedPrice: 58,  conditions: 'Durée 1h. Sur rendez-vous. 1re séance découverte à 35 EUR.',    isActive: true, isDemo: true, partnerId: studio.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Paris' })
  await upsertOffer('offer-yoga-annuel',        { title: 'Abonnement yoga annuel',              description: "Cours de yoga en illimité toute l'année : vinyasa, hatha, yin yoga. Cours en salle et en ligne inclus.",                    originalPrice: 780, discountedPrice: 490, conditions: 'Prélèvement mensuel de 42 EUR possible.',                        isActive: true, isDemo: true, partnerId: studio.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Paris' })
  await upsertOffer('offer-retraite-weekend',   { title: 'Retraite bien-être weekend',          description: 'Weekend de ressourcement : yoga du matin, sophrologie, méditation, repas ayurvédiques. En pleine nature à 1h de Paris.',    originalPrice: 320, discountedPrice: 199, conditions: 'Hébergement inclus. Départ vendredi 18h, retour dimanche 17h.',  isActive: true, isDemo: true, partnerId: studio.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Fontainebleau', locationCountry: 'France' })

  // ── 7. Thermae Évasion — Bien-être ───────────────────────────────────
  const thermae = await upsertPartner(
    'thermes@demo-ce.fr', hashedPartner, 'Valérie Rousseau',
    { name: 'Thermae Évasion', slug: 'thermae-evasion', description: 'Réseau de spas thermaux et instituts de bien-être haut de gamme. Bassins naturels, soins signatures, hammam et restauration légère.', website: 'https://thermae-evasion.fr' }
  )
  await upsertOffer('offer-journee-thermes',  { title: 'Journée thermes & spa',           description: 'Accès illimité aux bassins intérieurs et extérieurs, hammam, sauna, jacuzzi et espace fitness. Serviette et peignoir fournis.', originalPrice: 65, discountedPrice: 40, conditions: 'Sur réservation. Restauration légère sur place (non incluse).', isActive: true, isDemo: true, partnerId: thermae.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Vichy', locationCountry: 'France' })
  await upsertOffer('offer-soin-signature',   { title: 'Soin signature 1h30',             description: 'Soin corps complet avec bain thermal, massage aux huiles essentielles et enveloppement reminéralisant. Moment de pure détente.', originalPrice: 110, discountedPrice: 72, conditions: "Sur réservation 48h à l'avance. Déconseillé aux femmes enceintes.", isActive: true, isDemo: true, partnerId: thermae.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Vichy', locationCountry: 'France' })
  await upsertOffer('offer-rituel-duo',       { title: 'Rituel duo 2h',                   description: 'Journée thermes pour 2 personnes avec soin en duo : gommage, massage 45 min et soin visage. Coupe de champagne offerte.', originalPrice: 240, discountedPrice: 155, conditions: 'Sur réservation. Valable 2 personnes, non séparable.', isActive: true, isDemo: true, partnerId: thermae.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Vichy', locationCountry: 'France' })
  await upsertOffer('offer-weekend-thermes',  { title: 'Weekend thermes 2 nuits',         description: '2 nuits en chambre supérieure, petits-déjeuners, 2 accès journée thermes et 1 soin par personne.', originalPrice: 480, discountedPrice: 310, conditions: 'Du vendredi au dimanche. Sur disponibilité. Hors périodes spéciales.', isActive: true, isDemo: true, partnerId: thermae.id, categoryId: CAT_BIEN_ETRE.id, locationCity: 'Vichy', locationCountry: 'France' })

  // ── 8. Horizons Séjours — Voyages ─────────────────────────────────────
  const horizons = await upsertPartner(
    'hotel@demo-ce.fr', hashedPartner, 'Philippe Renard',
    { name: 'Horizons Séjours', slug: 'horizons-sejours', description: 'Leader des résidences de vacances et clubs tout inclus en France et en Méditerranée. Mer, montagne, campagne : plus de 200 destinations négociées pour les membres CE.', website: 'https://horizons-sejours.fr' }
  )
  await upsertOffer('offer-weekend-cote',     { title: 'Weekend côte atlantique (2 nuits)', description: "Studio ou 2 pièces en résidence 3* face à l'océan. Accès piscine couverte et activités nautiques.",           originalPrice: 320,  discountedPrice: 199,  conditions: 'Du vendredi au dimanche. Hors périodes scolaires.',           isActive: true, isDemo: true, partnerId: horizons.id, categoryId: CAT_VOYAGE.id, locationCity: 'La Baule', locationCountry: 'France' })
  await upsertOffer('offer-semaine-mer',      { title: 'Semaine en résidence bord de mer',  description: 'Appartement 2 pièces pour 4, piscine, accès direct plage, ménage inclus. Côte atlantique ou méditerranée.',      originalPrice: 890,  discountedPrice: 549,  conditions: 'Du samedi au samedi. Charge de linge 50 EUR incluse.',       isActive: true, isDemo: true, partnerId: horizons.id, categoryId: CAT_VOYAGE.id, locationCity: 'Arcachon', locationCountry: 'France' })
  await upsertOffer('offer-ski-alpes',        { title: 'Semaine ski Alpes tout compris',    description: 'Appartement 6p à 200m des pistes, forfait skieur 6 jours et cours collectifs adultes inclus.',                  originalPrice: 1850, discountedPrice: 1190, conditions: 'Février-mars hors zone A. Matériel non inclus.',              isActive: true, isDemo: true, partnerId: horizons.id, categoryId: CAT_VOYAGE.id, locationCity: 'Les Deux Alpes', locationCountry: 'France' })
  await upsertOffer('offer-club-tout-inclus', { title: 'Village club tout inclus 7 nuits',  description: 'Hébergement, repas midi et soir, boissons, animations et sports inclus. Espagne, Maroc ou Tunisie.',            originalPrice: 1380, discountedPrice: 890,  conditions: 'Vols non inclus depuis Paris CDG. Enfants -12 ans réduits.',  isActive: true, isDemo: true, partnerId: horizons.id, categoryId: CAT_VOYAGE.id, locationCity: 'Marrakech', locationCountry: 'Maroc' })
  await upsertOffer('offer-city-break',       { title: 'City break Europe 3 nuits',         description: 'Hôtel 4* en centre-ville : Rome, Barcelone, Lisbonne ou Prague. Petit-déjeuner inclus, visite guidée offerte.', originalPrice: 580,  discountedPrice: 365,  conditions: 'Vols non inclus. Destination au choix parmi 12 villes.',    isActive: true, isDemo: true, partnerId: horizons.id, categoryId: CAT_VOYAGE.id, locationCity: 'Rome', locationCountry: 'Italie' })

  // ── 9. Cap Jeunes — Voyages ───────────────────────────────────────────
  const capJeunes = await upsertPartner(
    'colonie@demo-ce.fr', hashedPartner, 'Caroline Petit',
    { name: 'Cap Jeunes', slug: 'cap-jeunes', description: "Organisateur de séjours éducatifs et colonies de vacances pour enfants et adolescents. 35 ans d'expérience, encadrants diplômés, destinations France et étranger.", website: 'https://cap-jeunes.fr' }
  )
  await upsertOffer('offer-colonie-ete',      { title: 'Colonie été mer (1 semaine)',       description: 'Séjour 7 jours en bord de mer pour enfants 6-12 ans : nautisme, plage, veillées, excursions. Encadrement 1 pour 8.', originalPrice: 650,  discountedPrice: 420, conditions: 'Juillet ou août. Départ en car depuis Paris. Assurance incluse.', isActive: true, isDemo: true, partnerId: capJeunes.id, categoryId: CAT_VOYAGE.id, locationCity: 'Hendaye', locationCountry: 'France' })
  await upsertOffer('offer-sejour-lingui',    { title: 'Séjour linguistique Angleterre',    description: 'Immersion anglaise 2 semaines pour ados 13-17 ans : cours le matin, activités sportives l\'après-midi, familles d\'accueil.', originalPrice: 1850, discountedPrice: 1190, conditions: 'Juillet uniquement. Vol depuis Paris inclus. Niveau scolaire exigé.', isActive: true, isDemo: true, partnerId: capJeunes.id, categoryId: CAT_VOYAGE.id, locationCity: 'Brighton', locationCountry: 'Royaume-Uni' })
  await upsertOffer('offer-camp-montagne',    { title: 'Camp montagne aventure (10 jours)', description: 'Randonnée, escalade, via ferrata et bivouac pour ados 12-16 ans dans les Alpes. Encadrants BAFA et moniteurs brevetés.', originalPrice: 980, discountedPrice: 630, conditions: 'Août uniquement. Équipement technique fourni.', isActive: true, isDemo: true, partnerId: capJeunes.id, categoryId: CAT_VOYAGE.id, locationCity: 'Chamonix', locationCountry: 'France' })

  // ── 10. Plaisirs France — Loisirs ─────────────────────────────────────
  const plaisirs = await upsertPartner(
    'loisirs@demo-ce.fr', hashedPartner, 'Romain Leclerc',
    { name: 'Plaisirs France', slug: 'plaisirs-france', description: "Centrale d'achat CE pour les grands parcs de loisirs, parcs animaliers et centres d'activités en France. Tarifs négociés, valables toute l'année sans contrainte de date.", website: 'https://plaisirs-france.fr' }
  )
  await upsertOffer('offer-parc-aventure',   { title: 'Parc aventure & attractions 1j',    description: 'Journée illimitée dans un parc de loisirs technologiques : simulateurs, spectacles 4D, attractions familles. 2e parc inclus.', originalPrice: 58,  discountedPrice: 35,  conditions: 'Valable 1 an. Hors événements spéciaux. Enfants -4 ans gratuits.', isActive: true, isDemo: true, partnerId: plaisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Poitiers', locationCountry: 'France' })
  await upsertOffer('offer-parc-magie',      { title: 'Parc magie & féerie billet 1j',     description: "Journée dans le plus grand parc de féerie d'Europe : attractions, spectacles, personnages, feux d'artifice le soir.", originalPrice: 109, discountedPrice: 72,  conditions: 'Valable 6 mois. Accès aux 2 zones inclus. Hors supplément fastpass.', isActive: true, isDemo: true, partnerId: plaisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Chessy', locationCountry: 'France' })
  await upsertOffer('offer-zoo-famille',     { title: 'Zoo parc animalier (pack famille)',  description: 'Entrée 2 adultes + 2 enfants au 1er zoo de France : pandas géants, lions blancs, hippopotames, 10 000 animaux.', originalPrice: 134, discountedPrice: 88,  conditions: 'Pack 4 personnes non séparable. Enfants 3-12 ans.',                  isActive: true, isDemo: true, partnerId: plaisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Saint-Aignan', locationCountry: 'France' })
  await upsertOffer('offer-aquapark',        { title: 'Aquapark journée famille',           description: 'Accès illimité à un parc aquatique indoor & outdoor : toboggans, rivière lente, espace enfants et espace détente.', originalPrice: 92,  discountedPrice: 58,  conditions: 'Pack 2 adultes + 2 enfants. Valable semaine et weekend.',            isActive: true, isDemo: true, partnerId: plaisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Paris', locationCountry: 'France' })
  await upsertOffer('offer-karting',         { title: 'Session karting + bowling',          description: '2 sessions karting 10 min + 1 partie bowling pour 4 personnes. Boissons incluses.', originalPrice: 120, discountedPrice: 75, conditions: 'Sur réservation. Valable semaine uniquement pour bowling.', isActive: true, isDemo: true, partnerId: plaisirs.id, categoryId: CAT_LOISIRS.id, locationCity: 'Paris', locationCountry: 'France' })

  console.log('[seed] Terminé.')
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
  console.log('  Membre      : membre@ce-avocats.fr   / Member123!')
}

main()
  .catch((e) => { console.error('[seed] Erreur:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
