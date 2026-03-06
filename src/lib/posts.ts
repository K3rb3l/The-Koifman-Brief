import {
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, where, orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Post } from '@/types/post'

const postsRef = collection(db, 'posts')

const CACHE_KEY = 'tkb_posts_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

type CachedPosts = {
  posts: Post[]
  timestamp: number
}

function getCachedPosts(): Post[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached: CachedPosts = JSON.parse(raw)
    if (Date.now() - cached.timestamp > CACHE_TTL) return null
    return cached.posts
  } catch {
    return null
  }
}

function setCachedPosts(posts: Post[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ posts, timestamp: Date.now() }))
  } catch {
    // Storage full or unavailable
  }
}

export async function getPublishedPosts(): Promise<Post[]> {
  const q = query(postsRef, where('published', '==', true), orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  const posts = snapshot.docs.map((d) => ({ slug: d.id, ...d.data() }) as Post)
  setCachedPosts(posts)
  return posts
}

export function getCachedPublishedPosts(): Post[] | null {
  return getCachedPosts()
}

export async function getAllPosts(): Promise<Post[]> {
  const q = query(postsRef, orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ slug: d.id, ...d.data() }) as Post)
}

export async function getPost(slug: string): Promise<Post | null> {
  const docSnap = await getDoc(doc(db, 'posts', slug))
  if (!docSnap.exists()) return null
  return { slug: docSnap.id, ...docSnap.data() } as Post
}

export async function savePost(slug: string, data: Omit<Post, 'slug'>): Promise<void> {
  await setDoc(doc(db, 'posts', slug), data)
}

export async function deletePost(slug: string): Promise<void> {
  await deleteDoc(doc(db, 'posts', slug))
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
