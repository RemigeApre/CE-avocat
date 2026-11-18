import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Button, CountUp, FlipCard, Avocado, type AvocadoEmotion } from '@/components/ui'
import { HeroCards } from '@/components/hero/HeroCards'
import { OfferGrid } from '@/components/offers/OfferGrid'
import { cn } from '@/lib/utils'
import { CATEGORY_PUNS } from '@/lib/categoryPuns'
import { formatDate } from '@/lib/utils'
import type { OfferWithRelations } from '@/types'

async function getFeaturedOffers(): Promise<OfferWithRelations[]> {
  const offers = await prisma.offer.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: {
      partner: { select: { id: true, name: true, slug: true, logo: true } },
      category: { select: { id: true, name: true, slug: true, icon: true } },
    },
  })
  return offers as unknown as OfferWithRelations[]
}

// Nombre d'offres actives par categorie (slug -> nombre), pour le verso des cartes du hero
async function getOfferCountsByCategory(): Promise<Record<string, number>> {
  const categories = await prisma.category.findMany({
    select: { slug: true, _count: { select: { offers: { where: { isActive: true } } } } },
  })
  return Object.fromEntries(categories.map((c) => [c.slug, c._count.offers]))
}

async function getOfferCount() {
  return prisma.offer.count({ where: { isActive: true } })
}

async function getPartners() {
  return prisma.partner.findMany({
    select: { id: true, name: true, logo: true },
    orderBy: { name: 'asc' },
  })
}

async function getLatestPosts() {
  return prisma.post.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { id: true, title: true, slug: true, excerpt: true, imageUrl: true, publishedAt: true },
  })
}


// Parcours d'adhesion : recto = etape, verso = emotion de l'avocat a ce moment-la
const JOIN_STEPS: { n: string; title: string; emotion: AvocadoEmotion; mood: string; quote: string }[] = [
  { n: '01', title: "S'inscrire gratuitement", emotion: 'curious', mood: 'Curieux', quote: 'Gratuit ? Vraiment ?' },
  { n: '02', title: 'Prouver son inscription au barreau', emotion: 'focused', mood: 'Concentré', quote: 'Ma carte pro… elle était là !' },
  { n: '03', title: 'Choisir sa cotisation', emotion: 'hesitant', mood: 'Hésitant', quote: 'Laquelle me ressemble ?' },
  { n: '04', title: 'Accès aux offres et avantages', emotion: 'delighted', mood: 'Ravi', quote: 'Enfin en pause.' },
]

export default async function HomePage() {
  const [offers, offerCount, countsByCategory, partners, posts] = await Promise.all([
    getFeaturedOffers(),
    getOfferCount(),
    getOfferCountsByCategory(),
    getPartners(),
    getLatestPosts(),
  ])

  const HIGHLIGHTS = CATEGORY_PUNS.map((c) => c.pun)

  const marqueeItems = partners.length > 0
    ? partners
    : HIGHLIGHTS.map((h, i) => ({ id: String(i), name: h, logo: null as string | null }))
  const groupItems = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems]

  return (
    <>
      {/* Hero + marquee = exactement le viewport moins le header */}
      <section
        className="flex flex-col overflow-hidden bg-white"
        style={{ height: 'calc(100vh - 72px)' }}
      >
        {/* Zone principale */}
        <div className="relative flex-1 overflow-hidden">

          {/* Image droite - habillage, rien par dessus */}
          <div className="absolute right-0 top-0 h-full w-[44%] pointer-events-none select-none hidden md:block">
            {/* Fondu blanc a gauche : la statue est a droite, le fondu ne mange que le decor */}
            <div className="absolute left-0 top-0 bottom-0 w-24 lg:w-44 bg-gradient-to-r from-white via-white/60 to-transparent z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-justice-plage.webp"
              alt=""
              fetchPriority="high"
              decoding="async"
              width={1200}
              height={1698}
              className="h-full w-full object-cover object-[80%_10%]"
            />
          </div>

          {/* Contenu principal */}
          <div className="relative z-10 h-full flex items-center">

            {/* Logo + cartes collectibles - absolus a gauche, hors flux.
                lg -> 2xl : rail etroit pleine hauteur, cartes en 1 colonne defilante.
                2xl+      : bloc centre verticalement, cartes en 2 colonnes. */}
            <div className="absolute left-6 top-0 bottom-0 w-[140px] py-6 hidden lg:flex flex-col items-center gap-4 2xl:w-auto 2xl:py-0 2xl:bottom-auto 2xl:top-1/2 2xl:-translate-y-1/2 2xl:gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo complet.jpg" alt="Maître en Pause" className="h-20 2xl:h-32 w-auto object-contain rounded-xl shrink-0" />
              {/* Padding interne : evite que l'overflow coupe ombres, rotations et zoom au survol */}
              <div className="scroll-rail flex-1 min-h-0 w-full overflow-y-auto flex flex-col px-4 py-4 2xl:scroll-rail-none 2xl:flex-none 2xl:overflow-visible 2xl:p-0">
                <div className="my-auto">
                  <HeroCards counts={countsByCategory} total={offerCount} />
                </div>
              </div>
            </div>

            {/* Texte + CTA - decale a droite entre lg et 2xl pour laisser la place au rail (12rem = rail + respiration) */}
            <div className="max-w-5xl mx-auto px-6 md:px-8 lg:pl-[max(2rem,calc(12rem_-_(100vw_-_64rem)/2))] 2xl:pl-8 w-full">
              <div className="max-w-lg">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-navy-800 leading-[1.05] mb-8 md:mb-10">
                  Le Comité Professionnel des avocats
                </h1>
                <div className="flex items-center gap-6 md:gap-8">
                  <Link href="/login">
                    <Button size="lg" className="px-8 md:px-10 py-3 h-auto rounded-sm">
                      Se connecter
                    </Button>
                  </Link>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl md:text-4xl font-bold text-gold-500 leading-none">{offerCount}</span>
                    <span className="text-sm text-gray-400">offres</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-sm">
                  Dans les entreprises, les salariés accèdent à des offres negociées à tarifs
                  préférentiels. Les avocats libéraux, eux, n'y ont pas droit.
                  Maître en Pause change ça.
                </p>
                <p className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                  <CountUp target={81640} className="font-semibold text-gray-500" /> avocats en France.
                  <CountUp target={4132} className="font-semibold text-gray-500" /> élèves avocats.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Partenaires - dans le hero, visible sans scroll */}
        <div className="border-t border-[#e5e3de] bg-[#f7f6f3] py-5 shrink-0">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-navy-800">
              Partenaires
            </p>
            <div className="h-px w-8 bg-gold-400" />
          </div>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f7f6f3] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f7f6f3] to-transparent z-10 pointer-events-none" />
            <div className="animate-marquee">
              <div className="marquee-group">
                {groupItems.map((p, i) => (
                  <span key={`a-${i}`} className="inline-flex items-center mx-10 text-navy-800 font-medium text-sm opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
                    {p.logo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.logo} alt={p.name} className="h-7 w-auto object-contain" />
                      : p.name}
                  </span>
                ))}
              </div>
              <div className="marquee-group" aria-hidden="true">
                {groupItems.map((p, i) => (
                  <span key={`b-${i}`} className="inline-flex items-center mx-10 text-navy-800 font-medium text-sm opacity-60 whitespace-nowrap">
                    {p.logo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.logo} alt={p.name} className="h-7 w-auto object-contain" />
                      : p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nous rejoindre */}
      <section className="bg-white py-16 border-b border-[#e5e3de]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-navy-800 mb-12">Nous rejoindre</h2>

          {/* Etapes : recto = etape, verso = l'avocat dans l'emotion du moment (clic pour retourner) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {JOIN_STEPS.map((step) => (
              <FlipCard
                key={step.n}
                label={`Étape ${step.n} : ${step.title}`}
                className="h-64"
                frontClassName="rounded-sm bg-[#f7f6f3] border border-[#e5e3de] transition-colors hover:border-navy-200"
                backClassName="rounded-sm bg-navy-800 border border-navy-700"
                front={
                  <div className="h-full flex flex-col items-center justify-center gap-4 px-6">
                    <div className="w-14 h-14 rounded-sm bg-navy-800 flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-gold-400 tabular-nums tracking-tight">{step.n}</span>
                    </div>
                    <p className="text-sm font-semibold text-navy-800 leading-snug">{step.title}</p>
                    {/* Indice : la carte se retourne */}
                    <svg aria-hidden="true" className="absolute bottom-3 right-3 w-4 h-4 text-navy-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" /><path d="M3 21v-5h5" />
                    </svg>
                  </div>
                }
                back={
                  <div className="h-full flex flex-col items-center justify-center gap-2 px-4">
                    <Avocado emotion={step.emotion} className="w-24 h-[125px]" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">{step.mood}</p>
                    <p className="text-sm italic text-white/80 leading-snug">« {step.quote} »</p>
                  </div>
                }
              />
            ))}
          </div>

          <div className="mt-10">
            <Link href="/adhesion">
              <Button size="lg" className="px-10">Rejoindre le Comité</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Offres en vedette */}
      <section className="bg-[#f7f6f3] py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-navy-800">Dernieres offres</h2>
            <Link href="/offres" className="text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors shrink-0">
              Tout voir &rarr;
            </Link>
          </div>
          <OfferGrid offers={offers} emptyMessage="Aucune offre disponible pour le moment." />
          {offerCount > 4 && (
            <div className="mt-8 text-center">
              <Link href="/offres">
                <Button variant="outline">Voir toutes les offres</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Cercle vertueux */}
      <section className="bg-white py-16 border-t border-[#e5e3de]">
        <div className="max-w-5xl mx-auto px-6">

          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600 mb-3">Modele collectif</p>
            <h2 className="text-2xl font-bold text-navy-800">Plus on est nombreux, mieux c&apos;est pour tous</h2>
            <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
              Chaque adhesion renforce le pouvoir de negociation collectif et permet d&apos;obtenir de meilleures conditions pour tout le monde.
            </p>
          </div>

          {/* Le cycle */}
          <div className="flex items-center justify-center gap-0 mb-14">

            {/* Noeud 1 */}
            <div className="flex flex-col items-center text-center w-40">
              <div className="w-16 h-16 rounded-full bg-navy-800 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-gold-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-navy-800 leading-tight">Plus d&apos;adherents</p>
              <p className="text-xs text-gray-400 mt-1 leading-snug">La profession se reunit</p>
            </div>

            {/* Fleche droite */}
            <div className="flex flex-col items-center gap-1 w-16 shrink-0">
              <svg className="w-10 h-5 text-gold-400" viewBox="0 0 40 20" fill="none">
                <path d="M2 10h32M28 4l8 6-8 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Noeud 2 */}
            <div className="flex flex-col items-center text-center w-40">
              <div className="w-16 h-16 rounded-full bg-navy-800 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-gold-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-navy-800 leading-tight">Plus de budget</p>
              <p className="text-xs text-gray-400 mt-1 leading-snug">Pouvoir de negociation accru</p>
            </div>

            {/* Fleche droite */}
            <div className="flex flex-col items-center gap-1 w-16 shrink-0">
              <svg className="w-10 h-5 text-gold-400" viewBox="0 0 40 20" fill="none">
                <path d="M2 10h32M28 4l8 6-8 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Noeud 3 */}
            <div className="flex flex-col items-center text-center w-40">
              <div className="w-16 h-16 rounded-full bg-gold-500 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-navy-800 leading-tight">Plus d&apos;offres</p>
              <p className="text-xs text-gray-400 mt-1 leading-snug">Meilleurs tarifs negocies</p>
            </div>

          </div>

          {/* Retour : fleche qui boucle */}
          <div className="flex justify-center mb-14">
            <div className="flex items-center gap-3 bg-[#f7f6f3] border border-[#e5e3de] rounded-full px-5 py-2">
              <svg className="w-4 h-4 text-gold-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
              </svg>
              <span className="text-xs text-gray-500 font-medium">Ce qui attire de nouveaux adherents, qui renforcent le collectif</span>
            </div>
          </div>

          {/* CTA collectif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-[#e5e3de] rounded-lg p-7 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-sm bg-navy-800 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-navy-800 mb-1">Parlez-en autour de vous</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Chaque avocat que vous convainquez d&apos;adherer enrichit le catalogue pour tous.
                  Un mot suffit a faire la difference.
                </p>
              </div>
              <Link href="/adhesion" className="mt-auto inline-flex">
                <Button variant="outline" className="text-sm">Partager la page d&apos;adhesion</Button>
              </Link>
            </div>

            <div className="border border-navy-800 rounded-lg p-7 flex flex-col gap-4 bg-navy-800">
              <div className="w-10 h-10 rounded-sm bg-gold-500 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Offrez-le a vos collaborateurs</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Inscrivez votre cabinet en formule collective. Tarif degressif, facturation unique,
                  un avantage concret pour chaque membre de l&apos;equipe.
                </p>
              </div>
              <Link href="/adhesion" className="mt-auto inline-flex">
                <Button className="text-sm bg-gold-500 hover:bg-gold-400 border-0">Decouvrir le tarif cabinet</Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Actualites */}
      {posts.length > 0 && (
        <section className="bg-white py-14 border-t border-[#e5e3de]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-navy-800">Actualites</h2>
              <Link href="/actualites" className="text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors shrink-0">
                Tout voir &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/actualites/${post.slug}`}
                  className="group bg-white border border-[#e5e3de] rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {post.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.imageUrl} alt={post.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-[#f7f6f3] flex items-center justify-center">
                      <span className="text-3xl text-navy-200">◈</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    {post.publishedAt && (
                      <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-2">
                        {formatDate(post.publishedAt)}
                      </p>
                    )}
                    <h3 className="font-semibold text-navy-800 leading-snug mb-2 group-hover:text-gold-600 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="mt-4 text-sm font-medium text-gold-600 group-hover:text-gold-700 transition-colors">
                      Lire l'article &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
