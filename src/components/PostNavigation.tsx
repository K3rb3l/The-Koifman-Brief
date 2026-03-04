import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PostNavigationProps = {
  previous: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
}

export function PostNavigation({ previous, next }: PostNavigationProps) {
  if (!previous && !next) return null

  return (
    <nav className="flex justify-between items-start gap-8 border-t border-border pt-8 mt-8">
      {previous ? (
        <Link
          href={`/posts/${previous.slug}`}
          className="group flex items-start gap-2 cursor-pointer max-w-[45%]"
        >
          <ChevronLeft size={16} className="mt-1 text-muted group-hover:text-foreground transition-colors duration-200 shrink-0" />
          <div>
            <span className="text-xs text-muted font-sans uppercase tracking-wider">Previous</span>
            <p className="font-serif text-sm text-foreground group-hover:text-link-hover transition-colors duration-200">
              {previous.title}
            </p>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/posts/${next.slug}`}
          className="group flex items-start gap-2 cursor-pointer text-right max-w-[45%]"
        >
          <div>
            <span className="text-xs text-muted font-sans uppercase tracking-wider">Next</span>
            <p className="font-serif text-sm text-foreground group-hover:text-link-hover transition-colors duration-200">
              {next.title}
            </p>
          </div>
          <ChevronRight size={16} className="mt-1 text-muted group-hover:text-foreground transition-colors duration-200 shrink-0" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
