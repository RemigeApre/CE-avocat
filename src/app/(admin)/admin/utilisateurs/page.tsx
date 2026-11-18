import { prisma } from '@/lib/db'
import { Card, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { auth } from '../../../../../auth'
import { CreateUserButton } from './CreateUserButton'
import { RoleSelect } from './RoleSelect'

export default async function AdminUsersPage() {
  const [users, session] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, isDemo: true, createdAt: true,
        partner: { select: { name: true } },
      },
    }),
    auth(),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} compte{users.length > 1 ? 's' : ''}</p>
        </div>
        <CreateUserButton />
      </div>

      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e3de]">
              {['Nom', 'Email', 'Rôle', 'Partenaire', 'Inscription', ''].map((h) => (
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
                  <RoleSelect userId={u.id} currentRole={u.role} isSelf={session?.user.id === u.id} />
                </td>
                <td className="px-5 py-3 text-gray-500">{u.partner?.name ?? '-'}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-5 py-3">
                  {u.isDemo && <Badge variant="default">Demo</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
