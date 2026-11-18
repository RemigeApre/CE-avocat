import { categoryPun } from '@/lib/categoryPuns'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface CategorySubNavProps {
  categories: Category[]
  activeSlug?: string
}

export function CategorySubNav({ categories, activeSlug }: CategorySubNavProps) {
  const baseClass = 'shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap'
  const activeClass = 'border-gold-500 text-white'
  const inactiveClass = 'border-transparent text-white/60 hover:text-white'

  return (
    // Masque sur mobile : les categories sont dans le menu burger (sous-menu Offres)
    <div className="hidden md:block sticky top-[72px] z-30 bg-navy-800 border-b border-navy-700">
      {/* Centrage "sur" : w-max + mx-auto centre quand ca tient, et reste defilable depuis le debut quand ca deborde (mobile).
          xl+ : tout tient sur une ligne -> overflow visible pour laisser sortir l'infobulle sous la barre. */}
      <div className="overflow-x-auto xl:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max mx-auto px-6 lg:px-16">
          <a
            href="/offres"
            className={[baseClass, !activeSlug ? activeClass : inactiveClass].join(' ')}
          >
            Toutes les offres
          </a>
          {categories.map((cat) => {
            const entry = categoryPun(cat.slug)
            return (
              <a
                key={cat.id}
                href={`/offres?categorie=${cat.slug}`}
                className={[baseClass, 'group relative', activeSlug === cat.slug ? activeClass : inactiveClass].join(' ')}
              >
                {entry?.pun ?? cat.name}
                {entry && (
                  <>
                    {/* Lecteurs d'ecran : la vraie categorie est toujours annoncee */}
                    <span className="sr-only"> ({entry.category})</span>
                    {/* Infobulle au survol / focus clavier (desktop, xl+) */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 hidden xl:block -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded bg-white px-2.5 py-1 text-xs font-medium text-navy-800 opacity-0 shadow-lg transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                    >
                      {/* Petite fleche */}
                      <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" />
                      <span className="relative">{entry.category}</span>
                    </span>
                  </>
                )}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
