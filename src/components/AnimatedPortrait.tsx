'use client'

import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

const VIDEO_URL =
  'https://firebasestorage.googleapis.com/v0/b/the-koifman-brief.firebasestorage.app/o/images%2Fportrait.mp4?alt=media'

const STATIC_URL =
  'https://storage.googleapis.com/the-koifman-brief-images/images/shahar-koifman-sketch.png'

export function AnimatedPortrait({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)

  useGSAP(() => {
    const video = videoRef.current
    if (!video) return

    function handleCanPlay() {
      setLoaded(true)
      gsap.to(video, { opacity: 1, duration: 0.8, ease: 'power2.inOut' })
      video!.play().catch(() => {})
    }

    video.addEventListener('canplay', handleCanPlay, { once: true })
    video.load()

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
    }
  })

  return (
    <div className={className} style={{ overflow: 'hidden', position: 'relative' }}>
      <div
        className="absolute inset-0 skeleton-shimmer rounded-full"
        style={{ opacity: loaded ? 0 : 1, transition: 'opacity 400ms ease-in-out', pointerEvents: 'none' }}
      />
      <video
        ref={videoRef}
        src={VIDEO_URL}
        loop
        muted
        playsInline
        preload="auto"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
        }}
      />
    </div>
  )
}
