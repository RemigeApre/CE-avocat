'use client'

import { useState } from 'react'
import { Check, Copy, Eye, Loader2, Mail } from 'lucide-react'
import { getProof } from '@/lib/pow'

/**
 * L'adresse n'est jamais dans la page : elle est demandee au serveur au clic,
 * apres une petite preuve de travail (invisible pour un humain, couteuse pour un robot).
 */
export function RevealEmail({ className = '' }: { className?: string }) {
  const [email, setEmail] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  async function reveal() {
    setState('loading')
    try {
      const proof = await getProof('reveal')
      const res = await fetch('/api/contact/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proof),
      })
      if (!res.ok) throw new Error()
      setEmail((await res.json()).email)
      setState('idle')
    } catch {
      setState('error')
    }
  }

  async function copy() {
    if (!email) return
    try { await navigator.clipboard.writeText(email); setCopied(true); window.setTimeout(() => setCopied(false), 2000) } catch { /* */ }
  }

  if (email) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
        <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-gold-700 break-all">
          <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
          {email}
        </a>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-md border border-[#e5e3de] px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">
          {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
          <span aria-live="polite">{copied ? 'Copiée' : 'Copier'}</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`text-center ${className}`}>
      <button
        type="button"
        onClick={reveal}
        disabled={state === 'loading'}
        className="inline-flex items-center gap-2 text-sm font-medium text-navy-700 underline underline-offset-4 hover:text-gold-700 disabled:opacity-70"
      >
        {state === 'loading'
          ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          : <Eye className="w-4 h-4" aria-hidden="true" />}
        {state === 'loading' ? 'Vérification…' : 'Afficher l’adresse e-mail'}
      </button>
      {state === 'error' && <p className="mt-1 text-xs text-red-700" role="alert">Impossible d’afficher l’adresse pour le moment. Réessayez.</p>}
    </div>
  )
}
