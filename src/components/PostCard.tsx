import Link from 'next/link'
import { formatDate, slugToTitle } from '@/lib/utils'

type PostCardProps = {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  featured?: boolean
}

export function PostCard({ slug, title, date, category, excerpt, featured }: PostCardProps) {
  return (
    <article className={featured ? 'mb-12' : ''}>
      <Link
        href={`/posts/${slug}`}
        className={`group cursor-pointer block ${featured ? 'border-l-2 border-accent pl-6' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm`}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-sans font-semibold uppercase tracking-[0.15em] text-accent">
            {slugToTitle(category)}
          </span>
          <span className="text-xs text-muted font-sans">
            {formatDate(date)}
          </span>
        </div>
        <h2 className={`font-serif font-semibold text-foreground group-hover:text-accent transition-colors duration-200 ${featured ? 'text-2xl md:text-4xl leading-tight' : 'text-xl md:text-2xl'}`}>
          {title}
        </h2>
        <p className="mt-3 text-muted font-sans leading-relaxed line-clamp-2">
          {excerpt}
        </p>
      </Link>
    </article>
  )
}
