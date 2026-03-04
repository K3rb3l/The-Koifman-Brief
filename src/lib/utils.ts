export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function estimateReadingTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
  return `${minutes} min read`
}

const CATEGORY_LABELS: Record<string, string> = {
  geopolitics: 'Geopolitics',
  fintech: 'FinTech',
  'real-estate': 'Real Estate',
  macro: 'Macro',
}

export function slugToTitle(slug: string): string {
  return (
    CATEGORY_LABELS[slug] ??
    slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  )
}
