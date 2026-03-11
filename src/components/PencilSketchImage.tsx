'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

type PencilSketchImageProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  reveal?: boolean
}

export function PencilSketchImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority,
  reveal,
}: PencilSketchImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!reveal) return
    const el = wrapperRef.current
    if (!el) return

    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,
        delay: 0.2,
        ease: 'power4.out',
      },
    )
  }, { scope: wrapperRef, dependencies: [reveal] })

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${className}`}
      style={reveal ? { clipPath: 'inset(0 100% 0 0)' } : undefined}
    >
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="pencil-sketch">
            <feColorMatrix type="saturate" values="0.15" result="gray" />
            <feComponentTransfer in="gray" result="contrast">
              <feFuncR type="linear" slope="1.2" intercept="-0.05" />
              <feFuncG type="linear" slope="1.2" intercept="-0.05" />
              <feFuncB type="linear" slope="1.2" intercept="-0.05" />
            </feComponentTransfer>
            <feConvolveMatrix in="contrast" order="3" kernelMatrix="0 -0.5 0 -0.5 3 -0.5 0 -0.5 0" result="edges" />
            <feGaussianBlur in="edges" stdDeviation="0.3" />
          </filter>
          <filter id="pencil-sketch-dark">
            <feColorMatrix type="saturate" values="0" result="gray" />
            <feComponentTransfer in="gray" result="contrast">
              <feFuncR type="linear" slope="1.6" intercept="0.0" />
              <feFuncG type="linear" slope="1.6" intercept="0.0" />
              <feFuncB type="linear" slope="1.6" intercept="0.0" />
            </feComponentTransfer>
            <feConvolveMatrix in="contrast" order="3" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0" result="edges" />
            <feGaussianBlur in="edges" stdDeviation="0.4" />
          </filter>
        </defs>
      </svg>

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-md object-cover dark:opacity-0"
        style={{ filter: 'url(#pencil-sketch)', transition: 'opacity 0.3s ease-in-out' }}
        priority={priority}
      />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="absolute inset-0 rounded-md object-cover opacity-0 dark:opacity-100"
        style={{ filter: 'url(#pencil-sketch-dark)', transition: 'opacity 0.3s ease-in-out' }}
        priority={priority}
      />
    </div>
  )
}
