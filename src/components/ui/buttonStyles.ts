import { cn } from '@/lib/utils'

// Styles des boutons : module neutre (ni client ni serveur), utilisable partout,
// y compris pour donner l'apparence d'un bouton a un lien depuis une page serveur.

export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type Size = 'sm' | 'md' | 'lg'

export const variants: Record<Variant, string> = {
  primary: 'bg-navy-800 text-white hover:bg-navy-700 focus-visible:ring-navy-800',
  secondary: 'bg-gold-500 text-navy-900 hover:bg-gold-400 focus-visible:ring-gold-500',
  outline: 'border border-navy-800 text-navy-800 hover:bg-navy-50 focus-visible:ring-navy-800',
  ghost: 'text-navy-800 hover:bg-navy-50 focus-visible:ring-navy-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
}

export const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-sm h-9',
  lg: 'px-6 py-3 text-base h-11',
}

/**
 * Classes d'un bouton, pour donner l'apparence d'un bouton a un lien
 * (<Link className={buttonClass({ variant: 'outline' })}>) sans imbriquer <button> dans <a>.
 */
export function buttonClass({ variant = 'primary', size = 'md', className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    'inline-flex items-center justify-center font-medium rounded-md transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    variants[variant],
    sizes[size],
    className,
  )
}

