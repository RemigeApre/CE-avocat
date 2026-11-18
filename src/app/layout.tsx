import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { auth } from '../../auth'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const SITE_URL = process.env.AUTH_URL ?? 'http://localhost:3000'
const DESCRIPTION = 'Le comité d’entreprise des avocats libéraux : des avantages négociés par et pour la profession, pour vous, votre cabinet et votre famille.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Maître en Pause — Le Comité Professionnel des avocats',
    template: '%s · Maître en Pause',
  },
  description: DESCRIPTION,
  applicationName: 'Maître en Pause',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Maître en Pause',
    title: 'Maître en Pause — Le Comité Professionnel des avocats',
    description: DESCRIPTION,
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
}

export const viewport: Viewport = {
  themeColor: '#1b2d5a',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="fr" className={inter.variable}>
      <body>
        {/* Lien d'evitement : visible uniquement au clavier */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy-900 focus:shadow-lg"
        >
          Aller au contenu
        </a>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
