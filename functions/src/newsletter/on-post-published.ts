import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const db = getFirestore()
const SITE_URL = 'https://thekoifmanbrief.com'

export const onPostPublished = onDocumentWritten('posts/{postId}', async (event) => {
  const before = event.data?.before?.data()
  const after = event.data?.after?.data()

  if (!after) return // deleted
  if (after.published !== true) return // not published
  if (before?.published === true) return // was already published

  const postId = event.params.postId

  // Skip if draft already exists
  const draftRef = db.collection('newsletterDrafts').doc(postId)
  const draftSnap = await draftRef.get()
  if (draftSnap.exists) return

  await draftRef.set({
    postId,
    title: after.title || '',
    excerpt: after.excerpt || '',
    postUrl: `${SITE_URL}/posts/${after.slug || postId}`,
    status: 'draft',
    createdAt: FieldValue.serverTimestamp(),
  })
})
