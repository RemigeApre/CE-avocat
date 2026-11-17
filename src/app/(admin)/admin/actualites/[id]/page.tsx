import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PostForm } from '../PostForm'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) notFound()

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/actualites" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          &larr; Actualites
        </Link>
        <h1 className="text-2xl font-bold text-navy-800 mt-2">Modifier l'article</h1>
      </div>
      <PostForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          content: post.content,
          imageUrl: post.imageUrl ?? '',
          isPublished: post.isPublished,
        }}
      />
    </div>
  )
}
