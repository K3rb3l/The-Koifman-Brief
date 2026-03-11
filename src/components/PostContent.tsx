'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPost, getPublishedPosts, getCachedPublishedPosts } from '@/lib/posts'
import { formatDate, estimateReadingTime, slugToTitle } from '@/lib/utils'
import { AuthorCard } from '@/components/AuthorCard'
import { ShareLinks } from '@/components/ShareLinks'
import { PostNavigation } from '@/components/PostNavigation'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ReadingProgress } from '@/components/ReadingProgress'
import { CountUp } from '@/components/CountUp'
import { CoverMedia } from '@/components/CoverMedia'
import { gsap, useGSAP, EASE_REVEAL } from '@/lib/gsap'
import { t, postTitle, postBody } from '@/lib/i18n'
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

    // Show cached data immediately if available
    const cached = getCachedPublishedPosts()
    if (cached) {
      const cachedPost = cached.find((p) => p.slug === slug)
      if (cachedPost && cachedPost.published) {
        setPost(cachedPost)
        setAllPosts(cached)
        setLoading(false)
      }
    }

    // Fetch fresh data in background
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
    return (
      <div className="space-y-6 py-8">
        {/* Title skeleton */}
        <div className="text-center space-y-4">
          <div className="h-3 w-20 mx-auto skeleton-shimmer rounded" style={{ opacity: 0, animation: 'skeletonFadeIn 0.4s ease-out forwards' }} />
          <div className="space-y-2">
            <div className="h-8 w-4/5 mx-auto skeleton-shimmer rounded" style={{ opacity: 0, animation: 'skeletonFadeIn 0.4s ease-out 0.1s forwards' }} />
            <div className="h-8 w-3/5 mx-auto skeleton-shimmer rounded" style={{ opacity: 0, animation: 'skeletonFadeIn 0.4s ease-out 0.15s forwards' }} />
          </div>
          <div className="h-3 w-48 mx-auto skeleton-shimmer rounded" style={{ opacity: 0, animation: 'skeletonFadeIn 0.4s ease-out 0.2s forwards' }} />
        </div>
        {/* Cover image skeleton */}
        <div className="h-64 w-full skeleton-shimmer rounded-lg" style={{ opacity: 0, animation: 'skeletonFadeIn 0.4s ease-out 0.25s forwards' }} />
        {/* Body skeleton */}
        <div className="space-y-3 pt-4" style={{ opacity: 0, animation: 'skeletonFadeIn 0.4s ease-out 0.3s forwards' }}>
          <div className="h-4 w-full skeleton-shimmer rounded" />
          <div className="h-4 w-11/12 skeleton-shimmer rounded" />
          <div className="h-4 w-4/5 skeleton-shimmer rounded" />
          <div className="h-4 w-full skeleton-shimmer rounded" />
          <div className="h-4 w-3/4 skeleton-shimmer rounded" />
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="text-center py-24">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">{t('post.notFound.title')}</h2>
        <p className="text-muted font-sans">{t('post.notFound.body')}</p>
      </div>
    )
  }

  const currentIndex = allPosts.findIndex((p) => p.slug === slug)
  const briefNumber = allPosts.length - currentIndex

  const previous = currentIndex < allPosts.length - 1
    ? { slug: allPosts[currentIndex + 1].slug, title: allPosts[currentIndex + 1].title, title_fa: allPosts[currentIndex + 1].title_fa, coverImageUrl: allPosts[currentIndex + 1].coverImageUrl, coverAnimationUrl: allPosts[currentIndex + 1].coverAnimationUrl }
    : null
  const next = currentIndex > 0
    ? { slug: allPosts[currentIndex - 1].slug, title: allPosts[currentIndex - 1].title, title_fa: allPosts[currentIndex - 1].title_fa, coverImageUrl: allPosts[currentIndex - 1].coverImageUrl, coverAnimationUrl: allPosts[currentIndex - 1].coverAnimationUrl }
    : null

  const readingTime = estimateReadingTime(post.body)
  const headerRef = useRef<HTMLElement>(null)

  // Header stagger reveal
  useGSAP(() => {
    const el = headerRef.current
    if (!el) return
    const items = el.querySelectorAll('[data-reveal]')
    gsap.from(items, { y: 20, opacity: 0, duration: 0.4, ease: EASE_REVEAL, stagger: 0.1 })
  }, { scope: headerRef })

  // Cover zoom-out on scroll
  useGSAP(() => {
    const cover = document.querySelector('[data-article-cover]') as HTMLElement
    if (!cover) return
    gsap.fromTo(cover,
      { scale: 1.05 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: cover, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
  })

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
        <header ref={headerRef} className="mb-10 text-center" style={{ viewTransitionName: 'article-header' }}>
          <div data-reveal className="flex items-center justify-center gap-3 mb-5">
            <span className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-muted">
              {t('post.briefNo')} <CountUp target={briefNumber} />
            </span>
            <span className="w-[3px] h-[3px] bg-border rounded-full" />
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-accent">
              {slugToTitle(post.category)}
            </span>
          </div>
          <h1 data-reveal className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight max-w-2xl mx-auto">
            {postTitle(post)}
          </h1>
          <div data-reveal className="flex items-center justify-center gap-3 mt-5 text-[13px] text-muted font-sans">
            <a href="/about" className="hover:text-accent transition-colors duration-200">{t('post.byline')}</a>
            <span>-</span>
            <time>{formatDate(post.date)}</time>
            <span>-</span>
            <span>{readingTime}</span>
          </div>
        </header>

        {post.coverImageUrl && (
          <div data-article-cover className="mb-10 -mx-4 sm:mx-0 relative cover-vignette cover-vignette-lg bg-[#f5f0e8] dark:bg-[#1a1a1a]" style={{ aspectRatio: '16/9', viewTransitionName: 'cover-hero' }}>
            <CoverMedia
              imageUrl={post.coverImageUrl}
              animationUrl={post.coverAnimationUrl}
              alt={postTitle(post)}
              className="absolute inset-0 w-full h-full object-cover rounded-lg dark:brightness-[0.85] dark:contrast-[1.1]"
            />
          </div>
        )}

        <div style={{ viewTransitionName: 'article-body' }}>
          <div className="decorative-rule"><span className="diamond" /></div>

          <div className="prose prose-lg max-w-none dark:prose-invert drop-cap">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{postBody(post)}</ReactMarkdown>
          </div>

          <ShareLinks title={postTitle(post)} slug={slug} />
          <AuthorCard />
          <PostNavigation previous={previous} next={next} />
          <SubscribeForm />
        </div>
      </article>
    </>
  )
}
