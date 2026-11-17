/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('[seed] Demarrage...')

  const hashedAdmin   = await bcrypt.hash('Admin123!',   12)
  const hashedPartner = await bcrypt.hash('Partner123!', 12)
  const hashedMember  = await bcrypt.hash('Member123!',  12)

  // Admin
  await prisma.user.upsert({
    where:  { email: 'admin@ce-avocats.fr' },
    update: {},
    create: { email: 'admin@ce-avocats.fr', password: hashedAdmin, name: 'Administrateur', role: 'ADMIN' },
  })

  // Categories
  const cats = await Promise.all([
    prisma.category.upsert({ where: { slug: 'restauration' },    update: {}, create: { name: 'Restauration',      slug: 'restauration',    icon: '🍽️' } }),
    prisma.category.upsert({ where: { slug: 'sport-bien-etre' }, update: {}, create: { name: 'Sport et bien-etre', slug: 'sport-bien-etre', icon: '🏋️' } }),
    prisma.category.upsert({ where: { slug: 'culture' },         update: {}, create: { name: 'Culture',           slug: 'culture',         icon: '🎭' } }),
    prisma.category.upsert({ where: { slug: 'voyages' },         update: {}, create: { name: 'Voyages',           slug: 'voyages',         icon: '✈️' } }),
    prisma.category.upsert({ where: { slug: 'shopping' },        update: {}, create: { name: 'Shopping',          slug: 'shopping',        icon: '🛍️' } }),
    prisma.category.upsert({ where: { slug: 'services' },        update: {}, create: { name: 'Services',          slug: 'services',        icon: '🔧' } }),
  ])

  // Partenaire 1
  const restoAdmin = await prisma.user.upsert({
    where:  { email: 'resto@ce-avocats.fr' },
    update: {},
    create: { email: 'resto@ce-avocats.fr', password: hashedPartner, name: 'Marie Dupont', role: 'PARTNER_ADMIN' },
  })
  const restoPalais = await prisma.partner.upsert({
    where:  { slug: 'resto-du-palais' },
    update: {},
    create: { name: 'Resto du Palais', slug: 'resto-du-palais', description: 'Restaurant gastronomique au coeur du quartier judiciaire.', adminId: restoAdmin.id },
  })
  await prisma.user.update({ where: { id: restoAdmin.id }, data: { partnerId: restoPalais.id } })

  // Partenaire 2
  const sportAdmin = await prisma.user.upsert({
    where:  { email: 'sport@ce-avocats.fr' },
    update: {},
    create: { email: 'sport@ce-avocats.fr', password: hashedPartner, name: 'Thomas Martin', role: 'PARTNER_ADMIN' },
  })
  const sportForme = await prisma.partner.upsert({
    where:  { slug: 'sport-et-forme' },
    update: {},
    create: { name: 'Sport et Forme', slug: 'sport-et-forme', description: 'Votre salle de sport premium avec coaches certifies.', adminId: sportAdmin.id },
  })
  await prisma.user.update({ where: { id: sportAdmin.id }, data: { partnerId: sportForme.id } })

  // Membre
  await prisma.user.upsert({
    where:  { email: 'membre@ce-avocats.fr' },
    update: {},
    create: { email: 'membre@ce-avocats.fr', password: hashedMember, name: 'Sophie Bernard', role: 'MEMBER' },
  })

  // Offres
  await prisma.offer.upsert({
    where:  { id: 'offer-menu-midi' },
    update: {},
    create: { id: 'offer-menu-midi', title: 'Menu du midi 3 plats', description: 'Entree, plat et dessert au choix.', originalPrice: 38, discountedPrice: 24, conditions: 'Lundi-vendredi, sur reservation.', isActive: true, partnerId: restoPalais.id, categoryId: cats[0].id },
  })
  await prisma.offer.upsert({
    where:  { id: 'offer-brunch' },
    update: {},
    create: { id: 'offer-brunch', title: 'Brunch du dimanche', description: 'Brunch copieux a volonte.', originalPrice: 45, discountedPrice: 30, conditions: 'Uniquement le dimanche 10h-14h.', isActive: true, partnerId: restoPalais.id, categoryId: cats[0].id },
  })
  await prisma.offer.upsert({
    where:  { id: 'offer-abonnement-mensuel' },
    update: {},
    create: { id: 'offer-abonnement-mensuel', title: 'Abonnement mensuel sans engagement', description: 'Acces illimite salle + cours + piscine.', originalPrice: 79, discountedPrice: 49, conditions: 'Premier mois.', isActive: true, partnerId: sportForme.id, categoryId: cats[1].id },
  })
  await prisma.offer.upsert({
    where:  { id: 'offer-coaching' },
    update: {},
    create: { id: 'offer-coaching', title: 'Pack 5 seances de coaching', description: 'Cinq seances individuelles avec un coach certifie.', originalPrice: 250, discountedPrice: 160, conditions: 'Valable 3 mois.', isActive: true, partnerId: sportForme.id, categoryId: cats[1].id },
  })

  console.log('[seed] Termine. admin@ce-avocats.fr / Admin123!')
}

main()
  .catch((e) => { console.error('[seed] Erreur:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
