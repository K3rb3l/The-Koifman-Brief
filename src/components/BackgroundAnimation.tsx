'use client'

import { useEffect, useRef, useState } from 'react'

const shapes = [
  { type: 'diamond' as const, x: '8%',  y: '12%', size: 12, dur: 30, delay: 0,  dx: 50,  dy: -35, opacity: 0.15, depth: 0.02 },
  { type: 'diamond' as const, x: '25%', y: '35%', size: 10, dur: 35, delay: 2,  dx: -40, dy: 25,  opacity: 0.12, depth: 0.03 },
  { type: 'diamond' as const, x: '72%', y: '18%', size: 14, dur: 28, delay: 5,  dx: 35,  dy: 40,  opacity: 0.18, depth: 0.015 },
  { type: 'diamond' as const, x: '55%', y: '65%', size: 10, dur: 32, delay: 8,  dx: -50, dy: -25, opacity: 0.14, depth: 0.025 },
  { type: 'diamond' as const, x: '88%', y: '45%', size: 12, dur: 38, delay: 3,  dx: 25,  dy: 50,  opacity: 0.13, depth: 0.035 },
  { type: 'diamond' as const, x: '40%', y: '82%', size: 14, dur: 26, delay: 6,  dx: -30, dy: -40, opacity: 0.16, depth: 0.02 },
  { type: 'diamond' as const, x: '15%', y: '58%', size: 10, dur: 34, delay: 10, dx: 45,  dy: 20,  opacity: 0.14, depth: 0.03 },
  { type: 'line' as const, x: '18%', y: '25%', size: 70, dur: 28, delay: 1,  dx: -25, dy: 35,  opacity: 0.14, angle: 35,  depth: 0.01 },
  { type: 'line' as const, x: '65%', y: '10%', size: 60, dur: 36, delay: 5,  dx: 35,  dy: -20, opacity: 0.16, angle: -20, depth: 0.02 },
  { type: 'line' as const, x: '82%', y: '70%', size: 75, dur: 24, delay: 3,  dx: -45, dy: 25,  opacity: 0.13, angle: 60,  depth: 0.025 },
  { type: 'line' as const, x: '35%', y: '50%', size: 55, dur: 40, delay: 7,  dx: 20,  dy: -45, opacity: 0.17, angle: -45, depth: 0.015 },
  { type: 'line' as const, x: '50%', y: '88%', size: 80, dur: 30, delay: 4,  dx: -40, dy: 30,  opacity: 0.15, angle: 15,  depth: 0.03 },
  { type: 'line' as const, x: '92%', y: '30%', size: 55, dur: 34, delay: 9,  dx: 25,  dy: 40,  opacity: 0.13, angle: -70, depth: 0.02 },
  { type: 'line' as const, x: '5%',  y: '75%', size: 65, dur: 26, delay: 6,  dx: 50,  dy: -25, opacity: 0.16, angle: 40,  depth: 0.035 },
  { type: 'line' as const, x: '45%', y: '5%',  size: 70, dur: 30, delay: 1,  dx: -20, dy: 50,  opacity: 0.14, angle: -30, depth: 0.01 },
]

export function BackgroundAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const mouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(false)
      return
    }

    function handleMouseMove(e: globalThis.MouseEvent) {
      // Normalize to center of viewport (-0.5 to 0.5)
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      }
    }

    function animate() {
      if (!containerRef.current) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      const els = containerRef.current.children
      for (let i = 0; i < els.length; i++) {
        const el = els[i] as HTMLElement
        const depth = shapes[i]?.depth ?? 0.02
        const tx = mouseRef.current.x * depth * window.innerWidth
        const ty = mouseRef.current.y * depth * window.innerHeight
        el.style.setProperty('--mouse-x', `${tx}px`)
        el.style.setProperty('--mouse-y', `${ty}px`)
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (!visible) return null

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none text-accent" aria-hidden="true">
      {shapes.map((shape, i) => (
        <svg
          key={i}
          className={`absolute geometric-drift ${i >= 7 ? 'hidden-mobile' : ''}`}
          style={{
            left: shape.x,
            top: shape.y,
            opacity: shape.opacity,
            ['--drift-x' as string]: `${shape.dx}px`,
            ['--drift-y' as string]: `${shape.dy}px`,
            animationDuration: `${shape.dur}s`,
            animationDelay: `${shape.delay}s`,
            translate: 'var(--mouse-x, 0) var(--mouse-y, 0)',
            willChange: 'translate',
          }}
          width={shape.type === 'diamond' ? shape.size : shape.size}
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
              transform={`rotate(${'angle' in shape ? shape.angle : 0} ${shape.size / 2} 2)`}
            />
          )}
        </svg>
      ))}
    </div>
  )
}
