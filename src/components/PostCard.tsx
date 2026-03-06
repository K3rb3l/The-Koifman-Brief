import Link from 'next/link'
import { formatDate, slugToTitle } from '@/lib/utils'
import { CountUp } from './CountUp'
import { CoverMedia } from './CoverMedia'

type PostCardProps = {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  coverImageUrl?: string
  coverAnimationUrl?: string
  briefNumber?: number
  isLatest?: boolean
}

export function PostCard({ slug, title, date, category, excerpt, coverImageUrl, coverAnimationUrl, briefNumber, isLatest }: PostCardProps) {
  return (
    <article className="group">
      <Link
        href={`/posts/${slug}`}
        className="block cursor-pointer -mx-5 px-5 py-5 rounded-sm transition-all duration-500 ease-out group-hover:bg-accent/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Soft gradient rule — fades at edges */}
        <div className="flex items-center gap-4 mb-4">
          <span
            className="h-px flex-1 transition-opacity duration-500 ease-out opacity-40 group-hover:opacity-70"
            style={{ background: 'linear-gradient(90deg, transparent, var(--bd) 30%, var(--bd) 70%, transparent)' }}
          />
          {briefNumber !== undefined && (
            <span className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-muted/60 group-hover:text-accent/70 transition-colors duration-500 ease-out">
              No. <CountUp target={briefNumber} />
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-accent/80 group-hover:text-accent transition-colors duration-500 ease-out">
            {slugToTitle(category)}
          </span>
          <span className="text-[11px] text-muted/40 font-sans">
            -
          </span>
          <time className="text-[11px] text-muted/60 font-sans">
            {formatDate(date)}
          </time>
        </div>

        {coverImageUrl && (
          <div className="sm:hidden relative cover-vignette mb-3" style={{ aspectRatio: '16/9' }}>
            <CoverMedia
              imageUrl={coverImageUrl}
              animationUrl={coverAnimationUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover rounded dark:brightness-[0.85] dark:contrast-[1.1]"
            />
          </div>
        )}

        <div className={coverImageUrl ? 'sm:flex sm:gap-5' : ''}>
          <div className="flex-1 min-w-0">
            <h2 className={`font-serif font-bold text-foreground leading-tight tracking-tight group-hover:text-accent transition-colors duration-500 ease-out ${
              isLatest ? 'text-2xl sm:text-[1.85rem]' : 'text-xl sm:text-2xl'
            }`}>
              {title}
            </h2>

            <p className="mt-3 text-muted/70 font-sans text-[15px] leading-relaxed line-clamp-3 group-hover:text-foreground/60 transition-colors duration-500 ease-out">
              {excerpt}
            </p>
          </div>

          {coverImageUrl && (
            <div
              className="hidden sm:block flex-shrink-0 relative self-start mt-1 cover-vignette"
              style={{ width: '10rem', aspectRatio: '16/9' }}
            >
              <CoverMedia
                imageUrl={coverImageUrl}
                animationUrl={coverAnimationUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover rounded dark:brightness-[0.85] dark:contrast-[1.1]"
              />
            </div>
          )}
        </div>

        <span
          className="inline-flex items-center gap-1 mt-4 text-[13px] font-sans font-medium text-accent opacity-0 group-hover:opacity-100"
          style={{ transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1)' }}
        >
          Read brief
          <svg
            width="14" height="14" viewBox="0 0 16 16" fill="none"
            className="translate-x-0 group-hover:translate-x-1.5"
            style={{ transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s' }}
          >
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </Link>
    </article>
  )
}
