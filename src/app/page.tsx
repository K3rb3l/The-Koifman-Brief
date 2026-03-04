import Link from 'next/link'
import Image from 'next/image'
import { reader } from '@/lib/keystatic'
import { PostCard } from '@/components/PostCard'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ScrollReveal } from '@/components/ScrollReveal'

export default async function HomePage() {
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
      {/* Author header */}
      <section className="animate-fade-in-up flex flex-col sm:flex-row items-center sm:items-center gap-4 mb-10 pb-8 border-b border-border">
        <Link href="/about" className="shrink-0">
          <Image
            src="/images/shahar-koifman-sketch.png"
            alt="Shahar Koifman"
            width={112}
            height={112}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover hover:ring-2 hover:ring-accent/40 transition-all duration-200"
            priority
          />
        </Link>
        <div className="text-center sm:text-left">
          <Link
            href="/about"
            className="font-serif font-semibold text-foreground hover:text-accent transition-colors duration-200"
          >
            Shahar Koifman
          </Link>
          <p className="text-sm text-muted font-sans mt-0.5">
            Geopolitics, FinTech, and real estate — tracing the macro forces that create structural shifts.
          </p>
        </div>
      </section>

      {sortedPosts.length > 0 && (
        <div className="space-y-6">
          {sortedPosts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 0.08}>
              <div className="border-b border-border pb-6 last:border-b-0">
                <PostCard
                  slug={post.slug}
                  title={post.entry.title}
                  date={post.entry.date!}
                  category={post.entry.category}
                  excerpt={post.entry.excerpt}
                  featured
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      <ScrollReveal>
        <SubscribeForm />
      </ScrollReveal>

      {sortedPosts.length === 0 && (
        <p className="text-muted font-sans">No posts yet. Check back soon.</p>
      )}
    </div>
  )
}
