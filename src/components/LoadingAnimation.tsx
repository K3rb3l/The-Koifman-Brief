'use client'

import { useEffect, useState } from 'react'

function clearIntroStyles() {
  document.body.style.overflow = ''
}

function shouldAnimate(): boolean {
  try {
    const COOLDOWN_MS = 60 * 60 * 1000
    const STORAGE_KEY = 'tkb-intro-last'

    const navType = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const isHardLoad = !navType || navType.type === 'navigate' || navType.type === 'reload'
    if (!isHardLoad) return false

    const lastShown = Number(localStorage.getItem(STORAGE_KEY) || 0)
    if (Date.now() - lastShown < COOLDOWN_MS) return false

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    return true
  } catch {
    return false
  }
}

export function LoadingAnimation() {
  const [phase, setPhase] = useState<'animate' | 'exit' | 'done'>('done')

  useEffect(() => {
    if (!shouldAnimate()) {
      clearIntroStyles()
      return
    }
    setPhase('animate')

    const exitTimer = setTimeout(() => {
      clearIntroStyles()
      setPhase('exit')
    }, 2000)
    const doneTimer = setTimeout(() => {
      setPhase('done')
    }, 2600)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  if (phase === 'done') return null

  const title = 'THE KOIFMAN BRIEF'

  // Golden dust particles — predefined positions to avoid hydration issues
  const particles = [
    { left: '7%',  top: '80%', size: 1.5, delay: 0.2, dur: 4.5, drift: 15 },
    { left: '15%', top: '65%', size: 1,   delay: 0.8, dur: 5,   drift: -10 },
    { left: '22%', top: '90%', size: 2,   delay: 0.4, dur: 4,   drift: 20 },
    { left: '30%', top: '75%', size: 1,   delay: 1.2, dur: 5.5, drift: -8 },
    { left: '38%', top: '85%', size: 1.5, delay: 0.6, dur: 4.2, drift: 12 },
    { left: '45%', top: '70%', size: 1,   delay: 1.5, dur: 5.2, drift: -15 },
    { left: '52%', top: '88%', size: 2,   delay: 0.3, dur: 4.8, drift: 8 },
    { left: '58%', top: '72%', size: 1,   delay: 1.0, dur: 5.4, drift: -20 },
    { left: '65%', top: '82%', size: 1.5, delay: 0.7, dur: 4.3, drift: 18 },
    { left: '72%', top: '68%', size: 1,   delay: 1.3, dur: 5.1, drift: -12 },
    { left: '78%', top: '92%', size: 2,   delay: 0.1, dur: 4.6, drift: 10 },
    { left: '85%', top: '76%', size: 1,   delay: 0.9, dur: 5.3, drift: -18 },
    { left: '92%', top: '84%', size: 1.5, delay: 1.1, dur: 4.1, drift: 14 },
    { left: '12%', top: '55%', size: 1,   delay: 1.8, dur: 5.6, drift: -6 },
    { left: '42%', top: '60%', size: 1.5, delay: 0.5, dur: 4.7, drift: 16 },
    { left: '68%', top: '58%', size: 1,   delay: 1.6, dur: 5.8, drift: -14 },
    { left: '88%', top: '62%', size: 1.5, delay: 0.0, dur: 4.4, drift: 22 },
    { left: '25%', top: '95%', size: 2,   delay: 1.4, dur: 4.9, drift: -16 },
    { left: '50%', top: '78%', size: 1,   delay: 0.3, dur: 5.7, drift: 11 },
    { left: '35%', top: '50%', size: 1.5, delay: 2.0, dur: 5.0, drift: -9 },
  ]

  return (
    <div
      className="fixed inset-0 z-[100]"
      aria-hidden="true"
      style={{ pointerEvents: phase === 'exit' ? 'none' : 'auto' }}
    >
      {/* Left curtain */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1/2"
        style={{
          background: '#0A0A08',
          transform: phase === 'exit' ? 'translateX(-100%)' : 'translateX(0)',
          transition: phase === 'exit' ? 'transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)' : 'none',
        }}
      />
      {/* Right curtain */}
      <div
        className="absolute top-0 bottom-0 right-0 w-1/2"
        style={{
          background: '#0A0A08',
          transform: phase === 'exit' ? 'translateX(100%)' : 'translateX(0)',
          transition: phase === 'exit' ? 'transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)' : 'none',
        }}
      />

      {/* Floating golden particles */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          opacity: phase === 'exit' ? 0 : 1,
          transition: phase === 'exit' ? 'opacity 0.4s ease-out' : 'none',
        }}
      >
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: '#D4A843',
              opacity: 0,
              animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s forwards`,
              ['--drift' as string]: `${p.drift}px`,
            }}
          />
        ))}
      </div>

      {/* Center content — fades out before curtains split */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          opacity: phase === 'exit' ? 0 : 1,
          transition: phase === 'exit' ? 'opacity 0.35s ease-out' : 'none',
        }}
      >
        {/* SVG + glow wrapper */}
        <div className="relative flex items-center justify-center">
          {/* Radial golden glow pulse */}
          <div
            className="absolute w-[200px] h-[200px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(212,168,67,0.18) 0%, transparent 70%)',
              opacity: 0,
              animation: 'loadingGlow 1.2s ease-out 0.5s forwards',
            }}
          />

          {/* Diamond brand mark */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 36 36"
            fill="none"
            className="relative"
          >
            <defs>
              <filter id="goldGlow">
                <feGaussianBlur stdDeviation="1.5" />
              </filter>
            </defs>

            {/* Glow layer — blurred gold stroke */}
            <path
              d="M18 2 L34 18 L18 34 L2 18 Z"
              stroke="#D4A843"
              strokeWidth="2.5"
              fill="none"
              opacity="0.25"
              filter="url(#goldGlow)"
              style={{
                strokeDasharray: 128,
                strokeDashoffset: 128,
                animation: 'drawStroke 0.7s ease-out 0.15s forwards',
              }}
            />
            {/* Sharp diamond outline */}
            <path
              d="M18 2 L34 18 L18 34 L2 18 Z"
              stroke="#D4A843"
              strokeWidth="0.75"
              fill="none"
              style={{
                strokeDasharray: 128,
                strokeDashoffset: 128,
                animation: 'drawStroke 0.7s ease-out 0.15s forwards',
              }}
            />
            {/* Vertical crosshair */}
            <line
              x1="18" y1="8" x2="18" y2="28"
              stroke="#D4A843"
              strokeWidth="0.5"
              style={{
                strokeDasharray: 20,
                strokeDashoffset: 20,
                animation: 'drawStroke 0.25s ease-out 0.7s forwards',
              }}
            />
            {/* Horizontal crosshair */}
            <line
              x1="8" y1="18" x2="28" y2="18"
              stroke="#D4A843"
              strokeWidth="0.5"
              style={{
                strokeDasharray: 20,
                strokeDashoffset: 20,
                animation: 'drawStroke 0.25s ease-out 0.85s forwards',
              }}
            />
            {/* Center dot */}
            <circle
              cx="18"
              cy="18"
              r="1.5"
              fill="#D4A843"
              style={{
                opacity: 0,
                animation: 'fadeInUp 0.2s ease-out 1.0s forwards',
              }}
            />
          </svg>
        </div>

        {/* Decorative gradient line expanding from center */}
        <div className="relative w-60 h-px mt-8 overflow-hidden">
          <div
            className="absolute inset-y-0 left-1/2 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, #D4A843 40%, #D4A843 60%, transparent)',
              animation: 'expandFromCenter 0.4s ease-out 1.1s forwards',
              width: 0,
              transform: 'translateX(-50%)',
            }}
          />
        </div>

        {/* Title — letter-by-letter stagger reveal */}
        <div
          className="mt-5 font-serif text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.25em]"
          style={{ color: '#D4A843' }}
        >
          {title.split('').map((letter, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                opacity: 0,
                transform: 'translateY(12px)',
                animation: `fadeInUp 0.2s ease-out ${1.2 + i * 0.025}s forwards`,
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          className="mt-3 font-sans text-xs uppercase tracking-[0.2em]"
          style={{
            color: '#6A6050',
            opacity: 0,
            animation: 'fadeInUp 0.3s ease-out 1.7s forwards',
          }}
        >
          Clarity in complexity
        </p>
      </div>
    </div>
  )
}
