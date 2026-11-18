'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { CheckCircle2, Loader2, Send, ShieldCheck } from 'lucide-react'
import { getProof } from '@/lib/pow'

const SUBJECTS = [
  { value: 'le-geai', label: 'Projet avec Le Geai (site, application, formation)' },
  { value: 'cabinet', label: 'Formule Cabinet Maître en Pause' },
  { value: 'partenariat', label: 'Devenir partenaire' },
  { value: 'autre', label: 'Autre demande' },
] as const

type Subject = (typeof SUBJECTS)[number]['value']
type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Formulaire de contact protege des robots : preuve de travail calculee en arriere-plan
 * pendant la saisie, champ piege invisible, delai minimal et limites cote serveur.
 */
export function ContactForm({ defaultSubject = 'le-geai' }: { defaultSubject?: Subject }) {
  const uid = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const proof = useRef<Promise<{ token: string; nonce: string }> | null>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)

  // Le calcul commence des l'affichage : il est pret bien avant que la personne ait fini d'ecrire
  const startProof = () => { proof.current = getProof('contact'); proof.current.catch(() => { /* gere a l'envoi */ }) }
  useEffect(() => { startProof() }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    setStatus('sending'); setError('')
    try {
      const { token, nonce } = await (proof.current ?? getProof('contact'))
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, token, nonce }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? 'L’envoi a échoué.')
      setStatus('sent')
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'L’envoi a échoué.')
      setStatus('error')
      startProof() // un jeton ne sert qu'une fois : on en prepare un nouveau
      window.setTimeout(() => errorRef.current?.focus(), 0)
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-lg border border-[#e5e3de] bg-white p-6 text-center" role="status">
        <CheckCircle2 className="w-8 h-8 text-gold-600 mx-auto" aria-hidden="true" />
        <p className="mt-3 text-base font-semibold text-navy-800">Message envoyé, merci !</p>
        <p className="mt-1 text-sm text-gray-600">Nous vous répondrons rapidement à l’adresse indiquée.</p>
        <button type="button" onClick={() => { setStatus('idle'); startProof() }} className="mt-4 text-sm font-medium text-navy-700 underline underline-offset-4">
          Envoyer un autre message
        </button>
      </div>
    )
  }

  const field = 'w-full rounded-md border border-[#e5e3de] bg-white px-3 py-2.5 text-base sm:text-sm text-navy-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-transparent'
  const label = 'block text-sm font-medium text-navy-800 mb-1.5'

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-[#e5e3de] bg-white p-5 sm:p-6 space-y-4 text-left" noValidate={false}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${uid}-name`} className={label}>Nom</label>
          <input id={`${uid}-name`} name="name" required minLength={2} maxLength={80} autoComplete="name" className={field} />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className={label}>E-mail</label>
          <input id={`${uid}-email`} name="email" type="email" required maxLength={120} autoComplete="email" inputMode="email" className={field} />
        </div>
      </div>
      <div>
        <label htmlFor={`${uid}-subject`} className={label}>Sujet</label>
        <select id={`${uid}-subject`} name="subject" defaultValue={defaultSubject} className={field}>
          {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${uid}-message`} className={label}>Message</label>
        <textarea id={`${uid}-message`} name="message" required minLength={10} maxLength={4000} rows={5} className={`${field} resize-y`} />
      </div>

      {/* Champ piege : invisible et hors du parcours clavier pour les humains, souvent rempli par les robots */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor={`${uid}-website`}>Ne pas remplir</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'error' && (
        <p ref={errorRef} tabIndex={-1} role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0" aria-hidden="true" />
          Protégé contre les robots, sans traceur ni service tiers.
        </p>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-navy-800 hover:bg-navy-700 disabled:opacity-70 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
          {status === 'sending' ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </form>
  )
}
