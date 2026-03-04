'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const GIF_URL =
  'https://firebasestorage.googleapis.com/v0/b/the-koifman-brief.firebasestorage.app/o/Video_Generation_With_No_Lip_Movement-ezgif.com-optimize.gif?alt=media&token=e7db0df3-70d1-4f32-b4f7-a58cf044a0ca'

const STATIC_URL =
  'https://storage.googleapis.com/the-koifman-brief-images/images/shahar-koifman-sketch.png'

const PAUSE_MS = 5000
const FRAME_MS = 16

export function AnimatedPortrait({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState(false)
  const framesRef = useRef<ImageData[]>([])

  const init = useCallback(async () => {
    try {
      const { parseGIF, decompressFrames } = await import('gifuct-js')

      const response = await fetch(GIF_URL)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = await response.arrayBuffer()
      const gif = parseGIF(buffer)
      const decompressed = decompressFrames(gif, true)

      if (decompressed.length === 0) {
        setError(true)
        return
      }

      const { width, height } = gif.lsd

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = width
      tempCanvas.height = height
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) {
        setError(true)
        return
      }

      const allFrames: ImageData[] = []

      for (const frame of decompressed) {
        const patch = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height,
        )

        if (frame.disposalType === 2) {
          tempCtx.clearRect(0, 0, width, height)
        }

        const patchCanvas = document.createElement('canvas')
        patchCanvas.width = frame.dims.width
        patchCanvas.height = frame.dims.height
        patchCanvas.getContext('2d')!.putImageData(patch, 0, 0)
        tempCtx.drawImage(patchCanvas, frame.dims.left, frame.dims.top)

        // Store as ImageData directly — avoids ArrayBuffer copying issues
        allFrames.push(tempCtx.getImageData(0, 0, width, height))
      }

      framesRef.current = allFrames
      setReady(true)
    } catch (err) {
      console.error('AnimatedPortrait: failed to load', err)
      setError(true)
    }
  }, [])

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (!ready || !canvasRef.current) return

    const frames = framesRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx || frames.length === 0) return

    const { width, height } = frames[0]
    canvas.width = width
    canvas.height = height

    ctx.putImageData(frames[0], 0, 0)
    requestAnimationFrame(() => setVisible(true))

    let cancelled = false

    async function animate() {
      const total = frames.length

      try {
        while (!cancelled) {
          for (let i = 0; i < total && !cancelled; i++) {
            ctx!.putImageData(frames[i], 0, 0)
            await new Promise((r) => setTimeout(r, FRAME_MS))
          }
          if (cancelled) break

          await new Promise((r) => setTimeout(r, PAUSE_MS))
          if (cancelled) break

          for (let i = total - 1; i >= 0 && !cancelled; i--) {
            ctx!.putImageData(frames[i], 0, 0)
            await new Promise((r) => setTimeout(r, FRAME_MS))
          }
          if (cancelled) break

          await new Promise((r) => setTimeout(r, PAUSE_MS))
        }
      } catch {
        // Animation failed — canvas stays on last drawn frame
      }
    }

    animate()
    return () => { cancelled = true }
  }, [ready])

  // On error or if frames never load, just show the static image
  if (error) {
    return (
      <img
        src={STATIC_URL}
        alt="Shahar Koifman"
        className={className}
      />
    )
  }

  return (
    <div className={className} style={{ overflow: 'hidden', position: 'relative' }}>
      <img
        src={STATIC_URL}
        alt="Shahar Koifman"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          inset: 0,
          opacity: visible ? 0 : 1,
          transition: 'opacity 0.8s ease-in-out',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease-in-out',
        }}
        role="img"
        aria-label="Shahar Koifman"
      />
    </div>
  )
}
