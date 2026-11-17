'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

interface OrderButtonProps {
  offerId: string
  price: number
}

export function OrderButton({ offerId, price }: OrderButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!session) {
    return (
      <Button
        className="w-full"
        onClick={() => router.push(`/login?redirect=/offres/${offerId}`)}
      >
        Se connecter pour profiter
      </Button>
    )
  }

  async function handleOrder() {
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, quantity: 1 }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/mes-commandes/${data.orderId}?confirmation=1`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className="w-full" loading={loading} onClick={handleOrder}>
      Commander cette offre
    </Button>
  )
}
