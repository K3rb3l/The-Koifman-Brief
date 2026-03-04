'use client'

export function BrandMark() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      {/* Outer diamond */}
      <path
        d="M18 2 L34 18 L18 34 L2 18 Z"
        stroke="currentColor"
        strokeWidth="1"
        className="draw-stroke text-accent"
        style={{ '--path-length': '128' } as React.CSSProperties}
      />
      {/* Inner cross */}
      <line
        x1="18" y1="8" x2="18" y2="28"
        stroke="currentColor"
        strokeWidth="0.75"
        className="draw-stroke text-accent"
        style={{ '--path-length': '20', animationDelay: '0.5s' } as React.CSSProperties}
      />
      <line
        x1="8" y1="18" x2="28" y2="18"
        stroke="currentColor"
        strokeWidth="0.75"
        className="draw-stroke text-accent"
        style={{ '--path-length': '20', animationDelay: '0.7s' } as React.CSSProperties}
      />
      {/* Center dot */}
      <circle
        cx="18" cy="18" r="2"
        fill="currentColor"
        className="text-accent"
        style={{ opacity: 0, animation: 'fadeInUp 0.3s ease-out 1.2s forwards' }}
      />
    </svg>
  )
}
