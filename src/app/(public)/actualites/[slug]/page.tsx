import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.post.findUnique({ where: { slug }, select: { title: true, excerpt: true } })
  if (!post) return {}
  return { title: `${post.title} - CE Avocats`, description: post.excerpt ?? undefined }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug, isPublished: true },
    include: { author: { select: { name: true } } },
  })
  if (!post) notFound()

  const paragraphs = post.content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)

  return (
    <article className="max-w-3xl mx-auto px-6 py-14">

      <div className="mb-3">
        <Link href="/actualites" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          &larr; Actualites
        </Link>
      </div>

      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
      )}

      <div className="mb-6">
        {post.publishedAt && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 mb-3">
            {formatDate(post.publishedAt)}
          </p>
        )}
        <h1 className="text-3xl font-bold text-navy-800 leading-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">{post.excerpt}</p>
        )}
      </div>

      <div className="border-t border-[#e5e3de] pt-8 space-y-5">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {p}
          </p>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-[#e5e3de]">
        <p className="text-xs text-gray-400">Par {post.author.name}</p>
      </div>

    </article>
  )
}
