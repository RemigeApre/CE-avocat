import { prisma } from '@/lib/db'
import { Card, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'

const roleLabel: Record<string, string> = {
  ADMIN: 'Admin',
  PARTNER_ADMIN: 'Partenaire admin',
  PARTNER_USER: 'Partenaire',
  MEMBER: 'Membre',
}
const roleVariant: Record<string, 'danger' | 'gold' | 'info' | 'default'> = {
  ADMIN: 'danger',
  PARTNER_ADMIN: 'gold',
  PARTNER_USER: 'info',
  MEMBER: 'default',
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { partner: { select: { name: true } } },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">Utilisateurs</h1>
        <p className="text-sm text-gray-500 mt-1">{users.length} compte{users.length > 1 ? 's' : ''}</p>
      </div>

      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e3de]">
              {['Nom', 'Email', 'Role', 'Partenaire', 'Inscription'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[#e5e3de] last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-navy-800">{u.name}</td>
                <td className="px-5 py-3 text-gray-500">{u.email}</td>
                <td className="px-5 py-3">
                  <Badge variant={roleVariant[u.role]}>{roleLabel[u.role]}</Badge>
                </td>
                <td className="px-5 py-3 text-gray-500">{u.partner?.name ?? '-'}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
