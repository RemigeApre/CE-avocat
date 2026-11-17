'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '../../../../auth'
import { prisma } from '@/lib/db'

async function getSession() {
  const session = await auth()
  if (!session) throw new Error('Non autorise')
  return session
}

export async function toggleSavedOffer(offerId: string) {
  const session = await getSession()
  const userId = session.user.id

  const existing = await prisma.savedOffer.findUnique({
    where: { userId_offerId: { userId, offerId } },
  })

  if (existing) {
    await prisma.savedOffer.delete({
      where: { userId_offerId: { userId, offerId } },
    })
  } else {
    await prisma.savedOffer.create({
      data: { userId, offerId },
    })
  }

  revalidatePath('/mes-favoris')
  revalidatePath(`/offres/${offerId}`)
}
