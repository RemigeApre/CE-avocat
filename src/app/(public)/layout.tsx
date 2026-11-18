import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/layout/CookieBanner'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main id="contenu" tabIndex={-1} className="outline-none flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  )
}
