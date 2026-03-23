'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState, useCallback } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleToggle = useCallback(() => {
    document.documentElement.classList.add('theme-transition')
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 600)
  }, [resolvedTheme, setTheme])

  if (!mounted) {
    return <div className="w-10 h-10" />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={handleToggle}
      className="cursor-pointer w-10 h-10 flex items-center justify-center text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Center circle — morphs between small sun core and large moon */}
        <circle
          cx="12"
          cy="12"
          fill="currentColor"
          style={{
            r: isDark ? 5 : 9,
            transition: 'r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* Moon mask — clips a crescent out of the circle */}
        <circle
          cx={isDark ? 28 : 18}
          cy="6"
          fill="var(--bg)"
          style={{
            r: isDark ? 0 : 7,
            transition: 'cx 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* Sun rays — 8 lines radiating outward, collapse when moon */}
        <g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transformOrigin: '12px 12px',
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(45deg) scale(0)',
            transition: 'opacity 0.3s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  )
}
