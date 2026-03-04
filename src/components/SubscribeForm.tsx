'use client'

import { useState, type FormEvent } from 'react'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error()
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="border-y border-border py-8 my-12">
        <p className="text-center font-sans text-foreground">
          You&apos;re subscribed. Check your email to confirm.
        </p>
      </div>
    )
  }

  return (
    <div className="border-y border-border py-8 my-12">
      <p className="font-serif text-lg text-foreground mb-1">
        Get the next brief in your inbox
      </p>
      <p className="text-sm text-muted font-sans mb-4">
        Concise analysis on macro forces and structural shifts. No spam.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-2 border border-border bg-surface text-foreground font-sans text-sm rounded-none focus:outline-none focus:border-accent transition-colors duration-200"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-2 bg-accent text-white font-sans text-sm cursor-pointer hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-sans">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  )
}
