'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPublishedPosts, getCachedPublishedPosts } from '@/lib/posts'
import { PostCard } from '@/components/PostCard'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ScrollReveal } from '@/components/ScrollReveal'
import { CursorSpotlight } from '@/components/CursorSpotlight'
import { AnimatedPortrait } from '@/components/AnimatedPortrait'
import { PostCardSkeleton } from '@/components/PostCardSkeleton'
import { prefetchVideos } from '@/lib/video-cache'
import { t } from '@/lib/i18n'
import type { Post } from '@/types/post'

const POSTS_PER_PAGE = 3
const PRELOAD_TIMEOUT_MS = 2000

function preloadCoverImages(posts: Post[]): Promise<void> {
  const urls = posts.map((p) => p.coverImageUrl).filter(Boolean) as string[]
  if (urls.length === 0) return Promise.resolve()
  return new Promise((resolve) => {
    let loaded = 0
    const done = () => { if (++loaded >= urls.length) resolve() }
    urls.forEach((url) => {
      const img = new Image()
      img.onload = done
      img.onerror = done
      img.src = url
    })
    setTimeout(resolve, PRELOAD_TIMEOUT_MS)
  })
}

export function HomeContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cached = getCachedPublishedPosts()
    if (cached) {
      preloadCoverImages(cached.slice(0, POSTS_PER_PAGE)).then(() => {
        setPosts(cached)
        setLoading(false)
      })
    }

    getPublishedPosts()
      .then(async (data) => {
        await preloadCoverImages(data.slice(0, POSTS_PER_PAGE))
        setPosts(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load posts:', err)
        if (!cached) {
          setError(err instanceof Error ? err.message : 'Failed to load posts')
        }
        setLoading(false)
      })
  }, [])

  const totalBriefs = posts.length
  const [page, setPage] = useState(1)
  const [pageLoading, setPageLoading] = useState(false)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const paginatedPosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  useEffect(() => {
    const videoUrls = paginatedPosts
      .map((p) => p.coverAnimationUrl)
      .filter(Boolean) as string[]
    if (videoUrls.length > 0) prefetchVideos(videoUrls)
  }, [page, posts.length])

  function goToPage(nextPage: number) {
    setPageLoading(true)
    setPage(nextPage)
    requestAnimationFrame(() => window.scrollTo(0, 0))

    const nextPosts = posts.slice((nextPage - 1) * POSTS_PER_PAGE, nextPage * POSTS_PER_PAGE)
    preloadCoverImages(nextPosts).then(() => setPageLoading(false))
  }

  return (
    <div>
      <section className="animate-fade-in-up mb-16 flex flex-col items-center text-center">
        <Link href="/about" className="mb-5 group">
          <AnimatedPortrait
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover portrait-ring group-hover:ring-accent/50 transition-all duration-300"
          />
        </Link>
        <p className="text-[11px] font-sans font-medium tracking-[0.3em] uppercase text-muted mb-3">
          {t('brand.tagline')}
        </p>
        <p className="text-[11px] font-sans font-medium tracking-[0.2em] uppercase text-muted mb-4">
          <Link href="/about" className="text-accent hover:text-link-hover transition-colors duration-200 cursor-pointer">{t('home.byline')}</Link>
        </p>
        <h2 className="font-serif text-lg sm:text-xl text-muted leading-relaxed max-w-md mx-auto">
          {t('home.subtitle')}
        </h2>
      </section>

      {error ? (
        <div className="text-center text-red-500 font-sans py-12">{error}</div>
      ) : loading || pageLoading ? (
        <PostCardSkeleton />
      ) : posts.length > 0 ? (
        <>
          <CursorSpotlight>
            <section className="space-y-2">
              {paginatedPosts.map((post, i) => (
                <PostCard
                  key={post.slug}
                  slug={post.slug}
                  title={post.title}
                  title_fa={post.title_fa}
                  date={post.date}
                  category={post.category}
                  excerpt={post.excerpt}
                  excerpt_fa={post.excerpt_fa}
                  coverImageUrl={post.coverImageUrl}
                  coverAnimationUrl={post.coverAnimationUrl}
                  briefNumber={totalBriefs - ((page - 1) * POSTS_PER_PAGE + i)}
                  isLatest={page === 1 && i === 0}
                />
              ))}
            </section>
          </CursorSpotlight>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-sans text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {t('home.prev')}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-8 h-8 text-sm font-sans rounded cursor-pointer transition-colors ${
                    p === page
                      ? 'bg-accent text-white'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm font-sans text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {t('home.next')}
              </button>
            </nav>
          )}
        </>
      ) : (
        <p className="text-muted font-sans text-center">{t('home.empty')}</p>
      )}

      <ScrollReveal>
        <SubscribeForm />
      </ScrollReveal>
    </div>
  )
}
