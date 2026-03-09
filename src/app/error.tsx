'use client'

import { useEffect } from 'react'
import { t } from '@/lib/i18n'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
        {t('error.title')}
      </h2>
      <p className="text-muted font-sans text-sm mb-6">
        {t('error.message')}
      </p>
      <button
        onClick={() => {
          // Clear any corrupted state before retrying
          try { sessionStorage.clear() } catch {}
          reset()
        }}
        className="px-6 py-2 bg-accent text-white font-sans text-sm cursor-pointer hover:opacity-90 transition-opacity"
      >
        {t('error.retry')}
      </button>
    </div>
  )
}
