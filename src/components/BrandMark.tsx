'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

export function BrandMark() {
  const svgRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const svg = svgRef.current
    if (!svg) return

    const edges = svg.querySelectorAll('[data-edge]')
    const overdraw = svg.querySelector('[data-overdraw]') as SVGPathElement
    const crossV = svg.querySelector('[data-cross-v]') as SVGLineElement
    const crossH = svg.querySelector('[data-cross-h]') as SVGLineElement
    const dot = svg.querySelector('[data-dot]') as SVGCircleElement

    // Phase 1: Initial draw (100ms delay, 0.8s duration)
    const drawTl = gsap.timeline({ delay: 0.1 })

    edges.forEach((edge, i) => {
      drawTl.to(edge, {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, i * 0.2)
    })

    drawTl.to(crossV, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, 0.8)
    drawTl.to(crossH, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, 1.0)
    drawTl.to(dot, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 1.2)

    // Phase 2: Breathing loop (starts at 2s)
    drawTl.call(() => {
      const edgeConfigs = [
        { undraw: 14, dur: 9, delay: 0 },
        { undraw: 22, dur: 11, delay: 1.5 },
        { undraw: 26, dur: 13, delay: 0.8 },
        { undraw: 12, dur: 10, delay: 3 },
      ]

      edges.forEach((edge, i) => {
        const cfg = edgeConfigs[i]
        gsap.to(edge, {
          keyframes: [
            { strokeDashoffset: 0, duration: cfg.dur * 0.33 },
            { strokeDashoffset: cfg.undraw, duration: cfg.dur * 0.12 },
            { strokeDashoffset: cfg.undraw, duration: cfg.dur * 0.13 },
            { strokeDashoffset: 0, duration: cfg.dur * 0.12 },
            { strokeDashoffset: 0, duration: cfg.dur * 0.30 },
          ],
          ease: 'sine.inOut',
          repeat: -1,
          delay: cfg.delay,
        })
      })

      gsap.to(overdraw, {
        keyframes: [
          { strokeDashoffset: 128, duration: 3.75 },
          { strokeDashoffset: 0, duration: 3 },
          { strokeDashoffset: 0, duration: 1.5 },
          { strokeDashoffset: -128, duration: 3 },
          { strokeDashoffset: -128, duration: 3.75 },
        ],
        ease: 'sine.inOut',
        repeat: -1,
        delay: 2,
      })

      gsap.to(crossV, {
        keyframes: [
          { strokeDashoffset: 0, duration: 3.36 },
          { strokeDashoffset: 12, duration: 1.44 },
          { strokeDashoffset: 12, duration: 1.8 },
          { strokeDashoffset: 0, duration: 1.44 },
          { strokeDashoffset: 0, duration: 3.96 },
        ],
        ease: 'sine.inOut',
        repeat: -1,
        delay: 0.5,
      })

      gsap.to(crossH, {
        keyframes: [
          { strokeDashoffset: 0, duration: 3.5 },
          { strokeDashoffset: 10, duration: 1.68 },
          { strokeDashoffset: 10, duration: 2.1 },
          { strokeDashoffset: 0, duration: 1.68 },
          { strokeDashoffset: 0, duration: 5.04 },
        ],
        ease: 'sine.inOut',
        repeat: -1,
        delay: 2.5,
      })

      gsap.to(dot, {
        keyframes: [
          { opacity: 1, scale: 1, duration: 3.15 },
          { opacity: 0.3, scale: 0.6, duration: 1.17 },
          { opacity: 0.3, scale: 0.6, duration: 1.08 },
          { opacity: 1, scale: 1, duration: 1.17 },
          { opacity: 1, scale: 1, duration: 2.43 },
        ],
        ease: 'sine.inOut',
        repeat: -1,
        delay: 1,
        transformOrigin: 'center',
      })
    }, [], 2.0)
  }, { scope: svgRef })

  return (
    <svg
      ref={svgRef}
      width="28"
      height="28"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 sm:w-9 sm:h-9"
      aria-hidden="true"
    >
      <path data-edge d="M18 2 L34 18" stroke="currentColor" strokeWidth="1" className="text-accent" style={{ strokeDasharray: 32, strokeDashoffset: 32 }} />
      <path data-edge d="M34 18 L18 34" stroke="currentColor" strokeWidth="1" className="text-accent" style={{ strokeDasharray: 32, strokeDashoffset: 32 }} />
      <path data-edge d="M18 34 L2 18" stroke="currentColor" strokeWidth="1" className="text-accent" style={{ strokeDasharray: 32, strokeDashoffset: 32 }} />
      <path data-edge d="M2 18 L18 2" stroke="currentColor" strokeWidth="1" className="text-accent" style={{ strokeDasharray: 32, strokeDashoffset: 32 }} />
      <path data-overdraw d="M18 2 L34 18 L18 34 L2 18 Z" stroke="currentColor" strokeWidth="1" className="text-foreground" style={{ strokeDasharray: 128, strokeDashoffset: 128, opacity: 0.25 }} />
      <line data-cross-v x1="18" y1="8" x2="18" y2="28" stroke="currentColor" strokeWidth="0.75" className="text-accent" style={{ strokeDasharray: 20, strokeDashoffset: 20 }} />
      <line data-cross-h x1="8" y1="18" x2="28" y2="18" stroke="currentColor" strokeWidth="0.75" className="text-accent" style={{ strokeDasharray: 20, strokeDashoffset: 20 }} />
      <circle data-dot cx="18" cy="18" r="2" fill="currentColor" className="text-accent" style={{ opacity: 0 }} />
    </svg>
  )
}
