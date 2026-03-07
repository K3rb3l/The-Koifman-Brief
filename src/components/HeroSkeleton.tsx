'use client'

export function HeroSkeleton() {
  return (
    <div
      className="mb-16 flex flex-col items-center text-center"
      style={{ opacity: 0, animation: 'skeletonFadeIn 0.4s ease-out forwards' }}
    >
      {/* Portrait circle */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full skeleton-shimmer mb-5" />

      {/* Tagline */}
      <div className="h-3 w-32 skeleton-shimmer rounded mb-3" />

      {/* Byline */}
      <div className="h-3 w-40 skeleton-shimmer rounded mb-4" />

      {/* Description */}
      <div className="space-y-2 max-w-md w-full">
        <div className="h-5 w-full skeleton-shimmer rounded mx-auto" />
        <div className="h-5 w-4/5 skeleton-shimmer rounded mx-auto" />
      </div>
    </div>
  )
}
