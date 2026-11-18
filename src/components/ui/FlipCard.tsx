'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  /** Nom de la carte, pour les libelles d'accessibilite des boutons de retournement */
  label: string
  /** Libelle du bouton recto -> verso (defaut : "<label> : retourner la carte") */
  flipLabel?: string
  /** Taille, rotation, survol... de la carte (conteneur exterieur) */
  className?: string
  style?: CSSProperties
  /** Fond, bordure, rayon, ombre de chaque face */
  frontClassName?: string
  backClassName?: string
}

/**
 * Carte recto/verso qui se retourne au clic (animation 3D).
 *
 * - Chaque face porte un bouton plein cadre qui retourne la carte ; son contenu est
 *   pose par-dessus en `pointer-events-none`. Pour un element cliquable dans une face
 *   (lien, bouton), lui ajouter `pointer-events-auto`.
 * - La face cachee est `inert` : ni focus clavier, ni lecteur d'ecran.
 * - `prefers-reduced-motion` : changement de face instantane, sans rotation.
 */
export function FlipCard({
  front,
  back,
  label,
  flipLabel,
  className,
  style,
  frontClassName,
  backClassName,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false)
  const toggle = () => setFlipped((f) => !f)

  return (
    <div className={cn('perspective-800', className)} style={style}>
      <div
        className={cn(
          'relative h-full w-full preserve-3d transition-transform duration-500 ease-[cubic-bezier(.2,.7,.3,1)] motion-reduce:transition-none',
          flipped && 'rotate-y-180',
        )}
      >
        <Face hidden={flipped} onToggle={toggle} ariaLabel={flipLabel ?? `${label} : retourner la carte`} className={frontClassName}>
          {front}
        </Face>
        <Face hidden={!flipped} onToggle={toggle} ariaLabel={`${label} : revenir au recto`} className={cn('rotate-y-180', backClassName)}>
          {back}
        </Face>
      </div>
    </div>
  )
}

interface FaceProps {
  hidden: boolean
  onToggle: () => void
  ariaLabel: string
  className?: string
  children: ReactNode
}

function Face({ hidden, onToggle, ariaLabel, className, children }: FaceProps) {
  return (
    <div className={cn('absolute inset-0 backface-hidden', className)} inert={hidden}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={ariaLabel}
        className="absolute inset-0 rounded-[inherit] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500 focus-visible:outline-offset-2"
      />
      <div className="pointer-events-none relative h-full w-full">{children}</div>
    </div>
  )
}
