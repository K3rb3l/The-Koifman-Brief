'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import { gsap, useGSAP } from '@/lib/gsap'

interface TorchClapProps {
  slug: string
  initialClaps: number
}

const MAX_CLAPS = 50
const STORAGE_KEY = (slug: string) => `tkb_claps_${slug}`

const SPARK_COLORS = ['#B8860B', '#D4A843', '#FF8C00', '#FFA500', '#FFD700']

function getFlameScale(userClaps: number): number {
  if (userClaps === 0) return 0
  if (userClaps <= 15) return 0.6
  if (userClaps <= 35) return 0.8
  return 1.0
}

export function TorchClap({ slug, initialClaps }: TorchClapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const flameGroupRef = useRef<SVGGElement>(null)
  const outerFlameRef = useRef<SVGEllipseElement>(null)
  const midFlameRef = useRef<SVGEllipseElement>(null)
  const innerFlameRef = useRef<SVGEllipseElement>(null)
  const flameTimelineRef = useRef<gsap.core.Timeline | null>(null)

  const [userClaps, setUserClaps] = useState(0)
  const [totalClaps, setTotalClaps] = useState(initialClaps)
  const pendingRef = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLit = userClaps > 0

  // Load saved claps from localStorage
  useEffect(() => {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY(slug)) ?? '0', 10)
    if (!isNaN(saved) && saved > 0) {
      setUserClaps(Math.min(saved, MAX_CLAPS))
    }
  }, [slug])

  // Flame flicker animation
  useGSAP(() => {
    if (!isLit || !outerFlameRef.current || !midFlameRef.current || !innerFlameRef.current) return

    const tl = gsap.timeline({ repeat: -1, yoyo: true })

    tl.to(outerFlameRef.current, {
      y: gsap.utils.random(-2, 2),
      scaleY: gsap.utils.random(0.92, 1.08),
      scaleX: gsap.utils.random(0.95, 1.05),
      opacity: gsap.utils.random(0.85, 1),
      duration: gsap.utils.random(0.3, 0.5),
      ease: 'sine.inOut',
    }, 0)

    tl.to(midFlameRef.current, {
      y: gsap.utils.random(-3, 1),
      scaleY: gsap.utils.random(0.9, 1.1),
      scaleX: gsap.utils.random(0.93, 1.07),
      opacity: gsap.utils.random(0.9, 1),
      duration: gsap.utils.random(0.25, 0.45),
      ease: 'sine.inOut',
    }, 0.05)

    tl.to(innerFlameRef.current, {
      y: gsap.utils.random(-2, 2),
      scaleY: gsap.utils.random(0.88, 1.12),
      scaleX: gsap.utils.random(0.92, 1.08),
      opacity: gsap.utils.random(0.95, 1),
      duration: gsap.utils.random(0.2, 0.4),
      ease: 'sine.inOut',
    }, 0.1)

    flameTimelineRef.current = tl
    return () => { tl.kill() }
  }, { scope: containerRef, dependencies: [isLit] })

  // Sync flame scale when userClaps tier changes
  useGSAP(() => {
    if (!flameGroupRef.current) return
    const scale = getFlameScale(userClaps)
    if (scale === 0) {
      gsap.set(flameGroupRef.current, { scale: 0, opacity: 0 })
    } else {
      gsap.to(flameGroupRef.current, { scale, opacity: 1, duration: 0.3, ease: 'back.out(1.7)', transformOrigin: 'center bottom' })
    }
  }, { scope: containerRef, dependencies: [userClaps] })

  const spawnSparks = useCallback((anchorEl: HTMLElement) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const rect = anchorEl.getBoundingClientRect()
    const originX = rect.left + rect.width / 2
    const originY = rect.top + rect.height * 0.25

    for (let i = 0; i < 6; i++) {
      const dot = document.createElement('div')
      dot.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: ${SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]};
        left: ${originX}px;
        top: ${originY}px;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
      `
      document.body.appendChild(dot)

      gsap.to(dot, {
        x: gsap.utils.random(-30, 30),
        y: gsap.utils.random(-50, -20),
        opacity: 0,
        duration: gsap.utils.random(0.4, 0.7),
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
    localStorage.setItem(STORAGE_KEY(slug), String(next))

    pendingRef.current += 1

    // Punch animation on flame group
    if (flameGroupRef.current && next > 0) {
      gsap.fromTo(flameGroupRef.current,
        { scale: getFlameScale(next) * 1.4 },
        { scale: getFlameScale(next), duration: 0.3, ease: 'elastic.out(1, 0.5)', transformOrigin: 'center bottom' }
      )
    }

    spawnSparks(e.currentTarget)

    // Debounced sync
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      syncToServer(pendingRef.current)
    }, 500)
  }, [userClaps, slug, spawnSparks, syncToServer])

  const flameScale = getFlameScale(userClaps)

  const torchBody = (
    <>
      <rect x="17" y="44" width="6" height="36" rx="3" className="fill-muted" opacity="0.6" />
      <line x1="17" y1="54" x2="23" y2="54" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="17" y1="60" x2="23" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="17" y1="66" x2="23" y2="66" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <path d="M12 44 C12 38 14 30 20 28 C26 30 28 38 28 44 Z" className="fill-muted" opacity="0.5" />
      <ellipse cx="20" cy="44" rx="8" ry="3" className="fill-muted" opacity="0.7" />
      <ellipse cx="20" cy="28" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </>
  )

  const flameElements = (withRefs: boolean) => (
    <g
      ref={withRefs ? flameGroupRef : undefined}
      style={{
        transformOrigin: '20px 28px',
        transform: `scale(${flameScale})`,
        opacity: flameScale === 0 ? 0 : 1,
      }}
    >
      <ellipse ref={withRefs ? outerFlameRef : undefined} cx="20" cy="16" rx="8" ry="14" fill="#FF6B00" opacity="0.85" style={{ transformOrigin: '20px 28px' }} />
      <ellipse ref={withRefs ? midFlameRef : undefined} cx="20" cy="15" rx="5.5" ry="11" fill="#D4A843" opacity="0.9" style={{ transformOrigin: '20px 28px' }} />
      <ellipse ref={withRefs ? innerFlameRef : undefined} cx="20" cy="14" rx="3" ry="8" fill="#FFF9C4" opacity="0.95" style={{ transformOrigin: '20px 28px' }} />
    </g>
  )

  const atMax = userClaps >= MAX_CLAPS
  const displayTotal = totalClaps > 0 ? totalClaps : null

  return (
    <div ref={containerRef}>
      {/* Desktop: fixed left-side floating torch */}
      <div
        className="hidden md:flex fixed top-1/2 -translate-y-1/2 flex-col items-center gap-2 z-40"
        style={{ left: 'max(1rem, calc((100vw - 48rem) / 2 - 5rem))' }}
      >
        <button
          onClick={handleClap}
          disabled={atMax}
          aria-label={
            atMax
              ? `You've given the maximum 50 claps`
              : `Clap for this article (${userClaps} of ${MAX_CLAPS})`
          }
          className="group cursor-pointer transition-transform active:scale-95 disabled:cursor-default disabled:opacity-60"
        >
          <svg width={32} height={70} viewBox="0 0 40 88" fill="none" aria-hidden="true">
            {torchBody}
            {flameElements(true)}
          </svg>
        </button>

        {displayTotal !== null && (
          <span className="text-xs font-sans text-muted tabular-nums select-none">
            {displayTotal.toLocaleString()}
          </span>
        )}
      </div>

      {/* Mobile: fixed bottom-right floating button */}
      <div className="flex md:hidden fixed bottom-6 right-4 z-40">
        <button
          onClick={handleClap}
          disabled={atMax}
          aria-label={
            atMax
              ? `You've given the maximum 50 claps`
              : `Clap for this article (${userClaps} of ${MAX_CLAPS})`
          }
          className="flex items-center gap-2 px-3 py-2 bg-surface/90 backdrop-blur-sm border border-border rounded-full shadow-lg cursor-pointer transition-transform active:scale-95 disabled:cursor-default disabled:opacity-60"
        >
          <span className="flex-shrink-0" style={{ display: 'block', lineHeight: 0 }}>
            <svg width={18} height={40} viewBox="0 0 40 88" fill="none" aria-hidden="true">
              {torchBody}
              {flameElements(false)}
            </svg>
          </span>
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
