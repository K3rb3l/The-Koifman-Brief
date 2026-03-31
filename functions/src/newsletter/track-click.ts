import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const db = getFirestore()

export const trackClick = onRequest(async (req, res) => {
  const { n: newsletterId, p: postSlug, e: emailHash } = req.query as Record<string, string>

  const postUrl = postSlug
    ? `https://thekoifmanbrief.com/posts/${postSlug}`
    : 'https://thekoifmanbrief.com'

  if (!newsletterId || !postSlug) {
    res.redirect(302, postUrl)
    return
  }

  // Record click asynchronously — don't block the redirect
  const clickRef = db
    .collection('newsletterDrafts')
    .doc(newsletterId)
    .collection('clicks')
    .doc(postSlug)

  try {
    await clickRef.set(
      {
        postSlug,
        totalClicks: FieldValue.increment(1),
        lastClickedAt: FieldValue.serverTimestamp(),
        ...(emailHash
          ? { uniqueClickers: FieldValue.arrayUnion(emailHash) }
          : {}),
      },
      { merge: true },
    )
  } catch (err) {
    console.error('Failed to record click:', err)
  }

  res.redirect(302, postUrl)
})
