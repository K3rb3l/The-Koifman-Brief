'use client'

import { useEffect, useRef, useState } from 'react'

type CountUpProps = {
  target: number
  className?: string
  prefix?: string
  pad?: number
}

export function CountUp({ target, className = '', prefix = '', pad = 3 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const startedRef = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target)
      setStarted(true)
      startedRef.current = true
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true
          setStarted(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  useEffect(() => {
    if (!started) return

    const duration = 800
    const steps = Math.min(target, 30)
    const stepTime = duration / steps
    let current = 0

    const interval = setInterval(() => {
      current++
      const eased = 1 - Math.pow(1 - current / steps, 3)
      setCount(Math.round(eased * target))
      if (current >= steps) {
        setCount(target)
        clearInterval(interval)
      }
    }, stepTime)

    return () => clearInterval(interval)
  }, [started, target])

  return (
    <span ref={ref} className={className}>
      {prefix}{String(count).padStart(pad, '0')}
    </span>
  )
}
