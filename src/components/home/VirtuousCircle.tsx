import Link from 'next/link'
import { Building2, Euro, Gift, RefreshCw, Users, type LucideIcon } from 'lucide-react'
import { ShareButton } from './ShareButton'

// Les 3 etapes du cycle, dans l'ordre (la derniere reboucle sur la premiere)
const NODES: { title: string; sub: string; Icon: LucideIcon; accent?: boolean }[] = [
  { title: "Plus d'adhérents", sub: 'La profession se réunit', Icon: Users },
  { title: 'Plus de budget', sub: 'Un pouvoir de négociation accru', Icon: Euro },
  { title: "Plus d'offres", sub: 'De meilleurs tarifs négociés', Icon: Gift, accent: true },
]
// Ce qui fait passer d'une etape a la suivante : LINKS[i] relie NODES[i] -> NODES[i + 1]
const LINKS = ['cotisations', 'négociation', 'attractivité']

// --- Geometrie du schema circulaire (desktop), en px dans un cadre fixe ---
const W = 700 // tient dans le contenu en md (768 - 2 x 24 = 720)
const H = 430
const CX = W / 2
const CY = 245
const R = 150
const NODE_R = 36
const ANGLES = [-90, 30, 150] // haut, bas-droite, bas-gauche (sens horaire)
const GAP_DEG = 19 // espace entre la fleche et le noeud

const rad = (deg: number) => (deg * Math.PI) / 180
const pt = (deg: number) => ({ x: CX + R * Math.cos(rad(deg)), y: CY + R * Math.sin(rad(deg)) })

function arcPath(from: number, to: number) {
  const a = pt(from + GAP_DEG)
  const b = pt(to - GAP_DEG)
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${R} ${R} 0 0 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
}

function NodeBadge({ Icon, accent, size }: { Icon: LucideIcon; accent?: boolean; size: 'md' | 'lg' }) {
  return (
    <div
      className={[
        'rounded-full flex items-center justify-center shrink-0 ring-4 ring-white shadow-md',
        size === 'lg' ? 'w-[72px] h-[72px]' : 'w-14 h-14',
        accent ? 'bg-gold-500 text-white' : 'bg-navy-800 text-gold-400',
      ].join(' ')}
    >
      <Icon className={size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'} strokeWidth={1.6} aria-hidden="true" />
    </div>
  )
}

function LinkPill({ children }: { children: string }) {
  return (
    <span className="inline-block whitespace-nowrap rounded-full bg-white border border-gold-200 px-2.5 py-0.5 text-[11px] font-medium text-gold-700 shadow-sm">
      {children}
    </span>
  )
}

/** Schema circulaire anime (md+) */
function CircleDiagram() {
  return (
    <div className="relative hidden md:block mx-auto" style={{ width: W, height: H }} aria-hidden="true">
      <svg className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
        <defs>
          <marker id="vc-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#c9a84c" />
          </marker>
        </defs>
        {/* Bande de fond du cercle */}
        <circle cx={CX} cy={CY} r={R} stroke="#fdf8ec" strokeWidth="30" />
        {/* Fleches qui tournent dans le sens du cycle */}
        {ANGLES.map((a, i) => (
          <path
            key={a}
            d={arcPath(a, i === ANGLES.length - 1 ? ANGLES[0] + 360 : ANGLES[i + 1])}
            stroke="#c9a84c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 6"
            className="animate-dash-flow"
            markerEnd="url(#vc-arrow)"
          />
        ))}
      </svg>

      {/* Centre */}
      <div className="absolute flex flex-col items-center text-center" style={{ left: CX, top: CY, transform: 'translate(-50%, -50%)' }}>
        <RefreshCw className="w-5 h-5 text-gold-500 mb-2" strokeWidth={1.75} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-600">Le cercle</p>
        <p className="text-lg font-bold text-navy-800 leading-tight">vertueux</p>
      </div>

      {/* Noeuds + libelles (haut : au-dessus ; droite : a droite ; gauche : a gauche) */}
      {NODES.map(({ title, sub, Icon, accent }, i) => {
        const p = pt(ANGLES[i])
        const labelPos =
          i === 0
            ? { left: p.x, top: p.y - NODE_R - 12, transform: 'translate(-50%, -100%)', textAlign: 'center' as const }
            : i === 1
              ? { left: p.x + NODE_R + 16, top: p.y, transform: 'translate(0, -50%)', textAlign: 'left' as const }
              : { left: p.x - NODE_R - 16, top: p.y, transform: 'translate(-100%, -50%)', textAlign: 'right' as const }
        return (
          <div key={title}>
            <div className="absolute" style={{ left: p.x, top: p.y, transform: 'translate(-50%, -50%)' }}>
              <NodeBadge Icon={Icon} accent={accent} size="lg" />
            </div>
            <div className="absolute w-[150px]" style={labelPos}>
              <p className="text-sm font-bold text-navy-800 leading-tight">{title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">{sub}</p>
            </div>
          </div>
        )
      })}

      {/* Ce qui relie les etapes, au milieu de chaque arc */}
      {LINKS.map((label, i) => {
        const mid = pt(ANGLES[i] + 60)
        return (
          <div key={label} className="absolute" style={{ left: mid.x, top: mid.y, transform: 'translate(-50%, -50%)' }}>
            <LinkPill>{label}</LinkPill>
          </div>
        )
      })}
    </div>
  )
}

/** Version verticale (mobile) : etapes reliees, puis retour au debut */
function CycleList() {
  const Connector = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 h-12 ml-[27px]">
      <div className="h-full border-l-2 border-dashed border-gold-300" />
      <LinkPill>{label}</LinkPill>
    </div>
  )
  return (
    <div className="md:hidden mx-auto max-w-xs" aria-hidden="true">
      {NODES.map(({ title, sub, Icon, accent }, i) => (
        <div key={title}>
          {i > 0 && <Connector label={LINKS[i - 1]} />}
          <div className="flex items-center gap-4">
            <NodeBadge Icon={Icon} accent={accent} size="md" />
            <div>
              <p className="text-sm font-bold text-navy-800 leading-tight">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{sub}</p>
            </div>
          </div>
        </div>
      ))}
      <Connector label={LINKS[2]} />
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full border-2 border-dashed border-gold-400 flex items-center justify-center shrink-0">
          <RefreshCw className="w-5 h-5 text-gold-500" strokeWidth={1.75} />
        </div>
        <p className="text-sm font-semibold text-navy-800 leading-snug">… et le cycle recommence</p>
      </div>
    </div>
  )
}

export function VirtuousCircle() {
  return (
    <section className="bg-white py-12 md:py-20 border-t border-[#e5e3de]">
      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center mb-8 md:mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600 mb-3">Modèle collectif</p>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800">Plus on est nombreux, mieux c&apos;est pour tous</h2>
          <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
            Chaque adhésion renforce le pouvoir de négociation collectif et permet d&apos;obtenir de meilleures conditions pour tout le monde.
          </p>
        </div>

        {/* Description textuelle du cycle pour les lecteurs d'ecran (les schemas sont decoratifs) */}
        <p className="sr-only">
          Le cercle vertueux : plus d&apos;adhérents apportent plus de cotisations, donc plus de budget ;
          ce budget renforce la négociation et apporte plus d&apos;offres ; ces offres attirent de nouveaux adhérents,
          et le cycle recommence.
        </p>
        <CircleDiagram />
        <CycleList />

        {/* Comment y contribuer */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-[#e5e3de] rounded-lg p-6 md:p-7 flex flex-col gap-4 transition-shadow hover:shadow-md">
            <div className="w-10 h-10 rounded-sm bg-navy-800 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-gold-400" strokeWidth={1.6} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-navy-800 mb-1">Parlez-en autour de vous</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Chaque confrère qui adhère enrichit le catalogue pour tous. Un mot suffit à faire la différence.
              </p>
            </div>
            <ShareButton
              path="/adhesion"
              title="Maître en Pause"
              text="Le comité professionnel des avocats : des offres négociées pour les avocats libéraux."
              label="Partager la page d'adhésion"
              className="mt-auto w-full justify-center py-2.5 sm:w-auto sm:self-start sm:py-2 px-4 rounded-sm border border-navy-800 text-sm font-medium text-navy-800 hover:bg-navy-50 transition-colors"
            />
          </div>

          <div className="rounded-lg p-6 md:p-7 flex flex-col gap-4 bg-navy-800 transition-shadow hover:shadow-lg hover:shadow-navy-800/20">
            <div className="w-10 h-10 rounded-sm bg-gold-500 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white" strokeWidth={1.6} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Offrez-le à vos collaborateurs</p>
              <p className="text-sm text-white/70 leading-relaxed">
                Inscrivez votre cabinet en formule collective : tarif dégressif, facturation unique,
                un avantage concret pour chaque membre de l&apos;équipe.
              </p>
            </div>
            <Link
              href="/adhesion#cabinet"
              className="mt-auto w-full text-center py-2.5 sm:w-auto sm:self-start sm:py-2 px-4 rounded-sm bg-gold-500 hover:bg-gold-400 text-sm font-medium text-navy-900 transition-colors"
            >
              Découvrir le tarif cabinet
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
