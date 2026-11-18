import { redirect } from 'next/navigation'
import { auth } from '../../../auth'
import { prisma } from '@/lib/db'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session || (session.user.role !== 'PARTNER_ADMIN' && session.user.role !== 'PARTNER_USER')) {
    redirect('/login')
  }

  const partner = session.user.partnerId
    ? await prisma.partner.findUnique({
        where: { id: session.user.partnerId },
        select: { name: true },
      })
    : null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar role="partner" partnerName={partner?.name} />
        <main id="contenu" tabIndex={-1} className="outline-none flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
