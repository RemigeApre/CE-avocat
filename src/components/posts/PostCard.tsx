import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export interface PostCardData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  imageUrl: string | null
  publishedAt: Date | null
}

/** Carte d'article (accueil + page Actualites) */
export function PostCard({ post, headingLevel = 'h3' }: { post: PostCardData; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  return (
    <Link
      href={`/actualites/${post.slug}`}
      className="group h-full bg-white border border-[#e5e3de] rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" loading="lazy" className="w-full h-44 object-cover" />
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
        <Heading className="font-semibold text-navy-800 leading-snug mb-2 group-hover:text-gold-600 transition-colors">
          {post.title}
        </Heading>
        {post.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>
        )}
        <span className="mt-4 text-sm font-medium text-gold-600 group-hover:text-gold-700 transition-colors">
          Lire l&apos;article &rarr;
        </span>
      </div>
    </Link>
  )
}
