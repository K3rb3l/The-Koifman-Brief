'use client'

import { useEffect, useState } from 'react'

export function BrandMark() {
  const [drawn, setDrawn] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true)
      setDrawn(true)
      return
    }

    const drawTimer = setTimeout(() => setDrawn(true), 100)
    const animTimer = setTimeout(() => setAnimate(true), 2000)
    return () => { clearTimeout(drawTimer); clearTimeout(animTimer) }
  }, [])

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 sm:w-9 sm:h-9"
      aria-hidden="true"
    >
      {/* Outer diamond — top-right edge */}
      <path
        d="M18 2 L34 18"
        stroke="currentColor"
        strokeWidth="1"
        className="text-accent"
        style={reducedMotion ? undefined : {
          strokeDasharray: 32,
          strokeDashoffset: drawn ? 0 : 32,
          transition: drawn && !animate ? 'stroke-dashoffset 0.8s ease-out' : undefined,
          animation: animate ? 'bmEdgeA 9s ease-in-out infinite' : undefined,
        }}
      />
      {/* Outer diamond — bottom-right edge */}
      <path
        d="M34 18 L18 34"
        stroke="currentColor"
        strokeWidth="1"
        className="text-accent"
        style={reducedMotion ? undefined : {
          strokeDasharray: 32,
          strokeDashoffset: drawn ? 0 : 32,
          transition: drawn && !animate ? 'stroke-dashoffset 0.8s ease-out 0.2s' : undefined,
          animation: animate ? 'bmEdgeB 11s ease-in-out 1.5s infinite' : undefined,
        }}
      />
      {/* Outer diamond — bottom-left edge */}
      <path
        d="M18 34 L2 18"
        stroke="currentColor"
        strokeWidth="1"
        className="text-accent"
        style={reducedMotion ? undefined : {
          strokeDasharray: 32,
          strokeDashoffset: drawn ? 0 : 32,
          transition: drawn && !animate ? 'stroke-dashoffset 0.8s ease-out 0.4s' : undefined,
          animation: animate ? 'bmEdgeC 13s ease-in-out 0.8s infinite' : undefined,
        }}
      />
      {/* Outer diamond — top-left edge */}
      <path
        d="M2 18 L18 2"
        stroke="currentColor"
        strokeWidth="1"
        className="text-accent"
        style={reducedMotion ? undefined : {
          strokeDasharray: 32,
          strokeDashoffset: drawn ? 0 : 32,
          transition: drawn && !animate ? 'stroke-dashoffset 0.8s ease-out 0.6s' : undefined,
          animation: animate ? 'bmEdgeD 10s ease-in-out 3s infinite' : undefined,
        }}
      />
      {/* Overdraw — partial accent trace */}
      <path
        d="M18 2 L34 18 L18 34 L2 18 Z"
        stroke="currentColor"
        strokeWidth="1"
        className="text-foreground"
        style={reducedMotion ? { display: 'none' } : {
          strokeDasharray: 128,
          strokeDashoffset: 128,
          opacity: 0.25,
          animation: animate ? 'bmOverdraw 15s ease-in-out 2s infinite' : undefined,
        }}
      />
      {/* Inner cross — vertical */}
      <line
        x1="18" y1="8" x2="18" y2="28"
        stroke="currentColor"
        strokeWidth="0.75"
        className="text-accent"
        style={reducedMotion ? undefined : {
          strokeDasharray: 20,
          strokeDashoffset: drawn ? 0 : 20,
          transition: drawn && !animate ? 'stroke-dashoffset 0.4s ease-out 0.8s' : undefined,
          animation: animate ? 'bmCrossV 12s ease-in-out 0.5s infinite' : undefined,
        }}
      />
      {/* Inner cross — horizontal */}
      <line
        x1="8" y1="18" x2="28" y2="18"
        stroke="currentColor"
        strokeWidth="0.75"
        className="text-accent"
        style={reducedMotion ? undefined : {
          strokeDasharray: 20,
          strokeDashoffset: drawn ? 0 : 20,
          transition: drawn && !animate ? 'stroke-dashoffset 0.4s ease-out 1s' : undefined,
          animation: animate ? 'bmCrossH 14s ease-in-out 2.5s infinite' : undefined,
        }}
      />
      {/* Center dot */}
      <circle
        cx="18" cy="18" r="2"
        fill="currentColor"
        className="text-accent"
        style={reducedMotion ? undefined : {
          opacity: drawn ? 1 : 0,
          transition: drawn && !animate ? 'opacity 0.3s ease-out 1.2s' : undefined,
          animation: animate ? 'bmDot 9s ease-in-out 1s infinite' : undefined,
        }}
      />
    </svg>
  )
}
