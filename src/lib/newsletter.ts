import { httpsCallable } from 'firebase/functions'
import {
  collection, query, orderBy, getDocs, doc, updateDoc,
} from 'firebase/firestore'
import { db, functions } from './firebase'

// Subscribe
const subscribeCallable = httpsCallable(functions, 'subscribe')

export async function subscribeEmail(email: string): Promise<void> {
  await subscribeCallable({ email })
}

// Send newsletter
const sendNewsletterCallable = httpsCallable(functions, 'sendNewsletter')

export async function sendNewsletter(draftId: string): Promise<{ recipientCount: number }> {
  const result = await sendNewsletterCallable({ draftId })
  return result.data as { recipientCount: number }
}

// Fetch drafts
export type NewsletterDraft = {
  id: string
  postId: string
  title: string
  excerpt: string
  postUrl: string
  status: 'draft' | 'sent'
  createdAt: { seconds: number }
  sentAt?: { seconds: number }
  recipientCount?: number
}

export async function getDrafts(): Promise<NewsletterDraft[]> {
  try {
    const q = query(
      collection(db, 'newsletterDrafts'),
      orderBy('createdAt', 'desc'),
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as NewsletterDraft)
  } catch {
    return []
  }
}

// Update draft (edit title/excerpt before sending)
export async function updateDraft(
  draftId: string,
  data: { title?: string; excerpt?: string },
): Promise<void> {
  await updateDoc(doc(db, 'newsletterDrafts', draftId), data)
}
