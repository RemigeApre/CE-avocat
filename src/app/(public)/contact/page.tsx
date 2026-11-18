import { ContactForm } from '@/components/contact/ContactForm'
import { RevealEmail } from '@/components/contact/RevealEmail'

export const metadata = {
  title: 'Contact',
  description: 'Écrivez-nous : formule Cabinet, partenariat, ou projet de site et d’application avec Le Geai.',
}

const SUBJECTS = ['le-geai', 'cabinet', 'partenariat', 'autre'] as const
type Props = { searchParams: Promise<{ sujet?: string }> }

export default async function ContactPage({ searchParams }: Props) {
  const { sujet } = await searchParams
  const subject = SUBJECTS.find((s) => s === sujet) ?? 'le-geai'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600 mb-3">Contact</p>
        <h1 className="text-3xl font-bold text-navy-800">Écrivez-nous</h1>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">Réponse rapide, à l’adresse que vous indiquez.</p>
      </div>
      <ContactForm defaultSubject={subject} />
      <div className="mt-6">
        <p className="text-center text-xs text-gray-500 mb-1.5">Vous préférez votre messagerie ?</p>
        <RevealEmail />
      </div>
    </div>
  )
}
