import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Markdoc from '@markdoc/markdoc'
import React from 'react'
import { reader } from '@/lib/keystatic'
import { formatDate, estimateReadingTime, slugToTitle } from '@/lib/utils'
import { AuthorCard } from '@/components/AuthorCard'
import { ShareLinks } from '@/components/ShareLinks'
import { PostNavigation } from '@/components/PostNavigation'
import { SubscribeForm } from '@/components/SubscribeForm'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await reader.collections.posts.list()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await reader.collections.posts.read(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date ?? undefined,
      authors: ['Shahar Koifman'],
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await reader.collections.posts.read(slug)
  if (!post) notFound()

  const { node } = await post.body()
  const renderable = Markdoc.transform(node)
  const content = Markdoc.renderers.react(renderable, React)

  // Get raw text for reading time
  const textContent = Markdoc.renderers.html(renderable) ?? ''
  const plainText = textContent.replace(/<[^>]*>/g, '')
  const readingTime = estimateReadingTime(plainText)

  // Get all posts sorted by date for navigation
  const allPosts = await reader.collections.posts.all()
  const sorted = allPosts
    .filter((p) => p.entry.date)
    .sort((a, b) => new Date(b.entry.date!).getTime() - new Date(a.entry.date!).getTime())

  const currentIndex = sorted.findIndex((p) => p.slug === slug)
  const previous = currentIndex < sorted.length - 1
    ? { slug: sorted[currentIndex + 1].slug, title: sorted[currentIndex + 1].entry.title }
    : null
  const next = currentIndex > 0
    ? { slug: sorted[currentIndex - 1].slug, title: sorted[currentIndex - 1].entry.title }
    : null

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Shahar Koifman',
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Koifman Brief',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-sans font-medium uppercase tracking-wider text-tag">
              {slugToTitle(post.category)}
            </span>
            <span className="text-xs text-muted font-sans">
              {formatDate(post.date!)}
            </span>
            <span className="text-xs text-muted font-sans">
              {readingTime}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          {content}
        </div>

        <ShareLinks title={post.title} slug={slug} />
        <AuthorCard />
        <PostNavigation previous={previous} next={next} />
      </article>

      <SubscribeForm />
    </>
  )
}
