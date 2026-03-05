import type { Metadata } from 'next'
import { ArticlesContent } from '@/components/ArticlesContent'

export const metadata: Metadata = {
  title: 'All Articles',
  description: 'All articles from The Koifman Brief.',
}

export default function ArticlesPage() {
  return <ArticlesContent />
}
