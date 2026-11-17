import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="w-8 h-8 rounded bg-navy-800 flex items-center justify-center">
            <span className="text-gold-400 font-bold text-sm">CE</span>
          </span>
          <span className="font-semibold text-navy-800 text-sm">CE Avocats</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </div>
    </div>
  )
}
