// Jeux de mots des categories d'offres : source unique (cartes du hero, footer, etc.)
export const CATEGORY_PUNS = [
  { pun: 'Flagrant délice', category: 'Gastronomie', slug: 'gastronomie' },
  { pun: 'Plagiat', category: 'Culture', slug: 'culture' },
  { pun: 'Abandon de poste', category: 'Bien-être', slug: 'bien-etre' },
  { pun: 'Délit de fuite', category: 'Voyages', slug: 'voyages' },
  { pun: 'Mise en liberté', category: 'Loisirs', slug: 'loisirs' },
] as const

export type CategoryPunSlug = (typeof CATEGORY_PUNS)[number]['slug']

export const categoryHref = (slug: string) => `/offres?categorie=${slug}`
