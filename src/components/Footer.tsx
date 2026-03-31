import { Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-[13px] font-sans text-muted">
            <span>&copy; {new Date().getFullYear()} The Koifman Brief</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/shahar-koifman-b29a76226"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center text-muted hover:text-accent transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              aria-label="Follow on LinkedIn"
            >
              <Linkedin size={16} />
            </a>
            <a
              href="https://x.com/shaharkoifman"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center text-muted hover:text-accent transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              aria-label="Follow on X"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
