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

  // Use same-domain OG images (downloaded at build time) so social crawlers
  // can reliably fetch them — Firebase Storage URLs cause issues with X/Twitter
  const ext = post.coverImageUrl?.match(/\.(png|webp)/i)?.[0] ?? '.jpg'
  const ogImage = post.coverImageUrl
    ? `/og/posts/${slug}${ext}`
    : '/og-image.png'

  const title = post.title
  const description = post.excerpt

  return {
    metadataBase: new URL('https://thekoifmanbrief.com'),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://thekoifmanbrief.com/posts/${slug}`,
      siteName: 'The Koifman Brief',
      locale: 'en_US',
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
