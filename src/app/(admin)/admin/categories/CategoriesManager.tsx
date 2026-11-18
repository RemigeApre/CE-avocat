'use client'

import { useState, useTransition } from 'react'
import { Button, Card, Input, Modal } from '@/components/ui'
import { createCategory, deleteCategory } from './actions'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  _count: { offers: number }
}

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', icon: '', description: '' })
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
        await createCategory(fd)
        setModalOpen(false)
        setForm({ name: '', icon: '', description: '' })
      } catch (err: any) {
        setError(err.message ?? 'Erreur.')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Supprimer cette catégorie ?')) return
    startTransition(async () => {
      try {
        await deleteCategory(id)
      } catch (err: any) {
        alert(err.message)
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Catégories</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categorie{categories.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => { setError(''); setModalOpen(true) }}>+ Nouvelle catégorie</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card key={c.id} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{c.icon ?? '📁'}</span>
              <div>
                <p className="font-medium text-navy-800">{c.name}</p>
                {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                <p className="text-xs text-gray-400 mt-1">{c._count.offers} offre{c._count.offers > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors shrink-0"
            >
              Supprimer
            </button>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle catégorie">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nom" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Emoji / Icône" name="icon" value={form.icon} onChange={handleChange} placeholder="ex: 🍽️" hint="Un emoji pour identifier la catégorie" />
          <Input label="Description (optionnel)" name="description" value={form.description} onChange={handleChange} />
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" loading={isPending}>Créer</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
