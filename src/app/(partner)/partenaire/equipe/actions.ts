'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/db'

const MAX_PARTNER_USERS = 3

async function getAdminPartnerOrThrow() {
  const session = await auth()
  if (!session || session.user.role !== 'PARTNER_ADMIN' || !session.user.partnerId) {
    throw new Error('Non autorise')
  }
  return session.user.partnerId
}

const memberSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function createTeamMember(formData: FormData) {
  const partnerId = await getAdminPartnerOrThrow()

  const count = await prisma.user.count({
    where: { partnerId, role: 'PARTNER_USER' },
  })
  if (count >= MAX_PARTNER_USERS) {
    throw new Error(`Maximum ${MAX_PARTNER_USERS} comptes autorise.`)
  }

  const data = memberSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('Cet email est deja utilise.')

  const hashed = await bcrypt.hash(data.password, 12)

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: 'PARTNER_USER',
      partnerId,
    },
  })

  revalidatePath('/partenaire/equipe')
}

export async function deleteTeamMember(userId: string) {
  const partnerId = await getAdminPartnerOrThrow()

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.partnerId !== partnerId || user.role !== 'PARTNER_USER') {
    throw new Error('Non autorise')
  }

  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/partenaire/equipe')
}
