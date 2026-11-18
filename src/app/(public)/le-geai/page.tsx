import { ContactForm } from '@/components/contact/ContactForm'
import { RevealEmail } from '@/components/contact/RevealEmail'
import {
  BookOpen,
  BrainCircuit,
  Gauge,
  Mail,
  Monitor,
  PenTool,
  Presentation,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export const metadata = {
  title: 'Le Geai',
  description:
    "Le Geai, maison d'édition et entreprise de services informatiques : sites sur mesure, applications ordinateur et mobile, maintenance, conférences et formations.",
}


const SERVICES: { Icon: LucideIcon; title: string; text: string; featured?: boolean }[] = [
  {
    Icon: Zap,
    title: 'Sites sur mesure',
    text: 'Notre spécialité : des sites conçus pour vous, livrés en peu de temps et sans compromis sur la qualité. Rapides, élégants, pensés pour l’ordinateur comme pour le téléphone.',
    featured: true,
  },
  {
    Icon: Monitor,
    title: 'Applications ordinateur',
    text: 'Des logiciels adaptés à vos usages métier, pour automatiser vos tâches et gagner du temps au quotidien.',
  },
  {
    Icon: Smartphone,
    title: 'Applications mobiles',
    text: 'Des applications pour iPhone et Android, fluides et agréables, qui accompagnent vos utilisateurs partout.',
  },
  {
    Icon: Wrench,
    title: 'Gestion et maintenance',
    text: 'Mises à jour, sécurité, sauvegardes, évolutions : votre site reste fiable et performant dans la durée.',
  },
  {
    Icon: Presentation,
    title: 'Conférences et formations',
    text: 'Des interventions claires et concrètes pour vos équipes, en particulier sur la cybersécurité et l’intelligence artificielle.',
  },
  {
    Icon: BookOpen,
    title: 'Édition',
    text: 'Maison d’édition, Le Geai accompagne aussi des projets éditoriaux, de l’idée à la publication.',
  },
]

const TRAINING_TOPICS: { Icon: LucideIcon; label: string }[] = [
  { Icon: ShieldCheck, label: 'Cybersécurité' },
  { Icon: BrainCircuit, label: 'Intelligence artificielle' },
]

const STRENGTHS: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Gauge, title: 'Rapidité', text: 'Des délais courts, sans sacrifier la finition.' },
  { Icon: Sparkles, title: 'Haute qualité', text: 'Un code soigné, un design travaillé, un résultat durable.' },
  { Icon: PenTool, title: 'Sur mesure', text: 'Chaque projet part de vos besoins, jamais d’un modèle générique.' },
]

export default function LeGeaiPage() {
  return (
    <div className="bg-white">
      {/* En-tete */}
      <section className="bg-navy-800 text-white">
        <div className="max-w-5xl mx-auto px-6 py-14 md:py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400 mb-3">Concepteur du site</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">Le Geai</h1>
          <p className="mt-4 text-sm md:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
            Maison d&apos;édition et entreprise de services informatiques. Nous créons des sites, des applications
            et des formations qui allient rapidité, exigence et sur-mesure.
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-sm bg-gold-500 hover:bg-gold-400 text-navy-900 text-sm font-semibold transition-colors"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            Nous écrire
          </a>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600 mb-3">Ce que nous faisons</p>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800">Nos services</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map(({ Icon, title, text, featured }) => (
            <div
              key={title}
              className={[
                'rounded-lg p-6 flex flex-col gap-3 border transition-shadow hover:shadow-md',
                featured ? 'bg-navy-800 border-navy-800 sm:col-span-2 lg:col-span-1' : 'bg-white border-[#e5e3de]',
              ].join(' ')}
            >
              <div className={['w-10 h-10 rounded-sm flex items-center justify-center shrink-0', featured ? 'bg-gold-500' : 'bg-navy-800'].join(' ')}>
                <Icon className={['w-5 h-5', featured ? 'text-white' : 'text-gold-400'].join(' ')} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <h3 className={['text-base font-bold', featured ? 'text-white' : 'text-navy-800'].join(' ')}>
                {title}
                {featured && <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-widest text-gold-400">Spécialité</span>}
              </h3>
              <p className={['text-sm leading-relaxed', featured ? 'text-white/70' : 'text-gray-500'].join(' ')}>{text}</p>
              {title === 'Conférences et formations' && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {TRAINING_TOPICS.map(({ Icon: TopicIcon, label }) => (
                    <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 border border-gold-200 px-2.5 py-1 text-xs font-medium text-gold-800">
                      <TopicIcon className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Points forts */}
      <section className="bg-[#f7f6f3] border-y border-[#e5e3de]">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-14 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
          {STRENGTHS.map(({ Icon, title, text }) => (
            <div key={title} className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3 sm:text-center">
              <div className="w-12 h-12 rounded-full bg-white border border-[#e5e3de] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-gold-600" strokeWidth={1.6} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy-800">{title}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact : formulaire protege + adresse affichee a la demande (jamais dans la page) */}
      <section id="contact" className="max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-16 scroll-mt-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-navy-800">Un projet en tête ?</h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            Ce site, Maître en Pause, a été conçu et réalisé bénévolement par Le Geai.
            Parlons du vôtre : réponse rapide et devis sans engagement.
          </p>
        </div>
        <ContactForm defaultSubject="le-geai" />
        <div className="mt-6">
          <p className="text-center text-xs text-gray-500 mb-1.5">Vous préférez votre messagerie ?</p>
          <RevealEmail />
        </div>
      </section>
    </div>
  )
}
