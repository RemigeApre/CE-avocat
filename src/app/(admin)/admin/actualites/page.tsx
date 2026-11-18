import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Card, Badge, buttonClass } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { deletePost } from './actions'

export default async function AdminActualitesPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
      publishedAt: true,
      createdAt: true,
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Actualités</h1>
          <p className="text-sm text-gray-500 mt-1">{posts.length} article{posts.length > 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/actualites/nouveau" className={buttonClass()}>+ Nouvel article</Link>
      </div>

      {posts.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-400 text-center py-8">Aucun article. Creez le premier.</p>
        </Card>
      ) : (
        <Card padding="none">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e3de]">
                {['Titre', 'Statut', 'Publié le', 'Créé le', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-[#e5e3de] last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-navy-800">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">/actualites/{p.slug}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={p.isPublished ? 'success' : 'default'}>
                      {p.isPublished ? 'Publié' : 'Brouillon'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {p.publishedAt ? formatDate(p.publishedAt) : '-'}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-4 justify-end">
                      <Link
                        href={`/admin/actualites/${p.id}`}
                        className="text-sm text-navy-600 hover:text-navy-800 font-medium transition-colors"
                      >
                        Modifier
                      </Link>
                      <form action={deletePost.bind(null, p.id)}>
                        <button
                          type="submit"
                          className="text-sm text-red-400 hover:text-red-600 transition-colors"
                          onClick={(e) => { if (!confirm('Supprimer cet article ?')) e.preventDefault() }}
                        >
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
