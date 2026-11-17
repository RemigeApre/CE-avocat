import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'gold' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700',
  gold:    'bg-gold-100 text-gold-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
