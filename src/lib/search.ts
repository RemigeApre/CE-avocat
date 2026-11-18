// Recherche d'offres : titre, partenaire, ville, description. Insensible a la casse et aux accents
// ("theatre" trouve "Théâtre"). Le catalogue de demonstration est petit : filtrage en memoire.

/** Minuscules, sans accents ni ponctuation superflue */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface Searchable {
  title: string
  description: string
  partner: { name: string }
  locationCity?: string | null
}

/**
 * Score de pertinence (0 = ne correspond pas). Chaque mot de la requete doit apparaitre
 * quelque part ; un mot trouve dans le titre pese plus que dans le partenaire, puis la description.
 */
export function matchScore(item: Searchable, query: string): number {
  const words = normalize(query).split(' ').filter(Boolean)
  if (words.length === 0) return 0
  const title = normalize(item.title)
  const partner = normalize(item.partner.name)
  const desc = normalize(item.description)
  const city = normalize(item.locationCity ?? '')
  let score = 0
  for (const w of words) {
    if (title.includes(w)) score += title.startsWith(w) || title.includes(' ' + w) ? 6 : 4
    else if (partner.includes(w)) score += 3
    else if (city.includes(w)) score += 2
    else if (desc.includes(w)) score += 1
    else return 0
  }
  return score
}

/** Filtre et trie par pertinence (ordre d'origine conserve a egalite) */
export function searchItems<T extends Searchable>(items: T[], query: string): T[] {
  if (!normalize(query)) return items
  return items
    .map((item, i) => ({ item, i, s: matchScore(item, query) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((r) => r.item)
}
