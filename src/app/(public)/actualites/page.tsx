import { prisma } from '@/lib/db'
import { PostCard } from '@/components/posts/PostCard'

export const metadata = { title: 'Actualites - Maitre en Pause' }

export default async function ActualitesPage() {
  const posts = await prisma.post.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      imageUrl: true,
      publishedAt: true,
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
      <div className="mb-8 md:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 mb-2">Blog</p>
        <h1 className="text-3xl font-bold text-navy-800">Actualites</h1>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-sm">Aucun article publie pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => <PostCard key={post.id} post={post} headingLevel="h2" />)}
        </div>
      )}
    </div>
  )
}
