'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP, EASE_REVEAL, DURATION_REVEAL } from '@/lib/gsap'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const el = ref.current
    if (!el) return

    // If element is already in viewport on load, show it immediately
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight + 40) return

    gsap.from(el, {
      y: 16,
      opacity: 0,
      duration: DURATION_REVEAL,
      delay,
      ease: EASE_REVEAL,
      scrollTrigger: {
        trigger: el,
        start: 'top bottom-=40px',
        once: true,
      },
    })
  }, { scope: ref })

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
