import Anthropic from '@anthropic-ai/sdk'
import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount
    : undefined

  initializeApp(
    serviceAccount
      ? { credential: cert(serviceAccount) }
      : { projectId: 'the-koifman-brief' },
  )
}

const db = getFirestore()
const client = new Anthropic()

async function translatePost(slug: string) {
  const doc = await db.collection('posts').doc(slug).get()
  const data = doc.data()
  if (!data || data.title_fa) {
    console.log(`Skipping ${slug} (already translated or missing)`)
    return
  }

  console.log(`Translating: ${slug}...`)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `Translate the following article from English to Persian (Farsi). Return ONLY valid JSON with keys "title", "excerpt", and "body". Preserve all Markdown formatting in the body. The translation should read naturally as a native Persian publication — not a literal translation. Maintain the analytical tone and precision of the original.

Title: ${data.title}

Excerpt: ${data.excerpt}

Body:
${data.body}`,
      },
    ],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
  const translated = JSON.parse(cleaned)

  await db.collection('posts').doc(slug).update({
    title_fa: translated.title,
    excerpt_fa: translated.excerpt,
    body_fa: translated.body,
  })

  console.log(`Done: ${slug}`)
}

async function main() {
  const snapshot = await db
    .collection('posts')
    .where('published', '==', true)
    .get()

  for (const doc of snapshot.docs) {
    await translatePost(doc.id)
  }

  console.log('All posts translated.')
}

main().catch(console.error)
