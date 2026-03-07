import { useRef } from 'react'

const FADE_MS = 800

export { FADE_MS }

export function useVideoFadeLoop() {
  const videoRef = useRef<HTMLVideoElement>(null)
  return { videoRef }
}
