'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'

async function assertAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') throw new Error('Non autorise')
}

const categorySchema = z.object({
  name: z.string().min(2).max(60),
  icon: z.string().max(10).optional(),
  description: z.string().max(200).optional(),
})

export async function createCategory(formData: FormData) {
  await assertAdmin()
  const data = categorySchema.parse({
    name: formData.get('name'),
    icon: formData.get('icon') || undefined,
    description: formData.get('description') || undefined,
  })
  const slug = slugify(data.name)
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) throw new Error('Une catégorie avec ce nom existe déjà.')
  await prisma.category.create({ data: { ...data, slug, icon: data.icon ?? null, description: data.description ?? null } })
  revalidatePath('/admin/categories')
}

export async function deleteCategory(id: string) {
  await assertAdmin()
  const count = await prisma.offer.count({ where: { categoryId: id } })
  if (count > 0) throw new Error(`Impossible : ${count} offre(s) utilisent cette catégorie.`)
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
}
