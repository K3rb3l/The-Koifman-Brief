'use client'

import { t } from '@/lib/i18n'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('error.title')}</h2>
        <p style={{ color: '#666', marginBottom: '0.5rem' }}>{error.message}</p>
        <button
          onClick={reset}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.5rem',
            background: '#B8860B',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {t('error.retry')}
        </button>
      </body>
    </html>
  )
}
