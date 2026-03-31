'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { subscribeEmail } from '@/lib/newsletter'
import { gsap } from '@/lib/gsap'
import { SplitText } from 'gsap/SplitText'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(SplitText)
}

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [focused, setFocused] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLParagraphElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const hasAnimated = useRef(false)

  // Entrance animation — typewriter heading + staggered elements
  useEffect(() => {
    if (hasAnimated.current || !headingRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return
        hasAnimated.current = true
        observer.disconnect()

        const split = SplitText.create(headingRef.current!, {
          type: 'chars',
          smartWrap: true,
        })

        gsap.set(split.chars, { opacity: 0, color: 'var(--ac)' })

        const tl = gsap.timeline()

        // Typewriter the heading
        split.chars.forEach((char, i) => {
          tl.to(char, { opacity: 1, duration: 0.08, ease: 'none' }, i * 0.04)
          tl.to(char, { color: 'inherit', duration: 0.5, ease: 'power1.out' }, i * 0.04 + 0.15)
        })

        // Fade in description + form
        tl.from(
          sectionRef.current!.querySelectorAll('[data-animate]'),
          { opacity: 0, y: 12, duration: 0.5, ease: 'power3.out', stagger: 0.1 },
          '-=0.3',
        )
      },
      { threshold: 0.5 },
    )

    observer.observe(sectionRef.current!)
    return () => observer.disconnect()
  }, [])

  // Floating golden particles in background
  useEffect(() => {
    const container = sectionRef.current
    if (!container) return

    const particles: HTMLSpanElement[] = []
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('span')
      p.style.cssText = `
        position:absolute;border-radius:50%;pointer-events:none;
        width:${2 + Math.random() * 3}px;height:${2 + Math.random() * 3}px;
        background:var(--ac);opacity:0;
        left:${10 + Math.random() * 80}%;top:${10 + Math.random() * 80}%;
      `
      container.appendChild(p)
      particles.push(p)

      gsap.to(p, {
        opacity: 0.2 + Math.random() * 0.15,
        y: -20 - Math.random() * 30,
        x: gsap.utils.random(-15, 15),
        duration: 3 + Math.random() * 4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 3,
      })
    }

    return () => particles.forEach((p) => p.remove())
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      await subscribeEmail(email)

      // Spark burst from the button
      const btn = formRef.current?.querySelector('button')
      if (btn && sectionRef.current) {
        const rect = btn.getBoundingClientRect()
        const containerRect = sectionRef.current.getBoundingClientRect()
        const cx = rect.left + rect.width / 2 - containerRect.left
        const cy = rect.top + rect.height / 2 - containerRect.top

        for (let i = 0; i < 16; i++) {
          const spark = document.createElement('span')
          spark.style.cssText = `
            position:absolute;left:${cx}px;top:${cy}px;
            width:${2 + Math.random() * 4}px;height:${2 + Math.random() * 4}px;
            border-radius:50%;background:var(--ac);pointer-events:none;
          `
          sectionRef.current.appendChild(spark)

          gsap.to(spark, {
            x: gsap.utils.random(-100, 100),
            y: gsap.utils.random(-80, -20),
            opacity: 0,
            scale: 0,
            duration: 0.6 + Math.random() * 0.4,
            ease: 'power2.out',
            onComplete: () => spark.remove(),
          })
        }
      }

      // Animate form out
      if (formRef.current) {
        gsap.to(formRef.current.parentElement!, {
          opacity: 0,
          y: -10,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => {
            setStatus('success')
            setEmail('')
          },
        })
      } else {
        setStatus('success')
        setEmail('')
      }
    } catch {
      setStatus('error')
    }
  }

  // Success state entrance
  useEffect(() => {
    if (status !== 'success' || !successRef.current) return

    const split = SplitText.create(
      successRef.current.querySelector('[data-success-text]')!,
      { type: 'chars', smartWrap: true },
    )

    gsap.from(successRef.current.querySelector('[data-success-icon]')!, {
      scale: 0,
      rotation: -180,
      duration: 0.6,
      ease: 'back.out(2)',
    })

    gsap.set(split.chars, { opacity: 0, color: 'var(--ac)' })
    split.chars.forEach((char, i) => {
      gsap.to(char, { opacity: 1, duration: 0.06, delay: 0.3 + i * 0.03 })
      gsap.to(char, { color: 'inherit', duration: 0.4, delay: 0.4 + i * 0.03, ease: 'power1.out' })
    })

    gsap.from(successRef.current.querySelector('[data-success-sub]')!, {
      opacity: 0,
      y: 8,
      duration: 0.5,
      ease: 'power3.out',
      delay: 0.6,
    })
  }, [status])

  return (
    <div
      ref={sectionRef}
      className="mt-16 mb-0 -mx-6 px-6 py-14 bg-surface border-y border-border relative overflow-hidden"
    >
      {/* Subtle golden glow on focus */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          opacity: focused ? 0.12 : 0,
          background: 'radial-gradient(ellipse at center bottom, var(--ac), transparent 60%)',
        }}
      />

      <div className="max-w-md mx-auto text-center relative">
        {status === 'success' ? (
          <div ref={successRef} className="py-4">
            <div
              data-success-icon
              className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-accent flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p data-success-text className="font-serif text-xl text-foreground mb-2">
              You&apos;re in. Welcome aboard.
            </p>
            <p data-success-sub className="text-sm text-muted font-sans">
              Check your email to confirm your subscription.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-muted mb-3">
              Newsletter
            </p>
            <p ref={headingRef} className="font-serif text-2xl text-foreground mb-2">
              Get the next brief
            </p>
            <p data-animate className="text-sm text-muted font-sans mb-8">
              Concise analysis on macro forces and structural shifts. No spam.
            </p>
            <div data-animate>
              <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:border-accent transition-all duration-300"
                    style={{
                      boxShadow: focused
                        ? '0 0 0 1px var(--ac), 0 0 20px rgba(184, 134, 11, 0.12)'
                        : 'none',
                    }}
                    aria-label="your@email.com"
                  />
                  {/* Golden ink line on focus */}
                  <span
                    className="absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-700 ease-out"
                    style={{ width: focused ? '100%' : '0%' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`px-6 py-3 bg-accent text-white font-sans text-sm font-medium cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(184,134,11,0.25)]${status === 'idle' ? ' subscribe-pulse' : ''}`}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Subscribing</span>
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </form>
            </div>
            {status === 'error' && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm font-sans">
                <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                <p className="text-red-600 dark:text-red-400">
                  Something went wrong. Please try again.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
