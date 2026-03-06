'use client'

import { useVideoFadeLoop, FADE_MS } from '@/hooks/useVideoFadeLoop'

type CoverMediaProps = {
  imageUrl: string
  animationUrl?: string
  alt: string
  className?: string
  onLoad?: () => void
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function CoverMedia({ imageUrl, animationUrl, alt, className = '', onLoad }: CoverMediaProps) {
  const { videoRef, faded } = useVideoFadeLoop()

  if (animationUrl && !prefersReducedMotion()) {
    return (
      <>
        <img src={imageUrl} alt={alt} className={className} />
        <video
          ref={videoRef}
          src={animationUrl}
          poster={imageUrl}
          autoPlay
          muted
          playsInline
          onLoadedData={onLoad}
          className={className}
          style={{
            opacity: faded ? 0 : 1,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        />
      </>
    )
  }

  return <img src={imageUrl} alt={alt} className={className} onLoad={onLoad} />
}
