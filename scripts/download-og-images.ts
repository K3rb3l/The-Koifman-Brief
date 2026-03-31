import { getPublishedPostsServer } from '../src/lib/posts-server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

async function downloadOGImages() {
  const posts = await getPublishedPostsServer()
  const ogDir = path.join(process.cwd(), 'out', 'og', 'posts')

  await mkdir(ogDir, { recursive: true })

  const results = await Promise.allSettled(
    posts.map(async (post) => {
      if (!post.coverImageUrl) return

      const response = await fetch(post.coverImageUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const buffer = Buffer.from(await response.arrayBuffer())
      const ext = post.coverImageUrl.match(/\.(png|webp)/i) ? post.coverImageUrl.match(/\.(png|webp)/i)![0] : '.jpg'
      await writeFile(path.join(ogDir, `${post.slug}${ext}`), buffer)
      console.log(`  OG image: ${post.slug}${ext}`)
    }),
  )

  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length) {
    console.warn(`Failed to download ${failed.length} OG images`)
  }
}

downloadOGImages()
