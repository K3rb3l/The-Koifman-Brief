'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const hasSetup = useRef(false)

  useEffect(() => {
    if (hasSetup.current) return
    hasSetup.current = true

    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    } catch {
      return
    }

    const el = ref.current
    if (!el) return

    // If element is already in viewport, keep it visible
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight + 40) return

    // Below fold — hide and observe
    setIsVisible(false)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: isVisible ? `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s` : 'none',
      }}
    >
      {children}
    </div>
  )
}
