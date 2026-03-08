const cache = new Map<string, string>()
const listeners = new Map<string, Set<(blobUrl: string) => void>>()
let prefetchQueue: string[] = []
let prefetching = false

export function getCachedVideoUrl(remoteUrl: string): string | undefined {
  return cache.get(remoteUrl)
}

export function onVideoCached(remoteUrl: string, callback: (blobUrl: string) => void): () => void {
  const cached = cache.get(remoteUrl)
  if (cached) {
    callback(cached)
    return () => {}
  }
  if (!listeners.has(remoteUrl)) listeners.set(remoteUrl, new Set())
  listeners.get(remoteUrl)!.add(callback)
  return () => { listeners.get(remoteUrl)?.delete(callback) }
}

export function prefetchVideos(urls: string[]): void {
  const newUrls = urls.filter((url) => !cache.has(url) && !prefetchQueue.includes(url))
  prefetchQueue.push(...newUrls)
  if (!prefetching) processQueue()
}

async function processQueue(): Promise<void> {
  prefetching = true
  while (prefetchQueue.length > 0) {
    const url = prefetchQueue.shift()!
    if (cache.has(url)) continue
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      cache.set(url, blobUrl)
      listeners.get(url)?.forEach((cb) => cb(blobUrl))
      listeners.delete(url)
    } catch {
      // Skip failed downloads silently
    }
  }
  prefetching = false
}
