'use client'

import { useState, useEffect } from 'react'
import { getCachedVideoUrl, onVideoCached } from '@/lib/video-cache'

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
  const [imgLoaded, setImgLoaded] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoSrc, setVideoSrc] = useState(animationUrl)

  useEffect(() => {
    if (!animationUrl) return
    const cached = getCachedVideoUrl(animationUrl)
    if (cached) {
      setVideoSrc(cached)
      return
    }
    return onVideoCached(animationUrl, (blobUrl) => setVideoSrc(blobUrl))
  }, [animationUrl])

  function handleImgLoad() {
    setImgLoaded(true)
    onLoad?.()
  }

  if (videoSrc && !prefersReducedMotion()) {
    return (
      <>
        <div
          className="absolute inset-0 skeleton-shimmer rounded-lg"
          style={{ opacity: imgLoaded ? 0 : 1, transition: 'opacity 400ms ease-in-out', pointerEvents: 'none' }}
        />
        <img src={imageUrl} alt={alt} className={className} onLoad={handleImgLoad} />
        <video
          src={videoSrc}
          poster={imageUrl}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoReady(true)}
          className={className}
          style={{
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 400ms ease-in-out',
          }}
        />
      </>
    )
  }

  return (
    <>
      <div
        className="absolute inset-0 skeleton-shimmer rounded-lg"
        style={{ opacity: imgLoaded ? 0 : 1, transition: 'opacity 400ms ease-in-out', pointerEvents: 'none' }}
      />
      <img src={imageUrl} alt={alt} className={className} onLoad={handleImgLoad} />
    </>
  )
}
