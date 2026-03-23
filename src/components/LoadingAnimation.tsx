'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

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

export function LoadingAnimation() {
  const [active, setActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldAnimate()) {
      setActive(true)
    } else {
      clearIntroStyles()
    }
  }, [])

  useGSAP(() => {
    if (!active) return
    const el = containerRef.current
    if (!el) return

    const leftCurtain = el.querySelector('[data-left-curtain]') as HTMLElement
    const rightCurtain = el.querySelector('[data-right-curtain]') as HTMLElement
    const centerContent = el.querySelector('[data-center]') as HTMLElement
    const particlesContainer = el.querySelector('[data-particles]') as HTMLElement
    const glowEl = el.querySelector('[data-glow]') as HTMLElement
    const diamondPaths = el.querySelectorAll('[data-diamond-path]')
    const crossV = el.querySelector('[data-cross-v]') as SVGLineElement
    const crossH = el.querySelector('[data-cross-h]') as SVGLineElement
    const centerDot = el.querySelector('[data-center-dot]') as SVGCircleElement
    const expandLine = el.querySelector('[data-expand-line]') as HTMLElement
    const letterEls = el.querySelectorAll('[data-letter]')
    const tagline = el.querySelector('[data-tagline]') as HTMLElement
    const particleEls = el.querySelectorAll('[data-particle]')

    const tl = gsap.timeline({
      onComplete() {
        setActive(false)
      },
    })

    // Particle float (background, overlapping with main timeline)
    particleEls.forEach((p, i) => {
      const particle = particles[i]
      gsap.fromTo(p,
        { opacity: 0, y: 0, x: 0 },
        {
          opacity: 0,
          y: '-40vh',
          x: particle.drift,
          duration: particle.dur,
          delay: particle.delay,
          ease: 'power1.inOut',
          keyframes: {
            opacity: [0, 0.6, 0.4, 0.2, 0],
          },
        },
      )
    })

    // Golden glow pulse
    tl.fromTo(glowEl,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
      0.5,
    )
    tl.to(glowEl, { opacity: 0, scale: 1.5, duration: 0.7, ease: 'power2.in' }, 0.9)

    // Diamond stroke draw
    diamondPaths.forEach((path) => {
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 0.7,
        ease: 'power2.out',
      }, 0.15)
    })

    // Crosshairs
    tl.to(crossV, { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' }, 0.7)
    tl.to(crossH, { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' }, 0.85)

    // Center dot
    tl.fromTo(centerDot,
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out', transformOrigin: 'center' },
      1.0,
    )

    // Expanding line
    tl.fromTo(expandLine,
      { width: 0 },
      { width: '100%', duration: 0.4, ease: 'power2.out' },
      1.1,
    )

    // Letter stagger
    tl.fromTo(letterEls,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out', stagger: 0.025 },
      1.2,
    )

    // Tagline
    tl.fromTo(tagline,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      1.7,
    )

    // Exit phase at 2s — fade center, split curtains
    tl.to([centerContent, particlesContainer], {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.out',
    }, 2.0)
    tl.call(() => clearIntroStyles(), [], 2.0)
    tl.to(leftCurtain, {
      x: '-100%',
      duration: 0.6,
      ease: 'power4.inOut',
    }, 2.0)
    tl.to(rightCurtain, {
      x: '100%',
      duration: 0.6,
      ease: 'power4.inOut',
    }, 2.0)
  }, { scope: containerRef, dependencies: [active] })

  if (!active) return null

  const title = 'THE KOIFMAN BRIEF'

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100]"
      aria-hidden="true"
      style={{ pointerEvents: 'auto' }}
    >
      <div data-left-curtain className="absolute top-0 bottom-0 left-0 w-1/2" style={{ background: '#0A0A08' }} />
      <div data-right-curtain className="absolute top-0 bottom-0 right-0 w-1/2" style={{ background: '#0A0A08' }} />

      <div data-particles className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            data-particle
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: '#D4A843',
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div data-center className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div
            data-glow
            className="absolute w-[200px] h-[200px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(212,168,67,0.18) 0%, transparent 70%)',
              opacity: 0,
            }}
          />

          <svg width="80" height="80" viewBox="0 0 36 36" fill="none" className="relative">
            <defs>
              <filter id="goldGlow">
                <feGaussianBlur stdDeviation="1.5" />
              </filter>
            </defs>
            <path data-diamond-path d="M18 2 L34 18 L18 34 L2 18 Z" stroke="#D4A843" strokeWidth="2.5" fill="none" opacity="0.25" filter="url(#goldGlow)" style={{ strokeDasharray: 128, strokeDashoffset: 128 }} />
            <path data-diamond-path d="M18 2 L34 18 L18 34 L2 18 Z" stroke="#D4A843" strokeWidth="0.75" fill="none" style={{ strokeDasharray: 128, strokeDashoffset: 128 }} />
            <line data-cross-v x1="18" y1="8" x2="18" y2="28" stroke="#D4A843" strokeWidth="0.5" style={{ strokeDasharray: 20, strokeDashoffset: 20 }} />
            <line data-cross-h x1="8" y1="18" x2="28" y2="18" stroke="#D4A843" strokeWidth="0.5" style={{ strokeDasharray: 20, strokeDashoffset: 20 }} />
            <circle data-center-dot cx="18" cy="18" r="1.5" fill="#D4A843" style={{ opacity: 0 }} />
          </svg>
        </div>

        <div className="relative w-60 h-px mt-8 overflow-hidden">
          <div
            data-expand-line
            className="absolute inset-y-0 left-1/2 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, #D4A843 40%, #D4A843 60%, transparent)',
              width: 0,
              transform: 'translateX(-50%)',
            }}
          />
        </div>

        <div
          className="mt-5 font-serif text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.25em]"
          style={{ color: '#D4A843' }}
        >
          {title.split('').map((letter, i) => (
            <span key={i} data-letter className="inline-block" style={{ opacity: 0 }}>
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>

        <p
          data-tagline
          className="mt-3 font-sans text-xs uppercase tracking-[0.2em]"
          style={{ color: '#6A6050', opacity: 0 }}
        >
          Clarity in complexity
        </p>
      </div>
    </div>
  )
}
