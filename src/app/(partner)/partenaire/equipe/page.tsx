import { redirect } from 'next/navigation'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/db'
import { TeamManager } from './TeamManager'

export default async function EquipePage() {
  const session = await auth()
  if (!session?.user.partnerId) redirect('/login')

  const members = await prisma.user.findMany({
    where: {
      partnerId: session.user.partnerId,
      role: 'PARTNER_USER',
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  return (
    <TeamManager
      members={members}
      isAdmin={session.user.role === 'PARTNER_ADMIN'}
    />
  )
}
