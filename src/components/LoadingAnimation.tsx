'use client'

import { useEffect, useState } from 'react'

export function LoadingAnimation() {
  const [phase, setPhase] = useState<'loading' | 'exiting' | 'done'>('loading')

  useEffect(() => {
    // Skip if already shown this session
    if (sessionStorage.getItem('tkb-loaded')) {
      setPhase('done')
      return
    }

    // Start exit after animation plays
    const exitTimer = setTimeout(() => setPhase('exiting'), 2000)
    const doneTimer = setTimeout(() => {
      setPhase('done')
      sessionStorage.setItem('tkb-loaded', '1')
    }, 2600)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  // Check reduced motion preference
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('done')
      sessionStorage.setItem('tkb-loaded', '1')
    }
  }, [])

  if (phase === 'done') return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-all duration-500 ${
        phase === 'exiting' ? 'opacity-0 -translate-y-8' : 'opacity-100'
      }`}
    >
      {/* Large brand mark diamond */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M18 2 L34 18 L18 34 L2 18 Z"
          stroke="currentColor"
          strokeWidth="0.75"
          className="text-accent"
          style={{
            strokeDasharray: 128,
            strokeDashoffset: 128,
            animation: 'drawStroke 1.2s ease-out forwards',
          }}
        />
        <line
          x1="18" y1="8" x2="18" y2="28"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-accent"
          style={{
            strokeDasharray: 20,
            strokeDashoffset: 20,
            animation: 'drawStroke 0.6s ease-out 0.6s forwards',
          }}
        />
        <line
          x1="8" y1="18" x2="28" y2="18"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-accent"
          style={{
            strokeDasharray: 20,
            strokeDashoffset: 20,
            animation: 'drawStroke 0.6s ease-out 0.8s forwards',
          }}
        />
        <circle
          cx="18" cy="18" r="1.5"
          className="text-accent"
          style={{
            fill: 'currentColor',
            opacity: 0,
            animation: 'fadeInUp 0.3s ease-out 1.1s forwards',
          }}
        />
      </svg>

      {/* Horizontal line drawing outward from center */}
      <div className="relative w-48 h-px mt-6 overflow-hidden">
        <div
          className="absolute inset-y-0 left-1/2 bg-border"
          style={{
            animation: 'expandFromCenter 0.6s ease-out 1.2s forwards',
            width: 0,
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      {/* Title text */}
      <p
        className="mt-4 font-serif text-sm uppercase tracking-[0.3em] text-muted"
        style={{
          opacity: 0,
          animation: 'fadeInUp 0.5s ease-out 1.5s forwards',
        }}
      >
        The Koifman Brief
      </p>
    </div>
  )
}
