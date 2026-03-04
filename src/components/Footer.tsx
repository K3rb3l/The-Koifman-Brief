import { Linkedin, Twitter } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <p className="font-serif text-lg font-semibold text-foreground mb-2">
                The Koifman Brief
              </p>
              <p className="text-sm text-muted font-sans leading-relaxed">
                Macro forces that create structural shifts, and what decision-makers should do about them. Covering geopolitics, FinTech, and commercial real estate.
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm font-sans font-medium text-foreground mb-3">
                Connect
              </p>
              <div className="flex sm:justify-end gap-4">
                <a
                  href="https://linkedin.com/in/shaharkoifman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center text-muted hover:text-accent transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                  aria-label="Follow on LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://twitter.com/shaharkoifman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center text-muted hover:text-accent transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                  aria-label="Follow on X"
                >
                  <Twitter size={18} />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted font-sans">
              &copy; {new Date().getFullYear()} The Koifman Brief. All rights reserved.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}
