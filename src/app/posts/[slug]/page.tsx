import type { Metadata } from 'next'
import { getPublishedPostsServer } from '@/lib/posts-server'
import { PostContent } from '@/components/PostContent'

export async function generateStaticParams() {
  const posts = await getPublishedPostsServer()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const posts = await getPublishedPostsServer()
  const post = posts.find((p) => p.slug === slug)

  if (!post) return {}

  const ogImage = post.coverImageUrl || '/og-image.png'

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  }
}

export default function PostPage() {
  return <PostContent />
}
