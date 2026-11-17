'use client'

import { useState, useTransition } from 'react'
import { Button, Badge, Card, Input, Modal } from '@/components/ui'
import { formatPrice, formatDate } from '@/lib/utils'
import { createOffer, updateOffer, deleteOffer, toggleOfferActive } from './actions'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface Offer {
  id: string
  title: string
  description: string
  originalPrice: number
  discountedPrice: number
  imageUrl: string | null
  conditions: string | null
  validUntil: Date | null
  isActive: boolean
  categoryId: string
  category: { name: string; icon: string | null }
  locationCity: string | null
  locationCountry: string | null
  addresses: string[]
  contactEmail: string | null
}

interface Props {
  offers: Offer[]
  categories: Category[]
}

const emptyForm = {
  title: '',
  description: '',
  originalPrice: '',
  discountedPrice: '',
  categoryId: '',
  conditions: '',
  imageUrl: '',
  validUntil: '',
  locationCity: '',
  locationCountry: '',
  addresses: '',   // une adresse par ligne
  contactEmail: '',
}

export function OffersManager({ offers, categories }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Offer | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const selectedCatSlug = categories.find((c) => c.id === form.categoryId)?.slug ?? ''

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(offer: Offer) {
    setEditing(offer)
    setForm({
      title: offer.title,
      description: offer.description,
      originalPrice: String(offer.originalPrice),
      discountedPrice: String(offer.discountedPrice),
      categoryId: offer.categoryId,
      conditions: offer.conditions ?? '',
      imageUrl: offer.imageUrl ?? '',
      validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '',
      locationCity: offer.locationCity ?? '',
      locationCountry: offer.locationCountry ?? '',
      addresses: offer.addresses.join('\n'),
      contactEmail: offer.contactEmail ?? '',
    })
    setError('')
    setModalOpen(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        if (editing) {
          await updateOffer(editing.id, fd)
        } else {
          await createOffer(fd)
        }
        setModalOpen(false)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Supprimer cette offre ?')) return
    startTransition(() => deleteOffer(id))
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(() => toggleOfferActive(id, !current))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Mes offres</h1>
          <p className="text-sm text-gray-500 mt-1">{offers.length} offre{offers.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate}>+ Nouvelle offre</Button>
      </div>

      {offers.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-400 text-center py-10">Aucune offre. Creez la premiere !</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Card key={offer.id} padding="sm" className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-navy-800 truncate">{offer.title}</p>
                  <Badge variant={offer.isActive ? 'success' : 'default'}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400">
                  {offer.category.name}
                  {offer.validUntil && ` - jusqu'au ${formatDate(offer.validUntil)}`}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-navy-800">{formatPrice(Number(offer.discountedPrice))}</p>
                <p className="text-xs text-gray-400 line-through">{formatPrice(Number(offer.originalPrice))}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleToggle(offer.id, offer.isActive)} className="text-xs text-gray-500 hover:text-navy-800 transition-colors">
                  {offer.isActive ? 'Desactiver' : 'Activer'}
                </button>
                <button onClick={() => openEdit(offer)} className="text-xs text-gold-600 hover:text-gold-700 transition-colors">
                  Modifier
                </button>
                <button onClick={() => handleDelete(offer.id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                  Supprimer
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'offre" : 'Nouvelle offre'} className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Titre" name="title" value={form.title} onChange={handleChange} required />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy-800">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-navy-800 resize-none" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy-800">Categorie</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-navy-800">
              <option value="">Choisir une categorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Prix original (EUR)" name="originalPrice" type="number" min="0" step="0.01" value={form.originalPrice} onChange={handleChange} required />
            <Input label="Prix remise (EUR)" name="discountedPrice" type="number" min="0" step="0.01" value={form.discountedPrice} onChange={handleChange} required />
          </div>

          {/* Champs contextuels par categorie */}
          {selectedCatSlug === 'restauration' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-navy-800">
                Adresses <span className="text-gray-400 font-normal">(une par ligne)</span>
              </label>
              <textarea name="addresses" value={form.addresses} onChange={handleChange} rows={3} placeholder={"12 rue du Palais, Paris 1er\n45 avenue Montaigne, Paris 8e"}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-navy-800 resize-none" />
            </div>
          )}

          {(selectedCatSlug === 'voyages' || selectedCatSlug === 'culture') && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ville" name="locationCity" value={form.locationCity} onChange={handleChange} placeholder="Paris" />
              {selectedCatSlug === 'voyages' && (
                <Input label="Pays" name="locationCountry" value={form.locationCountry} onChange={handleChange} placeholder="France" />
              )}
            </div>
          )}

          {selectedCatSlug === 'shopping' && (
            <Input label="Email de commande" name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="commandes@boutique.fr" />
          )}

          <Input label="URL image (optionnel)" name="imageUrl" type="url" placeholder="https://..." value={form.imageUrl} onChange={handleChange} />
          <Input label="Valable jusqu'au (optionnel)" name="validUntil" type="date" value={form.validUntil} onChange={handleChange} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-navy-800">Conditions (optionnel)</label>
            <textarea name="conditions" value={form.conditions} onChange={handleChange} rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-navy-800 resize-none" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" loading={isPending}>{editing ? 'Enregistrer' : 'Creer'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
