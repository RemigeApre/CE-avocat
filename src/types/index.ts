import type { Role, OrderStatus } from '@prisma/client'

export type { Role, OrderStatus }

// Augmentation de la session next-auth v5
declare module 'next-auth' {
  interface User {
    role: Role
    partnerId: string | null
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      partnerId: string | null
    }
  }
}

// En v5, le JWT est gere par @auth/core (dependance interne de next-auth)
declare module '@auth/core/jwt' {
  interface JWT {
    id?: string
    role?: Role
    partnerId?: string | null
  }
}

export type OfferWithRelations = {
  id: string
  title: string
  description: string
  originalPrice: number
  discountedPrice: number
  imageUrl: string | null
  conditions: string | null
  validUntil: Date | null
  isActive: boolean
  locationCity: string | null
  locationCountry: string | null
  addresses: string[]
  contactEmail: string | null
  partner: {
    id: string
    name: string
    slug: string
    logo: string | null
  }
  category: {
    id: string
    name: string
    slug: string
    icon: string | null
  }
}

export type OrderWithItems = {
  id: string
  status: OrderStatus
  totalAmount: number
  createdAt: Date
  items: {
    id: string
    quantity: number
    unitPrice: number
    offer: {
      title: string
      partner: { name: string }
    }
  }[]
}
