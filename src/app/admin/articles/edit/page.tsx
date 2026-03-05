'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminGuard } from '@/components/AdminGuard'
import { ArticleEditor } from '@/components/ArticleEditor'
import { getPost } from '@/lib/posts'
import type { Post } from '@/types/post'

function EditArticleContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    getPost(slug).then((data) => {
      setPost(data)
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return <div className="text-center text-muted font-sans py-12">Loading article...</div>
  }

  if (!post) {
    return <div className="text-center text-muted font-sans py-12">Article not found.</div>
  }

  return <ArticleEditor existingPost={post} />
}

export default function EditArticlePage() {
  return (
    <AdminGuard>
      <Suspense fallback={<div className="text-center text-muted font-sans py-12">Loading...</div>}>
        <EditArticleContent />
      </Suspense>
    </AdminGuard>
  )
}
