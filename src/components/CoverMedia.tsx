'use client'

import { useState, useEffect, useRef } from 'react'
import { getCachedVideoUrl, onVideoCached } from '@/lib/video-cache'

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
  const [videoSrc, setVideoSrc] = useState(() => {
    if (!animationUrl) return undefined
    return getCachedVideoUrl(animationUrl) || animationUrl
  })

  useEffect(() => {
    if (!animationUrl) return
    const cached = getCachedVideoUrl(animationUrl)
    if (cached) {
      setVideoSrc(cached)
      return
    }
    return onVideoCached(animationUrl, (blobUrl) => setVideoSrc(blobUrl))
  }, [animationUrl])

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
      <div
        className="absolute inset-0 skeleton-shimmer rounded-lg"
        style={{ opacity: ready ? 0 : 1, transition: 'opacity 400ms ease-in-out', pointerEvents: 'none' }}
      />
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
          style={{ opacity: ready ? 1 : 0, transition: 'opacity 400ms ease-in-out' }}
        />
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          className={className}
          onLoad={() => { setReady(true); onLoad?.() }}
          style={{ opacity: ready ? 1 : 0, transition: 'opacity 400ms ease-in-out' }}
        />
      )}
    </>
  )
}
