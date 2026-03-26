'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import { gsap, useGSAP } from '@/lib/gsap'

type TorchClapProps = {
  slug: string
  initialClaps: number
}

const MAX_CLAPS = 50
const STORAGE_KEY = (slug: string) => `tkb_claps_${slug}`
const SPARK_COLORS = ['#B8860B', '#D4A843', '#FF8C00', '#FFA500', '#FFD700']

export function TorchClap({ slug, initialClaps }: TorchClapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const flameGroupRef = useRef<SVGGElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)
  const flickerTlRef = useRef<gsap.core.Timeline | null>(null)

  const [userClaps, setUserClaps] = useState(0)
  const [totalClaps, setTotalClaps] = useState(initialClaps)
  const pendingRef = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLit = userClaps > 0
  // Continuous scale: 0 at 0 claps, ramps from 0.4 to 1.0 over 1-50
  const flameScale = userClaps === 0 ? 0 : 0.4 + (userClaps / MAX_CLAPS) * 0.6

  // Load saved claps
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(STORAGE_KEY(slug)) ?? '0', 10)
      if (!isNaN(saved) && saved > 0) setUserClaps(Math.min(saved, MAX_CLAPS))
    } catch { /* */ }
  }, [slug])

  // Animate flame scale continuously as userClaps changes
  useEffect(() => {
    if (!flameGroupRef.current) return
    if (flameScale === 0) {
      gsap.set(flameGroupRef.current, { scale: 0, autoAlpha: 0, svgOrigin: '20 26' })
    } else {
      gsap.to(flameGroupRef.current, {
        scale: flameScale,
        autoAlpha: 1,
        duration: 0.3,
        ease: 'back.out(2)',
        svgOrigin: '20 26',
      })
    }
  }, [flameScale])

  // Continuous flame flicker
  useGSAP(() => {
    if (!isLit || !flameGroupRef.current) return

    const flames = flameGroupRef.current.querySelectorAll('[data-flame]')
    if (!flames.length) return

    function flicker() {
      const tl = gsap.timeline({ onComplete: flicker })
      flames.forEach((flame, i) => {
        tl.to(flame, {
          y: (Math.random() - 0.5) * 6,
          scaleY: 0.85 + Math.random() * 0.3,
          scaleX: 0.9 + Math.random() * 0.2,
          opacity: 0.7 + Math.random() * 0.3,
          duration: 0.15 + Math.random() * 0.2,
          ease: 'sine.inOut',
          svgOrigin: '20 26',
        } as gsap.TweenVars, i * 0.05)
      })
      flickerTlRef.current = tl
    }

    flicker()
    return () => { flickerTlRef.current?.kill() }
  }, { scope: containerRef, dependencies: [isLit] })

  // Glow pulse
  useGSAP(() => {
    if (!isLit || !glowRef.current) return
    gsap.to(glowRef.current, {
      opacity: 0.15,
      scale: 1.2,
      duration: 1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      transformOrigin: '50% 50%',
    })
  }, { scope: containerRef, dependencies: [isLit] })

  const spawnSparks = useCallback((anchorEl: HTMLElement) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const rect = anchorEl.getBoundingClientRect()
    const originX = rect.left + rect.width / 2
    const originY = rect.top + 8

    for (let i = 0; i < 8; i++) {
      const dot = document.createElement('div')
      Object.assign(dot.style, {
        position: 'fixed',
        width: `${3 + Math.random() * 3}px`,
        height: `${3 + Math.random() * 3}px`,
        borderRadius: '50%',
        background: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
        left: `${originX}px`,
        top: `${originY}px`,
        pointerEvents: 'none',
        zIndex: '9999',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 4px currentColor',
      })
      document.body.appendChild(dot)

      gsap.to(dot, {
        x: (Math.random() - 0.5) * 50,
        y: -30 - Math.random() * 40,
        opacity: 0,
        scale: 0,
        duration: 0.4 + Math.random() * 0.4,
        ease: 'power2.out',
        onComplete: () => dot.remove(),
      })
    }
  }, [])

  const syncToServer = useCallback(async (count: number) => {
    if (count === 0) return
    try {
      const clapPost = httpsCallable<{ slug: string; count: number }, { totalClaps: number }>(functions, 'clapPost')
      const result = await clapPost({ slug, count })
      setTotalClaps(result.data.totalClaps)
    } catch {
      // Silent — optimistic count remains
    }
    pendingRef.current = 0
  }, [slug])

  const handleClap = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (userClaps >= MAX_CLAPS) return

    const next = userClaps + 1
    setUserClaps(next)
    setTotalClaps(prev => prev + 1)
    try { localStorage.setItem(STORAGE_KEY(slug), String(next)) } catch { /* */ }

    pendingRef.current += 1

    // Punch animation
    if (flameGroupRef.current) {
      const targetScale = 0.4 + (next / MAX_CLAPS) * 0.6
      gsap.fromTo(flameGroupRef.current,
        { scale: targetScale * 1.4, svgOrigin: '20 26' },
        { scale: targetScale, duration: 0.25, ease: 'elastic.out(1, 0.4)', svgOrigin: '20 26' },
      )
    }

    spawnSparks(e.currentTarget)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => syncToServer(pendingRef.current), 500)
  }, [userClaps, slug, spawnSparks, syncToServer])

  const atMax = userClaps >= MAX_CLAPS
  const displayTotal = totalClaps > 0 ? totalClaps : null

  return (
    <div ref={containerRef}>
      {/* Desktop: fixed left-side */}
      <div
        className="hidden md:flex fixed top-1/2 -translate-y-1/2 flex-col items-center gap-2 z-40"
        style={{ left: 'max(1rem, calc((100vw - 48rem) / 2 - 5rem))' }}
      >
        <button
          onClick={handleClap}
          disabled={atMax}
          aria-label={atMax ? 'Maximum claps reached' : `Clap (${userClaps}/${MAX_CLAPS})`}
          className="cursor-pointer transition-transform hover:scale-110 active:scale-95 disabled:cursor-default disabled:opacity-60 disabled:hover:scale-100"
        >
          <TorchSvg flameGroupRef={flameGroupRef} glowRef={glowRef} isLit={isLit} size={36} />
        </button>
        {displayTotal !== null && (
          <span className="text-xs font-sans text-muted tabular-nums select-none">
            {displayTotal.toLocaleString()}
          </span>
        )}
      </div>

      {/* Mobile: bottom-right */}
      <div className="flex md:hidden fixed bottom-6 right-4 z-40">
        <button
          onClick={handleClap}
          disabled={atMax}
          aria-label={atMax ? 'Maximum claps reached' : `Clap (${userClaps}/${MAX_CLAPS})`}
          className="flex items-center gap-2 px-3 py-2 bg-surface/90 backdrop-blur-sm border border-border rounded-full shadow-lg cursor-pointer active:scale-95 disabled:cursor-default disabled:opacity-60"
        >
          <TorchSvgSimple isLit={isLit} size={20} />
          {displayTotal !== null && (
            <span className="text-xs font-sans text-muted tabular-nums pr-1 select-none">
              {displayTotal.toLocaleString()}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

// Desktop torch — with refs for GSAP animation
function TorchSvg({ flameGroupRef, glowRef, isLit, size }: {
  flameGroupRef: React.RefObject<SVGGElement | null>
  glowRef: React.RefObject<SVGCircleElement | null>
  isLit: boolean
  size: number
}) {
  return (
    <svg width={size} height={size * 2.2} viewBox="-5 -10 50 100" fill="none" aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Handle */}
      <rect x="17" y="40" width="6" height="32" rx="3" fill="#8B7B6B" opacity="0.5" />
      <line x1="17.5" y1="48" x2="22.5" y2="48" stroke="#8B7B6B" strokeWidth="0.8" opacity="0.4" />
      <line x1="17.5" y1="53" x2="22.5" y2="53" stroke="#8B7B6B" strokeWidth="0.8" opacity="0.4" />
      <line x1="17.5" y1="58" x2="22.5" y2="58" stroke="#8B7B6B" strokeWidth="0.8" opacity="0.4" />
      {/* Torch bowl */}
      <path d="M11 40 C11 34 14 28 20 26 C26 28 29 34 29 40 Z" fill="#8B7B6B" opacity="0.4" />
      <ellipse cx="20" cy="40" rx="9" ry="3" fill="#8B7B6B" opacity="0.5" />
      <ellipse cx="20" cy="26" rx="7" ry="2.5" fill="none" stroke="#8B7B6B" strokeWidth="1" opacity="0.5" />

      {/* Glow */}
      {isLit && <circle ref={glowRef} cx="20" cy="10" r="20" fill="#FFD700" opacity="0.08" />}

      {/* Flames */}
      <g ref={flameGroupRef}>
        {isLit && (
          <>
            <ellipse data-flame cx="20" cy="8" rx="10" ry="18" fill="#FF6B00" opacity="0.7" />
            <ellipse data-flame cx="20" cy="6" rx="7" ry="15" fill="#D4A843" opacity="0.85" />
            <ellipse data-flame cx="20" cy="4" rx="4" ry="12" fill="#FFF4CC" opacity="0.9" />
          </>
        )}
      </g>
    </svg>
  )
}

// Mobile torch — simple, no refs
function TorchSvgSimple({ isLit, size }: { isLit: boolean; size: number }) {
  return (
    <svg width={size} height={size * 2} viewBox="-5 -10 50 100" fill="none" aria-hidden="true" style={{ overflow: 'visible' }}>
      <rect x="17" y="40" width="6" height="32" rx="3" fill="#8B7B6B" opacity="0.5" />
      <path d="M11 40 C11 34 14 28 20 26 C26 28 29 34 29 40 Z" fill="#8B7B6B" opacity="0.4" />
      <ellipse cx="20" cy="40" rx="9" ry="3" fill="#8B7B6B" opacity="0.5" />
      {isLit && (
        <>
          <ellipse cx="20" cy="8" rx="10" ry="18" fill="#FF6B00" opacity="0.7" />
          <ellipse cx="20" cy="6" rx="7" ry="15" fill="#D4A843" opacity="0.85" />
          <ellipse cx="20" cy="4" rx="4" ry="12" fill="#FFF4CC" opacity="0.9" />
        </>
      )}
    </svg>
  )
}
