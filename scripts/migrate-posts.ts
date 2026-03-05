import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

if (getApps().length === 0) {
  initializeApp({
    credential: cert(
      JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS!, 'utf-8'))
    ),
    storageBucket: 'the-koifman-brief.firebasestorage.app',
  })
}

const db = getFirestore()
const bucket = getStorage().bucket()

type MdocFrontmatter = {
  title: string
  date: string
  category: string
  excerpt: string
  coverImage?: string
}

export function parseMdoc(content: string): { frontmatter: MdocFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error('Invalid mdoc format')

  const rawFrontmatter = match[1]
  const body = match[2].trim()

  const frontmatter: Record<string, string> = {}
  let currentKey = ''
  let currentValue = ''

  for (const line of rawFrontmatter.split('\n')) {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/)
    if (keyMatch) {
      if (currentKey) {
        frontmatter[currentKey] = currentValue.trim()
      }
      currentKey = keyMatch[1]
      currentValue = keyMatch[2].replace(/^['">-]\s*/, '').replace(/['"]$/, '')
    } else if (currentKey && line.startsWith('  ')) {
      currentValue += ' ' + line.trim()
    }
  }
  if (currentKey) {
    frontmatter[currentKey] = currentValue.trim()
  }

  return {
    frontmatter: frontmatter as unknown as MdocFrontmatter,
    body,
  }
}

async function migrate() {
  const postsDir = resolve(__dirname, '../content/posts')
  const postDirs = [
    'the-koifman-brief-launches',
    'what-does-mojtaba-khameneis-appointment-mean-for-iran',
    'why-did-iran-attack-turkey',
  ]

  for (const slug of postDirs) {
    const mdocPath = resolve(postsDir, slug, 'index.mdoc')
    console.log(`Migrating: ${slug}`)

    const content = readFileSync(mdocPath, 'utf-8')
    const { frontmatter, body } = parseMdoc(content)

    let coverImageUrl = ''

    if (frontmatter.coverImage) {
      const localPath = resolve(__dirname, '..', 'public', frontmatter.coverImage.replace(/^\//, ''))
      if (existsSync(localPath)) {
        const destPath = `images/posts/${slug}/cover.jpeg`
        await bucket.upload(localPath, { destination: destPath })
        const file = bucket.file(destPath)
        await file.makePublic()
        coverImageUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`
        console.log(`  Uploaded cover image: ${coverImageUrl}`)
      }
    }

    await db.collection('posts').doc(slug).set({
      title: frontmatter.title,
      date: frontmatter.date.replace(/'/g, ''),
      category: frontmatter.category,
      excerpt: frontmatter.excerpt,
      coverImageUrl,
      body,
      published: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    console.log(`  Saved to Firestore`)
  }

  console.log('\nMigration complete!')
}

migrate().catch(console.error)
