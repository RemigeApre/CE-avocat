import { punFor } from '@/lib/categoryPuns'

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
    <div className="sticky top-[72px] z-30 bg-navy-800 border-b border-navy-700">
      {/* Centrage "sur" : w-max + mx-auto centre quand ca tient, et reste defilable depuis le debut quand ca deborde (mobile) */}
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max mx-auto px-6 lg:px-16">
          <a
            href="/offres"
            className={[baseClass, !activeSlug ? activeClass : inactiveClass].join(' ')}
          >
            Toutes les offres
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/offres?categorie=${cat.slug}`}
              className={[baseClass, activeSlug === cat.slug ? activeClass : inactiveClass].join(' ')}
            >
              {punFor(cat.slug) ? (
                <>
                  {punFor(cat.slug)}
                  <span className="text-xs font-normal opacity-60">· {cat.name}</span>
                </>
              ) : cat.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
