'use client'

export function PostCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="px-5 py-5"
          style={{
            opacity: 0,
            animation: `skeletonFadeIn 0.4s ease-out ${i * 0.12}s forwards`,
          }}
        >
          {/* Divider line */}
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 skeleton-shimmer rounded" />
            <div className="h-3 w-12 skeleton-shimmer rounded" />
          </div>

          {/* Category + date */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-3 w-20 skeleton-shimmer rounded" />
            <div className="h-3 w-24 skeleton-shimmer rounded" />
          </div>

          {/* Cover image */}
          <div className="sm:w-[70%] sm:mx-auto mb-3">
            <div className="w-full skeleton-shimmer rounded" style={{ aspectRatio: '16/9' }} />
          </div>

          {/* Title */}
          <div className="flex flex-col items-center space-y-2 mb-3">
            <div className="h-6 w-4/5 skeleton-shimmer rounded" />
            <div className="h-6 w-3/5 skeleton-shimmer rounded" />
          </div>

          {/* Excerpt */}
          <div className="flex flex-col items-center space-y-1.5 mt-3">
            <div className="h-4 w-full skeleton-shimmer rounded" />
            <div className="h-4 w-11/12 skeleton-shimmer rounded" />
            <div className="h-4 w-2/3 skeleton-shimmer rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
