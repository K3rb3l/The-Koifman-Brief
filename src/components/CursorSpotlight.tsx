'use client'

import { useEffect, useRef, useCallback, type ReactNode } from 'react'

type CursorSpotlightProps = {
  children: ReactNode
  className?: string
}

export function CursorSpotlight({ children, className = '' }: CursorSpotlightProps) {
  return <div className={className}>{children}</div>
}

export function GlobalCursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!ref.current) return
    ref.current.style.setProperty('--spot-x', `${e.clientX}px`)
    ref.current.style.setProperty('--spot-y', `${e.clientY}px`)
    ref.current.style.setProperty('--spot-opacity', '1')
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.setProperty('--spot-opacity', '0')
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave])

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-700"
      style={{
        opacity: 'var(--spot-opacity, 0)',
        background: 'radial-gradient(600px circle at var(--spot-x, -1000px) var(--spot-y, -1000px), rgba(184, 134, 11, 0.06), transparent 65%)',
      }}
    />
  )
}
