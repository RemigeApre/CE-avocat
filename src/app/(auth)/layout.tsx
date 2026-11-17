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

        {/* Bouton retour */}
        <div className="relative z-10 p-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
            Retour
          </a>
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
