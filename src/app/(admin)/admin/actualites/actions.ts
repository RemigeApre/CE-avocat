'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'

async function assertAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') throw new Error('Non autorise')
  return session
}

const postSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(220).regex(/^[a-z0-9-]+$/, 'Slug invalide (minuscules, chiffres, tirets)'),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
})

export async function createPost(formData: FormData) {
  const session = await assertAdmin()

  const data = postSchema.parse({
    title: formData.get('title'),
    slug: formData.get('slug') || slugify(String(formData.get('title'))),
    excerpt: formData.get('excerpt') || undefined,
    content: formData.get('content'),
    imageUrl: formData.get('imageUrl') || undefined,
    isPublished: formData.get('isPublished') === 'true',
  })

  const existing = await prisma.post.findUnique({ where: { slug: data.slug } })
  if (existing) throw new Error('Un article avec ce slug existe deja.')

  await prisma.post.create({
    data: {
      ...data,
      imageUrl: data.imageUrl || null,
      excerpt: data.excerpt || null,
      publishedAt: data.isPublished ? new Date() : null,
      authorId: session.user.id,
    },
  })

  revalidatePath('/admin/actualites')
  revalidatePath('/actualites')
  revalidatePath('/')
}

export async function updatePost(id: string, formData: FormData) {
  await assertAdmin()

  const data = postSchema.parse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt') || undefined,
    content: formData.get('content'),
    imageUrl: formData.get('imageUrl') || undefined,
    isPublished: formData.get('isPublished') === 'true',
  })

  const current = await prisma.post.findUnique({ where: { id } })
  if (!current) throw new Error('Article introuvable.')

  const slugConflict = await prisma.post.findFirst({
    where: { slug: data.slug, NOT: { id } },
  })
  if (slugConflict) throw new Error('Un autre article utilise ce slug.')

  await prisma.post.update({
    where: { id },
    data: {
      ...data,
      imageUrl: data.imageUrl || null,
      excerpt: data.excerpt || null,
      publishedAt:
        data.isPublished && !current.publishedAt ? new Date() : current.publishedAt,
    },
  })

  revalidatePath('/admin/actualites')
  revalidatePath(`/admin/actualites/${id}`)
  revalidatePath('/actualites')
  revalidatePath(`/actualites/${data.slug}`)
  revalidatePath('/')
}

export async function deletePost(id: string) {
  await assertAdmin()
  await prisma.post.delete({ where: { id } })
  revalidatePath('/admin/actualites')
  revalidatePath('/actualites')
  revalidatePath('/')
}
