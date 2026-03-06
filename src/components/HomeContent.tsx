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
import type { Post } from '@/types/post'

export function HomeContent() {
  const cached = typeof window !== 'undefined' ? getCachedPublishedPosts() : null
  const [posts, setPosts] = useState<Post[]>(cached ?? [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublishedPosts()
      .then((data) => {
        setPosts(data)
        setLoading(false)
        // Prefetch cover images for first page
        data.slice(0, 3).forEach((post) => {
          if (post.coverImageUrl) {
            const img = new Image()
            img.src = post.coverImageUrl
          }
        })
      })
      .catch((err) => {
        console.error('Failed to load posts:', err)
        if (!cached) {
          setError(err instanceof Error ? err.message : 'Failed to load posts')
        }
        setLoading(false)
      })
  }, [])

  const POSTS_PER_PAGE = 3
  const totalBriefs = posts.length
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const paginatedPosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  return (
    <div>
      <section className="animate-fade-in-up mb-16 flex flex-col items-center text-center">
        <Link href="/about" className="mb-5 group">
          <AnimatedPortrait
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-border group-hover:ring-accent/50 transition-all duration-300"
          />
        </Link>
        <p className="text-[11px] font-sans font-medium tracking-[0.3em] uppercase text-muted mb-3">
          Clarity in complexity
        </p>
        <p className="text-[11px] font-sans font-medium tracking-[0.2em] uppercase text-muted mb-4">
          by <Link href="/about" className="text-accent hover:text-link-hover transition-colors duration-200 cursor-pointer">Shahar Koifman</Link>
        </p>
        <h2 className="font-serif text-lg sm:text-xl text-muted leading-relaxed max-w-md mx-auto">
          Geopolitics, FinTech, and real estate - tracing the macro forces that create structural shifts.
        </h2>
      </section>

      {error ? (
        <div className="text-center text-red-500 font-sans py-12">{error}</div>
      ) : loading ? (
        <PostCardSkeleton />
      ) : posts.length > 0 ? (
        <>
          <CursorSpotlight>
            <section className="space-y-2 stagger-children">
              {paginatedPosts.map((post, i) => (
                <PostCard
                  key={post.slug}
                  slug={post.slug}
                  title={post.title}
                  date={post.date}
                  category={post.category}
                  excerpt={post.excerpt}
                  briefNumber={totalBriefs - ((page - 1) * POSTS_PER_PAGE + i)}
                  isLatest={page === 1 && i === 0}
                />
              ))}
            </section>
          </CursorSpotlight>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-sans text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className={`w-8 h-8 text-sm font-sans rounded transition-colors ${
                    p === page
                      ? 'bg-accent text-white'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm font-sans text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </nav>
          )}
        </>
      ) : (
        <p className="text-muted font-sans text-center">No briefs yet. Check back soon.</p>
      )}

      <ScrollReveal>
        <SubscribeForm />
      </ScrollReveal>
    </div>
  )
}
