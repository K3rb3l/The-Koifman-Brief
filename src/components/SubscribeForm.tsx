'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, AlertCircle, Check } from 'lucide-react'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('https://buttondown.com/api/emails/embed-subscribe/koifman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }),
        referrerPolicy: 'unsafe-url',
      })

      if (!res.ok) throw new Error()
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mt-16 mb-0 -mx-6 px-6 py-14 bg-surface border-y border-border">
      <div className="max-w-md mx-auto text-center">
        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2">
            <Check size={18} className="text-accent" />
            <p className="font-serif text-lg text-foreground">
              You&apos;re subscribed. Check your email to confirm.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-muted mb-3">
              Newsletter
            </p>
            <p className="font-serif text-2xl text-foreground mb-2">
              Get the next brief
            </p>
            <p className="text-sm text-muted font-sans mb-8">
              Concise analysis on macro forces and structural shifts. No spam.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 input-glow"
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`px-6 py-3 bg-accent text-white font-sans text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2${status === 'idle' ? ' subscribe-pulse' : ''}`}
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
