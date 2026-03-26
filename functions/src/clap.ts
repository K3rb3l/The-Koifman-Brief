import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const db = getFirestore()

export const clapPost = onCall(async (request) => {
  const { slug, count } = request.data as { slug?: string; count?: number }

  if (!slug || typeof slug !== 'string') {
    throw new HttpsError('invalid-argument', 'slug is required')
  }

  if (!count || typeof count !== 'number' || count < 1 || count > 50 || !Number.isInteger(count)) {
    throw new HttpsError('invalid-argument', 'count must be an integer between 1 and 50')
  }

  const postRef = db.collection('posts').doc(slug)
  const postSnap = await postRef.get()

  if (!postSnap.exists) {
    throw new HttpsError('not-found', 'Post not found')
  }

  await postRef.update({ claps: FieldValue.increment(count) })

  const updated = await postRef.get()
  const totalClaps = updated.data()?.claps ?? 0

  return { totalClaps }
})
