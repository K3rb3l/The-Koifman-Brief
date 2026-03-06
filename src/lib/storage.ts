import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

const MAX_DIMENSION = 1200
const JPEG_QUALITY = 0.75

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg',
        JPEG_QUALITY,
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export async function uploadPostImage(
  slug: string,
  file: File,
  path: string = 'cover'
): Promise<string> {
  const compressed = await compressImage(file)
  const storageRef = ref(storage, `images/posts/${slug}/${path}.jpg`)
  await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000' })
  return getDownloadURL(storageRef)
}

export async function deletePostImages(slug: string): Promise<void> {
  const paths = ['cover.jpg', 'cover.jpeg', 'cover.png', 'cover.webp']
  for (const path of paths) {
    try {
      await deleteObject(ref(storage, `images/posts/${slug}/${path}`))
    } catch {
      // File doesn't exist, skip
    }
  }
}

export async function uploadPostAnimation(
  slug: string,
  videoBlob: Blob,
  posterBlob: Blob,
): Promise<{ animationUrl: string; imageUrl: string }> {
  const videoRef = ref(storage, `images/posts/${slug}/cover-animation.mp4`)
  const posterRef = ref(storage, `images/posts/${slug}/cover.jpg`)

  await Promise.all([
    uploadBytes(videoRef, videoBlob, { contentType: 'video/mp4', cacheControl: 'public, max-age=31536000' }),
    uploadBytes(posterRef, posterBlob, { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000' }),
  ])

  const [animationUrl, imageUrl] = await Promise.all([
    getDownloadURL(videoRef),
    getDownloadURL(posterRef),
  ])

  return { animationUrl, imageUrl }
}

export async function deletePostAnimation(slug: string): Promise<void> {
  try {
    await deleteObject(ref(storage, `images/posts/${slug}/cover-animation.mp4`))
  } catch {
    // File doesn't exist, skip
  }
}

export async function uploadInlineImage(slug: string, file: File): Promise<string> {
  const timestamp = Date.now()
  const compressed = await compressImage(file)
  const storageRef = ref(storage, `images/posts/${slug}/inline-${timestamp}.jpg`)
  await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000' })
  return getDownloadURL(storageRef)
}
