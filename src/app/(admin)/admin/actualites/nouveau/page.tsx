import Link from 'next/link'
import { PostForm } from '../PostForm'

export default function NouvelArticlePage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/actualites" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          &larr; Actualites
        </Link>
        <h1 className="text-2xl font-bold text-navy-800 mt-2">Nouvel article</h1>
      </div>
      <PostForm />
    </div>
  )
}
