import { Timestamp } from 'firebase/firestore'

export type PostCategory = 'geopolitics' | 'fintech' | 'real-estate' | 'macro'

export type Post = {
  slug: string
  title: string
  date: string
  category: PostCategory
  excerpt: string
  coverImageUrl: string
  coverAnimationUrl?: string
  body: string
  title_fa?: string
  excerpt_fa?: string
  body_fa?: string
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
  title_fa: string
  excerpt_fa: string
  body_fa: string
  published: boolean
  coverImage: File | null
  coverImageUrl: string
  coverAnimation: File | null
  coverAnimationUrl: string
}

export type Admin = {
  email: string
  createdAt: Timestamp
}
