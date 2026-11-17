import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const hashedAdmin = await bcrypt.hash('Admin123!', 12)
  const hashedPartner = await bcrypt.hash('Partner123!', 12)
  const hashedMember = await bcrypt.hash('Member123!', 12)

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ce-avocats.fr' },
    update: {},
    create: {
      email: 'admin@ce-avocats.fr',
      password: hashedAdmin,
      name: 'Administrateur',
      role: Role.ADMIN,
    },
  })

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'restauration' },
      update: {},
      create: { name: 'Restauration', slug: 'restauration', icon: '🍽️', description: 'Restaurants et traiteurs partenaires' },
    }),
    prisma.category.upsert({
      where: { slug: 'sport-bien-etre' },
      update: {},
      create: { name: 'Sport et bien-etre', slug: 'sport-bien-etre', icon: '🏋️', description: 'Salles de sport, yoga, spa' },
    }),
    prisma.category.upsert({
      where: { slug: 'culture' },
      update: {},
      create: { name: 'Culture', slug: 'culture', icon: '🎭', description: 'Cinema, theatre, musees' },
    }),
    prisma.category.upsert({
      where: { slug: 'voyages' },
      update: {},
      create: { name: 'Voyages', slug: 'voyages', icon: '✈️', description: 'Hotels, locations, transports' },
    }),
    prisma.category.upsert({
      where: { slug: 'shopping' },
      update: {},
      create: { name: 'Shopping', slug: 'shopping', icon: '🛍️', description: 'Mode, tech, maison' },
    }),
    prisma.category.upsert({
      where: { slug: 'services' },
      update: {},
      create: { name: 'Services', slug: 'services', icon: '🔧', description: 'Assurances, banque, formation' },
    }),
  ])

  // Partenaire 1 : Resto du Palais
  const restoAdmin = await prisma.user.upsert({
    where: { email: 'resto@ce-avocats.fr' },
    update: {},
    create: {
      email: 'resto@ce-avocats.fr',
      password: hashedPartner,
      name: 'Marie Dupont',
      role: Role.PARTNER_ADMIN,
    },
  })

  const restoPalais = await prisma.partner.upsert({
    where: { slug: 'resto-du-palais' },
    update: {},
    create: {
      name: 'Resto du Palais',
      slug: 'resto-du-palais',
      description: 'Restaurant gastronomique au coeur du quartier judiciaire. Cuisine francaise de qualite dans un cadre elegant.',
      website: 'https://restdupalais.fr',
      adminId: restoAdmin.id,
    },
  })

  await prisma.user.update({
    where: { id: restoAdmin.id },
    data: { partnerId: restoPalais.id },
  })

  // Partenaire 2 : Sport & Forme
  const sportAdmin = await prisma.user.upsert({
    where: { email: 'sport@ce-avocats.fr' },
    update: {},
    create: {
      email: 'sport@ce-avocats.fr',
      password: hashedPartner,
      name: 'Thomas Martin',
      role: Role.PARTNER_ADMIN,
    },
  })

  const sportForme = await prisma.partner.upsert({
    where: { slug: 'sport-et-forme' },
    update: {},
    create: {
      name: 'Sport et Forme',
      slug: 'sport-et-forme',
      description: 'Votre salle de sport premium avec coaches certifies, piscine et espace bien-etre.',
      website: 'https://sportetforme.fr',
      adminId: sportAdmin.id,
    },
  })

  await prisma.user.update({
    where: { id: sportAdmin.id },
    data: { partnerId: sportForme.id },
  })

  // Membre
  await prisma.user.upsert({
    where: { email: 'membre@ce-avocats.fr' },
    update: {},
    create: {
      email: 'membre@ce-avocats.fr',
      password: hashedMember,
      name: 'Sophie Bernard',
      role: Role.MEMBER,
    },
  })

  // Offres du Resto du Palais
  await prisma.offer.upsert({
    where: { id: 'offer-menu-midi' },
    update: {},
    create: {
      id: 'offer-menu-midi',
      title: 'Menu du midi 3 plats',
      description: 'Entree, plat et dessert au choix parmi notre selection du moment. Boisson non incluse.',
      originalPrice: 38,
      discountedPrice: 24,
      conditions: 'Valable du lundi au vendredi, sur reservation uniquement.',
      validUntil: new Date('2025-12-31'),
      isActive: true,
      partnerId: restoPalais.id,
      categoryId: categories[0].id,
    },
  })

  await prisma.offer.upsert({
    where: { id: 'offer-brunch' },
    update: {},
    create: {
      id: 'offer-brunch',
      title: 'Brunch du dimanche',
      description: 'Brunch copieux avec viennoiseries, oeufs, charcuterie, fromages et desserts a volonte.',
      originalPrice: 45,
      discountedPrice: 30,
      conditions: 'Uniquement le dimanche de 10h a 14h. Sur reservation.',
      validUntil: new Date('2025-12-31'),
      isActive: true,
      partnerId: restoPalais.id,
      categoryId: categories[0].id,
    },
  })

  // Offres Sport et Forme
  await prisma.offer.upsert({
    where: { id: 'offer-abonnement-mensuel' },
    update: {},
    create: {
      id: 'offer-abonnement-mensuel',
      title: 'Abonnement mensuel sans engagement',
      description: 'Acces illimite a la salle, aux cours collectifs et a la piscine. Bilan fitness offert.',
      originalPrice: 79,
      discountedPrice: 49,
      conditions: 'Premier mois. Renouvellement au tarif preferentiel de 59 EUR/mois.',
      isActive: true,
      partnerId: sportForme.id,
      categoryId: categories[1].id,
    },
  })

  await prisma.offer.upsert({
    where: { id: 'offer-coaching' },
    update: {},
    create: {
      id: 'offer-coaching',
      title: 'Pack 5 seances de coaching',
      description: 'Cinq seances individuelles avec un coach certifie pour atteindre vos objectifs.',
      originalPrice: 250,
      discountedPrice: 160,
      conditions: 'Valable 3 mois a compter de la date d\'achat.',
      isActive: true,
      partnerId: sportForme.id,
      categoryId: categories[1].id,
    },
  })

  console.log('Seed termine.')
  console.log('Comptes de test :')
  console.log('  Admin       : admin@ce-avocats.fr / Admin123!')
  console.log('  Partenaire  : resto@ce-avocats.fr / Partner123!')
  console.log('  Partenaire  : sport@ce-avocats.fr / Partner123!')
  console.log('  Membre      : membre@ce-avocats.fr / Member123!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
