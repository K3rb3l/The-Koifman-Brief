import type { Metadata } from 'next'
import { reader } from '@/lib/keystatic'
import { PostCard } from '@/components/PostCard'
import { ScrollReveal } from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'All Articles',
  description: 'All articles from The Koifman Brief.',
}

export default async function ArticlesPage() {
  const posts = await reader.collections.posts.all()

  const sortedPosts = posts
    .filter((post) => post.entry.date)
    .sort((a, b) => {
      const dateA = new Date(a.entry.date!).getTime()
      const dateB = new Date(b.entry.date!).getTime()
      return dateB - dateA
    })

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-8">
        All Articles
      </h1>

      {sortedPosts.length > 0 ? (
        <div className="space-y-8">
          {sortedPosts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 0.06}>
              <div className="border-b border-border pb-8 last:border-b-0">
                <PostCard
                  slug={post.slug}
                  title={post.entry.title}
                  date={post.entry.date!}
                  category={post.entry.category}
                  excerpt={post.entry.excerpt}
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <p className="text-muted font-sans">No articles yet.</p>
      )}
    </div>
  )
}
