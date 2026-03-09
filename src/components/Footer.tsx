import { Linkedin, Twitter } from 'lucide-react'
import { t } from '@/lib/i18n'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-[13px] font-sans text-muted">
            <span>&copy; {new Date().getFullYear()} {t('footer.copyright')}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/shahar-koifman-b29a76226"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center text-muted hover:text-accent transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              aria-label={t('footer.linkedin')}
            >
              <Linkedin size={16} />
            </a>
            <a
              href="https://twitter.com/shaharkoifman"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center text-muted hover:text-accent transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              aria-label={t('footer.x')}
            >
              <Twitter size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
