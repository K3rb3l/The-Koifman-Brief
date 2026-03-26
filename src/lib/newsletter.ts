import { httpsCallable } from 'firebase/functions'
import {
  collection, query, orderBy, getDocs, doc, updateDoc, setDoc, addDoc, serverTimestamp,
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

// Create draft manually (not tied to a post)
export async function createDraft(data: { title: string; excerpt: string; postUrl: string }): Promise<string> {
  const ref = await addDoc(collection(db, 'newsletterDrafts'), {
    ...data,
    postId: '',
    status: 'draft',
    createdAt: serverTimestamp(),
  })
  return ref.id
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

// Fetch subscribers
export type Subscriber = {
  email: string
  status: 'active' | 'unsubscribed'
  subscribedAt?: { seconds: number }
  unsubscribedAt?: { seconds: number }
}

export async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const q = query(
      collection(db, 'subscribers'),
      orderBy('subscribedAt', 'desc'),
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as Subscriber)
  } catch {
    return []
  }
}

// Add subscriber manually (admin)
export async function addSubscriber(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim()
  await setDoc(doc(db, 'subscribers', normalized), {
    email: normalized,
    status: 'active',
    subscribedAt: serverTimestamp(),
  }, { merge: true })
}

// Update draft (edit title/excerpt before sending)
export async function updateDraft(
  draftId: string,
  data: { title?: string; excerpt?: string },
): Promise<void> {
  await updateDoc(doc(db, 'newsletterDrafts', draftId), data)
}
