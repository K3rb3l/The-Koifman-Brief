'use client'

import { useEffect, useRef, useState } from 'react'

type DiamondShape = { type: 'diamond'; x: number; y: number; size: number; dur: number; delay: number; dx: number; dy: number; opacity: number }
type LineShape = { type: 'line'; x: number; y: number; size: number; dur: number; delay: number; dx: number; dy: number; opacity: number; angle: number }
type Shape = DiamondShape | LineShape

type DustParticle = { x: number; y: number; r: number; dur: number; delay: number; speed: number }

const DIAMOND_COUNT = 7

const shapes: Shape[] = [
  { type: 'diamond', x: 8,  y: 12, size: 12, dur: 30, delay: 0,  dx: 50,  dy: -35, opacity: 0.15 },
  { type: 'diamond', x: 25, y: 35, size: 10, dur: 35, delay: 2,  dx: -40, dy: 25,  opacity: 0.12 },
  { type: 'diamond', x: 72, y: 18, size: 14, dur: 28, delay: 5,  dx: 35,  dy: 40,  opacity: 0.18 },
  { type: 'diamond', x: 55, y: 65, size: 10, dur: 32, delay: 8,  dx: -50, dy: -25, opacity: 0.14 },
  { type: 'diamond', x: 88, y: 45, size: 12, dur: 38, delay: 3,  dx: 25,  dy: 50,  opacity: 0.13 },
  { type: 'diamond', x: 40, y: 82, size: 14, dur: 26, delay: 6,  dx: -30, dy: -40, opacity: 0.16 },
  { type: 'diamond', x: 15, y: 58, size: 10, dur: 34, delay: 10, dx: 45,  dy: 20,  opacity: 0.14 },
  { type: 'line', x: 18, y: 25, size: 70, dur: 28, delay: 1,  dx: -25, dy: 35,  opacity: 0.14, angle: 35 },
  { type: 'line', x: 65, y: 10, size: 60, dur: 36, delay: 5,  dx: 35,  dy: -20, opacity: 0.16, angle: -20 },
  { type: 'line', x: 82, y: 70, size: 75, dur: 24, delay: 3,  dx: -45, dy: 25,  opacity: 0.13, angle: 60 },
  { type: 'line', x: 35, y: 50, size: 55, dur: 40, delay: 7,  dx: 20,  dy: -45, opacity: 0.17, angle: -45 },
  { type: 'line', x: 50, y: 88, size: 80, dur: 30, delay: 4,  dx: -40, dy: 30,  opacity: 0.15, angle: 15 },
  { type: 'line', x: 92, y: 30, size: 55, dur: 34, delay: 9,  dx: 25,  dy: 40,  opacity: 0.13, angle: -70 },
  { type: 'line', x: 5,  y: 75, size: 65, dur: 26, delay: 6,  dx: 50,  dy: -25, opacity: 0.16, angle: 40 },
  { type: 'line', x: 45, y: 5,  size: 70, dur: 30, delay: 1,  dx: -20, dy: 50,  opacity: 0.14, angle: -30 },
]

const dust: DustParticle[] = [
  { x: 12, y: 8,  r: 2,   dur: 22, delay: 0,  speed: 0.3 },
  { x: 85, y: 15, r: 1.5, dur: 28, delay: 3,  speed: 0.5 },
  { x: 45, y: 25, r: 2.5, dur: 18, delay: 1,  speed: 0.2 },
  { x: 70, y: 40, r: 1,   dur: 32, delay: 5,  speed: 0.6 },
  { x: 20, y: 55, r: 2,   dur: 24, delay: 2,  speed: 0.35 },
  { x: 90, y: 60, r: 1.5, dur: 26, delay: 4,  speed: 0.45 },
  { x: 35, y: 72, r: 2,   dur: 20, delay: 6,  speed: 0.25 },
  { x: 60, y: 85, r: 1,   dur: 30, delay: 1,  speed: 0.55 },
  { x: 8,  y: 90, r: 2.5, dur: 16, delay: 3,  speed: 0.15 },
  { x: 75, y: 30, r: 1.5, dur: 25, delay: 7,  speed: 0.4 },
  { x: 50, y: 50, r: 1,   dur: 34, delay: 2,  speed: 0.65 },
  { x: 30, y: 18, r: 2,   dur: 22, delay: 8,  speed: 0.3 },
]

const PULL_STRENGTH = 0.15
const PULL_RADIUS = 350

export function BackgroundAnimation() {
  const elementsRef = useRef<(SVGSVGElement | null)[]>([])
  const dustRef = useRef<(HTMLDivElement | null)[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const rafRef = useRef<number>(0)
  const [mode, setMode] = useState<'desktop' | 'mobile' | 'none'>('desktop')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode('none')
      return
    }
    setMode(window.innerWidth < 768 ? 'mobile' : 'desktop')
  }, [])

  // Desktop: cursor-following shapes
  useEffect(() => {
    if (mode !== 'desktop') return

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY }
    }

    function animate() {
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      elementsRef.current.forEach((el, i) => {
        if (!el) return
        const shape = shapes[i]
        const bx = (shape.x / 100) * window.innerWidth
        const by = (shape.y / 100) * document.documentElement.scrollHeight
        const dx = mx - bx
        const dy = my - by
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < PULL_RADIUS && mx > 0) {
          const factor = PULL_STRENGTH * (1 - dist / PULL_RADIUS)
          el.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`
        } else {
          el.style.transform = ''
        }
      })
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [mode])

  // Mobile: scroll-based parallax on dust particles
  useEffect(() => {
    if (mode !== 'mobile') return

    function handleScroll() {
      const scrollY = window.scrollY
      dustRef.current.forEach((el, i) => {
        if (!el) return
        const offset = scrollY * dust[i].speed
        el.style.transform = `translateY(${-offset}px)`
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mode])

  if (mode === 'none') return null

  if (mode === 'mobile') {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none text-accent opacity-[0.5] dark:opacity-100" aria-hidden="true">
        {dust.map((d, i) => (
          <div
            key={i}
            ref={(el) => { dustRef.current[i] = el }}
            className="absolute geometric-drift"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              ['--drift-x' as string]: `${(i % 2 ? 15 : -15)}px`,
              ['--drift-y' as string]: `${(i % 3 ? -10 : 10)}px`,
              animationDuration: `${d.dur}s`,
              animationDelay: `${d.delay}s`,
            }}
          >
            <svg width={d.r * 4} height={d.r * 4} viewBox={`0 0 ${d.r * 4} ${d.r * 4}`} style={{ opacity: 0.15 + d.speed * 0.3 }}>
              <circle cx={d.r * 2} cy={d.r * 2} r={d.r} fill="currentColor" />
            </svg>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none text-accent dark:opacity-100 opacity-[0.6]" aria-hidden="true">
      {shapes.map((shape, i) => (
        <div
          key={i}
          className={`absolute geometric-drift ${i >= DIAMOND_COUNT ? 'hidden-mobile' : ''}`}
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            ['--drift-x' as string]: `${shape.dx}px`,
            ['--drift-y' as string]: `${shape.dy}px`,
            animationDuration: `${shape.dur}s`,
            animationDelay: `${shape.delay}s`,
          }}
        >
          <svg
            ref={(el) => { elementsRef.current[i] = el }}
            style={{
              opacity: shape.opacity,
              transition: 'transform 0.6s ease-out',
            }}
            width={shape.size}
            height={shape.type === 'diamond' ? shape.size : 4}
            viewBox={shape.type === 'diamond' ? `0 0 ${shape.size} ${shape.size}` : `0 0 ${shape.size} 4`}
            fill="none"
          >
            {shape.type === 'diamond' ? (
              <rect
                x={shape.size / 2 - 3.5}
                y={shape.size / 2 - 3.5}
                width={7}
                height={7}
                fill="currentColor"
                transform={`rotate(45 ${shape.size / 2} ${shape.size / 2})`}
              />
            ) : (
              <line
                x1="0"
                y1="2"
                x2={shape.size}
                y2="2"
                stroke="currentColor"
                strokeWidth="1.5"
                transform={`rotate(${shape.type === 'line' ? shape.angle : 0} ${shape.size / 2} 2)`}
              />
            )}
          </svg>
        </div>
      ))}
    </div>
  )
}
