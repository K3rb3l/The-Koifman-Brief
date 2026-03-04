import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { BrandMark } from './BrandMark'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-6">
        {/* Mobile: stack logo + nav; Desktop: single row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm min-w-0"
          >
            <BrandMark />
            <h1 className="font-serif text-xs sm:text-base md:text-lg font-bold tracking-tight text-foreground uppercase whitespace-nowrap hidden sm:block" style={{ letterSpacing: '0.08em' }}>
              The Koifman Brief
            </h1>
          </Link>
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-sans">
              <Link
                href="/"
                className="link-underline text-muted hover:text-foreground transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1 py-1"
              >
                Home
              </Link>
              <Link
                href="/articles"
                className="link-underline text-muted hover:text-foreground transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1 py-1"
              >
                Articles
              </Link>
              <Link
                href="/about"
                className="link-underline text-muted hover:text-foreground transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1 py-1"
              >
                About
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
