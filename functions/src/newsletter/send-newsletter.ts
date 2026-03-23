import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { NewsletterEmail } from './email-template'

const resendApiKey = defineSecret('RESEND_API_KEY')
const db = getFirestore()

const UNSUBSCRIBE_BASE_URL = 'https://thekoifmanbrief.com/unsubscribe'
const BATCH_SIZE = 100

export const sendNewsletter = onCall(
  { secrets: [resendApiKey], maxInstances: 1 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated')
    }

    // Check admin status
    const adminDoc = await db.collection('admins').doc(request.auth.uid).get()
    if (!adminDoc.exists) {
      throw new HttpsError('permission-denied', 'Must be an admin')
    }

    const { draftId } = request.data as { draftId?: string }
    if (!draftId) {
      throw new HttpsError('invalid-argument', 'draftId is required')
    }

    const draftRef = db.collection('newsletterDrafts').doc(draftId)
    const draftSnap = await draftRef.get()
    if (!draftSnap.exists) {
      throw new HttpsError('not-found', 'Draft not found')
    }

    const draft = draftSnap.data()!
    if (draft.status === 'sent') {
      throw new HttpsError('failed-precondition', 'Newsletter already sent')
    }

    // Fetch active subscribers
    const subscribersSnap = await db
      .collection('subscribers')
      .where('status', '==', 'active')
      .get()

    if (subscribersSnap.empty) {
      throw new HttpsError('failed-precondition', 'No active subscribers')
    }

    const resend = new Resend(resendApiKey.value())
    let totalSent = 0

    // Send in batches of 100
    const subscribers = subscribersSnap.docs
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)

      try {
        const emails = await Promise.all(
          batch.map(async (sub) => {
            const data = sub.data()
            const unsubscribeUrl = `${UNSUBSCRIBE_BASE_URL}?token=${data.unsubscribeToken}`
            const html = await render(
              NewsletterEmail({
                title: draft.title,
                excerpt: draft.excerpt,
                postUrl: draft.postUrl,
                unsubscribeUrl,
              }),
            )

            return {
              from: 'Shahar Koifman <shahar@thekoifmanbrief.com>',
              to: [data.email],
              subject: draft.title,
              html,
              headers: {
                'List-Unsubscribe': `<${unsubscribeUrl}>`,
              },
            }
          }),
        )
        await resend.batch.send(emails)
        totalSent += batch.length
      } catch (error) {
        console.error(`Batch send failed at offset ${i}:`, error)
      }
    }

    await draftRef.update({
      status: 'sent',
      sentAt: FieldValue.serverTimestamp(),
      recipientCount: totalSent,
    })

    return { success: true, recipientCount: totalSent }
  },
)
