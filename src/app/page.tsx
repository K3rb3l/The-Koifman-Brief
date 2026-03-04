import { reader } from '@/lib/keystatic'
import { PostCard } from '@/components/PostCard'
import { SubscribeForm } from '@/components/SubscribeForm'

export default async function HomePage() {
  const posts = await reader.collections.posts.all()

  const sortedPosts = posts
    .filter((post) => post.entry.date)
    .sort((a, b) => {
      const dateA = new Date(a.entry.date!).getTime()
      const dateB = new Date(b.entry.date!).getTime()
      return dateB - dateA
    })

  const [featured, ...rest] = sortedPosts

  return (
    <div>
      {featured && (
        <div className="animate-fade-in-up">
          <PostCard
            slug={featured.slug}
            title={featured.entry.title}
            date={featured.entry.date!}
            category={featured.entry.category}
            excerpt={featured.entry.excerpt}
            featured
          />
        </div>
      )}

      <SubscribeForm />

      {rest.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="font-serif text-sm font-semibold text-muted uppercase tracking-[0.15em] whitespace-nowrap">
              Previous Briefs
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-8">
            {rest.map((post, i) => (
              <div key={post.slug} className={`border-b border-border pb-8 last:border-b-0 animate-fade-in-up`} style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
                <PostCard
                  slug={post.slug}
                  title={post.entry.title}
                  date={post.entry.date!}
                  category={post.entry.category}
                  excerpt={post.entry.excerpt}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {sortedPosts.length === 0 && (
        <p className="text-muted font-sans">No posts yet. Check back soon.</p>
      )}
    </div>
  )
}
