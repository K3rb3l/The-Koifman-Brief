# Admin Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Keystatic CMS with a custom Firebase-powered admin interface at `/admin` for managing articles, with auth, rich editor, and user management.

**Architecture:** Client-side SPA approach within a statically exported Next.js app. All data lives in Firestore (posts) and Firebase Storage (images). Firebase Auth handles authentication, with admin status verified against a Firestore `admins` collection. Public pages fetch from Firestore at runtime with loading states. Firebase Hosting rewrites route `/posts/*` to a single shell page that resolves slugs client-side.

**Tech Stack:** Next.js 16 (static export), Firebase SDK (Auth, Firestore, Storage), `@uiw/react-md-editor` (rich markdown editor), `react-markdown` + `remark-gfm` (public rendering), Tailwind CSS v4, Vitest.

---

## Important Patterns

### Static Export + Client-Side Data
Since `output: 'export'` is kept, dynamic routes like `/posts/[slug]` can't fetch from Firestore at build time. Solution:
- Remove the dynamic `[slug]` route
- Create a static `/posts` page that reads the slug from `window.location.pathname`
- Firebase Hosting rewrite: `/posts/**` → `/posts.html`
- Pages use server component for metadata + render a client component for data fetching

### Server/Client Component Split
```
page.tsx (server) — exports metadata, renders client component
  └── ClientContent.tsx (client) — 'use client', fetches Firestore, renders UI
```

### Admin Pages
All under `/admin/*` — static routes (no dynamic segments), fully client-side.

### Existing Files Reference
- Theme colors: `src/app/globals.css` (CSS custom properties `--ac`, `--bg`, etc.)
- Utils: `src/lib/utils.ts` (formatDate, estimateReadingTime, slugToTitle)
- Components: `src/components/PostCard.tsx`, `Header.tsx`, `ScrollReveal.tsx`, etc.
- Firebase config: `firebase.json`, `apphosting.yaml`, `.firebaserc`

---

### Task 1: Install Dependencies + Remove Keystatic

**Files:**
- Modify: `package.json`
- Delete: `keystatic.config.ts`
- Delete: `src/lib/keystatic.ts`

**Step 1: Install new dependencies**

Run:
```bash
npm install firebase @uiw/react-md-editor react-markdown remark-gfm
```

**Step 2: Uninstall Keystatic and Markdoc**

Run:
```bash
npm uninstall @keystatic/core @keystatic/next @markdoc/markdoc
```

**Step 3: Delete Keystatic config files**

Run:
```bash
rm keystatic.config.ts src/lib/keystatic.ts
```

**Step 4: Verify build still works (will have import errors — expected)**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Errors about missing `@/lib/keystatic` imports (we'll fix these in later tasks)

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Keystatic and add Firebase, markdown editor dependencies"
```

---

### Task 2: Firebase Client SDK + Types

**Files:**
- Create: `src/lib/firebase.ts`
- Create: `src/types/post.ts`

**Step 1: Write the Post and Admin types**

```typescript
// src/types/post.ts
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
```

**Step 2: Create Firebase client initialization**

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAOex7aRLvN5kW8RrRE4PoOFB9ytEHZLZU',
  authDomain: 'the-koifman-brief.firebaseapp.com',
  projectId: 'the-koifman-brief',
  storageBucket: 'the-koifman-brief.firebasestorage.app',
  messagingSenderId: '283874833646',
  appId: '1:283874833646:web:d917e1dec22018bfae2fff',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

**Step 3: Commit**

```bash
git add src/types/post.ts src/lib/firebase.ts
git commit -m "feat: add Firebase client SDK initialization and post types"
```

---

### Task 3: Firestore Data Access Layer

**Files:**
- Create: `src/lib/posts.ts`
- Create: `src/lib/admins.ts`
- Create: `src/lib/storage.ts`

**Step 1: Create posts data access module**

```typescript
// src/lib/posts.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Post } from '@/types/post'

const postsRef = collection(db, 'posts')

export async function getPublishedPosts(): Promise<Post[]> {
  const q = query(postsRef, where('published', '==', true), orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ slug: doc.id, ...doc.data() }) as Post)
}

export async function getAllPosts(): Promise<Post[]> {
  const q = query(postsRef, orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ slug: doc.id, ...doc.data() }) as Post)
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
```

**Step 2: Create admins data access module**

```typescript
// src/lib/admins.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Admin } from '@/types/post'

const adminsRef = collection(db, 'admins')

export async function isAdmin(uid: string): Promise<boolean> {
  const docSnap = await getDoc(doc(db, 'admins', uid))
  return docSnap.exists()
}

export async function getAllAdmins(): Promise<(Admin & { uid: string })[]> {
  const snapshot = await getDocs(adminsRef)
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }) as Admin & { uid: string })
}

export async function addAdmin(uid: string, email: string): Promise<void> {
  await setDoc(doc(db, 'admins', uid), {
    email,
    createdAt: Timestamp.now(),
  })
}

export async function removeAdmin(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'admins', uid))
}
```

**Step 3: Create storage helper module**

```typescript
// src/lib/storage.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadPostImage(
  slug: string,
  file: File,
  path: string = 'cover'
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const storageRef = ref(storage, `images/posts/${slug}/${path}.${ext}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function deletePostImages(slug: string): Promise<void> {
  // Best-effort delete — Storage doesn't support listing without admin SDK,
  // so we try common paths
  const paths = ['cover.jpg', 'cover.jpeg', 'cover.png', 'cover.webp']
  for (const path of paths) {
    try {
      await deleteObject(ref(storage, `images/posts/${slug}/${path}`))
    } catch {
      // File doesn't exist, skip
    }
  }
}

export async function uploadInlineImage(slug: string, file: File): Promise<string> {
  const timestamp = Date.now()
  const ext = file.name.split('.').pop() || 'jpg'
  const storageRef = ref(storage, `images/posts/${slug}/inline-${timestamp}.${ext}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
```

**Step 4: Commit**

```bash
git add src/lib/posts.ts src/lib/admins.ts src/lib/storage.ts
git commit -m "feat: add Firestore and Storage data access layer"
```

---

### Task 4: Auth Context + Admin Guard

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Create: `src/components/AdminGuard.tsx`

**Step 1: Create Auth context provider**

```typescript
// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { isAdmin } from '@/lib/admins'

type AuthState = {
  user: User | null
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, isAdmin: false, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isAdmin: false, loading: true })

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminStatus = await isAdmin(user.uid)
        setState({ user, isAdmin: adminStatus, loading: false })
      } else {
        setState({ user: null, isAdmin: false, loading: false })
      }
    })
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
```

**Step 2: Create AdminGuard component**

```typescript
// src/components/AdminGuard.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/LoginForm'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted font-sans">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted font-sans">You don't have admin privileges.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
```

**Step 3: Create LoginForm component**

```typescript
// src/components/LoginForm.tsx
'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h2 className="font-serif text-2xl font-bold text-foreground text-center mb-6">
          Admin Login
        </h2>
        {error && (
          <p className="text-red-500 text-sm font-sans text-center">{error}</p>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded border border-border bg-surface text-foreground font-sans input-glow focus:outline-none focus:border-accent"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded border border-border bg-surface text-foreground font-sans input-glow focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded bg-accent text-white font-sans font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add src/contexts/AuthContext.tsx src/components/AdminGuard.tsx src/components/LoginForm.tsx
git commit -m "feat: add Firebase Auth context, admin guard, and login form"
```

---

### Task 5: Update Public Pages to Use Firestore

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/HomeContent.tsx`
- Modify: `src/app/posts/[slug]/page.tsx` → Replace with `src/app/posts/page.tsx`
- Create: `src/components/PostContent.tsx`
- Modify: `src/app/articles/page.tsx`
- Create: `src/components/ArticlesContent.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `firebase.json`

**Step 1: Create HomeContent client component**

```typescript
// src/components/HomeContent.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPublishedPosts } from '@/lib/posts'
import { PostCard } from '@/components/PostCard'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ScrollReveal } from '@/components/ScrollReveal'
import { CursorSpotlight } from '@/components/CursorSpotlight'
import { AnimatedPortrait } from '@/components/AnimatedPortrait'
import type { Post } from '@/types/post'

export function HomeContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublishedPosts().then((data) => {
      setPosts(data)
      setLoading(false)
    })
  }, [])

  const totalBriefs = posts.length

  return (
    <div>
      <section className="animate-fade-in-up mb-16 flex flex-col items-center text-center">
        <Link href="/about" className="mb-5 group">
          <AnimatedPortrait
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-border group-hover:ring-accent/50 transition-all duration-300"
          />
        </Link>
        <p className="text-[11px] font-sans font-medium tracking-[0.3em] uppercase text-muted mb-3">
          Clarity in complexity
        </p>
        <p className="text-[11px] font-sans font-medium tracking-[0.2em] uppercase text-muted mb-4">
          by <Link href="/about" className="text-accent hover:text-link-hover transition-colors duration-200 cursor-pointer">Shahar Koifman</Link>
        </p>
        <h2 className="font-serif text-lg sm:text-xl text-muted leading-relaxed max-w-md mx-auto">
          Geopolitics, FinTech, and real estate - tracing the macro forces that create structural shifts.
        </h2>
      </section>

      {loading ? (
        <div className="text-center text-muted font-sans py-12">Loading briefs...</div>
      ) : posts.length > 0 ? (
        <CursorSpotlight>
          <section className="space-y-2">
            {posts.map((post, i) => (
              <ScrollReveal key={post.slug} delay={i * 0.08}>
                <PostCard
                  slug={post.slug}
                  title={post.title}
                  date={post.date}
                  category={post.category}
                  excerpt={post.excerpt}
                  briefNumber={totalBriefs - i}
                  isLatest={i === 0}
                />
              </ScrollReveal>
            ))}
          </section>
        </CursorSpotlight>
      ) : (
        <p className="text-muted font-sans text-center">No briefs yet. Check back soon.</p>
      )}

      <ScrollReveal>
        <SubscribeForm />
      </ScrollReveal>
    </div>
  )
}
```

**Step 2: Update homepage to use HomeContent**

Replace entire `src/app/page.tsx`:

```typescript
// src/app/page.tsx
import { HomeContent } from '@/components/HomeContent'

export default function HomePage() {
  return <HomeContent />
}
```

**Step 3: Create PostContent client component**

```typescript
// src/components/PostContent.tsx
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPost, getPublishedPosts } from '@/lib/posts'
import { formatDate, estimateReadingTime, slugToTitle } from '@/lib/utils'
import { AuthorCard } from '@/components/AuthorCard'
import { ShareLinks } from '@/components/ShareLinks'
import { PostNavigation } from '@/components/PostNavigation'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ScrollReveal } from '@/components/ScrollReveal'
import { ReadingProgress } from '@/components/ReadingProgress'
import { CountUp } from '@/components/CountUp'
import type { Post } from '@/types/post'

export function PostContent() {
  const pathname = usePathname()
  const slug = pathname.replace(/^\/posts\//, '').replace(/\/$/, '')

  const [post, setPost] = useState<Post | null>(null)
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug || slug === 'posts') {
      setNotFound(true)
      setLoading(false)
      return
    }

    Promise.all([getPost(slug), getPublishedPosts()]).then(([postData, postsData]) => {
      if (!postData || !postData.published) {
        setNotFound(true)
      } else {
        setPost(postData)
        setAllPosts(postsData)
      }
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return <div className="text-center text-muted font-sans py-24">Loading...</div>
  }

  if (notFound || !post) {
    return (
      <div className="text-center py-24">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Brief not found</h2>
        <p className="text-muted font-sans">This brief doesn't exist or has been removed.</p>
      </div>
    )
  }

  const currentIndex = allPosts.findIndex((p) => p.slug === slug)
  const briefNumber = allPosts.length - currentIndex

  const previous = currentIndex < allPosts.length - 1
    ? { slug: allPosts[currentIndex + 1].slug, title: allPosts[currentIndex + 1].title }
    : null
  const next = currentIndex > 0
    ? { slug: allPosts[currentIndex - 1].slug, title: allPosts[currentIndex - 1].title }
    : null

  const readingTime = estimateReadingTime(post.body)

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: { '@type': 'Person', name: 'Shahar Koifman' },
            publisher: { '@type': 'Organization', name: 'The Koifman Brief' },
          }),
        }}
      />
      <article>
        <header className="mb-10 text-center">
          <div className="animate-fade-in-up flex items-center justify-center gap-3 mb-5">
            <span className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-muted">
              No. <CountUp target={briefNumber} />
            </span>
            <span className="w-[3px] h-[3px] bg-border rounded-full" />
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-accent">
              {slugToTitle(post.category)}
            </span>
          </div>
          <h1 className="animate-fade-in-up-delay-1 font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight max-w-2xl mx-auto">
            {post.title}
          </h1>
          <div className="animate-fade-in-up-delay-2 flex items-center justify-center gap-3 mt-5 text-[13px] text-muted font-sans">
            <span>By Shahar Koifman</span>
            <span>-</span>
            <time>{formatDate(post.date)}</time>
            <span>-</span>
            <span>{readingTime}</span>
          </div>
        </header>

        {post.coverImageUrl && (
          <div className="mb-10 -mx-4 sm:mx-0">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        <div className="decorative-rule"><span className="diamond" /></div>

        <ScrollReveal>
          <div className="prose prose-lg max-w-none dark:prose-invert drop-cap">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <ShareLinks title={post.title} slug={slug} />
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <AuthorCard />
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <PostNavigation previous={previous} next={next} />
        </ScrollReveal>
      </article>

      <ScrollReveal delay={0.1}>
        <SubscribeForm />
      </ScrollReveal>
    </>
  )
}
```

**Step 4: Replace posts/[slug] route with static posts page**

Delete the old route and create the new one:

```bash
rm -rf src/app/posts/\[slug\]
```

Create `src/app/posts/page.tsx`:

```typescript
// src/app/posts/page.tsx
import { PostContent } from '@/components/PostContent'

export default function PostPage() {
  return <PostContent />
}
```

**Step 5: Create ArticlesContent client component**

```typescript
// src/components/ArticlesContent.tsx
'use client'

import { useEffect, useState } from 'react'
import { getPublishedPosts } from '@/lib/posts'
import { PostCard } from '@/components/PostCard'
import { ScrollReveal } from '@/components/ScrollReveal'
import type { Post } from '@/types/post'

export function ArticlesContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublishedPosts().then((data) => {
      setPosts(data)
      setLoading(false)
    })
  }, [])

  const totalBriefs = posts.length

  return (
    <div>
      <header className="mb-12 text-center">
        <p className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-muted mb-3">
          Archive
        </p>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          All Briefs
        </h1>
        {!loading && (
          <p className="text-sm text-muted font-sans mt-2">
            {posts.length} brief{posts.length !== 1 ? 's' : ''} published
          </p>
        )}
      </header>

      {loading ? (
        <div className="text-center text-muted font-sans py-12">Loading briefs...</div>
      ) : posts.length > 0 ? (
        <div className="space-y-10">
          {posts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 0.05}>
              <PostCard
                slug={post.slug}
                title={post.title}
                date={post.date}
                category={post.category}
                excerpt={post.excerpt}
                briefNumber={totalBriefs - i}
              />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <p className="text-muted font-sans text-center">No briefs yet.</p>
      )}
    </div>
  )
}
```

**Step 6: Update articles page**

Replace entire `src/app/articles/page.tsx`:

```typescript
// src/app/articles/page.tsx
import type { Metadata } from 'next'
import { ArticlesContent } from '@/components/ArticlesContent'

export const metadata: Metadata = {
  title: 'All Articles',
  description: 'All articles from The Koifman Brief.',
}

export default function ArticlesPage() {
  return <ArticlesContent />
}
```

**Step 7: Update layout.tsx — wrap with AuthProvider**

In `src/app/layout.tsx`, add the AuthProvider inside ThemeProvider:

```typescript
// Add import at top:
import { AuthProvider } from '@/contexts/AuthContext'

// Wrap children with AuthProvider inside ThemeProvider:
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <AuthProvider>
    <LoadingAnimation />
    <BackgroundAnimation />
    <Header />
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
      {children}
    </main>
    <Footer />
  </AuthProvider>
</ThemeProvider>
```

**Step 8: Update firebase.json — add rewrites for posts and admin**

```json
{
  "hosting": {
    "public": "out",
    "cleanUrls": true,
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/posts/**",
        "destination": "/posts.html"
      },
      {
        "source": "/admin/**",
        "destination": "/admin.html"
      },
      {
        "source": "**",
        "destination": "/404.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

**Step 9: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds (may have warnings about unused components)

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: migrate public pages from Keystatic to Firestore client-side rendering"
```

---

### Task 6: Admin Layout + Dashboard

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/components/AdminDashboard.tsx`

**Step 1: Create admin layout (no public site header/footer)**

```typescript
// src/app/admin/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin | The Koifman Brief',
  robots: 'noindex, nofollow',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}
```

Note: This layout nests inside the root layout. The root layout has Header/Footer. We'll need to conditionally hide them for admin routes. Alternative approach: keep them visible (admin users can navigate back to public site). Let's keep header visible but hide BackgroundAnimation and LoadingAnimation for admin. Actually, simplest: just let admin inherit the root layout as-is. The admin content will render inside the `<main>` tag. The admin layout just adds the metadata override.

Revise to simpler admin layout:

```typescript
// src/app/admin/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin | The Koifman Brief',
  robots: 'noindex, nofollow',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

**Step 2: Create AdminDashboard client component**

```typescript
// src/components/AdminDashboard.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { getAllPosts, deletePost as removePost } from '@/lib/posts'
import { getAllAdmins, addAdmin, removeAdmin } from '@/lib/admins'
import { deletePostImages } from '@/lib/storage'
import { formatDate, slugToTitle } from '@/lib/utils'
import type { Post, Admin } from '@/types/post'
import { Pencil, Trash2, Plus, LogOut, Eye, EyeOff, UserPlus, UserMinus } from 'lucide-react'

export function AdminDashboard() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [admins, setAdmins] = useState<(Admin & { uid: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminUid, setNewAdminUid] = useState('')
  const [showUsers, setShowUsers] = useState(false)

  const loadData = async () => {
    const [postsData, adminsData] = await Promise.all([getAllPosts(), getAllAdmins()])
    setPosts(postsData)
    setAdmins(adminsData)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await removePost(slug)
    await deletePostImages(slug)
    setPosts((prev) => prev.filter((p) => p.slug !== slug))
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminUid.trim() || !newAdminEmail.trim()) return
    await addAdmin(newAdminUid.trim(), newAdminEmail.trim())
    setNewAdminUid('')
    setNewAdminEmail('')
    loadData()
  }

  const handleRemoveAdmin = async (uid: string, email: string) => {
    if (uid === user?.uid) {
      alert("You can't remove yourself.")
      return
    }
    if (!confirm(`Remove admin "${email}"?`)) return
    await removeAdmin(uid)
    setAdmins((prev) => prev.filter((a) => a.uid !== uid))
  }

  if (loading) {
    return <div className="text-center text-muted font-sans py-12">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted font-sans mt-1">{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-sans text-sm rounded hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> New Article
          </Link>
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 px-4 py-2 border border-border text-muted font-sans text-sm rounded hover:text-foreground transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <section>
        <h2 className="font-serif text-lg font-bold text-foreground mb-4">
          Articles ({posts.length})
        </h2>
        <div className="border border-border rounded overflow-hidden">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-semibold text-foreground truncate">
                    {post.title}
                  </h3>
                  {post.published ? (
                    <span className="flex items-center gap-1 text-[10px] font-sans uppercase tracking-wider text-green-600 dark:text-green-400">
                      <Eye size={12} /> Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-sans uppercase tracking-wider text-muted">
                      <EyeOff size={12} /> Draft
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted font-sans">
                  <span>{slugToTitle(post.category)}</span>
                  <span>-</span>
                  <span>{formatDate(post.date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/admin/articles/edit?slug=${post.slug}`}
                  className="p-2 text-muted hover:text-accent transition-colors"
                  title="Edit"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(post.slug, post.title)}
                  className="p-2 text-muted hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="px-4 py-8 text-center text-muted font-sans">
              No articles yet. Create your first one!
            </div>
          )}
        </div>
      </section>

      {/* Admin Users Section */}
      <section>
        <button
          onClick={() => setShowUsers(!showUsers)}
          className="flex items-center gap-2 font-serif text-lg font-bold text-foreground mb-4 hover:text-accent transition-colors"
        >
          Admin Users ({admins.length})
          <span className="text-sm">{showUsers ? '▾' : '▸'}</span>
        </button>

        {showUsers && (
          <div className="space-y-4">
            <div className="border border-border rounded overflow-hidden">
              {admins.map((admin) => (
                <div
                  key={admin.uid}
                  className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0"
                >
                  <div>
                    <span className="font-sans text-foreground">{admin.email}</span>
                    <span className="text-xs text-muted font-sans ml-2">({admin.uid.slice(0, 8)}...)</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAdmin(admin.uid, admin.email)}
                    className="p-2 text-muted hover:text-red-500 transition-colors"
                    title="Remove admin"
                  >
                    <UserMinus size={16} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddAdmin} className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-muted font-sans mb-1">Firebase UID</label>
                <input
                  type="text"
                  value={newAdminUid}
                  onChange={(e) => setNewAdminUid(e.target.value)}
                  placeholder="User UID"
                  className="w-full px-3 py-2 rounded border border-border bg-surface text-foreground font-sans text-sm input-glow focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-muted font-sans mb-1">Email</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 rounded border border-border bg-surface text-foreground font-sans text-sm input-glow focus:outline-none focus:border-accent"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-2 bg-accent text-white font-sans text-sm rounded hover:opacity-90 transition-opacity"
              >
                <UserPlus size={14} /> Add
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}
```

**Step 3: Create admin page**

```typescript
// src/app/admin/page.tsx
'use client'

import { AdminGuard } from '@/components/AdminGuard'
import { AdminDashboard } from '@/components/AdminDashboard'

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  )
}
```

**Step 4: Commit**

```bash
git add src/app/admin/ src/components/AdminDashboard.tsx
git commit -m "feat: add admin dashboard with article list and user management"
```

---

### Task 7: Article Editor with Rich Markdown

**Files:**
- Create: `src/components/ArticleEditor.tsx`
- Create: `src/app/admin/articles/new/page.tsx`
- Create: `src/app/admin/articles/edit/page.tsx`

**Step 1: Create ArticleEditor component**

This is the core component shared by new + edit pages. It uses `@uiw/react-md-editor` for rich markdown editing.

```typescript
// src/components/ArticleEditor.tsx
'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Timestamp } from 'firebase/firestore'
import { savePost, generateSlug } from '@/lib/posts'
import { uploadPostImage, uploadInlineImage } from '@/lib/storage'
import type { Post, PostCategory, PostFormData } from '@/types/post'
import { Save, ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const CATEGORIES: { label: string; value: PostCategory }[] = [
  { label: 'Geopolitics', value: 'geopolitics' },
  { label: 'FinTech', value: 'fintech' },
  { label: 'Real Estate', value: 'real-estate' },
  { label: 'Macro', value: 'macro' },
]

type ArticleEditorProps = {
  existingPost?: Post
}

export function ArticleEditor({ existingPost }: ArticleEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<PostFormData>({
    title: existingPost?.title ?? '',
    date: existingPost?.date ?? new Date().toISOString().split('T')[0],
    category: existingPost?.category ?? 'geopolitics',
    excerpt: existingPost?.excerpt ?? '',
    body: existingPost?.body ?? '',
    published: existingPost?.published ?? false,
    coverImage: null,
    coverImageUrl: existingPost?.coverImageUrl ?? '',
  })

  const updateField = <K extends keyof PostFormData>(key: K, value: PostFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateField('coverImage', file)
      updateField('coverImageUrl', URL.createObjectURL(file))
    }
  }

  const handleInlineImageUpload = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const slug = existingPost?.slug ?? generateSlug(form.title)
      if (!slug) {
        alert('Enter a title first so images can be organized.')
        return
      }
      try {
        const url = await uploadInlineImage(slug, file)
        updateField('body', form.body + `\n\n![${file.name}](${url})\n`)
      } catch {
        alert('Failed to upload image.')
      }
    }
    input.click()
  }, [existingPost?.slug, form.title, form.body])

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    if (!form.excerpt.trim()) {
      setError('Excerpt is required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const slug = existingPost?.slug ?? generateSlug(form.title)
      let coverImageUrl = form.coverImageUrl

      if (form.coverImage) {
        coverImageUrl = await uploadPostImage(slug, form.coverImage)
      }

      await savePost(slug, {
        title: form.title,
        date: form.date,
        category: form.category,
        excerpt: form.excerpt,
        coverImageUrl,
        body: form.body,
        published: form.published,
        createdAt: existingPost?.createdAt ?? Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      router.push('/admin')
    } catch {
      setError('Failed to save article. Check your permissions.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 text-muted hover:text-foreground font-sans text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-sans text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField('published', e.target.checked)}
              className="accent-accent"
            />
            Published
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-sans text-sm rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm font-sans">{error}</p>
      )}

      {/* Metadata Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs text-muted font-sans mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Article title"
            className="w-full px-4 py-3 rounded border border-border bg-surface text-foreground font-serif text-xl input-glow focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted font-sans mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full px-4 py-3 rounded border border-border bg-surface text-foreground font-sans input-glow focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted font-sans mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => updateField('category', e.target.value as PostCategory)}
            className="w-full px-4 py-3 rounded border border-border bg-surface text-foreground font-sans input-glow focus:outline-none focus:border-accent"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-muted font-sans mb-1">Excerpt</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => updateField('excerpt', e.target.value)}
            placeholder="Short summary for homepage cards and SEO"
            rows={2}
            className="w-full px-4 py-3 rounded border border-border bg-surface text-foreground font-sans input-glow focus:outline-none focus:border-accent resize-none"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-xs text-muted font-sans mb-1">Cover Image</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm font-sans text-muted hover:text-foreground cursor-pointer transition-colors">
            <Upload size={16} /> Choose Image
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
            />
          </label>
          {form.coverImageUrl && (
            <img
              src={form.coverImageUrl}
              alt="Cover preview"
              className="h-16 rounded object-cover"
            />
          )}
        </div>
      </div>

      {/* Markdown Editor */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-muted font-sans">Body (Markdown)</label>
          <button
            type="button"
            onClick={handleInlineImageUpload}
            className="flex items-center gap-1 text-xs text-muted hover:text-accent font-sans transition-colors"
          >
            <ImageIcon size={14} /> Insert Image
          </button>
        </div>
        <div data-color-mode="auto">
          <MDEditor
            value={form.body}
            onChange={(val) => updateField('body', val ?? '')}
            height={500}
            preview="live"
          />
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Create new article page**

```typescript
// src/app/admin/articles/new/page.tsx
'use client'

import { AdminGuard } from '@/components/AdminGuard'
import { ArticleEditor } from '@/components/ArticleEditor'

export default function NewArticlePage() {
  return (
    <AdminGuard>
      <ArticleEditor />
    </AdminGuard>
  )
}
```

**Step 3: Create edit article page**

```typescript
// src/app/admin/articles/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminGuard } from '@/components/AdminGuard'
import { ArticleEditor } from '@/components/ArticleEditor'
import { getPost } from '@/lib/posts'
import type { Post } from '@/types/post'

function EditArticleContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    getPost(slug).then((data) => {
      setPost(data)
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return <div className="text-center text-muted font-sans py-12">Loading article...</div>
  }

  if (!post) {
    return <div className="text-center text-muted font-sans py-12">Article not found.</div>
  }

  return <ArticleEditor existingPost={post} />
}

export default function EditArticlePage() {
  return (
    <AdminGuard>
      <EditArticleContent />
    </AdminGuard>
  )
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/ArticleEditor.tsx src/app/admin/articles/
git commit -m "feat: add article editor with rich markdown, image upload, and inline images"
```

---

### Task 8: Firestore + Storage Security Rules

**Files:**
- Create: `firestore.rules`
- Create: `storage.rules`

**Step 1: Create Firestore security rules**

```
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: check if user is admin
    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Posts: public read for published, admin write
    match /posts/{slug} {
      allow read: if resource.data.published == true;
      allow read, write: if isAdmin();
    }

    // Admins: admin-only read and write
    match /admins/{uid} {
      allow read, write: if isAdmin();
    }
  }
}
```

**Step 2: Create Storage security rules**

```
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Post images: public read, admin write
    match /images/posts/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }

    // Default: deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**Step 3: Commit**

```bash
git add firestore.rules storage.rules
git commit -m "feat: add Firestore and Storage security rules for admin access"
```

---

### Task 9: Migration Script + Tests

**Files:**
- Create: `scripts/migrate-posts.ts`
- Create: `src/__tests__/migration.test.ts`
- Create: `src/__tests__/posts.test.ts`

**Step 1: Create migration script**

This script reads the 3 existing `.mdoc` files and uploads them to Firestore. It also uploads the cover image to Firebase Storage.

```typescript
// scripts/migrate-posts.ts
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// Initialize firebase-admin (requires GOOGLE_APPLICATION_CREDENTIALS env var)
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

function parseMdoc(content: string): { frontmatter: MdocFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error('Invalid mdoc format')

  const rawFrontmatter = match[1]
  const body = match[2].trim()

  // Simple YAML parser for our known fields
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

    // Upload cover image if exists
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
```

**Step 2: Install firebase-admin as dev dependency (for migration only)**

Run:
```bash
npm install -D firebase-admin
```

**Step 3: Add migration script to package.json**

Add to scripts:
```json
"migrate": "npx tsx scripts/migrate-posts.ts"
```

**Step 4: Write migration parsing tests**

```typescript
// src/__tests__/migration.test.ts
import { describe, it, expect } from 'vitest'

// Test the parseMdoc function by inlining the logic (avoid importing the script directly
// since it has side effects)
function parseMdoc(content: string) {
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

  return { frontmatter, body }
}

describe('parseMdoc', () => {
  it('parses simple frontmatter and body', () => {
    const content = `---
title: The Koifman Brief Launches
date: '2026-03-04'
category: macro
excerpt: >-
  Introducing The Koifman Brief — a publication covering the macro forces that
  create structural shifts, and what decision-makers should do about them.
---

Welcome to The Koifman Brief.

## What to expect

Each piece will focus on a specific development.`

    const result = parseMdoc(content)

    expect(result.frontmatter.title).toBe('The Koifman Brief Launches')
    expect(result.frontmatter.date).toBe('2026-03-04')
    expect(result.frontmatter.category).toBe('macro')
    expect(result.frontmatter.excerpt).toContain('Introducing The Koifman Brief')
    expect(result.frontmatter.excerpt).toContain('decision-makers should do about them.')
    expect(result.body).toContain('Welcome to The Koifman Brief.')
    expect(result.body).toContain('## What to expect')
  })

  it('parses frontmatter with coverImage', () => {
    const content = `---
title: Why Did Iran Attack Turkey?
date: '2026-03-06'
category: geopolitics
excerpt: >-
  Iran's strikes on Turkish targets are being called everything from suicidal to
  messianic.
coverImage: /images/posts/why-did-iran-attack-turkey/cover.jpeg
---

Iran's strikes on Turkish targets.`

    const result = parseMdoc(content)

    expect(result.frontmatter.title).toBe('Why Did Iran Attack Turkey?')
    expect(result.frontmatter.coverImage).toBe('/images/posts/why-did-iran-attack-turkey/cover.jpeg')
    expect(result.body).toBe("Iran's strikes on Turkish targets.")
  })

  it('throws on invalid format', () => {
    expect(() => parseMdoc('no frontmatter')).toThrow('Invalid mdoc format')
  })

  it('handles multiline excerpt', () => {
    const content = `---
title: Test
date: '2026-01-01'
category: macro
excerpt: >-
  Line one of the excerpt that continues
  across multiple lines for readability.
---

Body content.`

    const result = parseMdoc(content)
    expect(result.frontmatter.excerpt).toContain('Line one')
    expect(result.frontmatter.excerpt).toContain('multiple lines')
  })
})
```

**Step 5: Write data layer unit tests**

```typescript
// src/__tests__/posts.test.ts
import { describe, it, expect } from 'vitest'
import { generateSlug } from '@/lib/posts'

describe('generateSlug', () => {
  it('converts title to lowercase kebab-case', () => {
    expect(generateSlug('Why Did Iran Attack Turkey?')).toBe('why-did-iran-attack-turkey')
  })

  it('removes special characters', () => {
    expect(generateSlug("What's Next for FinTech?")).toBe('whats-next-for-fintech')
  })

  it('collapses multiple hyphens', () => {
    expect(generateSlug('Hello   World!!!')).toBe('hello-world')
  })

  it('trims leading and trailing hyphens', () => {
    expect(generateSlug('---test---')).toBe('test')
  })

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('')
  })
})
```

**Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass

**Step 7: Commit**

```bash
git add scripts/ src/__tests__/ package.json
git commit -m "feat: add migration script and tests for mdoc parsing and slug generation"
```

---

### Task 10: Clean Up Keystatic Remnants + Final Config

**Files:**
- Modify: `apphosting.yaml`
- Delete: `content/posts/` (after successful migration)
- Modify: `next.config.ts` (if needed)

**Step 1: Update apphosting.yaml — remove Keystatic env vars**

Remove the Keystatic-related environment variables from `apphosting.yaml`, keep only:

```yaml
runConfig:
  concurrency: 80
  cpu: 1
  memoryMiB: 512
  minInstances: 0
  maxInstances: 4

env:
  - variable: BUTTONDOWN_API_KEY
    secret: buttondown-api-key
```

**Step 2: Verify full build**

Run: `npm run build`
Expected: Build succeeds, output in `out/` directory

**Step 3: Verify test suite**

Run: `npm test`
Expected: All tests pass

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove Keystatic config from apphosting.yaml, clean up"
```

---

### Task 11: Seed First Admin User

This is a manual step documented here for the implementer.

**Step 1: Create a Firebase Auth user**

Go to Firebase Console → Authentication → Add User. Create an email/password user.

**Step 2: Add the user to the admins collection**

Go to Firebase Console → Firestore → Create collection `admins` → Add document:
- Document ID: the user's UID (from Auth)
- Fields: `email` (string), `createdAt` (timestamp)

**Step 3: Test login**

Run `npm run dev`, go to `http://localhost:3000/admin`, sign in with the created user.

---

### Task 12: Run Migration

**Step 1: Download service account key**

Go to Firebase Console → Project Settings → Service Accounts → Generate New Private Key.
Save as `service-account.json` in project root (already in `.gitignore` ideally — verify).

**Step 2: Run migration**

```bash
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run migrate
```

Expected: All 3 articles migrated to Firestore, cover image uploaded to Storage.

**Step 3: Verify in Firebase Console**

Check Firestore `posts` collection — should have 3 documents.
Check Storage `images/posts/` — should have cover image.

**Step 4: Test public pages**

Run `npm run dev` and verify:
- Homepage shows all 3 articles
- Clicking an article shows the full post with correct markdown rendering
- Articles page shows all posts

**Step 5: After verification, delete local content**

```bash
rm -rf content/
```

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove local content directory after migration to Firestore"
```

---

## Summary of All Files

### Created
- `src/lib/firebase.ts` — Firebase SDK init
- `src/lib/posts.ts` — Firestore posts CRUD
- `src/lib/admins.ts` — Firestore admins CRUD
- `src/lib/storage.ts` — Firebase Storage helpers
- `src/types/post.ts` — TypeScript types
- `src/contexts/AuthContext.tsx` — Auth state provider
- `src/components/AdminGuard.tsx` — Auth + admin check wrapper
- `src/components/LoginForm.tsx` — Email/password login
- `src/components/AdminDashboard.tsx` — Article list + user management
- `src/components/ArticleEditor.tsx` — Rich markdown editor
- `src/components/HomeContent.tsx` — Client-side homepage
- `src/components/PostContent.tsx` — Client-side post page
- `src/components/ArticlesContent.tsx` — Client-side articles list
- `src/app/admin/layout.tsx` — Admin layout
- `src/app/admin/page.tsx` — Admin page (login/dashboard)
- `src/app/admin/articles/new/page.tsx` — New article
- `src/app/admin/articles/edit/page.tsx` — Edit article
- `scripts/migrate-posts.ts` — Migration script
- `src/__tests__/migration.test.ts` — Migration tests
- `src/__tests__/posts.test.ts` — Posts util tests
- `firestore.rules` — Firestore security rules
- `storage.rules` — Storage security rules

### Modified
- `src/app/page.tsx` — Use HomeContent client component
- `src/app/posts/page.tsx` — Replaces `[slug]` dynamic route
- `src/app/articles/page.tsx` — Use ArticlesContent client component
- `src/app/layout.tsx` — Add AuthProvider
- `firebase.json` — Add Firestore rules config, add rewrites
- `apphosting.yaml` — Remove Keystatic env vars
- `package.json` — New deps, remove old deps, add migrate script

### Deleted
- `keystatic.config.ts`
- `src/lib/keystatic.ts`
- `src/app/posts/[slug]/page.tsx`
- `content/posts/` (after migration)
