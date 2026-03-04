'use client'

import { useEffect, useState } from 'react'

export function BrandMark() {
  const [animKey, setAnimKey] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true)
      return
    }

    const interval = setInterval(() => {
      setAnimKey((k) => k + 1)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

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
          strokeDasharray: 128,
          strokeDashoffset: 128,
          animation: 'drawStroke 1.5s ease-out forwards',
        }}
      />
      {/* Inner cross */}
      <line
        x1="18" y1="8" x2="18" y2="28"
        stroke="currentColor"
        strokeWidth="0.75"
        className="text-accent"
        style={reducedMotion ? undefined : {
          strokeDasharray: 20,
          strokeDashoffset: 20,
          animation: 'drawStroke 0.4s ease-out 0.5s forwards',
        }}
      />
      <line
        x1="8" y1="18" x2="28" y2="18"
        stroke="currentColor"
        strokeWidth="0.75"
        className="text-accent"
        style={reducedMotion ? undefined : {
          strokeDasharray: 20,
          strokeDashoffset: 20,
          animation: 'drawStroke 0.4s ease-out 0.7s forwards',
        }}
      />
      {/* Center dot */}
      <circle
        cx="18" cy="18" r="2"
        fill="currentColor"
        className="text-accent"
        style={reducedMotion ? undefined : {
          opacity: 0,
          animation: 'fadeInUp 0.3s ease-out 1s forwards',
        }}
      />
    </svg>
  )
}
