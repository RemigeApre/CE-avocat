export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* Colonne gauche -- image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-navy-900 flex-col overflow-hidden">
        {/* Image de fond */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Sans titre.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900/80 via-navy-800/60 to-navy-900/40" />

        {/* Contenu gauche */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 bg-white/10 border border-white/20 flex items-center justify-center rounded-[3px]">
              <span className="text-gold-400 font-bold text-sm tracking-tight">CE</span>
            </span>
            <span className="font-semibold text-white text-base">CE Avocats</span>
          </div>

          {/* Bas de colonne */}
          <div className="mt-auto">
            <p className="text-2xl font-bold text-white leading-snug mb-3">
              Profitez de chaque avantage
            </p>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Le comite d'entreprise de votre ecole d'avocats. Des avantages negocies, des partenaires selectionnes.
            </p>
          </div>
        </div>
      </div>

      {/* Colonne droite -- formulaire */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}
