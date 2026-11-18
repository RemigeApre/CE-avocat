import Link from 'next/link'
import { prisma } from '@/lib/db'
import { buttonClass, CountUp, FlipCard, Avocado, Carousel, type AvocadoEmotion } from '@/components/ui'
import { HeroCards } from '@/components/hero/HeroCards'
import { VirtuousCircle } from '@/components/home/VirtuousCircle'
import { OfferCard } from '@/components/offers/OfferCard'
import { PostCard } from '@/components/posts/PostCard'
import { cn } from '@/lib/utils'
import { CATEGORY_PUNS } from '@/lib/categoryPuns'
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
const JOIN_STEPS: { n: string; title: string; emotion: AvocadoEmotion }[] = [
  { n: '01', title: "S'inscrire gratuitement", emotion: 'curious' },
  { n: '02', title: 'Prouver son inscription au barreau', emotion: 'focused' },
  { n: '03', title: 'Choisir sa cotisation', emotion: 'hesitant' },
  { n: '04', title: 'Accès aux offres et avantages', emotion: 'delighted' },
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
      <section className="flex flex-col overflow-hidden bg-white h-[calc(100svh-72px)] md:h-[calc(100vh-72px)]">
        {/* Zone principale */}
        <div className="relative flex-1 overflow-hidden">

          {/* Image de couverture : plein cadre sur mobile, colonne droite (44%) sur desktop */}
          <div className="absolute inset-0 md:left-auto md:w-[44%] pointer-events-none select-none">
            {/* Desktop : fondu blanc a gauche, la statue est a droite, le fondu ne mange que le decor */}
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-24 lg:w-44 bg-gradient-to-r from-white via-white/60 to-transparent z-10" />
            {/* Mobile : voile bleu nuit depuis le bas, pour lire le texte en blanc ; la statue reste visible en haut */}
            <div className="md:hidden absolute inset-0 z-10 bg-[linear-gradient(to_top,rgba(14,26,63,0.97)_0%,rgba(14,26,63,0.88)_45%,rgba(14,26,63,0.35)_72%,rgba(14,26,63,0.05)_100%)]" />
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
          <div className="relative z-10 h-full flex items-end pb-10 md:items-center md:pb-0">

            {/* Logo + cartes collectibles - absolus a gauche, hors flux.
                lg -> 2xl : rail etroit pleine hauteur, cartes en 1 colonne defilante.
                2xl+      : bloc centre verticalement, cartes en 2 colonnes. */}
            <div className="absolute left-6 top-0 bottom-0 w-[140px] py-6 hidden lg:flex flex-col items-center gap-4 2xl:w-auto 2xl:py-0 2xl:bottom-auto 2xl:top-1/2 2xl:-translate-y-1/2 2xl:gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo complet.jpg" alt="Maître en Pause" className="h-20 2xl:h-32 w-auto object-contain rounded-xl shrink-0" />
              {/* Padding interne : evite que l'overflow coupe ombres, rotations et zoom au survol */}
              <div className="scroll-rail flex-1 min-h-0 w-full overflow-y-auto flex flex-col px-4 py-4 2xl:scroll-rail-none 2xl:flex-none 2xl:overflow-visible 2xl:p-0">
                <div className="my-auto">
                  <HeroCards counts={countsByCategory} />
                </div>
              </div>
            </div>

            {/* Texte + CTA - decale a droite entre lg et 2xl pour laisser la place au rail (12rem = rail + respiration) */}
            <div className="max-w-5xl mx-auto px-6 md:px-8 lg:pl-[max(2rem,calc(12rem_-_(100vw_-_64rem)/2))] 2xl:pl-8 w-full">
              {/* Mobile : texte centre ; desktop : aligne a gauche (inchange) */}
              <div className="max-w-lg mx-auto text-center md:mx-0 md:text-left">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white md:text-navy-800 leading-[1.05] tracking-tight md:tracking-normal mb-7 md:mb-10 [text-shadow:0_2px_16px_rgba(14,26,63,0.45)] md:[text-shadow:none]">
                  Le Comité Professionnel des avocats
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8">
                  <Link href="/login" className={buttonClass({ size: 'lg', className: 'px-8 md:px-10 py-3 h-auto rounded-sm bg-gold-500 text-navy-900 hover:bg-gold-400 md:bg-navy-800 md:text-white md:hover:bg-navy-700' })}>
                    Se connecter
                  </Link>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl md:text-4xl font-bold text-gold-400 md:text-gold-500 leading-none">{offerCount}</span>
                    <span className="text-sm text-white/70 md:text-gray-400">offres</span>
                  </div>
                </div>
                <p className="mt-5 md:mt-4 text-sm text-white/80 md:text-gray-500 leading-relaxed max-w-sm mx-auto md:mx-0">
                  Dans les entreprises, les salariés accèdent à des offres négociées à tarifs
                  préférentiels. Les avocats libéraux, eux, n'y ont pas droit.
                  Maître en Pause change ça.
                </p>
                <p className="mt-3 md:mt-2 text-xs text-white/60 md:text-gray-400 flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
                  <span className="inline-flex items-center gap-2"><CountUp target={81640} className="font-semibold text-white md:text-gray-500" /> avocats en France.</span>
                  <span className="inline-flex items-center gap-2"><CountUp target={4132} className="font-semibold text-white md:text-gray-500" /> élèves avocats.</span>
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

      {/* Mobile : les 6 cartes du hero en carrousel, sous la ligne partenaires (desktop : rail dans le hero) */}
      <section className="md:hidden bg-white pt-8 pb-7 border-b border-[#e5e3de]" aria-label="Nos catégories">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-gold-400" />
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-navy-800">Nos catégories</p>
          <div className="h-px w-8 bg-gold-400" />
        </div>
        <HeroCards counts={countsByCategory} variant="carousel" />
      </section>

      {/* Nous rejoindre */}
      <section className="bg-white py-16 border-b border-[#e5e3de]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-navy-800 mb-6 md:mb-12">Nous rejoindre</h2>

          {/* Etapes : recto = etape, verso = l'avocat dans l'emotion du moment (clic pour retourner) */}
          {/* Mobile : carrousel pleine largeur (bord a bord) ; md+ : grille 2 puis 4 colonnes, inchangee */}
          <div className="-mx-6 md:mx-0">
          <Carousel
            itemWidth="min(76vw, 320px)"
            label="Les étapes pour nous rejoindre"
            className="md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:px-0 md:py-0 md:[mask-image:none]"
            itemClassName="md:w-auto"
            dotsClassName="md:hidden"
          >
            {JOIN_STEPS.map((step) => (
              <FlipCard
                key={step.n}
                label={`Étape ${step.n} : ${step.title}`}
                className="h-64 perspective-1600 md:perspective-800"
                frontClassName="rounded-sm bg-[#f7f6f3] border border-[#e5e3de] transition-colors hover:border-navy-200"
                backClassName="rounded-sm bg-navy-800 border border-navy-700"
                front={
                  <div className="h-full flex flex-col items-center justify-center gap-4 px-6">
                    <div className="w-14 h-14 rounded-sm bg-navy-800 flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-gold-400 tabular-nums tracking-tight">{step.n}</span>
                    </div>
                    <p className="text-sm font-semibold text-navy-800 leading-snug">{step.title}</p>
                  </div>
                }
                back={
                  <div className="h-full flex items-center justify-center">
                    <Avocado emotion={step.emotion} className="w-32 h-[166px]" />
                  </div>
                }
              />
            ))}
          </Carousel>
          </div>

          <div className="mt-8 md:mt-10">
            <Link href="/adhesion" className={buttonClass({ size: 'lg', className: 'px-10' })}>Rejoindre le Comité</Link>
          </div>
        </div>
      </section>

      {/* Offres en vedette - mobile : carrousel ; md+ : grille identique a OfferGrid */}
      <section className="bg-[#f7f6f3] py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-navy-800 text-center mb-4 md:mb-8">Dernières offres</h2>
          {offers.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">Aucune offre disponible pour le moment.</div>
          ) : (
            <div className="-mx-6 md:mx-0">
              <Carousel
                itemWidth="min(80vw, 320px)"
                label="Dernières offres"
                className="md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 md:py-0 md:[mask-image:none]"
                itemClassName="md:w-auto"
                dotsClassName="md:hidden"
              >
                {offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
              </Carousel>
            </div>
          )}
          {offerCount > 4 && (
            <div className="mt-7 md:mt-8 text-center">
              <Link href="/offres" className={buttonClass({ variant: 'outline', className: 'w-full sm:w-auto' })}>Voir toutes les offres</Link>
            </div>
          )}
        </div>
      </section>

      {/* Cercle vertueux */}
      <VirtuousCircle />

      {/* Actualites - mobile : titre centre, carrousel, bouton en bas ; md+ : inchange */}
      {posts.length > 0 && (
        <section className="bg-white py-10 md:py-14 border-t border-[#e5e3de]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-center md:justify-between mb-4 md:mb-8">
              <h2 className="text-2xl font-bold text-navy-800">Actualités</h2>
              <Link href="/actualites" className="hidden md:inline text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors shrink-0">
                Tout voir &rarr;
              </Link>
            </div>

            <div className="-mx-6 md:mx-0">
              <Carousel
                itemWidth="min(82vw, 340px)"
                label="Actualités"
                className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:py-0 md:[mask-image:none]"
                itemClassName="md:w-auto"
                dotsClassName="md:hidden"
              >
                {posts.map((post) => <PostCard key={post.id} post={post} />)}
              </Carousel>
            </div>

            <div className="mt-7 md:hidden">
              <Link href="/actualites" className={buttonClass({ variant: 'outline', className: 'w-full' })}>Toutes les actualités</Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
