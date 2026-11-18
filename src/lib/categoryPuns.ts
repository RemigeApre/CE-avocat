// Jeux de mots des categories d'offres : source unique (cartes du hero, footer, etc.)
export const CATEGORY_PUNS = [
  { pun: 'Flagrant délice', category: 'Gastronomie', slug: 'gastronomie' },
  { pun: 'Plagiat', category: 'Culture', slug: 'culture' },
  { pun: 'Abandon de poste', category: 'Bien-être', slug: 'bien-etre' },
  { pun: 'Délit de fuite', category: 'Voyages', slug: 'voyages' },
  { pun: 'Mise en liberté', category: 'Loisirs', slug: 'loisirs' },
] as const

export type CategoryPunSlug = (typeof CATEGORY_PUNS)[number]['slug']

/** Jeu de mot d'une categorie (par slug), ou undefined si aucun n'est defini */
export const punFor = (slug: string): string | undefined =>
  CATEGORY_PUNS.find((c) => c.slug === slug)?.pun

export const categoryHref =(slug: string) => `/offres?categorie=${slug}`
