'use client'

import { useEffect, useState } from 'react'
import { getPublishedPosts, getCachedPublishedPosts } from '@/lib/posts'
import { PostCard } from '@/components/PostCard'
import { ScrollReveal } from '@/components/ScrollReveal'
import { PostCardSkeleton } from '@/components/PostCardSkeleton'
import { prefetchVideos } from '@/lib/video-cache'
import type { Post } from '@/types/post'

function preloadImages(posts: Post[]): Promise<void> {
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
    setTimeout(resolve, 2000)
  })
}

export function ArticlesContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = getCachedPublishedPosts()
    if (cached) {
      preloadImages(cached).then(() => {
        setPosts(cached)
        setLoading(false)
      })
    }

    getPublishedPosts()
      .then(async (data) => {
        await preloadImages(data)
        setPosts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const totalBriefs = posts.length

  useEffect(() => {
    const videoUrls = posts
      .map((p) => p.coverAnimationUrl)
      .filter(Boolean) as string[]
    if (videoUrls.length > 0) prefetchVideos(videoUrls)
  }, [posts.length])

  return (
    <div>
      <header className="mb-12 text-center">
        <p className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-muted mb-3">
          Archive
        </p>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          All Briefs
        </h1>
        {!loading && (
          <p className="text-sm text-muted font-sans mt-2">
            {posts.length} brief{posts.length !== 1 ? 's' : ''} published
          </p>
        )}
      </header>

      {loading ? (
        <PostCardSkeleton />
      ) : posts.length > 0 ? (
        <div className="space-y-10">
          {posts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 0.05}>
              <PostCard
                slug={post.slug}
                title={post.title}
                date={post.date}
                category={post.category}
                excerpt={post.excerpt}
                coverImageUrl={post.coverImageUrl}
                coverAnimationUrl={post.coverAnimationUrl}
                briefNumber={totalBriefs - i}
              />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <p className="text-muted font-sans text-center">No briefs yet.</p>
      )}
    </div>
  )
}
