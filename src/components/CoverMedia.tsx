'use client'

import { useEffect, useState } from 'react'

type CoverMediaProps = {
  imageUrl: string
  animationUrl?: string
  alt: string
  className?: string
}

export function CoverMedia({ imageUrl, animationUrl, alt, className = '' }: CoverMediaProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (animationUrl && !prefersReducedMotion) {
    return (
      <video
        src={animationUrl}
        poster={imageUrl}
        autoPlay
        muted
        loop
        playsInline
        className={className}
      />
    )
  }

  return <img src={imageUrl} alt={alt} className={className} />
}
