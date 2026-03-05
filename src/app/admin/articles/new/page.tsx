'use client'

import { AdminGuard } from '@/components/AdminGuard'
import { ArticleEditor } from '@/components/ArticleEditor'

export default function NewArticlePage() {
  return (
    <AdminGuard>
      <ArticleEditor />
    </AdminGuard>
  )
}
