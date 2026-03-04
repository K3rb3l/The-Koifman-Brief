import Link from 'next/link'
import { reader } from '@/lib/keystatic'
import { PostCard } from '@/components/PostCard'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ScrollReveal } from '@/components/ScrollReveal'
import { CursorSpotlight } from '@/components/CursorSpotlight'
import { AnimatedPortrait } from '@/components/AnimatedPortrait'

export default async function HomePage() {
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
      {/* Masthead intro with author image */}
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

      {/* Briefings with cursor spotlight */}
      {sortedPosts.length > 0 && (
        <CursorSpotlight>
          <section className="space-y-10">
            {sortedPosts.map((post, i) => (
              <ScrollReveal key={post.slug} delay={i * 0.08}>
                <PostCard
                  slug={post.slug}
                  title={post.entry.title}
                  date={post.entry.date!}
                  category={post.entry.category}
                  excerpt={post.entry.excerpt}
                  briefNumber={totalBriefs - i}
                  isLatest={i === 0}
                />
              </ScrollReveal>
            ))}
          </section>
        </CursorSpotlight>
      )}

      <ScrollReveal>
        <SubscribeForm />
      </ScrollReveal>

      {sortedPosts.length === 0 && (
        <p className="text-muted font-sans text-center">No briefs yet. Check back soon.</p>
      )}
    </div>
  )
}
