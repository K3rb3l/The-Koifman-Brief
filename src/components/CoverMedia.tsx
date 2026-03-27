'use client'

import { useState, useEffect, useRef } from 'react'
import { getCachedVideoUrl } from '@/lib/video-cache'

type CoverMediaProps = {
  imageUrl: string
  animationUrl?: string
  alt: string
  className?: string
  onLoad?: () => void
}

const videoTimeStore: Record<string, number> = {}

function getVideoTime(url: string): number {
  return videoTimeStore[url] || 0
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function CoverMedia({ imageUrl, animationUrl, alt, className = '', onLoad }: CoverMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [videoSrc] = useState(() => {
    if (!animationUrl) return undefined
    return getCachedVideoUrl(animationUrl) || animationUrl
  })

  useEffect(() => {
    const video = videoRef.current
    if (!animationUrl || !video) return
    const onTimeUpdate = () => { videoTimeStore[animationUrl] = video.currentTime }
    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [animationUrl, ready])

  function handleVideoLoaded(e: React.SyntheticEvent<HTMLVideoElement>) {
    const video = e.currentTarget
    const savedTime = animationUrl ? getVideoTime(animationUrl) : 0
    if (savedTime > 0) {
      video.currentTime = savedTime % video.duration
    }
    video.play().catch(() => {})
    setReady(true)
    onLoad?.()
  }

  const showVideo = videoSrc && !prefersReducedMotion()

  return (
    <>
      {/* Static image shows instantly as poster */}
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        style={{ zIndex: 1 }}
        onLoad={!showVideo ? onLoad : undefined}
      />
      {showVideo ? (
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedData={handleVideoLoaded}
          className={className}
          style={{ zIndex: ready ? 2 : -1, opacity: ready ? 1 : 0, transition: 'opacity 0.5s ease-in' }}
        />
      ) : null}
    </>
  )
}
