import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  // In CI/build, use application default credentials or service account
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount
    : undefined

  return initializeApp(
    serviceAccount
      ? { credential: cert(serviceAccount) }
      : { projectId: 'the-koifman-brief' },
  )
}

export type PostMeta = {
  slug: string
  title: string
  excerpt: string
  title_fa?: string
  excerpt_fa?: string
  coverImageUrl: string
  coverAnimationUrl?: string
  date: string
  category: string
  published: boolean
}

export async function getPublishedPostsServer(): Promise<PostMeta[]> {
  const app = getAdminApp()
  const db = getFirestore(app)
  const snapshot = await db.collection('posts')
    .where('published', '==', true)
    .orderBy('date', 'desc')
    .get()

  const posts = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      slug: doc.id,
      title: data.title,
      excerpt: data.excerpt,
      title_fa: data.title_fa,
      excerpt_fa: data.excerpt_fa,
      coverImageUrl: data.coverImageUrl ?? '',
      coverAnimationUrl: data.coverAnimationUrl,
      date: data.date,
      category: data.category,
      published: data.published,
    }
  })

  const locale = process.env.NEXT_PUBLIC_LOCALE ?? 'en'
  if (locale === 'fa') {
    return posts.filter((p) => p.title_fa)
  }
  return posts
}
