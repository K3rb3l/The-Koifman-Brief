import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              The Koifman Brief
            </h1>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden sm:flex items-center gap-6 text-sm font-sans">
              <Link href="/" className="text-muted hover:text-foreground transition-colors duration-200 cursor-pointer">
                Home
              </Link>
              <Link href="/about" className="text-muted hover:text-foreground transition-colors duration-200 cursor-pointer">
                About
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
        <p className="mt-2 text-sm text-muted font-sans">
          Macro forces. Structural shifts. What to do about them.
        </p>
      </div>
    </header>
  )
}
