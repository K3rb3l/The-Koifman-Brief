'use client'

import { useState } from 'react'

const EMAIL = 'shahar@thekoifmanbrief.com'

export function ContactEmailButton() {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    // Try mailto first
    window.location.href = `mailto:${EMAIL}`

    // Also copy to clipboard as fallback
    navigator.clipboard?.writeText(EMAIL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-accent text-accent hover:bg-accent hover:text-white transition-colors duration-200 cursor-pointer rounded-sm font-medium tracking-wide text-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
      {copied ? 'Email copied!' : 'Contact via Email'}
    </button>
  )
}
