'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, AlertCircle, Check } from 'lucide-react'
import { t } from '@/lib/i18n'
import { subscribeEmail } from '@/lib/newsletter'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      await subscribeEmail(email)
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
          <div
            className="flex items-center justify-center gap-2"
            style={{
              animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <Check
              size={18}
              className="text-accent"
              style={{
                animation: 'diamondSpinIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
              }}
            />
            <p className="font-serif text-lg text-foreground">
              {t('subscribe.success')}
            </p>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-muted mb-3">
              {t('subscribe.label')}
            </p>
            <p className="font-serif text-2xl text-foreground mb-2">
              {t('subscribe.heading')}
            </p>
            <p className="text-sm text-muted font-sans mb-8">
              {t('subscribe.description')}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('subscribe.placeholder')}
                className="flex-1 px-4 py-3 border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 input-glow"
                aria-label={t('subscribe.placeholder')}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`px-6 py-3 bg-accent text-white font-sans text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2${status === 'idle' ? ' subscribe-pulse' : ''}`}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{t('subscribe.loading')}</span>
                  </>
                ) : (
                  t('subscribe.button')
                )}
              </button>
            </form>
            {status === 'error' && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm font-sans">
                <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                <p className="text-red-600 dark:text-red-400">
                  {t('subscribe.error')}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
