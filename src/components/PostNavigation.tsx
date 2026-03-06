import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CoverMedia } from './CoverMedia'

type NavItem = { slug: string; title: string; coverImageUrl?: string; coverAnimationUrl?: string }

type PostNavigationProps = {
  previous: NavItem | null
  next: NavItem | null
}

export function PostNavigation({ previous, next }: PostNavigationProps) {
  if (!previous && !next) return null

  return (
    <nav className="grid grid-cols-2 gap-6 border-t border-border pt-8 mt-8">
      <div>
        {previous && (
          <Link
            href={`/posts/${previous.slug}`}
            className="group cursor-pointer block"
          >
            <div className="w-full h-0 pb-[56.25%] relative rounded overflow-hidden cover-vignette mb-2">
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
          </Link>
        )}
      </div>
      <div>
        {next && (
          <Link
            href={`/posts/${next.slug}`}
            className="group cursor-pointer block text-right"
          >
            <div className="w-full h-0 pb-[56.25%] relative rounded overflow-hidden cover-vignette mb-2">
              {next.coverImageUrl ? (
                <CoverMedia imageUrl={next.coverImageUrl} animationUrl={next.coverAnimationUrl} alt={next.title} className="absolute inset-0 w-full h-full object-cover dark:brightness-[0.85]" />
              ) : (
                <div className="absolute inset-0 bg-border/30" />
              )}
            </div>
            <p className="font-serif text-[15px] leading-tight text-foreground group-hover:text-accent transition-colors">
              {next.title}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-1.5">
              <span className="text-[10px] text-muted font-sans uppercase tracking-[0.2em]">Next</span>
              <ChevronRight size={14} className="text-muted group-hover:text-accent transition-colors shrink-0" />
            </div>
          </Link>
        )}
      </div>
    </nav>
  )
}
