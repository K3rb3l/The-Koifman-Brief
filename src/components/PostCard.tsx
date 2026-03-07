'use client'

import { useRouter } from 'next/navigation'
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

function waitForElement(selector: string): Promise<void> {
  if (document.querySelector(selector)) return Promise.resolve()
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        resolve()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    setTimeout(() => { observer.disconnect(); resolve() }, 2000)
  })
}

export function PostCard({ slug, title, date, category, excerpt, coverImageUrl, coverAnimationUrl, briefNumber, isLatest }: PostCardProps) {
  const router = useRouter()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()

    if (!document.startViewTransition) {
      router.push(`/posts/${slug}`)
      return
    }

    // Tag this card's cover for shared element morph
    const coverEl = e.currentTarget.querySelector('[data-cover]') as HTMLElement | null
    if (coverEl) coverEl.style.viewTransitionName = 'cover-hero'

    try {
      const transition = document.startViewTransition(async () => {
        router.push(`/posts/${slug}`)
        await waitForElement('[data-article-cover]')
        window.scrollTo({ top: 0, behavior: 'instant' })
      })
      transition.finished.catch(() => {})
    } catch {
      router.push(`/posts/${slug}`)
    }
  }

  return (
    <article className="group">
      <a
        href={`/posts/${slug}`}
        onClick={handleClick}
        className="block cursor-pointer -mx-5 px-5 py-5 rounded-sm transition-all duration-500 ease-out group-hover:bg-accent/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background text-center"
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

        <div className="flex items-center justify-center gap-3 mb-3">
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
          <div data-cover className="relative cover-vignette mb-3 sm:w-[70%] sm:mx-auto bg-[#f5f0e8] dark:bg-[#1a1a1a]" style={{ aspectRatio: '16/9' }}>
            <CoverMedia
              imageUrl={coverImageUrl}
              animationUrl={coverAnimationUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover rounded dark:brightness-[0.85] dark:contrast-[1.1]"
            />
          </div>
        )}

        <div className="text-center">
          <h2 className={`font-serif font-bold text-foreground leading-tight tracking-tight group-hover:text-accent transition-colors duration-500 ease-out ${
            isLatest ? 'text-2xl sm:text-[1.85rem]' : 'text-xl sm:text-2xl'
          }`}>
            {title}
          </h2>

          <p className="mt-3 text-muted/70 font-sans text-[15px] leading-relaxed line-clamp-3 group-hover:text-foreground/60 transition-colors duration-500 ease-out">
            {excerpt}
          </p>
        </div>

        <span
          className="mx-auto inline-flex items-center gap-1 mt-4 text-[13px] font-sans font-medium text-accent opacity-0 group-hover:opacity-100"
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
      </a>
    </article>
  )
}
