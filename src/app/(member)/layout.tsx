import { redirect } from 'next/navigation'
import { auth } from '../../../auth'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar role="member" />
        <main id="contenu" tabIndex={-1} className="outline-none flex-1 p-8 max-w-5xl">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
