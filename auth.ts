import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { clientIp, rateLimit } from '@/lib/antibot'
import type { Role } from '@prisma/client'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, request) {
        // Anti force brute : 10 essais / 15 min par IP, 5 / 15 min par adresse e-mail
        const ip = request instanceof Request ? clientIp(request) : 'inconnue'
        const email = typeof credentials?.email === 'string' ? credentials.email.toLowerCase() : ''
        if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000) || (email && !rateLimit(`login-mail:${email}`, 5, 15 * 60 * 1000))) {
          return null
        }
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          partnerId: user.partnerId,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? undefined
        token.role = (user as { role?: Role }).role
        token.partnerId = (user as { partnerId?: string | null }).partnerId ?? null
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id ?? token.sub ?? ''
      session.user.role = (token.role ?? 'MEMBER') as Role
      session.user.partnerId = token.partnerId ?? null
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
})
