'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/db'

const offerSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10),
  originalPrice: z.coerce.number().min(0),
  discountedPrice: z.coerce.number().min(0),
  categoryId: z.string().cuid(),
  conditions: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  validUntil: z.string().optional(),
  locationCity: z.string().max(100).optional(),
  locationCountry: z.string().max(100).optional(),
  addresses: z.string().optional(),   // lignes separees
  contactEmail: z.string().email().optional().or(z.literal('')),
})

async function getPartnerIdOrThrow() {
  const session = await auth()
  if (!session?.user.partnerId) throw new Error('Non autorise')
  if (session.user.role !== 'PARTNER_ADMIN' && session.user.role !== 'PARTNER_USER') {
    throw new Error('Non autorise')
  }
  return session.user.partnerId
}

function parseAddresses(raw: string | undefined): string[] {
  if (!raw) return []
  return raw.split('\n').map((l) => l.trim()).filter(Boolean)
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
    locationCity: formData.get('locationCity') || undefined,
    locationCountry: formData.get('locationCountry') || undefined,
    addresses: formData.get('addresses') || undefined,
    contactEmail: formData.get('contactEmail') || undefined,
  })

  if (data.originalPrice > 0 && data.discountedPrice >= data.originalPrice) {
    throw new Error('Le prix remise doit etre inferieur au prix original.')
  }

  await prisma.offer.create({
    data: {
      title: data.title,
      description: data.description,
      originalPrice: data.originalPrice,
      discountedPrice: data.discountedPrice,
      categoryId: data.categoryId,
      conditions: data.conditions || null,
      imageUrl: data.imageUrl || null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      locationCity: data.locationCity || null,
      locationCountry: data.locationCountry || null,
      addresses: parseAddresses(data.addresses),
      contactEmail: data.contactEmail || null,
      partnerId,
    },
  })

  revalidatePath('/partenaire/offres')
  revalidatePath('/offres')
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
    locationCity: formData.get('locationCity') || undefined,
    locationCountry: formData.get('locationCountry') || undefined,
    addresses: formData.get('addresses') || undefined,
    contactEmail: formData.get('contactEmail') || undefined,
  })

  if (data.originalPrice > 0 && data.discountedPrice >= data.originalPrice) {
    throw new Error('Le prix remise doit etre inferieur au prix original.')
  }

  await prisma.offer.update({
    where: { id: offerId },
    data: {
      title: data.title,
      description: data.description,
      originalPrice: data.originalPrice,
      discountedPrice: data.discountedPrice,
      categoryId: data.categoryId,
      conditions: data.conditions || null,
      imageUrl: data.imageUrl || null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      locationCity: data.locationCity || null,
      locationCountry: data.locationCountry || null,
      addresses: parseAddresses(data.addresses),
      contactEmail: data.contactEmail || null,
    },
  })

  revalidatePath('/partenaire/offres')
  revalidatePath('/offres')
  revalidatePath(`/offres/${offerId}`)
}

export async function deleteOffer(offerId: string) {
  const partnerId = await getPartnerIdOrThrow()
  const offer = await prisma.offer.findUnique({ where: { id: offerId } })
  if (!offer || offer.partnerId !== partnerId) throw new Error('Non autorise')
  await prisma.offer.delete({ where: { id: offerId } })
  revalidatePath('/partenaire/offres')
  revalidatePath('/offres')
}

export async function toggleOfferActive(offerId: string, isActive: boolean) {
  const partnerId = await getPartnerIdOrThrow()
  const offer = await prisma.offer.findUnique({ where: { id: offerId } })
  if (!offer || offer.partnerId !== partnerId) throw new Error('Non autorise')
  await prisma.offer.update({ where: { id: offerId }, data: { isActive } })
  revalidatePath('/partenaire/offres')
  revalidatePath('/offres')
}
