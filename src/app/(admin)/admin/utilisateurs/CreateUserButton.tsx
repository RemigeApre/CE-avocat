'use client'

import { useState, useTransition } from 'react'
import { Button, Input, Modal } from '@/components/ui'
import { createUser } from './actions'

export function CreateUserButton() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', isDemo: false })
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleClose() {
    setOpen(false)
    setForm({ name: '', email: '', password: '', isDemo: false })
    setError('')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('email', form.email)
    fd.append('password', form.password)
    fd.append('isDemo', String(form.isDemo))
    startTransition(async () => {
      try {
        await createUser(fd)
        handleClose()
      } catch (err: any) {
        setError(err.message ?? 'Erreur.')
      }
    })
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Nouvel utilisateur</Button>

      <Modal open={open} onClose={handleClose} title="Creer un compte membre">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom complet"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Prenom Nom"
          />
          <Input
            label="Adresse email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="nom@avocat.fr"
          />
          <Input
            label="Mot de passe provisoire"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            hint="8 caracteres minimum"
          />

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isDemo"
              checked={form.isDemo}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-navy-800 accent-navy-800"
            />
            <span className="text-sm text-gray-700">
              Compte demo
              <span className="block text-xs text-gray-400 mt-0.5">
                Autorise n'importe quel domaine email (hors @avocat.fr / @avocat-conseil.fr)
              </span>
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose}>Annuler</Button>
            <Button type="submit" loading={isPending}>Creer</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
