'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import { createPost, updatePost } from './actions'

interface PostData {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  imageUrl: string
  isPublished: boolean
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function PostForm({ initial }: { initial?: PostData }) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [form, setForm] = useState<PostData>(
    initial ?? { title: '', slug: '', excerpt: '', content: '', imageUrl: '', isPublished: false }
  )
  const [autoSlug, setAutoSlug] = useState(!isEdit)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (autoSlug) setForm((f) => ({ ...f, slug: slugify(f.title) }))
  }, [form.title, autoSlug])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    if (name === 'slug') setAutoSlug(false)
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
    startTransition(async () => {
      try {
        if (isEdit) {
          await updatePost(initial!.id!, fd)
        } else {
          await createPost(fd)
        }
        router.push('/admin/actualites')
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Erreur.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">

      <Input
        label="Titre"
        name="title"
        value={form.title}
        onChange={handleChange}
        required
        placeholder="Titre de l'article"
      />

      <div>
        <Input
          label="Slug (URL)"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          required
          placeholder="titre-de-l-article"
          hint="Généré automatiquement depuis le titre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Extrait</label>
        <textarea
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          rows={2}
          placeholder="Résumé court de l'article (optionnel)"
          className="w-full border border-[#e5e3de] rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">400 caractères max. Affiché dans les listings.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contenu <span className="text-red-500">*</span>
        </label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={16}
          required
          placeholder="Contenu de l'article. Separez les paragraphes par une ligne vide."
          className="w-full border border-[#e5e3de] rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-transparent resize-y font-mono"
        />
        <p className="text-xs text-gray-400 mt-1">Une ligne vide = nouveau paragraphe.</p>
      </div>

      <Input
        label="Image (URL, optionnel)"
        name="imageUrl"
        type="url"
        value={form.imageUrl}
        onChange={handleChange}
        placeholder="https://..."
      />

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          name="isPublished"
          checked={form.isPublished}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 accent-navy-800"
        />
        <span className="text-sm font-medium text-gray-700">
          Publier cet article
          <span className="block text-xs text-gray-400 font-normal mt-0.5">
            {isEdit && initial?.isPublished
              ? 'Déjà publié. Décocher mettra en brouillon.'
              : 'La date de publication sera fixée à la première publication.'}
          </span>
        </span>
      </label>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}

      <div className="flex items-center gap-3 pt-2 border-t border-[#e5e3de]">
        <Button type="submit" loading={isPending}>
          {isEdit ? 'Enregistrer' : 'Créer l\'article'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/actualites')}
        >
          Annuler
        </Button>
      </div>

    </form>
  )
}
