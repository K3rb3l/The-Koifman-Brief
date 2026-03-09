'use client'

import { Linkedin, Twitter } from 'lucide-react'
import { t, siteUrl } from '@/lib/i18n'

type ShareLinksProps = {
  title: string
  slug: string
}

export function ShareLinks({ title, slug }: ShareLinksProps) {
  const url = `${siteUrl}/posts/${slug}`
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  return (
    <div className="flex items-center gap-2 mt-8">
      <span className="text-sm text-muted font-sans mr-1">{t('share.label')}</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 flex items-center justify-center text-muted hover:text-accent transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        aria-label={t('share.linkedin')}
      >
        <Linkedin size={18} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 flex items-center justify-center text-muted hover:text-accent transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        aria-label={t('share.x')}
      >
        <Twitter size={18} />
      </a>
    </div>
  )
}
