import { Timestamp } from 'firebase/firestore'

export type PostCategory = 'geopolitics' | 'fintech' | 'real-estate' | 'macro'

export type Post = {
  slug: string
  title: string
  date: string
  category: PostCategory
  excerpt: string
  coverImageUrl: string
  body: string
  published: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type PostFormData = {
  title: string
  date: string
  category: PostCategory
  excerpt: string
  body: string
  published: boolean
  coverImage: File | null
  coverImageUrl: string
}

export type Admin = {
  email: string
  createdAt: Timestamp
}
