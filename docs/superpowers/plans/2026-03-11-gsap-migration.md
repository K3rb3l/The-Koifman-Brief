# GSAP Animation Migration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all CSS `@keyframes` animations and IntersectionObserver scroll triggers with GSAP + ScrollTrigger, add scroll-linked effects, deploy to Firebase preview channel.

**Architecture:** Central `src/lib/gsap.ts` registers plugins and exports defaults. Each animated component migrates from `useEffect` + IntersectionObserver / CSS classes to `useGSAP` hook from `@gsap/react`. CSS `@keyframes` replaced by GSAP are removed from `globals.css`.

**Tech Stack:** GSAP 3, @gsap/react, ScrollTrigger plugin, Next.js 16, React 19, Tailwind CSS v4

---

## Chunk 1: Setup & Foundation

### Task 1: Create branch and install GSAP

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Create new branch from current HEAD**

```bash
git checkout -b feat/gsap-migration
```

- [ ] **Step 2: Install GSAP and React adapter**

```bash
npm install gsap @gsap/react
```

- [ ] **Step 3: Verify install**

```bash
npm ls gsap @gsap/react
```

Expected: both packages listed with versions

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install gsap and @gsap/react"
```

---

### Task 2: Create GSAP setup utility

**Files:**
- Create: `src/lib/gsap.ts`

- [ ] **Step 1: Create `src/lib/gsap.ts`**

```typescript
'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)

  // Respect reduced motion globally
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function applyMotionPreference(reduced: boolean) {
    if (reduced) {
      gsap.globalTimeline.timeScale(1000)
      ScrollTrigger.defaults({ markers: false })
      // Disable all ScrollTrigger instances
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }

  applyMotionPreference(prefersReducedMotion.matches)
  prefersReducedMotion.addEventListener('change', (e) => applyMotionPreference(e.matches))
}

// Shared easing matching current cubic-bezier(0.16, 1, 0.3, 1)
const EASE_REVEAL = 'power3.out'
const DURATION_REVEAL = 0.5

export { gsap, ScrollTrigger, useGSAP, EASE_REVEAL, DURATION_REVEAL }
```

- [ ] **Step 2: Verify build compiles**

```bash
npx next build 2>&1 | tail -5
```

Expected: build succeeds (static export may have warnings, no errors)

- [ ] **Step 3: Commit**

```bash
git add src/lib/gsap.ts
git commit -m "feat: add GSAP setup utility with ScrollTrigger and reduced motion support"
```

---

## Chunk 2: Simple Component Migrations

### Task 3: Migrate ScrollReveal

**Files:**
- Modify: `src/components/ScrollReveal.tsx`

- [ ] **Step 1: Rewrite ScrollReveal with useGSAP**

Replace the entire file with:

```typescript
'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, useGSAP, EASE_REVEAL, DURATION_REVEAL } from '@/lib/gsap'

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
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ScrollReveal.tsx
git commit -m "refactor: migrate ScrollReveal to GSAP ScrollTrigger"
```

---

### Task 4: Migrate DecorativeRule

**Files:**
- Modify: `src/components/DecorativeRule.tsx`

- [ ] **Step 1: Rewrite DecorativeRule with GSAP timeline**

Replace the entire file with:

```typescript
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
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DecorativeRule.tsx
git commit -m "refactor: migrate DecorativeRule to GSAP timeline"
```

---

### Task 5: Migrate StaggeredBullet

**Files:**
- Modify: `src/components/StaggeredBullet.tsx`

- [ ] **Step 1: Rewrite StaggeredBullet with GSAP**

Replace the entire file with:

```typescript
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
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/StaggeredBullet.tsx
git commit -m "refactor: migrate StaggeredBullet to GSAP with stagger delay"
```

---

### Task 6: Migrate AnimatedPortrait

**Files:**
- Modify: `src/components/AnimatedPortrait.tsx`

- [ ] **Step 1: Rewrite AnimatedPortrait with GSAP**

Replace the entire file with:

```typescript
'use client'

import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

const VIDEO_URL =
  'https://firebasestorage.googleapis.com/v0/b/the-koifman-brief.firebasestorage.app/o/images%2Fportrait.mp4?alt=media'

const STATIC_URL =
  'https://storage.googleapis.com/the-koifman-brief-images/images/shahar-koifman-sketch.png'

export function AnimatedPortrait({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)

  useGSAP(() => {
    const video = videoRef.current
    if (!video) return

    function handleCanPlay() {
      setLoaded(true)
      gsap.to(video, { opacity: 1, duration: 0.8, ease: 'power2.inOut' })
      video!.play().catch(() => {})
    }

    video.addEventListener('canplay', handleCanPlay, { once: true })
    video.load()

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
    }
  })

  return (
    <div className={className} style={{ overflow: 'hidden', position: 'relative' }}>
      <img
        src={STATIC_URL}
        alt="Shahar Koifman"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <video
        ref={videoRef}
        src={VIDEO_URL}
        poster={STATIC_URL}
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AnimatedPortrait.tsx
git commit -m "refactor: migrate AnimatedPortrait to GSAP"
```

---

## Chunk 3: Medium-Complexity Migrations

### Task 7: Migrate CountUp

**Files:**
- Modify: `src/components/CountUp.tsx`

- [ ] **Step 1: Rewrite CountUp with GSAP onUpdate**

Replace the entire file with:

```typescript
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
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CountUp.tsx
git commit -m "refactor: migrate CountUp to GSAP with locale-aware formatting"
```

---

### Task 8: Migrate PencilSketchImage

**Files:**
- Modify: `src/components/PencilSketchImage.tsx`

- [ ] **Step 1: Rewrite PencilSketchImage with GSAP**

Replace the entire file with:

```typescript
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
      {/* SVG filters for pencil/pen illustration effect */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          {/* Light mode filter */}
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
          {/* Dark mode filter */}
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

      {/* Light mode image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-md object-cover dark:opacity-0"
        style={{ filter: 'url(#pencil-sketch)', transition: 'opacity 0.3s ease-in-out' }}
        priority={priority}
      />
      {/* Dark mode image */}
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
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PencilSketchImage.tsx
git commit -m "refactor: migrate PencilSketchImage to GSAP clip-path animation"
```

---

## Chunk 4: Complex Component Migrations

### Task 9: Migrate BackgroundAnimation

**Files:**
- Modify: `src/components/BackgroundAnimation.tsx`

- [ ] **Step 1: Rewrite BackgroundAnimation with GSAP**

Replace the entire file with:

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

type DiamondShape = { type: 'diamond'; x: number; y: number; size: number; dur: number; delay: number; dx: number; dy: number; opacity: number }
type LineShape = { type: 'line'; x: number; y: number; size: number; dur: number; delay: number; dx: number; dy: number; opacity: number; angle: number }
type Shape = DiamondShape | LineShape

type DustParticle = { x: number; y: number; r: number; dur: number; delay: number; speed: number }

const DIAMOND_COUNT = 7

const shapes: Shape[] = [
  { type: 'diamond', x: 8,  y: 12, size: 12, dur: 30, delay: 0,  dx: 50,  dy: -35, opacity: 0.15 },
  { type: 'diamond', x: 25, y: 35, size: 10, dur: 35, delay: 2,  dx: -40, dy: 25,  opacity: 0.12 },
  { type: 'diamond', x: 72, y: 18, size: 14, dur: 28, delay: 5,  dx: 35,  dy: 40,  opacity: 0.18 },
  { type: 'diamond', x: 55, y: 65, size: 10, dur: 32, delay: 8,  dx: -50, dy: -25, opacity: 0.14 },
  { type: 'diamond', x: 88, y: 45, size: 12, dur: 38, delay: 3,  dx: 25,  dy: 50,  opacity: 0.13 },
  { type: 'diamond', x: 40, y: 82, size: 14, dur: 26, delay: 6,  dx: -30, dy: -40, opacity: 0.16 },
  { type: 'diamond', x: 15, y: 58, size: 10, dur: 34, delay: 10, dx: 45,  dy: 20,  opacity: 0.14 },
  { type: 'line', x: 18, y: 25, size: 70, dur: 28, delay: 1,  dx: -25, dy: 35,  opacity: 0.14, angle: 35 },
  { type: 'line', x: 65, y: 10, size: 60, dur: 36, delay: 5,  dx: 35,  dy: -20, opacity: 0.16, angle: -20 },
  { type: 'line', x: 82, y: 70, size: 75, dur: 24, delay: 3,  dx: -45, dy: 25,  opacity: 0.13, angle: 60 },
  { type: 'line', x: 35, y: 50, size: 55, dur: 40, delay: 7,  dx: 20,  dy: -45, opacity: 0.17, angle: -45 },
  { type: 'line', x: 50, y: 88, size: 80, dur: 30, delay: 4,  dx: -40, dy: 30,  opacity: 0.15, angle: 15 },
  { type: 'line', x: 92, y: 30, size: 55, dur: 34, delay: 9,  dx: 25,  dy: 40,  opacity: 0.13, angle: -70 },
  { type: 'line', x: 5,  y: 75, size: 65, dur: 26, delay: 6,  dx: 50,  dy: -25, opacity: 0.16, angle: 40 },
  { type: 'line', x: 45, y: 5,  size: 70, dur: 30, delay: 1,  dx: -20, dy: 50,  opacity: 0.14, angle: -30 },
]

const dust: DustParticle[] = [
  { x: 12, y: 8,  r: 2,   dur: 22, delay: 0,  speed: 0.3 },
  { x: 85, y: 15, r: 1.5, dur: 28, delay: 3,  speed: 0.5 },
  { x: 45, y: 25, r: 2.5, dur: 18, delay: 1,  speed: 0.2 },
  { x: 70, y: 40, r: 1,   dur: 32, delay: 5,  speed: 0.6 },
  { x: 20, y: 55, r: 2,   dur: 24, delay: 2,  speed: 0.35 },
  { x: 90, y: 60, r: 1.5, dur: 26, delay: 4,  speed: 0.45 },
  { x: 35, y: 72, r: 2,   dur: 20, delay: 6,  speed: 0.25 },
  { x: 60, y: 85, r: 1,   dur: 30, delay: 1,  speed: 0.55 },
  { x: 8,  y: 90, r: 2.5, dur: 16, delay: 3,  speed: 0.15 },
  { x: 75, y: 30, r: 1.5, dur: 25, delay: 7,  speed: 0.4 },
  { x: 50, y: 50, r: 1,   dur: 34, delay: 2,  speed: 0.65 },
  { x: 30, y: 18, r: 2,   dur: 22, delay: 8,  speed: 0.3 },
]

const PULL_STRENGTH = 0.15
const PULL_RADIUS = 350

export function BackgroundAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRefs = useRef<(SVGSVGElement | null)[]>([])
  const dustRefs = useRef<(HTMLDivElement | null)[]>([])
  const quickX = useRef<ReturnType<typeof gsap.quickTo>[]>([])
  const quickY = useRef<ReturnType<typeof gsap.quickTo>[]>([])
  const [mode, setMode] = useState<'desktop' | 'mobile' | 'none'>('desktop')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode('none')
      return
    }
    setMode(window.innerWidth < 768 ? 'mobile' : 'desktop')
  }, [])

  // Ambient drift — replaces CSS geometric-drift keyframe
  useGSAP(() => {
    if (mode === 'none') return
    const container = containerRef.current
    if (!container) return

    const driftEls = container.querySelectorAll<HTMLElement>('[data-drift]')
    driftEls.forEach((el, i) => {
      const shape = mode === 'mobile' ? dust[i] : shapes[i]
      if (!shape) return
      const dx = mode === 'mobile' ? (i % 2 ? 15 : -15) : shape.dx
      const dy = mode === 'mobile' ? (i % 3 ? -10 : 10) : shape.dy

      gsap.to(el, {
        keyframes: [
          { x: dx, y: dy, duration: shape.dur * 0.25 },
          { x: dx * -0.5, y: dy * 1.2, duration: shape.dur * 0.25 },
          { x: dx * 0.8, y: dy * -0.6, duration: shape.dur * 0.25 },
          { x: 0, y: 0, duration: shape.dur * 0.25 },
        ],
        ease: 'none',
        repeat: -1,
        delay: shape.delay,
      })
    })
  }, { scope: containerRef, dependencies: [mode] })

  // Desktop: cursor-following with gsap.quickTo
  useGSAP(() => {
    if (mode !== 'desktop') return

    // Initialize quickTo for each SVG element
    svgRefs.current.forEach((el, i) => {
      if (!el) return
      quickX.current[i] = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
      quickY.current[i] = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    })

    function handleMouseMove(e: MouseEvent) {
      const mx = e.clientX
      const my = e.clientY + window.scrollY

      svgRefs.current.forEach((el, i) => {
        if (!el || !quickX.current[i] || !quickY.current[i]) return
        const shape = shapes[i]
        const bx = (shape.x / 100) * window.innerWidth
        const by = (shape.y / 100) * document.documentElement.scrollHeight
        const ddx = mx - bx
        const ddy = my - by
        const dist = Math.sqrt(ddx * ddx + ddy * ddy)

        if (dist < PULL_RADIUS && mx > 0) {
          const factor = PULL_STRENGTH * (1 - dist / PULL_RADIUS)
          quickX.current[i](ddx * factor)
          quickY.current[i](ddy * factor)
        } else {
          quickX.current[i](0)
          quickY.current[i](0)
        }
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, { dependencies: [mode] })

  // Mobile: scroll parallax on dust
  useGSAP(() => {
    if (mode !== 'mobile') return

    dustRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.to(el, {
        y: () => -(window.innerHeight * dust[i].speed),
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })
    })
  }, { dependencies: [mode] })

  if (mode === 'none') return null

  if (mode === 'mobile') {
    return (
      <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none text-accent opacity-[0.5] dark:opacity-100" aria-hidden="true">
        {dust.map((d, i) => (
          <div
            key={i}
            ref={(el) => { dustRefs.current[i] = el }}
            data-drift
            className="absolute"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
          >
            <svg width={d.r * 4} height={d.r * 4} viewBox={`0 0 ${d.r * 4} ${d.r * 4}`} style={{ opacity: 0.15 + d.speed * 0.3 }}>
              <circle cx={d.r * 2} cy={d.r * 2} r={d.r} fill="currentColor" />
            </svg>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none text-accent dark:opacity-100 opacity-[0.6]" aria-hidden="true">
      {shapes.map((shape, i) => (
        <div
          key={i}
          data-drift
          className={`absolute ${i >= DIAMOND_COUNT ? 'hidden-mobile' : ''}`}
          style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
        >
          <svg
            ref={(el) => { svgRefs.current[i] = el }}
            style={{ opacity: shape.opacity }}
            width={shape.size}
            height={shape.type === 'diamond' ? shape.size : 4}
            viewBox={shape.type === 'diamond' ? `0 0 ${shape.size} ${shape.size}` : `0 0 ${shape.size} 4`}
            fill="none"
          >
            {shape.type === 'diamond' ? (
              <rect
                x={shape.size / 2 - 3.5}
                y={shape.size / 2 - 3.5}
                width={7}
                height={7}
                fill="currentColor"
                transform={`rotate(45 ${shape.size / 2} ${shape.size / 2})`}
              />
            ) : (
              <line
                x1="0"
                y1="2"
                x2={shape.size}
                y2="2"
                stroke="currentColor"
                strokeWidth="1.5"
                transform={`rotate(${shape.angle} ${shape.size / 2} 2)`}
              />
            )}
          </svg>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BackgroundAnimation.tsx
git commit -m "refactor: migrate BackgroundAnimation to GSAP (drift, quickTo, ScrollTrigger parallax)"
```

---

### Task 10: Migrate LoadingAnimation

**Files:**
- Modify: `src/components/LoadingAnimation.tsx`

- [ ] **Step 1: Rewrite LoadingAnimation with GSAP timeline**

Replace the entire file with:

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { t } from '@/lib/i18n'

function clearIntroStyles() {
  document.body.style.overflow = ''
}

function shouldAnimate(): boolean {
  try {
    const COOLDOWN_MS = 60 * 60 * 1000
    const STORAGE_KEY = 'tkb-intro-last'

    const navType = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const isHardLoad = !navType || navType.type === 'navigate' || navType.type === 'reload'
    if (!isHardLoad) return false

    const lastShown = Number(localStorage.getItem(STORAGE_KEY) || 0)
    if (Date.now() - lastShown < COOLDOWN_MS) return false

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    return true
  } catch {
    return false
  }
}

// Golden dust particles — predefined positions to avoid hydration issues
const particles = [
  { left: '7%',  top: '80%', size: 1.5, delay: 0.2, dur: 4.5, drift: 15 },
  { left: '15%', top: '65%', size: 1,   delay: 0.8, dur: 5,   drift: -10 },
  { left: '22%', top: '90%', size: 2,   delay: 0.4, dur: 4,   drift: 20 },
  { left: '30%', top: '75%', size: 1,   delay: 1.2, dur: 5.5, drift: -8 },
  { left: '38%', top: '85%', size: 1.5, delay: 0.6, dur: 4.2, drift: 12 },
  { left: '45%', top: '70%', size: 1,   delay: 1.5, dur: 5.2, drift: -15 },
  { left: '52%', top: '88%', size: 2,   delay: 0.3, dur: 4.8, drift: 8 },
  { left: '58%', top: '72%', size: 1,   delay: 1.0, dur: 5.4, drift: -20 },
  { left: '65%', top: '82%', size: 1.5, delay: 0.7, dur: 4.3, drift: 18 },
  { left: '72%', top: '68%', size: 1,   delay: 1.3, dur: 5.1, drift: -12 },
  { left: '78%', top: '92%', size: 2,   delay: 0.1, dur: 4.6, drift: 10 },
  { left: '85%', top: '76%', size: 1,   delay: 0.9, dur: 5.3, drift: -18 },
  { left: '92%', top: '84%', size: 1.5, delay: 1.1, dur: 4.1, drift: 14 },
  { left: '12%', top: '55%', size: 1,   delay: 1.8, dur: 5.6, drift: -6 },
  { left: '42%', top: '60%', size: 1.5, delay: 0.5, dur: 4.7, drift: 16 },
  { left: '68%', top: '58%', size: 1,   delay: 1.6, dur: 5.8, drift: -14 },
  { left: '88%', top: '62%', size: 1.5, delay: 0.0, dur: 4.4, drift: 22 },
  { left: '25%', top: '95%', size: 2,   delay: 1.4, dur: 4.9, drift: -16 },
  { left: '50%', top: '78%', size: 1,   delay: 0.3, dur: 5.7, drift: 11 },
  { left: '35%', top: '50%', size: 1.5, delay: 2.0, dur: 5.0, drift: -9 },
]

export function LoadingAnimation() {
  const [active, setActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldAnimate()) {
      setActive(true)
    } else {
      clearIntroStyles()
    }
  }, [])

  useGSAP(() => {
    if (!active) return
    const el = containerRef.current
    if (!el) return

    const leftCurtain = el.querySelector('[data-left-curtain]') as HTMLElement
    const rightCurtain = el.querySelector('[data-right-curtain]') as HTMLElement
    const centerContent = el.querySelector('[data-center]') as HTMLElement
    const particlesContainer = el.querySelector('[data-particles]') as HTMLElement
    const glowEl = el.querySelector('[data-glow]') as HTMLElement
    const diamondPaths = el.querySelectorAll('[data-diamond-path]')
    const crossV = el.querySelector('[data-cross-v]') as SVGLineElement
    const crossH = el.querySelector('[data-cross-h]') as SVGLineElement
    const centerDot = el.querySelector('[data-center-dot]') as SVGCircleElement
    const expandLine = el.querySelector('[data-expand-line]') as HTMLElement
    const letterEls = el.querySelectorAll('[data-letter]')
    const tagline = el.querySelector('[data-tagline]') as HTMLElement
    const particleEls = el.querySelectorAll('[data-particle]')

    const tl = gsap.timeline({
      onComplete() {
        setActive(false)
      },
    })

    // Particle float (background, overlapping with main timeline)
    particleEls.forEach((p, i) => {
      const particle = particles[i]
      gsap.fromTo(p,
        { opacity: 0, y: 0, x: 0 },
        {
          opacity: 0,
          y: '-40vh',
          x: particle.drift,
          duration: particle.dur,
          delay: particle.delay,
          ease: 'power1.inOut',
          keyframes: {
            opacity: [0, 0.6, 0.4, 0.2, 0],
          },
        },
      )
    })

    // Golden glow pulse
    tl.fromTo(glowEl,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
      0.5,
    )
    tl.to(glowEl, { opacity: 0, scale: 1.5, duration: 0.7, ease: 'power2.in' }, 0.9)

    // Diamond stroke draw
    diamondPaths.forEach((path) => {
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 0.7,
        ease: 'power2.out',
      }, 0.15)
    })

    // Crosshairs
    tl.to(crossV, { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' }, 0.7)
    tl.to(crossH, { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' }, 0.85)

    // Center dot
    tl.fromTo(centerDot,
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out', transformOrigin: 'center' },
      1.0,
    )

    // Expanding line
    tl.fromTo(expandLine,
      { width: 0 },
      { width: '100%', duration: 0.4, ease: 'power2.out' },
      1.1,
    )

    // Letter stagger
    tl.fromTo(letterEls,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out', stagger: 0.025 },
      1.2,
    )

    // Tagline
    tl.fromTo(tagline,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      1.7,
    )

    // Exit phase at 2s — fade center, split curtains
    tl.to([centerContent, particlesContainer], {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.out',
    }, 2.0)
    tl.call(() => clearIntroStyles(), [], 2.0)
    tl.to(leftCurtain, {
      x: '-100%',
      duration: 0.6,
      ease: 'power4.inOut',
    }, 2.0)
    tl.to(rightCurtain, {
      x: '100%',
      duration: 0.6,
      ease: 'power4.inOut',
    }, 2.0)
  }, { scope: containerRef, dependencies: [active] })

  if (!active) return null

  const title = t('loading.title')

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100]"
      aria-hidden="true"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Left curtain */}
      <div data-left-curtain className="absolute top-0 bottom-0 left-0 w-1/2" style={{ background: '#0A0A08' }} />
      {/* Right curtain */}
      <div data-right-curtain className="absolute top-0 bottom-0 right-0 w-1/2" style={{ background: '#0A0A08' }} />

      {/* Floating golden particles */}
      <div data-particles className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            data-particle
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: '#D4A843',
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div data-center className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Radial golden glow pulse */}
          <div
            data-glow
            className="absolute w-[200px] h-[200px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(212,168,67,0.18) 0%, transparent 70%)',
              opacity: 0,
            }}
          />

          {/* Diamond brand mark */}
          <svg width="80" height="80" viewBox="0 0 36 36" fill="none" className="relative">
            <defs>
              <filter id="goldGlow">
                <feGaussianBlur stdDeviation="1.5" />
              </filter>
            </defs>
            {/* Glow layer */}
            <path
              data-diamond-path
              d="M18 2 L34 18 L18 34 L2 18 Z"
              stroke="#D4A843"
              strokeWidth="2.5"
              fill="none"
              opacity="0.25"
              filter="url(#goldGlow)"
              style={{ strokeDasharray: 128, strokeDashoffset: 128 }}
            />
            {/* Sharp diamond outline */}
            <path
              data-diamond-path
              d="M18 2 L34 18 L18 34 L2 18 Z"
              stroke="#D4A843"
              strokeWidth="0.75"
              fill="none"
              style={{ strokeDasharray: 128, strokeDashoffset: 128 }}
            />
            {/* Vertical crosshair */}
            <line
              data-cross-v
              x1="18" y1="8" x2="18" y2="28"
              stroke="#D4A843"
              strokeWidth="0.5"
              style={{ strokeDasharray: 20, strokeDashoffset: 20 }}
            />
            {/* Horizontal crosshair */}
            <line
              data-cross-h
              x1="8" y1="18" x2="28" y2="18"
              stroke="#D4A843"
              strokeWidth="0.5"
              style={{ strokeDasharray: 20, strokeDashoffset: 20 }}
            />
            {/* Center dot */}
            <circle
              data-center-dot
              cx="18"
              cy="18"
              r="1.5"
              fill="#D4A843"
              style={{ opacity: 0 }}
            />
          </svg>
        </div>

        {/* Decorative gradient line */}
        <div className="relative w-60 h-px mt-8 overflow-hidden">
          <div
            data-expand-line
            className="absolute inset-y-0 left-1/2 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, #D4A843 40%, #D4A843 60%, transparent)',
              width: 0,
              transform: 'translateX(-50%)',
            }}
          />
        </div>

        {/* Title — letter-by-letter stagger */}
        <div
          className="mt-5 font-serif text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.25em]"
          style={{ color: '#D4A843' }}
        >
          {title.split('').map((letter, i) => (
            <span
              key={i}
              data-letter
              className="inline-block"
              style={{ opacity: 0 }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          data-tagline
          className="mt-3 font-sans text-xs uppercase tracking-[0.2em]"
          style={{ color: '#6A6050', opacity: 0 }}
        >
          {t('loading.tagline')}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/LoadingAnimation.tsx
git commit -m "refactor: migrate LoadingAnimation to GSAP timeline"
```

---

### Task 11: Migrate BrandMark

**Files:**
- Modify: `src/components/BrandMark.tsx`

- [ ] **Step 1: Rewrite BrandMark with GSAP timelines**

Replace the entire file with:

```typescript
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
      // Each edge breathes independently — partial undraw/redraw
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

      // Overdraw — trace draws on then off
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

      // Cross vertical
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

      // Cross horizontal
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

      // Center dot
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
      {/* Outer diamond edges */}
      <path data-edge d="M18 2 L34 18" stroke="currentColor" strokeWidth="1" className="text-accent" style={{ strokeDasharray: 32, strokeDashoffset: 32 }} />
      <path data-edge d="M34 18 L18 34" stroke="currentColor" strokeWidth="1" className="text-accent" style={{ strokeDasharray: 32, strokeDashoffset: 32 }} />
      <path data-edge d="M18 34 L2 18" stroke="currentColor" strokeWidth="1" className="text-accent" style={{ strokeDasharray: 32, strokeDashoffset: 32 }} />
      <path data-edge d="M2 18 L18 2" stroke="currentColor" strokeWidth="1" className="text-accent" style={{ strokeDasharray: 32, strokeDashoffset: 32 }} />
      {/* Overdraw */}
      <path data-overdraw d="M18 2 L34 18 L18 34 L2 18 Z" stroke="currentColor" strokeWidth="1" className="text-foreground" style={{ strokeDasharray: 128, strokeDashoffset: 128, opacity: 0.25 }} />
      {/* Inner cross */}
      <line data-cross-v x1="18" y1="8" x2="18" y2="28" stroke="currentColor" strokeWidth="0.75" className="text-accent" style={{ strokeDasharray: 20, strokeDashoffset: 20 }} />
      <line data-cross-h x1="8" y1="18" x2="28" y2="18" stroke="currentColor" strokeWidth="0.75" className="text-accent" style={{ strokeDasharray: 20, strokeDashoffset: 20 }} />
      {/* Center dot */}
      <circle data-dot cx="18" cy="18" r="2" fill="currentColor" className="text-accent" style={{ opacity: 0 }} />
    </svg>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BrandMark.tsx
git commit -m "refactor: migrate BrandMark to GSAP timeline (draw + breathe loop)"
```

---

## Chunk 5: CSS Class Replacements & Portrait Ring

### Task 12: Migrate inline CSS animation classes to GSAP

**Files:**
- Modify: `src/components/HomeContent.tsx`
- Modify: `src/components/PostContent.tsx`

These files use `animate-fade-in-up`, `animate-fade-in-up-delay-1`, `animate-fade-in-up-delay-2` CSS classes and `portrait-ring` CSS class. We need to replace them with GSAP-driven animations.

- [ ] **Step 1: Update HomeContent.tsx — replace `animate-fade-in-up` class**

In `src/components/HomeContent.tsx`, the hero section at line 88 uses `animate-fade-in-up`:

```tsx
<section className="animate-fade-in-up mb-16 flex flex-col items-center text-center">
```

Replace with a GSAP-animated wrapper. Add a ref and useGSAP:

At the top of the file, add import (also add `useRef` to the React import if not present):
```typescript
import { useRef } from 'react' // add useRef to existing React import
import { gsap, useGSAP, EASE_REVEAL, DURATION_REVEAL } from '@/lib/gsap'
```

Add a ref inside the component:
```typescript
const heroRef = useRef<HTMLElement>(null)
```

Add useGSAP hook:
```typescript
useGSAP(() => {
  const el = heroRef.current
  if (!el) return
  gsap.from(el, { y: 20, opacity: 0, duration: DURATION_REVEAL, ease: EASE_REVEAL })
}, { scope: heroRef })
```

Change the section to:
```tsx
<section ref={heroRef} className="mb-16 flex flex-col items-center text-center">
```

Also replace the `portrait-ring` class (line 91). The `portrait-ring` class uses `@keyframes ringPulse` for a box-shadow animation cycling between accent tones. Add a GSAP animation inside the same `useGSAP`:

```typescript
const portrait = heroRef.current?.querySelector('[data-portrait]')
if (portrait) {
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim()
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--bd').trim()
  gsap.to(portrait, {
    keyframes: [
      { boxShadow: `0 0 0 2px ${accentColor}`, duration: 2 },
      { boxShadow: `0 0 0 2px ${borderColor}`, duration: 2 },
      { boxShadow: `0 0 0 2px ${accentColor}`, duration: 2 },
    ],
    repeat: -1,
    ease: 'sine.inOut',
  })
}
```

Change the AnimatedPortrait className from `portrait-ring` to just add `data-portrait`:
```tsx
<AnimatedPortrait
  data-portrait
  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover group-hover:ring-accent/50 transition-all duration-300"
/>
```

Note: The `AnimatedPortrait` component needs to forward the `data-portrait` attribute. Since it uses `className` prop, we need to check if it spreads additional props. Looking at the component, it doesn't spread props. Instead, apply the ring animation inside `AnimatedPortrait.tsx` by adding a wrapper div with the `data-portrait` attribute, OR apply the ring pulse via a wrapper in `HomeContent`. The simpler approach: wrap the `AnimatedPortrait` call with a div that has `data-portrait`.

```tsx
<div data-portrait className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
  <AnimatedPortrait className="w-full h-full rounded-full object-cover" />
</div>
```

- [ ] **Step 2: Update PostContent.tsx — replace `animate-fade-in-up*` classes**

In `src/components/PostContent.tsx`, lines 124-136 use three stagger classes. Add a ref + useGSAP to the article header:

Add imports (also add `useRef` to the React import if not present):
```typescript
import { useRef } from 'react' // add useRef to existing React import
import { gsap, useGSAP, EASE_REVEAL } from '@/lib/gsap'
```

Add ref and useGSAP inside the component (within the `post` block, not the loading skeleton block):
```typescript
const headerRef = useRef<HTMLElement>(null)

useGSAP(() => {
  const el = headerRef.current
  if (!el) return
  const items = el.querySelectorAll('[data-reveal]')
  gsap.from(items, {
    y: 20,
    opacity: 0,
    duration: 0.4,
    ease: EASE_REVEAL,
    stagger: 0.1,
  })
}, { scope: headerRef })
```

Replace the header markup:
```tsx
<header ref={headerRef} className="mb-10 text-center" style={{ viewTransitionName: 'article-header' }}>
  <div data-reveal className="flex items-center justify-center gap-3 mb-5">
    ...
  </div>
  <h1 data-reveal className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight max-w-2xl mx-auto">
    ...
  </h1>
  <div data-reveal className="flex items-center justify-center gap-3 mt-5 text-[13px] text-muted font-sans">
    ...
  </div>
</header>
```

Remove the `animate-fade-in-up`, `animate-fade-in-up-delay-1`, `animate-fade-in-up-delay-2` classes from those divs.

- [ ] **Step 3: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/components/HomeContent.tsx src/components/PostContent.tsx
git commit -m "refactor: replace CSS animation classes with GSAP in HomeContent and PostContent"
```

---

## Chunk 6: ScrollTrigger Enhancements

### Task 13: Add ScrollTrigger enhancements

**Files:**
- Modify: `src/components/HomeContent.tsx` (batch card reveal)
- Modify: `src/components/PostContent.tsx` (cover zoom-out)

- [ ] **Step 1: Add batch card reveal to HomeContent**

In `HomeContent.tsx`, the post cards are rendered in a grid. After the existing useGSAP hook, add another for the card batch reveal:

```typescript
useGSAP(() => {
  const cards = document.querySelectorAll('[data-post-card]')
  if (!cards.length) return

  ScrollTrigger.batch(cards, {
    onEnter: (batch) => {
      gsap.from(batch, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: EASE_REVEAL,
        stagger: 0.08,
      })
    },
    start: 'top bottom-=60px',
    once: true,
  })
})
```

Add `import { ScrollTrigger } from '@/lib/gsap'` if not already imported.

In `src/components/PostCard.tsx`, add `data-post-card` attribute to the outer `<article>` element:

```tsx
<article data-post-card className="group">
```

- [ ] **Step 2: Add homepage hero parallax**

In `HomeContent.tsx`, add a scrub-linked parallax to the hero section (the ref'd section from Task 12). Inside the same `useGSAP` or a new one:

```typescript
useGSAP(() => {
  const hero = heroRef.current
  if (!hero) return

  gsap.to(hero, {
    y: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })
})
```

This creates a subtle upward drift as the user scrolls past the hero section.

- [ ] **Step 3: Add article cover zoom-out to PostContent**

In `PostContent.tsx`, the cover image has `data-article-cover`. Add a scroll-linked zoom effect:

```typescript
useGSAP(() => {
  const cover = document.querySelector('[data-article-cover]') as HTMLElement
  if (!cover) return

  gsap.fromTo(cover,
    { scale: 1.05 },
    {
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: cover,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    },
  )
})
```

- [ ] **Step 4: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add src/components/HomeContent.tsx src/components/PostContent.tsx src/components/PostCard.tsx
git commit -m "feat: add ScrollTrigger batch card reveal and article cover zoom-out"
```

---

## Chunk 7: CSS Cleanup

### Task 14: Remove replaced CSS keyframes and utility classes

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Remove replaced `@keyframes` blocks**

Remove the following from `globals.css`:
- `@keyframes fadeInUp` (lines 136-145)
- `.animate-fade-in-up`, `.animate-fade-in-up-delay-1`, `.animate-fade-in-up-delay-2` (lines 156-169)
- `@keyframes drawLine` and `.animate-draw-line` (lines 147-175)
- `@keyframes diamondSpinIn` (lines 178-187)
- `@keyframes ruleDrawIn` (lines 190-193)
- `@keyframes sketchReveal` (lines 196-199)
- `@keyframes expandFromCenter` (lines 202-213)
- `@keyframes drawStroke` (lines 216-220)
- `@keyframes undrawStroke` (lines 222-225)
- `@keyframes fadeOut` (lines 227-230)
- `.draw-stroke` (lines 232-236)
- `@keyframes loadingGlow` (lines 239-243)
- `@keyframes particleFloat` (lines 246-252)
- First `prefers-reduced-motion` block for `.animate-fade-in-up*` and `.animate-draw-line` and `.draw-stroke` (lines 254-273)
- `.stagger-children` block and its reduced-motion (lines 397-418)
- `@keyframes geometricDrift` and `.geometric-drift` and `.hidden-mobile` and its reduced-motion (lines 421-453)
- All `@keyframes bmEdge*`, `bmOverdraw`, `bmCrossV`, `bmCrossH`, `bmDot` (lines 548-630)
- `@keyframes ringPulse` and `.portrait-ring` (lines 633-641)

**Keep intact:**
- `@keyframes shimmer` and `.tag-shimmer` (lines 343-360)
- `@keyframes subtlePulse` and `.subscribe-pulse` (lines 377-394)
- `@keyframes vtFadeOut/vtFadeIn` and all `::view-transition-*` rules (lines 456-708)
- `@keyframes skeletonShimmer`, `skeletonFadeIn`, `.skeleton-shimmer` (lines 512-546) — keep as CSS-only loading indicators
- `.card-lift`, `.link-underline`, `.input-glow` (CSS hover transitions)
- `.cover-vignette`, `.cover-vignette-lg`
- `.decorative-rule`, `.diamond`
- All RTL rules
- All `prefers-reduced-motion` for kept animations

Also keep `.hidden-mobile` media query (move it out of the geometric-drift section):
```css
@media (max-width: 768px) {
  .hidden-mobile {
    display: none;
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Verify no remaining references to removed classes in tsx files**

```bash
grep -rn "animate-fade-in-up\|animate-draw-line\|geometric-drift\|portrait-ring\|stagger-children" src/ --include="*.tsx"
```

Expected: no matches (or only in comments)

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "refactor: remove CSS keyframes and utility classes replaced by GSAP"
```

---

## Chunk 8: Build, Test & Deploy

### Task 15: Final build verification

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: successful build with no errors

- [ ] **Step 2: Check bundle size impact**

```bash
ls -la .next/static/chunks/ | sort -k5 -n | tail -20
```

Verify GSAP chunk is present and reasonable (~27KB gzip)

- [ ] **Step 3: Run dev server and verify visually**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Loading animation plays on first visit
- BrandMark draws and breathes
- Scroll reveals trigger as you scroll
- Background shapes drift and follow cursor (desktop)
- Post cards stagger in on homepage
- Article cover zooms subtly on scroll
- DecorativeRule draws in
- CountUp counts up with correct formatting
- All animations respect `prefers-reduced-motion`

- [ ] **Step 4: Commit any fixes**

### Task 16: Deploy to Firebase preview channel

- [ ] **Step 1: Build for production**

```bash
npm run build
```

- [ ] **Step 2: Deploy to preview channel**

```bash
firebase hosting:channel:deploy gsap-preview --expires 7d
```

Expected: outputs a preview URL like `https://the-koifman-brief--gsap-preview-XXXXX.web.app`

- [ ] **Step 3: Commit all changes and push branch**

```bash
git push -u origin feat/gsap-migration
```
