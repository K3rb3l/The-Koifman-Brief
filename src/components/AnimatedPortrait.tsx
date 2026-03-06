'use client'

import { useEffect, useRef, useState } from 'react'
import { FADE_MS } from '@/hooks/useVideoFadeLoop'

const VIDEO_URL =
  'https://firebasestorage.googleapis.com/v0/b/the-koifman-brief.firebasestorage.app/o/images%2Fportrait.mp4?alt=media'

const STATIC_URL =
  'https://storage.googleapis.com/the-koifman-brief-images/images/shahar-koifman-sketch.png'

const PAUSE_MS = 1000

export function AnimatedPortrait({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [faded, setFaded] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    function handleCanPlay() {
      setLoaded(true)
      video!.play().catch(() => {})
    }

    function handleEnded() {
      setFaded(true)
      timer = setTimeout(() => {
        if (cancelled || !video) return
        video.currentTime = 0
        video.play().then(() => {
          requestAnimationFrame(() => {
            if (!cancelled) setFaded(false)
          })
        }).catch(() => {
          if (!cancelled) setFaded(false)
        })
      }, FADE_MS + PAUSE_MS)
    }

    video.loop = false
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('ended', handleEnded)
    video.load()

    return () => {
      cancelled = true
      clearTimeout(timer)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  return (
    <div className={className} style={{ overflow: 'hidden', position: 'relative' }}>
      <img
        src={STATIC_URL}
        alt="Shahar Koifman"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded && !faded ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease-in-out`,
        }}
      />
    </div>
  )
}
