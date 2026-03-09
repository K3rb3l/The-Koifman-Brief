'use client'

import { t, alternateSiteUrl } from '@/lib/i18n'
import { usePathname } from 'next/navigation'

export function LanguageToggle() {
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const targetUrl = `${alternateSiteUrl}${pathname}`

    document.documentElement.style.transition = 'opacity 0.3s ease-out'
    document.documentElement.style.opacity = '0'

    setTimeout(() => {
      window.location.href = targetUrl
    }, 300)
  }

  return (
    <a
      href={`${alternateSiteUrl}${pathname}`}
      onClick={handleClick}
      className="text-xs sm:text-sm font-sans text-muted hover:text-accent transition-colors duration-200 cursor-pointer"
      title={t('lang.switch')}
    >
      {t('lang.switch')}
    </a>
  )
}
