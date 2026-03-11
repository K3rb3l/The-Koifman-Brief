'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

export function DecorativeRule() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const el = ref.current
    if (!el) return

    const leftLine = el.querySelector('[data-left]') as HTMLElement
    const diamond = el.querySelector('[data-diamond]') as HTMLElement
    const rightLine = el.querySelector('[data-right]') as HTMLElement
    if (!leftLine || !diamond || !rightLine) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top bottom-=50%',
        once: true,
      },
    })

    tl.fromTo([leftLine, rightLine],
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: 'power4.out' },
    )
    tl.fromTo(diamond,
      { scale: 0, rotation: 0 },
      { scale: 1, rotation: 45, duration: 0.4, ease: 'power4.out' },
      '-=0.3',
    )
  }, { scope: ref })

  return (
    <div ref={ref} className="flex items-center gap-4 my-8">
      <span data-left className="h-px flex-1 bg-[var(--bd)]" style={{ transformOrigin: 'right center' }} />
      <span data-diamond className="w-1.5 h-1.5 bg-accent shrink-0" />
      <span data-right className="h-px flex-1 bg-[var(--bd)]" style={{ transformOrigin: 'left center' }} />
    </div>
  )
}
