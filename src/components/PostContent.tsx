'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPost, getPublishedPosts } from '@/lib/posts'
import { formatDate, estimateReadingTime, slugToTitle } from '@/lib/utils'
import { AuthorCard } from '@/components/AuthorCard'
import { ShareLinks } from '@/components/ShareLinks'
import { PostNavigation } from '@/components/PostNavigation'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ScrollReveal } from '@/components/ScrollReveal'
import { ReadingProgress } from '@/components/ReadingProgress'
import { CountUp } from '@/components/CountUp'
import type { Post } from '@/types/post'

export function PostContent() {
  const pathname = usePathname()
  const slug = pathname.replace(/^\/posts\//, '').replace(/\/$/, '')

  const [post, setPost] = useState<Post | null>(null)
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug || slug === 'posts') {
      setNotFound(true)
      setLoading(false)
      return
    }

    Promise.all([getPost(slug), getPublishedPosts()]).then(([postData, postsData]) => {
      if (!postData || !postData.published) {
        setNotFound(true)
      } else {
        setPost(postData)
        setAllPosts(postsData)
      }
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return <div className="text-center text-muted font-sans py-24">Loading...</div>
  }

  if (notFound || !post) {
    return (
      <div className="text-center py-24">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Brief not found</h2>
        <p className="text-muted font-sans">This brief doesn&apos;t exist or has been removed.</p>
      </div>
    )
  }

  const currentIndex = allPosts.findIndex((p) => p.slug === slug)
  const briefNumber = allPosts.length - currentIndex

  const previous = currentIndex < allPosts.length - 1
    ? { slug: allPosts[currentIndex + 1].slug, title: allPosts[currentIndex + 1].title }
    : null
  const next = currentIndex > 0
    ? { slug: allPosts[currentIndex - 1].slug, title: allPosts[currentIndex - 1].title }
    : null

  const readingTime = estimateReadingTime(post.body)

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: { '@type': 'Person', name: 'Shahar Koifman' },
            publisher: { '@type': 'Organization', name: 'The Koifman Brief' },
          }),
        }}
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
            <time>{formatDate(post.date)}</time>
            <span>-</span>
            <span>{readingTime}</span>
          </div>
        </header>

        {post.coverImageUrl && (
          <div className="mb-10 -mx-4 sm:mx-0">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        <div className="decorative-rule"><span className="diamond" /></div>

        <ScrollReveal>
          <div className="prose prose-lg max-w-none dark:prose-invert drop-cap">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
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
