export function extractPosterFrame(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.crossOrigin = 'anonymous'

    const url = URL.createObjectURL(file)
    video.src = url

    const cleanup = () => URL.revokeObjectURL(url)

    function captureFrame() {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(video, 0, 0)
        cleanup()
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Failed to extract frame')),
          'image/jpeg',
          0.85,
        )
      } catch (err) {
        cleanup()
        reject(err)
      }
    }

    video.onloadeddata = () => {
      // If currentTime is already 0, capture directly
      // Otherwise seek to 0 and wait
      if (video.currentTime === 0 && video.videoWidth > 0) {
        captureFrame()
      } else {
        video.onseeked = captureFrame
        video.currentTime = 0
      }
    }

    video.onerror = () => {
      cleanup()
      reject(new Error('Failed to load video'))
    }

    // Timeout fallback
    setTimeout(() => {
      cleanup()
      reject(new Error('Video loading timed out'))
    }, 10000)
  })
}
