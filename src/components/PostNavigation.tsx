'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CoverMedia, setTransitionPromise } from './CoverMedia'

type NavItem = { slug: string; title: string; coverImageUrl?: string; coverAnimationUrl?: string }

type PostNavigationProps = {
  previous: NavItem | null
  next: NavItem | null
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

function NavLink({ slug, children, coverSelector }: { slug: string; children: React.ReactNode; coverSelector: string }) {
  const router = useRouter()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()

    if (!document.startViewTransition) {
      router.push(`/posts/${slug}`)
      return
    }

    const coverEl = e.currentTarget.querySelector(coverSelector) as HTMLElement | null
    if (coverEl) coverEl.style.viewTransitionName = 'cover-hero'

    // Clear old article's cover-hero name and marker so we detect the NEW page
    const oldCover = document.querySelector('[data-article-cover]') as HTMLElement | null
    if (oldCover) {
      oldCover.style.viewTransitionName = ''
      oldCover.removeAttribute('data-article-cover')
    }

    const transition = document.startViewTransition(async () => {
      router.push(`/posts/${slug}`)
      await waitForElement('[data-article-cover]')
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
    setTransitionPromise(transition.finished.catch(() => {}))
    transition.finished.catch(() => {})
  }

  return (
    <Link href={`/posts/${slug}`} onClick={handleClick} className="group cursor-pointer block">
      {children}
    </Link>
  )
}

export function PostNavigation({ previous, next }: PostNavigationProps) {
  if (!previous && !next) return null

  return (
    <nav className="grid grid-cols-2 gap-6 border-t border-border pt-8 mt-8">
      <div>
        {previous && (
          <NavLink slug={previous.slug} coverSelector="[data-nav-cover]">
            <div data-nav-cover className="w-full h-0 pb-[56.25%] relative rounded overflow-hidden cover-vignette mb-2">
              {previous.coverImageUrl ? (
                <CoverMedia imageUrl={previous.coverImageUrl} animationUrl={previous.coverAnimationUrl} alt={previous.title} className="absolute inset-0 w-full h-full object-cover dark:brightness-[0.85]" />
              ) : (
                <div className="absolute inset-0 bg-border/30" />
              )}
            </div>
            <p className="font-serif text-[15px] leading-tight text-foreground group-hover:text-accent transition-colors">
              {previous.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <ChevronLeft size={14} className="text-muted group-hover:text-accent transition-colors shrink-0" />
              <span className="text-[10px] text-muted font-sans uppercase tracking-[0.2em]">Previous</span>
            </div>
          </NavLink>
        )}
      </div>
      <div>
        {next && (
          <NavLink slug={next.slug} coverSelector="[data-nav-cover]">
            <div data-nav-cover className="w-full h-0 pb-[56.25%] relative rounded overflow-hidden cover-vignette mb-2">
              {next.coverImageUrl ? (
                <CoverMedia imageUrl={next.coverImageUrl} animationUrl={next.coverAnimationUrl} alt={next.title} className="absolute inset-0 w-full h-full object-cover dark:brightness-[0.85]" />
              ) : (
                <div className="absolute inset-0 bg-border/30" />
              )}
            </div>
            <p className="font-serif text-[15px] leading-tight text-left text-foreground group-hover:text-accent transition-colors">
              {next.title}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-1.5">
              <span className="text-[10px] text-muted font-sans uppercase tracking-[0.2em]">Next</span>
              <ChevronRight size={14} className="text-muted group-hover:text-accent transition-colors shrink-0" />
            </div>
          </NavLink>
        )}
      </div>
    </nav>
  )
}
