'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { isRTL } from '@/lib/i18n'

type CountUpProps = {
  target: number
  className?: string
  prefix?: string
  pad?: number
}

export function CountUp({ target, className = '', prefix = '', pad = 3 }: CountUpProps) {
  const spanRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const el = spanRef.current
    if (!el) return

    const obj = { value: 0 }

    function format(n: number): string {
      const rounded = Math.round(n)
      return isRTL
        ? rounded.toLocaleString('fa-IR', { minimumIntegerDigits: pad })
        : String(rounded).padStart(pad, '0')
    }

    el.textContent = prefix + format(0)

    gsap.to(obj, {
      value: target,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom-=50%',
        once: true,
      },
      onUpdate() {
        el.textContent = prefix + format(obj.value)
      },
    })
  }, { scope: spanRef })

  return <span ref={spanRef} className={className} />
}
