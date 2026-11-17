'use client'

import { useState, useTransition } from 'react'
import { toggleSavedOffer } from '@/app/(member)/mes-favoris/actions'

interface SaveButtonProps {
  offerId: string
  initialSaved: boolean
}

export function SaveButton({ offerId, initialSaved }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    setSaved((prev) => !prev)
    startTransition(async () => {
      await toggleSavedOffer(offerId)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={[
        'flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md border text-sm font-medium transition-colors',
        saved
          ? 'bg-navy-50 border-navy-300 text-navy-800'
          : 'border-[#e5e3de] text-gray-500 hover:border-navy-300 hover:text-navy-800',
        isPending ? 'opacity-60 cursor-wait' : '',
      ].join(' ')}
    >
      <svg
        className="w-4 h-4 shrink-0"
        viewBox="0 0 20 20"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 3h10a1 1 0 011 1v13.382a.5.5 0 01-.776.416L10 15.118l-5.224 2.68A.5.5 0 014 17.382V4a1 1 0 011-1z"
        />
      </svg>
      {saved ? 'Enregistre' : 'Enregistrer'}
    </button>
  )
}
