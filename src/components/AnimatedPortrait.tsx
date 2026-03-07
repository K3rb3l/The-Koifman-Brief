'use client'

import { useEffect, useRef, useState } from 'react'

const VIDEO_URL =
  'https://firebasestorage.googleapis.com/v0/b/the-koifman-brief.firebasestorage.app/o/images%2Fportrait.mp4?alt=media'

const STATIC_URL =
  'https://storage.googleapis.com/the-koifman-brief-images/images/shahar-koifman-sketch.png'

export function AnimatedPortrait({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    function handleCanPlay() {
      setLoaded(true)
      video!.play().catch(() => {})
    }

    video.addEventListener('canplay', handleCanPlay, { once: true })
    video.load()

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
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
        poster={STATIC_URL}
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 800ms ease-in-out',
        }}
      />
    </div>
  )
}
