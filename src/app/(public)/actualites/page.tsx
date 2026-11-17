import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'

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
    <div className="max-w-7xl mx-auto px-6 py-14">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 mb-2">Blog</p>
        <h1 className="text-3xl font-bold text-navy-800">Actualites</h1>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-sm">Aucun article publie pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/actualites/${post.slug}`}
              className="group bg-white border border-[#e5e3de] rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {post.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 bg-[#f7f6f3] flex items-center justify-center">
                  <span className="text-3xl text-navy-200">◈</span>
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                {post.publishedAt && (
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-2">
                    {formatDate(post.publishedAt)}
                  </p>
                )}
                <h2 className="font-semibold text-navy-800 leading-snug mb-2 group-hover:text-gold-600 transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-4 text-sm font-medium text-gold-600 group-hover:text-gold-700 transition-colors">
                  Lire l'article &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
