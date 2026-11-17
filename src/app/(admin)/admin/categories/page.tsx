import { prisma } from '@/lib/db'
import { CategoriesManager } from './CategoriesManager'

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { offers: true } } },
  })

  return <CategoriesManager categories={categories} />
}
