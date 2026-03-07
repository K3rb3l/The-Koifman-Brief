'use client'

import { useEffect, useRef } from 'react'
import { getCachedVideoUrl, onVideoCached } from '@/lib/video-cache'
import { useState } from 'react'

type CoverMediaProps = {
  imageUrl: string
  animationUrl?: string
  alt: string
  className?: string
  onLoad?: () => void
}

const VIEW_TRANSITION_DURATION = 0.5
const TIME_TRACK_INTERVAL_MS = 200

const videoTimeStore: Record<string, number> = {}

let transitionDone: Promise<void> = Promise.resolve()

export function setTransitionPromise(promise: Promise<void>) {
  transitionDone = promise
}

function getVideoTime(url: string): number {
  return videoTimeStore[url] || 0
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function useVideoSource(animationUrl?: string) {
  const [videoSrc, setVideoSrc] = useState(animationUrl)

  useEffect(() => {
    if (!animationUrl) return
    const cached = getCachedVideoUrl(animationUrl)
    if (cached) {
      setVideoSrc(cached)
      return
    }
    return onVideoCached(animationUrl, setVideoSrc)
  }, [animationUrl])

  return videoSrc
}

function useTrackPlaybackTime(videoRef: React.RefObject<HTMLVideoElement | null>, animationUrl?: string) {
  useEffect(() => {
    const video = videoRef.current
    if (!animationUrl || !video) return

    const onTimeUpdate = () => {
      videoTimeStore[animationUrl] = video.currentTime
    }
    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [animationUrl])
}

export function CoverMedia({ imageUrl, animationUrl, alt, className = '', onLoad }: CoverMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoSrc = useVideoSource(animationUrl)
  const showVideo = videoSrc && !prefersReducedMotion()

  useTrackPlaybackTime(videoRef, animationUrl)

  function handleVideoLoaded(e: React.SyntheticEvent<HTMLVideoElement>) {
    const video = e.currentTarget
    const savedTime = animationUrl ? getVideoTime(animationUrl) : 0
    if (savedTime > 0) {
      // Seek to the exact frame, then wait for transition to finish before playing
      video.currentTime = savedTime % video.duration
      transitionDone.then(() => video.play())
    } else {
      video.play()
    }
  }

  if (showVideo) {
    return (
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={handleVideoLoaded}
        className={className}
      />
    )
  }

  return <img src={imageUrl} alt={alt} className={className} onLoad={onLoad} />
}
