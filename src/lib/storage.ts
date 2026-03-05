import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadPostImage(
  slug: string,
  file: File,
  path: string = 'cover'
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const storageRef = ref(storage, `images/posts/${slug}/${path}.${ext}`)
  await uploadBytes(storageRef, file)
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

export async function uploadInlineImage(slug: string, file: File): Promise<string> {
  const timestamp = Date.now()
  const ext = file.name.split('.').pop() || 'jpg'
  const storageRef = ref(storage, `images/posts/${slug}/inline-${timestamp}.${ext}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
