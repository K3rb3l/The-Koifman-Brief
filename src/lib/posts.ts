import {
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, where, orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Post } from '@/types/post'

const postsRef = collection(db, 'posts')

export async function getPublishedPosts(): Promise<Post[]> {
  const q = query(postsRef, where('published', '==', true), orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ slug: d.id, ...d.data() }) as Post)
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
