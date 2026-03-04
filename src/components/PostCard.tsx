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
      <Link href={`/posts/${slug}`} className="group cursor-pointer block">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-sans font-medium uppercase tracking-wider text-tag">
            {slugToTitle(category)}
          </span>
          <span className="text-xs text-muted font-sans">
            {formatDate(date)}
          </span>
        </div>
        <h2 className={`font-serif font-semibold text-foreground group-hover:text-link-hover transition-colors duration-200 ${featured ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
          {title}
        </h2>
        <p className="mt-2 text-muted font-sans leading-relaxed line-clamp-2">
          {excerpt}
        </p>
      </Link>
    </article>
  )
}
