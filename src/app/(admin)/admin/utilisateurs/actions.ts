'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/db'
import type { Role } from '@prisma/client'

const VALID_ROLES: Role[] = ['ADMIN', 'PARTNER_ADMIN', 'PARTNER_USER', 'MEMBER']

export async function updateUserRole(userId: string, role: string) {
  await assertAdmin()
  if (!VALID_ROLES.includes(role as Role)) throw new Error('Rôle invalide')
  const session = await auth()
  if (session?.user.id === userId) throw new Error('Impossible de modifier son propre rôle')
  await prisma.user.update({ where: { id: userId }, data: { role: role as Role } })
  revalidatePath('/admin/utilisateurs')
}

const ALLOWED_DOMAINS = ['avocat.fr', 'avocat-conseil.fr']

async function assertAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') throw new Error('Non autorise')
}

const createUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  isDemo: z.boolean().optional().default(false),
})

export async function createUser(formData: FormData) {
  await assertAdmin()

  const data = createUserSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    isDemo: formData.get('isDemo') === 'true',
  })

  if (!data.isDemo) {
    const domain = data.email.split('@')[1]
    if (!ALLOWED_DOMAINS.includes(domain)) {
      throw new Error('Seules les adresses @avocat.fr et @avocat-conseil.fr sont acceptees (ou cochez "Compte demo").')
    }
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('Cet email est déjà utilisé.')

  const hashed = await bcrypt.hash(data.password, 12)

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: 'MEMBER',
      isDemo: data.isDemo,
    },
  })

  revalidatePath('/admin/utilisateurs')
}
