import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { v4 as uuidv4 } from 'uuid'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { WelcomeEmail } from './welcome-email'

const resendApiKey = defineSecret('RESEND_API_KEY')
const db = getFirestore()
const UNSUBSCRIBE_BASE_URL = 'https://thekoifmanbrief.com/unsubscribe'

export const subscribe = onCall({ secrets: [resendApiKey] }, async (request) => {
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

  const token = uuidv4()
  await docRef.set({
    email: normalizedEmail,
    status: 'active',
    unsubscribeToken: token,
    subscribedAt: FieldValue.serverTimestamp(),
  })

  // Send welcome email
  try {
    const resend = new Resend(resendApiKey.value())
    const unsubscribeUrl = `${UNSUBSCRIBE_BASE_URL}?token=${token}`
    const html = await render(WelcomeEmail({ unsubscribeUrl }))
    await resend.emails.send({
      from: 'Shahar Koifman <shahar@thekoifmanbrief.com>',
      to: [normalizedEmail],
      subject: 'Welcome to The Koifman Brief',
      html,
      headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
    })
  } catch (err) {
    console.error('Welcome email failed:', err)
  }

  return { success: true }
})
