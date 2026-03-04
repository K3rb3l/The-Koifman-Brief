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

  const totalBriefs = sortedPosts.length

  return (
    <div>
      <header className="mb-12 text-center">
        <p className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-muted mb-3">
          Archive
        </p>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          All Briefs
        </h1>
        <p className="text-sm text-muted font-sans mt-2">
          {sortedPosts.length} brief{sortedPosts.length !== 1 ? 's' : ''} published
        </p>
      </header>

      {sortedPosts.length > 0 ? (
        <div className="space-y-10">
          {sortedPosts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 0.05}>
              <PostCard
                slug={post.slug}
                title={post.entry.title}
                date={post.entry.date!}
                category={post.entry.category}
                excerpt={post.entry.excerpt}
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
