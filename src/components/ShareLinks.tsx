'use client'

import { Linkedin, Twitter } from 'lucide-react'

type ShareLinksProps = {
  title: string
  slug: string
}

export function ShareLinks({ title, slug }: ShareLinksProps) {
  const url = `https://thekoifmanbrief.com/posts/${slug}`
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  return (
    <div className="flex items-center gap-4 mt-6">
      <span className="text-sm text-muted font-sans">Share:</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={18} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
        aria-label="Share on X"
      >
        <Twitter size={18} />
      </a>
    </div>
  )
}
