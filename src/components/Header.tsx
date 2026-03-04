'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { BrandMark } from './BrandMark'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-border">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            <BrandMark />
            <div>
              <h1 className="font-serif text-xl md:text-2xl font-bold tracking-tight text-foreground uppercase" style={{ letterSpacing: '0.08em' }}>
                The Koifman Brief
              </h1>
              <p className="text-xs text-muted font-sans tracking-widest uppercase hidden sm:block">
                Clarity in complexity
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-6 text-sm font-sans">
              <Link
                href="/"
                className="link-underline text-muted hover:text-foreground transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1 py-1"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="link-underline text-muted hover:text-foreground transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1 py-1"
              >
                About
              </Link>
            </nav>
            <ThemeToggle />
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-muted hover:text-foreground transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className="sm:hidden mt-4 pt-4 border-t border-border flex flex-col gap-3 text-sm font-sans">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted hover:text-foreground transition-colors duration-200 cursor-pointer py-2"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted hover:text-foreground transition-colors duration-200 cursor-pointer py-2"
            >
              About
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
