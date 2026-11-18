'use client'

import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  /** Chemin a partager (ex. "/adhesion") ; l'origine du site est ajoutee cote navigateur */
  path: string
  title: string
  text?: string
  label: string
  className?: string
}

/**
 * Partage natif sur mobile (feuille de partage du telephone),
 * copie du lien dans le presse-papiers sur ordinateur.
 */
export function ShareButton({ path, title, text, label, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = new URL(path, window.location.origin).toString()
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch (err) {
        // Annule par l'utilisateur : on ne fait rien ; autre erreur : repli sur la copie
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.location.href = url
    }
  }

  return (
    <button type="button" onClick={share} className={cn('inline-flex items-center gap-2', className)}>
      {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Share2 className="w-4 h-4" aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Lien copié !' : label}</span>
    </button>
  )
}
