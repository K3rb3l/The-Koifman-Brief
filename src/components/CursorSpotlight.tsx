'use client'

import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react'

type CursorSpotlightProps = {
  children: ReactNode
  className?: string
}

export function CursorSpotlight({ children, className = '' }: CursorSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ref.current.style.setProperty('--spot-x', `${x}px`)
    ref.current.style.setProperty('--spot-y', `${y}px`)
    ref.current.style.setProperty('--spot-opacity', '1')
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.setProperty('--spot-opacity', '0')
  }, [])

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ['--spot-opacity' as string]: '0' }}
    >
      {/* Spotlight gradient — no overflow clip, bleeds freely past edges */}
      <div
        className="pointer-events-none absolute -inset-32 z-10 transition-opacity duration-500"
        style={{
          opacity: 'var(--spot-opacity, 0)',
          background: 'radial-gradient(500px circle at calc(var(--spot-x, 0) + 8rem) calc(var(--spot-y, 0) + 8rem), rgba(184, 134, 11, 0.07), transparent 65%)',
        }}
      />
      {children}
    </div>
  )
}
