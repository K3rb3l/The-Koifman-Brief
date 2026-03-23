import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { v4 as uuidv4 } from 'uuid'

const db = getFirestore()

export const subscribe = onCall(async (request) => {
  const { email } = request.data as { email?: string }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError('invalid-argument', 'Valid email is required')
  }

  const normalizedEmail = email.toLowerCase().trim()
  const docRef = db.collection('subscribers').doc(normalizedEmail)
  const doc = await docRef.get()

  if (doc.exists) {
    const data = doc.data()!
    if (data.status === 'active') {
      return { success: true }
    }
    // Reactivate unsubscribed user
    await docRef.update({
      status: 'active',
      unsubscribeToken: uuidv4(),
      unsubscribedAt: FieldValue.delete(),
    })
    return { success: true }
  }

  await docRef.set({
    email: normalizedEmail,
    status: 'active',
    unsubscribeToken: uuidv4(),
    subscribedAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})
