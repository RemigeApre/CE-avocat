'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CarouselProps {
  children: ReactNode[]
  /** Largeur d'un element, en px ou vw (pas en % : il ne se rapporterait pas a la meme base que les marges de centrage) */
  itemWidth: string
  /** Libelle accessible de la zone ("Etapes d'adhesion"...) */
  label: string
  /**
   * Classes ajoutees au conteneur defilant, typiquement pour repasser en grille a partir
   * d'un breakpoint (ex. "md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:py-0 md:[mask-image:none]").
   */
  className?: string
  /** Classes ajoutees a chaque element (ex. "md:w-auto") */
  itemClassName?: string
  /** Classes ajoutees aux pastilles (ex. "md:hidden") */
  dotsClassName?: string
  /** Element centre au chargement (ex. l'offre recommandee) ; sans effet quand le conteneur est en grille */
  initialIndex?: number
}

/**
 * Carrousel balayable au doigt : defilement natif + scroll-snap (fluide, inertie du telephone),
 * element actif centre, fondu sur les bords, pastilles de position cliquables.
 */
export function Carousel({ children, itemWidth, label, className, itemClassName, dotsClassName, initialIndex = 0 }: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(initialIndex)

  // Positionnement initial, sans animation (et sans toucher au defilement vertical de la page)
  useEffect(() => {
    const el = ref.current
    const child = el?.children[initialIndex] as HTMLElement | undefined
    if (!el || !child || el.scrollWidth <= el.clientWidth) return
    el.scrollLeft = child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2
  }, [initialIndex])

  // Element actif = celui dont le centre est le plus proche du centre de la zone
  function onScroll() {
    const el = ref.current
    if (!el) return
    const center = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    Array.from(el.children).forEach((child, i) => {
      const c = child as HTMLElement
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center)
      if (d < bestDist) { bestDist = d; best = i }
    })
    setActive(best)
  }

  function goTo(i: number) {
    const el = ref.current
    const child = el?.children[i] as HTMLElement | undefined
    if (!el || !child) return
    el.scrollTo({ left: child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2, behavior: 'smooth' })
  }

  return (
    <div role="region" aria-roledescription="carrousel" aria-label={label}>
      <div
        ref={ref}
        onScroll={onScroll}
        style={{ '--item-w': itemWidth } as CSSProperties}
        className={cn(
          'relative flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain py-5',
          'px-[calc(50%_-_var(--item-w)/2)]',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          '[mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-20px),transparent)]',
          className,
        )}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className={cn('snap-center shrink-0 w-[var(--item-w)]', itemClassName)}
            aria-roledescription="élément"
            aria-label={`${i + 1} sur ${children.length}`}
          >
            {child}
          </div>
        ))}
      </div>

      <div className={cn('flex justify-center gap-1.5 mt-1', dotsClassName)}>
        {children.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Aller à l'élément ${i + 1} sur ${children.length}`}
            aria-current={i === active ? 'true' : undefined}
            className="p-1.5 -m-0.5"
          >
            <span className={cn('block h-1.5 rounded-full transition-all duration-200', i === active ? 'w-5 bg-gold-500' : 'w-1.5 bg-navy-200')} />
          </button>
        ))}
      </div>
    </div>
  )
}
