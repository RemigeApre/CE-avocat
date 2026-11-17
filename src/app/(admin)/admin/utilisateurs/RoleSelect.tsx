'use client'

import { useTransition, useState } from 'react'
import { updateUserRole } from './actions'

const ROLES = [
  { value: 'MEMBER',       label: 'Membre' },
  { value: 'PARTNER_USER', label: 'Partenaire' },
  { value: 'PARTNER_ADMIN', label: 'Partenaire admin' },
  { value: 'ADMIN',        label: 'Admin' },
]

interface Props {
  userId: string
  currentRole: string
  isSelf: boolean
}

export function RoleSelect({ userId, currentRole, isSelf }: Props) {
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState(currentRole)

  if (isSelf) {
    return (
      <span className="text-xs text-gray-400 italic">vous</span>
    )
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value
        setValue(next)
        startTransition(() => { updateUserRole(userId, next) })
      }}
      className="text-xs border border-[#e5e3de] rounded px-2 py-1.5 bg-white text-navy-800 focus:outline-none focus:border-navy-400 disabled:opacity-40 cursor-pointer"
    >
      {ROLES.map((r) => (
        <option key={r.value} value={r.value}>{r.label}</option>
      ))}
    </select>
  )
}
