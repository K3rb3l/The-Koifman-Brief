import { useEffect, useRef, useState } from 'react'

const PAUSE_MS = 1000
const FADE_MS = 800

export { FADE_MS }

export function useVideoFadeLoop() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [faded, setFaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

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
    video.addEventListener('ended', handleEnded)

    return () => {
      cancelled = true
      clearTimeout(timer)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  return { videoRef, faded }
}
