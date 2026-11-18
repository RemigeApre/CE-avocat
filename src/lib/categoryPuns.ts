// Jeux de mots des categories d'offres : source unique (cartes du hero, footer, etc.)
export const CATEGORY_PUNS = [
  { pun: 'Flagrant délice', category: 'Gastronomie', slug: 'gastronomie' },
  { pun: 'Plagiat', category: 'Culture', slug: 'culture' },
  { pun: 'Abandon de poste', category: 'Bien-être', slug: 'bien-etre' },
  { pun: 'Délit de fuite', category: 'Voyages', slug: 'voyages' },
  { pun: 'Mise en liberté', category: 'Loisirs', slug: 'loisirs' },
] as const

export type CategoryPunSlug = (typeof CATEGORY_PUNS)[number]['slug']

/**
 * Jeu de mot + vraie categorie pour un slug, ou undefined si non reference.
 * Attention : en base, `Category.name` contient deja le jeu de mot (cf. prisma/seed.js) ;
 * la vraie categorie n'existe qu'ici, dans `category`.
 */
export const categoryPun = (slug: string) => CATEGORY_PUNS.find((c) => c.slug === slug)

export const categoryHref =(slug: string) => `/offres?categorie=${slug}`
