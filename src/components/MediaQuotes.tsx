'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { gsap } from '@/lib/gsap'
import { SplitText } from 'gsap/SplitText'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(SplitText)
}

/* ── Brand mastheads ── */

function BrandMasthead({ source, visible }: { source: string; visible: boolean }) {
  if (source === 'BBC') {
    return (
      <span
        className="inline-flex gap-[3px] transition-all duration-700"
        aria-label="BBC"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(-8deg)',
        }}
      >
        {['B', 'B', 'C'].map((letter, i) => (
          <span
            key={i}
            className="w-6 h-6 flex items-center justify-center border border-current text-[13px] font-sans font-bold leading-none"
            style={{
              transitionDelay: visible ? `${200 + i * 80}ms` : '0ms',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(-6px)',
              transition: 'opacity 0.4s, transform 0.4s',
            }}
          >
            {letter}
          </span>
        ))}
      </span>
    )
  }

  const styles: Record<string, string> = {
    'The New York Times': 'text-lg font-serif font-bold tracking-tight',
    'Le Monde': 'text-lg font-serif font-bold italic tracking-tight',
    'Le Point': 'text-base font-sans font-extrabold uppercase tracking-[0.15em]',
  }

  return (
    <span
      className={`inline-block transition-all duration-700 ${styles[source] ?? 'text-base font-sans font-semibold'}`}
      aria-label={source}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(-6deg)',
        transitionDelay: visible ? '150ms' : '0ms',
      }}
    >
      {source}
    </span>
  )
}

/* ── Sparkle particles ── */

function Sparkles({ active }: { active: boolean }) {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      delay: 400 + Math.random() * 1500,
      duration: 1200 + Math.random() * 800,
      size: 2 + Math.random() * 3,
    })), [],
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: '30%',
            width: p.size,
            height: p.size,
            background: 'var(--ac)',
            opacity: active ? 0.7 : 0,
            transform: active ? 'translateY(-40px) scale(0)' : 'translateY(0) scale(1)',
            transition: `opacity ${p.duration}ms ease-out ${p.delay}ms, transform ${p.duration}ms ease-out ${p.delay}ms`,
          }}
        />
      ))}
    </div>
  )
}

/* ── Corner flourish ── */

function CornerFlourish({ position, visible }: { position: 'tl' | 'tr' | 'bl' | 'br'; visible: boolean }) {
  const rot = { tl: '0', tr: '90', bl: '270', br: '180' }[position]
  const pos = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  }[position]

  return (
    <svg
      className={`absolute ${pos} w-6 h-6 text-accent/30 transition-all duration-1000`}
      style={{
        opacity: visible ? 1 : 0,
        transform: `rotate(${rot}deg) scale(${visible ? 1 : 0.3})`,
        transitionDelay: visible ? '300ms' : '0ms',
      }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M2 2 C2 12, 2 16, 8 20 C12 22, 16 22, 22 22" strokeLinecap="round" />
      <circle cx="2" cy="2" r="1.5" fill="currentColor" />
    </svg>
  )
}

/* ── GSAP SplitText per-line quill reveal ── */

function QuillText({ text, visible }: { text: string; visible: boolean }) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const splitRef = useRef<InstanceType<typeof SplitText> | null>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const el = textRef.current
    if (!el) return

    tlRef.current?.kill()
    splitRef.current?.revert()

    const split = SplitText.create(el, {
      type: 'chars',
      charsClass: 'typewriter-char',
    })
    splitRef.current = split

    // Initial: invisible, slightly below, with golden glow color
    gsap.set(split.chars, {
      opacity: 0,
      y: 6,
      color: 'var(--ac)',
    })

    return () => {
      tlRef.current?.kill()
      split.revert()
    }
  }, [text])

  useEffect(() => {
    const split = splitRef.current
    if (!split?.chars.length) return

    tlRef.current?.kill()

    if (visible) {
      const tl = gsap.timeline()

      // Fast magical typewriter: chars appear with golden flash then settle
      split.chars.forEach((char, i) => {
        const t = i * 0.018 // ~18ms per char — fast
        tl.to(char, {
          opacity: 1,
          y: 0,
          duration: 0.15,
          ease: 'power2.out',
        }, t)
        // Golden flash fades to normal text color
        tl.to(char, {
          color: 'inherit',
          duration: 0.6,
          ease: 'power1.out',
        }, t + 0.1)
      })

      tlRef.current = tl
    } else {
      // Exit: shimmer out — chars fade with stagger from end to start
      const tl = gsap.timeline()
      tl.to(split.chars, {
        opacity: 0,
        y: -4,
        color: 'var(--ac)',
        duration: 0.25,
        ease: 'power2.in',
        stagger: { each: 0.008, from: 'end' },
      })
      tlRef.current = tl
    }
  }, [visible])

  return (
    <div className="relative max-w-xl w-full">
      <p
        ref={textRef}
        className="font-serif italic text-base sm:text-lg text-foreground leading-relaxed"
      >
        <span className="text-accent/70">&ldquo;</span>
        {text}
        <span className="text-accent/70">&rdquo;</span>
      </p>
    </div>
  )
}

/* ── Data ── */

const QUOTES = [
  {
    text: 'We can keep striking, but the returns are already diminishing. It\u2019s like trying to empty the sea with a spoon.',
    source: 'Le Monde',
    date: 'March 28, 2026',
  },
  {
    text: 'There still needs to be another chapter in this war before it can end.',
    source: 'BBC',
    date: 'March 28, 2026',
  },
  {
    text: 'The regime will emerge scarred but alive.',
    source: 'The New York Times',
    date: 'March 18, 2026',
  },
  {
    text: 'It is impossible to provoke regime change from the air.',
    source: 'Le Point',
    date: 'March 25, 2026',
  },
  {
    text: 'As long as we don\u2019t attend to the main problem, which is Iran\u2019s capabilities, we are bound to meet this problem again and again and again.',
    source: 'BBC',
    date: 'March 28, 2026',
  },
  {
    text: 'The Iranian regime will never surrender. It has a vast missile arsenal and it is patient.',
    source: 'Le Monde',
    date: 'March 28, 2026',
  },
  {
    text: 'In the short term, Iranians will not take to the streets.',
    source: 'Le Point',
    date: 'March 25, 2026',
  },
  {
    text: 'To hit ships in the straits, you don\u2019t need a lot. Simple missiles or drones can hit commercial vessels with significant impact.',
    source: 'BBC',
    date: 'March 28, 2026',
  },
  {
    text: 'We should focus on concrete objectives: isolating Iran and severing its link with Lebanese Hezbollah, which is possible today.',
    source: 'Le Monde',
    date: 'March 28, 2026',
  },
  {
    text: 'This problem was bound to explode at some point. Iran has been fostering instability in the Middle East for 50 years.',
    source: 'BBC',
    date: 'March 28, 2026',
  },
]

const INTERVAL_MS = 8000
const SWIPE_THRESHOLD = 50

/* ── Main component ── */

export function MediaQuotes() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)
  const touchStart = useRef<number | null>(null)
  const mouseStart = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const transition = useCallback((next: number) => {
    setVisible(false)
    setTimeout(() => {
      setActive(next)
      setVisible(true)
    }, 600)
  }, [])

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActive((i) => (i + 1) % QUOTES.length)
        setVisible(true)
      }, 600)
    }, INTERVAL_MS)
  }, [])

  useEffect(() => {
    resetTimer()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [resetTimer])

  const goNext = useCallback(() => {
    transition((active + 1) % QUOTES.length)
    resetTimer()
  }, [active, transition, resetTimer])

  const goPrev = useCallback(() => {
    transition((active - 1 + QUOTES.length) % QUOTES.length)
    resetTimer()
  }, [active, transition, resetTimer])

  const goTo = (i: number) => {
    if (i === active) return
    transition(i)
    resetTimer()
  }

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > SWIPE_THRESHOLD) diff > 0 ? goNext() : goPrev()
    touchStart.current = null
  }

  // Mouse drag swipe (desktop)
  const onMouseDown = (e: React.MouseEvent) => { mouseStart.current = e.clientX }
  const onMouseUp = (e: React.MouseEvent) => {
    if (mouseStart.current === null) return
    const diff = mouseStart.current - e.clientX
    if (Math.abs(diff) > SWIPE_THRESHOLD) diff > 0 ? goNext() : goPrev()
    mouseStart.current = null
  }

  const q = QUOTES[active]

  return (
    <section className="mb-16 py-10 border-y border-border overflow-hidden">
      <p
        className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-muted text-center mb-6"
        style={{ transition: 'opacity 0.6s', opacity: visible ? 0.7 : 0.3 }}
      >
        As quoted in international media
      </p>

      <div
        className="relative min-h-[180px] sm:min-h-[160px] flex items-center justify-center px-4 select-none cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        {/* Corner flourishes */}
        <CornerFlourish position="tl" visible={visible} />
        <CornerFlourish position="tr" visible={visible} />
        <CornerFlourish position="bl" visible={visible} />
        <CornerFlourish position="br" visible={visible} />

        {/* Sparkle particles */}
        <Sparkles active={visible} />

        {/* Quote content */}
        <blockquote className="flex flex-col items-center justify-center text-center px-4 sm:px-8">
          <div className="mb-4 text-muted/60">
            <BrandMasthead source={q.source} visible={visible} />
          </div>

          <QuillText key={active} text={q.text} visible={visible} />

          {/* Decorative line */}
          <span
            className="block w-12 h-px bg-accent/40 mt-4 mb-3 transition-all duration-700"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'scaleX(1)' : 'scaleX(0)',
              transitionDelay: visible ? '600ms' : '0ms',
            }}
          />

          <footer
            className="text-xs font-sans text-muted tracking-wide transition-all duration-500"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(6px)',
              transitionDelay: visible ? '700ms' : '0ms',
            }}
          >
            {q.date}
          </footer>
        </blockquote>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            aria-label={`Quote ${i + 1}`}
          >
            <span
              className={`block w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === active
                  ? 'bg-accent scale-125'
                  : 'bg-muted/40 group-hover:bg-muted'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
