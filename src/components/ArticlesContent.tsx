'use client'

import { useEffect, useState } from 'react'
import { getPublishedPosts } from '@/lib/posts'
import { PostCard } from '@/components/PostCard'
import { ScrollReveal } from '@/components/ScrollReveal'
import type { Post } from '@/types/post'

export function ArticlesContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublishedPosts().then((data) => {
      setPosts(data)
      setLoading(false)
    })
  }, [])

  const totalBriefs = posts.length

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
        <div className="text-center text-muted font-sans py-12">Loading briefs...</div>
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
