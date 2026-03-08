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
      {!ready && (
        <div className="absolute inset-0 skeleton-shimmer rounded-lg" style={{ zIndex: 1 }} />
      )}
      {showVideo ? (
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={handleVideoLoaded}
          className={className}
          style={{ zIndex: 2 }}
        />
      ) : null}
    </>
  )
}
