# Clap Torch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a torch-shaped clap button that floats on the left side of articles, with flame animations that grow as readers click (up to 50 per device), backed by a Cloud Function that increments a `claps` field on the post document.

**Architecture:** A `TorchClap` React component with GSAP animations renders as a fixed-position sidebar element. Clap counts are debounced and sent to a `clapPost` Cloud Function that atomically increments `posts/{slug}.claps`. Client-side rate limiting uses localStorage.

**Tech Stack:** React 19, GSAP + @gsap/react, Firebase Functions v2, Firestore, Tailwind CSS v4

---

## File Structure

### Functions (backend)
- **Create:** `functions/src/clap.ts` — `clapPost` callable function
- **Modify:** `functions/src/index.ts` — re-export `clapPost`

### Frontend
- **Create:** `src/components/TorchClap.tsx` — torch clap component (SVG, animation, state, debounced sync)
- **Modify:** `src/components/PostContent.tsx` — render `TorchClap` in article view
- **Modify:** `src/types/post.ts` — add `claps?: number` to `Post` type

---

## Task 1: Cloud Function — `clapPost`

**Files:**
- Create: `functions/src/clap.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Create the clapPost callable**

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const db = getFirestore()

export const clapPost = onCall(async (request) => {
  const { slug, count } = request.data as { slug?: string; count?: number }

  if (!slug || typeof slug !== 'string') {
    throw new HttpsError('invalid-argument', 'slug is required')
  }

  if (!count || typeof count !== 'number' || count < 1 || count > 50 || !Number.isInteger(count)) {
    throw new HttpsError('invalid-argument', 'count must be an integer between 1 and 50')
  }

  const postRef = db.collection('posts').doc(slug)
  const postSnap = await postRef.get()

  if (!postSnap.exists) {
    throw new HttpsError('not-found', 'Post not found')
  }

  await postRef.update({ claps: FieldValue.increment(count) })

  const updated = await postRef.get()
  const totalClaps = updated.data()?.claps ?? 0

  return { totalClaps }
})
```

- [ ] **Step 2: Re-export from index.ts**

Add to `functions/src/index.ts`:

```typescript
export { clapPost } from './clap'
```

- [ ] **Step 3: Verify functions build**

Run: `cd functions && npm run build`
Expected: Compiles without errors

- [ ] **Step 4: Commit**

```bash
git add functions/src/clap.ts functions/src/index.ts
git commit -m "feat: add clapPost Cloud Function"
```

---

## Task 2: Add `claps` field to Post type

**Files:**
- Modify: `src/types/post.ts`

- [ ] **Step 1: Add claps field**

Add `claps?: number` to the `Post` type after `body: string`:

```typescript
body: string
claps?: number
```

- [ ] **Step 2: Commit**

```bash
git add src/types/post.ts
git commit -m "feat: add claps field to Post type"
```

---

## Task 3: TorchClap component

**Files:**
- Create: `src/components/TorchClap.tsx`

This is the main component. It contains:
1. Torch SVG with layered flame shapes
2. GSAP flame flicker animation
3. Spark/ember particle system
4. Click handler with localStorage rate limiting
5. Debounced Cloud Function sync
6. Responsive positioning (left sidebar desktop, bottom-right mobile)

- [ ] **Step 1: Create TorchClap component**

```tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import { gsap, useGSAP } from '@/lib/gsap'

type TorchClapProps = {
  slug: string
  initialClaps: number
}

const MAX_CLAPS = 50
const DEBOUNCE_MS = 500

const clapPostCallable = httpsCallable(functions, 'clapPost')

function getLocalClaps(slug: string): number {
  try {
    return parseInt(localStorage.getItem(`tkb_claps_${slug}`) ?? '0', 10)
  } catch {
    return 0
  }
}

function setLocalClaps(slug: string, count: number): void {
  try {
    localStorage.setItem(`tkb_claps_${slug}`, String(count))
  } catch {
    // Storage unavailable
  }
}

export function TorchClap({ slug, initialClaps }: TorchClapProps) {
  const [totalClaps, setTotalClaps] = useState(initialClaps)
  const [myClaps, setMyClaps] = useState(0)
  const [isLit, setIsLit] = useState(false)
  const pendingRef = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const flameRef = useRef<SVGGElement>(null)
  const sparkContainerRef = useRef<HTMLDivElement>(null)
  const flameTlRef = useRef<gsap.core.Timeline | null>(null)

  // Load local claps on mount
  useEffect(() => {
    const saved = getLocalClaps(slug)
    setMyClaps(saved)
    setIsLit(saved > 0)
  }, [slug])

  // Flame flicker animation
  useGSAP(() => {
    if (!flameRef.current || !isLit) return

    const flames = flameRef.current.children
    if (!flames.length) return

    // Kill old timeline
    if (flameTlRef.current) flameTlRef.current.kill()

    const tl = gsap.timeline({ repeat: -1, yoyo: true })

    Array.from(flames).forEach((flame, i) => {
      tl.to(flame, {
        y: -2 - Math.random() * 3,
        scaleY: 0.9 + Math.random() * 0.2,
        scaleX: 0.95 + Math.random() * 0.1,
        opacity: 0.7 + Math.random() * 0.3,
        duration: 0.3 + Math.random() * 0.2,
        ease: 'sine.inOut',
      }, i * 0.1)
    })

    flameTlRef.current = tl
  }, { dependencies: [isLit], scope: containerRef })

  // Flame scale based on user's clap tier
  const flameScale = myClaps <= 0 ? 0 : myClaps <= 15 ? 0.6 : myClaps <= 35 ? 0.8 : 1

  // Spawn spark particles
  const spawnSparks = useCallback(() => {
    const container = sparkContainerRef.current
    if (!container) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('div')
      spark.className = 'absolute w-1 h-1 rounded-full'
      spark.style.backgroundColor = ['#B8860B', '#D4A843', '#FFD700', '#FF8C00'][Math.floor(Math.random() * 4)]
      spark.style.left = '50%'
      spark.style.top = '0'
      container.appendChild(spark)

      gsap.to(spark, {
        x: (Math.random() - 0.5) * 40,
        y: -20 - Math.random() * 30,
        opacity: 0,
        scale: Math.random() * 1.5,
        duration: 0.5 + Math.random() * 0.3,
        ease: 'power2.out',
        onComplete: () => spark.remove(),
      })
    }
  }, [])

  const handleClap = useCallback(() => {
    if (myClaps >= MAX_CLAPS) return

    const newMyClaps = myClaps + 1
    setMyClaps(newMyClaps)
    setLocalClaps(slug, newMyClaps)
    setTotalClaps((prev) => prev + 1)
    setIsLit(true)
    pendingRef.current += 1

    // Spark burst
    spawnSparks()

    // Flame punch animation
    if (flameRef.current) {
      gsap.fromTo(flameRef.current,
        { scale: flameScale + 0.15 },
        { scale: flameScale, duration: 0.3, ease: 'power2.out' },
      )
    }

    // Debounced sync to Cloud Function
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const count = pendingRef.current
      if (count <= 0) return
      pendingRef.current = 0
      try {
        const result = await clapPostCallable({ slug, count })
        const data = result.data as { totalClaps: number }
        setTotalClaps(data.totalClaps)
      } catch {
        // Optimistic UI — don't revert on failure
      }
    }, DEBOUNCE_MS)
  }, [myClaps, slug, spawnSparks, flameScale])

  const atMax = myClaps >= MAX_CLAPS

  return (
    <>
      {/* Desktop: left sidebar */}
      <div
        ref={containerRef}
        className="hidden md:flex fixed left-[max(1rem,calc((100vw-48rem)/2-5rem))] top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2"
      >
        <button
          onClick={handleClap}
          disabled={atMax}
          className="relative group flex flex-col items-center gap-1 cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-2"
          aria-label={atMax ? 'Maximum claps reached' : `Clap for this article (${myClaps}/${MAX_CLAPS})`}
          title={atMax ? 'Maximum claps reached' : 'Clap'}
        >
          {/* Spark container */}
          <div ref={sparkContainerRef} className="absolute inset-0 pointer-events-none overflow-visible" />

          {/* Torch SVG */}
          <svg width="32" height="64" viewBox="0 0 32 64" fill="none" className="transition-transform duration-200 group-hover:scale-110 group-disabled:group-hover:scale-100">
            {/* Torch handle */}
            <rect x="13" y="28" width="6" height="30" rx="2" className="fill-muted/30 stroke-muted" strokeWidth="1" />
            {/* Torch head */}
            <rect x="10" y="22" width="12" height="8" rx="2" className="fill-muted/20 stroke-muted" strokeWidth="1" />
            {/* Wrap detail */}
            <line x1="13" y1="34" x2="19" y2="34" className="stroke-muted/50" strokeWidth="0.5" />
            <line x1="13" y1="38" x2="19" y2="38" className="stroke-muted/50" strokeWidth="0.5" />
            <line x1="13" y1="42" x2="19" y2="42" className="stroke-muted/50" strokeWidth="0.5" />

            {/* Flame group */}
            {isLit && (
              <g ref={flameRef} style={{ transformOrigin: '16px 22px', transform: `scale(${flameScale})` }}>
                {/* Outer flame */}
                <ellipse cx="16" cy="14" rx="6" ry="10" fill="#FF8C00" opacity="0.6" />
                {/* Middle flame */}
                <ellipse cx="16" cy="15" rx="4" ry="8" fill="#FFD700" opacity="0.8" />
                {/* Inner flame */}
                <ellipse cx="16" cy="16" rx="2.5" ry="6" fill="#FFF4CC" opacity="0.9" />
                {/* Glow */}
                <circle cx="16" cy="18" r="10" fill="#FFD700" opacity="0.1" />
              </g>
            )}
          </svg>
        </button>
        {/* Count */}
        <span className="text-xs font-sans text-muted tabular-nums">
          {totalClaps > 0 ? totalClaps : ''}
        </span>
      </div>

      {/* Mobile: bottom-right floating */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={handleClap}
          disabled={atMax}
          className="relative flex items-center gap-2 bg-surface/90 backdrop-blur-sm border border-border rounded-full px-3 py-2 shadow-lg cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={atMax ? 'Maximum claps reached' : `Clap for this article (${myClaps}/${MAX_CLAPS})`}
        >
          {/* Mini spark container */}
          <div className="absolute inset-0 pointer-events-none overflow-visible" />

          <svg width="20" height="36" viewBox="0 0 32 64" fill="none">
            <rect x="13" y="28" width="6" height="30" rx="2" className="fill-muted/30 stroke-muted" strokeWidth="1.5" />
            <rect x="10" y="22" width="12" height="8" rx="2" className="fill-muted/20 stroke-muted" strokeWidth="1.5" />
            {isLit && (
              <g style={{ transformOrigin: '16px 22px', transform: `scale(${flameScale})` }}>
                <ellipse cx="16" cy="14" rx="6" ry="10" fill="#FF8C00" opacity="0.6" />
                <ellipse cx="16" cy="15" rx="4" ry="8" fill="#FFD700" opacity="0.8" />
                <ellipse cx="16" cy="16" rx="2.5" ry="6" fill="#FFF4CC" opacity="0.9" />
              </g>
            )}
          </svg>
          {totalClaps > 0 && (
            <span className="text-xs font-sans text-muted tabular-nums">{totalClaps}</span>
          )}
        </button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TorchClap.tsx
git commit -m "feat: add TorchClap component with flame animation and spark particles"
```

---

## Task 4: Integrate TorchClap into PostContent

**Files:**
- Modify: `src/components/PostContent.tsx`

- [ ] **Step 1: Import TorchClap**

Add import at the top of `src/components/PostContent.tsx`:

```typescript
import { TorchClap } from '@/components/TorchClap'
```

- [ ] **Step 2: Render TorchClap in the article view**

Add `<TorchClap>` right after `<ReadingProgress />` (line 126) and before the `<script>` tag:

```tsx
<ReadingProgress />
<TorchClap slug={slug} initialClaps={post.claps ?? 0} />
```

- [ ] **Step 3: Verify build**

Run: `npm run build` (from project root)
Expected: Compiles without errors

- [ ] **Step 4: Commit**

```bash
git add src/components/PostContent.tsx
git commit -m "feat: integrate TorchClap into article page"
```

---

## Task 5: Deploy and configure

- [ ] **Step 1: Deploy functions**

Run: `cd functions && npm run build && cd .. && firebase deploy --only functions`
Expected: `clapPost` function deployed

- [ ] **Step 2: Allow unauthenticated access to clapPost**

Run:
```bash
gcloud run services add-iam-policy-binding clapPost \
  --region us-central1 \
  --project the-koifman-brief \
  --member="allUsers" \
  --role="roles/run.invoker"
```

Note: The Cloud Run service name might be lowercase `clappost` — check the deploy output and adjust if needed.

- [ ] **Step 3: Build and deploy hosting**

Run: `npm run build && firebase deploy --only hosting`
Expected: Site deploys with torch visible on articles

- [ ] **Step 4: Test end-to-end**

1. Visit an article → torch appears on left (desktop) or bottom-right (mobile)
2. Click torch → flame ignites with spark burst, count increments
3. Click multiple times → flame grows, sparks on each click
4. Wait 500ms → check Firestore `posts/{slug}` document has `claps` field incremented
5. Refresh page → torch shows the total count, localStorage remembers your contribution
6. Click 50 times → button disables, torch stays at max flame

- [ ] **Step 5: Commit deploy config if any changes**

```bash
git add -A
git commit -m "feat: deploy clap torch feature"
```
