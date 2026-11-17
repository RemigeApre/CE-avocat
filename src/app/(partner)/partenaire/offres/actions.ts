'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/db'

const offerSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10),
  originalPrice: z.coerce.number().positive(),
  discountedPrice: z.coerce.number().positive(),
  categoryId: z.string().cuid(),
  conditions: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  validUntil: z.string().optional(),
})

async function getPartnerIdOrThrow() {
  const session = await auth()
  if (!session?.user.partnerId) throw new Error('Non autorise')
  if (session.user.role !== 'PARTNER_ADMIN' && session.user.role !== 'PARTNER_USER') {
    throw new Error('Non autorise')
  }
  return session.user.partnerId
}

export async function createOffer(formData: FormData) {
  const partnerId = await getPartnerIdOrThrow()

  const data = offerSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    originalPrice: formData.get('originalPrice'),
    discountedPrice: formData.get('discountedPrice'),
    categoryId: formData.get('categoryId'),
    conditions: formData.get('conditions') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
    validUntil: formData.get('validUntil') || undefined,
  })

  if (data.discountedPrice >= data.originalPrice) {
    throw new Error('Le prix remise doit etre inferieur au prix original.')
  }

  await prisma.offer.create({
    data: {
      ...data,
      imageUrl: data.imageUrl || null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      conditions: data.conditions || null,
      partnerId,
    },
  })

  revalidatePath('/partenaire/offres')
}

export async function updateOffer(offerId: string, formData: FormData) {
  const partnerId = await getPartnerIdOrThrow()

  const offer = await prisma.offer.findUnique({ where: { id: offerId } })
  if (!offer || offer.partnerId !== partnerId) throw new Error('Non autorise')

  const data = offerSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    originalPrice: formData.get('originalPrice'),
    discountedPrice: formData.get('discountedPrice'),
    categoryId: formData.get('categoryId'),
    conditions: formData.get('conditions') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
    validUntil: formData.get('validUntil') || undefined,
  })

  if (data.discountedPrice >= data.originalPrice) {
    throw new Error('Le prix remise doit etre inferieur au prix original.')
  }

  await prisma.offer.update({
    where: { id: offerId },
    data: {
      ...data,
      imageUrl: data.imageUrl || null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      conditions: data.conditions || null,
    },
  })

  revalidatePath('/partenaire/offres')
}

export async function deleteOffer(offerId: string) {
  const partnerId = await getPartnerIdOrThrow()

  const offer = await prisma.offer.findUnique({ where: { id: offerId } })
  if (!offer || offer.partnerId !== partnerId) throw new Error('Non autorise')

  await prisma.offer.delete({ where: { id: offerId } })
  revalidatePath('/partenaire/offres')
}

export async function toggleOfferActive(offerId: string, isActive: boolean) {
  const partnerId = await getPartnerIdOrThrow()

  const offer = await prisma.offer.findUnique({ where: { id: offerId } })
  if (!offer || offer.partnerId !== partnerId) throw new Error('Non autorise')

  await prisma.offer.update({ where: { id: offerId }, data: { isActive } })
  revalidatePath('/partenaire/offres')
}
