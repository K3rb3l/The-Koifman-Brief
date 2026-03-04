'use client'

import { useEffect, useState } from 'react'

export function BrandMark() {
  const [reverse, setReverse] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true)
      return
    }

    const interval = setInterval(() => {
      setReverse((r) => !r)
      setAnimKey((k) => k + 1)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Forward: diamond(0-1.5s) → cross1(0.5s) → cross2(0.7s) → dot(1s)
  // Reverse: dot(0s) → cross2(0.1s) → cross1(0.3s) → diamond(0.5-2s)
  const fwd = !reverse

  return (
    <svg
      key={animKey}
      width="28"
      height="28"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 sm:w-9 sm:h-9"
      aria-hidden="true"
    >
      {/* Outer diamond */}
      <path
        d="M18 2 L34 18 L18 34 L2 18 Z"
        stroke="currentColor"
        strokeWidth="1"
        className="text-accent"
        style={reducedMotion ? undefined : {
          ['--dash-len' as string]: 128,
          strokeDasharray: 128,
          strokeDashoffset: fwd ? 128 : 0,
          animation: fwd
            ? 'drawStroke 1.5s ease-out forwards'
            : 'undrawStroke 1.5s ease-in 0.5s forwards',
        }}
      />
      {/* Inner cross - vertical */}
      <line
        x1="18" y1="8" x2="18" y2="28"
        stroke="currentColor"
        strokeWidth="0.75"
        className="text-accent"
        style={reducedMotion ? undefined : {
          ['--dash-len' as string]: 20,
          strokeDasharray: 20,
          strokeDashoffset: fwd ? 20 : 0,
          animation: fwd
            ? 'drawStroke 0.4s ease-out 0.5s forwards'
            : 'undrawStroke 0.4s ease-in 0.3s forwards',
        }}
      />
      {/* Inner cross - horizontal */}
      <line
        x1="8" y1="18" x2="28" y2="18"
        stroke="currentColor"
        strokeWidth="0.75"
        className="text-accent"
        style={reducedMotion ? undefined : {
          ['--dash-len' as string]: 20,
          strokeDasharray: 20,
          strokeDashoffset: fwd ? 20 : 0,
          animation: fwd
            ? 'drawStroke 0.4s ease-out 0.7s forwards'
            : 'undrawStroke 0.4s ease-in 0.1s forwards',
        }}
      />
      {/* Center dot */}
      <circle
        cx="18" cy="18" r="2"
        fill="currentColor"
        className="text-accent"
        style={reducedMotion ? undefined : {
          opacity: fwd ? 0 : 1,
          animation: fwd
            ? 'fadeInUp 0.3s ease-out 1s forwards'
            : 'fadeOut 0.3s ease-in forwards',
        }}
      />
    </svg>
  )
}
