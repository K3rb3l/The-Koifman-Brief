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
import { ScrollReveal } from '@/components/ScrollReveal'
import { ReadingProgress } from '@/components/ReadingProgress'
import { CountUp } from '@/components/CountUp'

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

  const textContent = Markdoc.renderers.html(renderable) ?? ''
  const plainText = textContent.replace(/<[^>]*>/g, '')
  const readingTime = estimateReadingTime(plainText)

  const allPosts = await reader.collections.posts.all()
  const sorted = allPosts
    .filter((p) => p.entry.date)
    .sort((a, b) => new Date(b.entry.date!).getTime() - new Date(a.entry.date!).getTime())

  const currentIndex = sorted.findIndex((p) => p.slug === slug)
  const briefNumber = sorted.length - currentIndex

  const previous = currentIndex < sorted.length - 1
    ? { slug: sorted[currentIndex + 1].slug, title: sorted[currentIndex + 1].entry.title }
    : null
  const next = currentIndex > 0
    ? { slug: sorted[currentIndex - 1].slug, title: sorted[currentIndex - 1].entry.title }
    : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Person', name: 'Shahar Koifman' },
    publisher: { '@type': 'Organization', name: 'The Koifman Brief' },
  }

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <header className="mb-10 text-center">
          <div className="animate-fade-in-up flex items-center justify-center gap-3 mb-5">
            <span className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-muted">
              No. <CountUp target={briefNumber} />
            </span>
            <span className="w-[3px] h-[3px] bg-border rounded-full" />
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-accent">
              {slugToTitle(post.category)}
            </span>
          </div>
          <h1 className="animate-fade-in-up-delay-1 font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight max-w-2xl mx-auto">
            {post.title}
          </h1>
          <div className="animate-fade-in-up-delay-2 flex items-center justify-center gap-3 mt-5 text-[13px] text-muted font-sans">
            <span>By Shahar Koifman</span>
            <span>-</span>
            <time>{formatDate(post.date!)}</time>
            <span>-</span>
            <span>{readingTime}</span>
          </div>
        </header>

        <div className="decorative-rule"><span className="diamond" /></div>

        <ScrollReveal>
          <div className="prose prose-lg max-w-none dark:prose-invert drop-cap">
            {content}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <ShareLinks title={post.title} slug={slug} />
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <AuthorCard />
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <PostNavigation previous={previous} next={next} />
        </ScrollReveal>
      </article>

      <ScrollReveal delay={0.1}>
        <SubscribeForm />
      </ScrollReveal>
    </>
  )
}
