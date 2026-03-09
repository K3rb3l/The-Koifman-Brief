import type { Metadata } from 'next'
import { getPublishedPostsServer } from '@/lib/posts-server'
import { postTitle, postExcerpt, siteUrl } from '@/lib/i18n'
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

  const title = postTitle(post)
  const description = postExcerpt(post)

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      authors: ['Shahar Koifman'],
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default function PostPage() {
  return <PostContent />
}
