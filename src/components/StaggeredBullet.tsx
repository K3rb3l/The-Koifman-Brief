'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

type StaggeredBulletProps = {
  children: ReactNode
  index: number
}

export function StaggeredBullet({ children, index }: StaggeredBulletProps) {
  const ref = useRef<HTMLLIElement>(null)

  useGSAP(() => {
    const el = ref.current
    if (!el) return

    const diamond = el.querySelector('[data-diamond]') as HTMLElement
    const content = el.querySelector('[data-content]') as HTMLElement
    if (!diamond || !content) return

    const delay = index * 0.12

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top bottom-=20%',
        once: true,
      },
    })

    tl.fromTo(content,
      { opacity: 0, x: 8 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out', delay },
    )
    tl.fromTo(diamond,
      { scale: 0, rotation: 0 },
      { scale: 1, rotation: 45, duration: 0.4, ease: 'power4.out' },
      `<+${delay + 0.1}`,
    )
  }, { scope: ref })

  return (
    <li ref={ref} className="flex gap-3">
      <span data-diamond className="w-1.5 h-1.5 bg-accent mt-2.5 shrink-0" />
      <div data-content>{children}</div>
    </li>
  )
}
