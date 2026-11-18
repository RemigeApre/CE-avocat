import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Sonde de sante (Docker, supervision) : 200 si l'application et la base repondent, 503 sinon
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ status: 'erreur', db: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
