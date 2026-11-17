'use client'

import { useState, useTransition } from 'react'
import { Button, Card, Input, Modal } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { createTeamMember, deleteTeamMember } from './actions'

const MAX = 3

interface Member {
  id: string
  name: string
  email: string
  createdAt: Date
}

interface Props {
  members: Member[]
  isAdmin: boolean
}

export function TeamManager({ members, isAdmin }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createTeamMember(fd)
        setModalOpen(false)
        setForm({ name: '', email: '', password: '' })
      } catch (err: any) {
        setError(err.message ?? 'Une erreur est survenue.')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Supprimer ce membre ?')) return
    startTransition(() => deleteTeamMember(id))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Mon equipe</h1>
          <p className="text-sm text-gray-500 mt-1">
            {members.length}/{MAX} membre{members.length > 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && members.length < MAX && (
          <Button onClick={() => { setError(''); setModalOpen(true) }}>
            + Ajouter un membre
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-400 text-center py-10">
            Aucun membre dans l'equipe pour le moment.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <Card key={m.id} padding="sm" className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center font-semibold text-navy-800 text-sm shrink-0">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <p className="text-xs text-gray-400 hidden sm:block">
                  Depuis le {formatDate(m.createdAt)}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Retirer
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {isAdmin && members.length >= MAX && (
        <p className="text-sm text-gray-400 mt-4 text-center">
          Limite de {MAX} membres atteinte.
        </p>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un membre">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom complet"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Mot de passe provisoire"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            hint="8 caracteres minimum. Le membre pourra le modifier."
          />
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={isPending}>
              Creer le compte
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
