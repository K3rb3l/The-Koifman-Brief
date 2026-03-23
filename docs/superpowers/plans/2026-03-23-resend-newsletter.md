# Resend + Firestore Newsletter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Buttondown newsletter with Resend + React Email + Firestore — subscribers stored in Firestore, emails sent via Resend, drafts auto-generated and editable by admin before sending.

**Architecture:** All backend logic in Firebase Functions (4 new functions: `subscribe`, `onPostPublished`, `sendNewsletter`, `unsubscribe`). Frontend changes: swap Buttondown call in SubscribeForm, add newsletter management section to AdminDashboard. Email template built with React Email.

**Tech Stack:** Firebase Functions v2, Firestore, Resend SDK, React Email, Next.js 16 (static export)

---

## File Structure

### Functions (backend)
- **Modify:** `functions/tsconfig.json` — add JSX support
- **Modify:** `functions/package.json` — add `resend`, `@react-email/components`, `uuid`
- **Create:** `functions/src/newsletter/subscribe.ts` — subscribe callable function
- **Create:** `functions/src/newsletter/on-post-published.ts` — Firestore trigger
- **Create:** `functions/src/newsletter/send-newsletter.ts` — send callable function
- **Create:** `functions/src/newsletter/unsubscribe.ts` — HTTP GET unsubscribe handler
- **Create:** `functions/src/newsletter/email-template.tsx` — React Email template
- **Modify:** `functions/src/index.ts` — re-export all new functions

### Frontend
- **Modify:** `src/components/SubscribeForm.tsx` — swap Buttondown → Firebase callable
- **Modify:** `src/lib/firebase.ts` — export `functions` instance
- **Create:** `src/lib/newsletter.ts` — client-side helpers (callable wrappers, Firestore queries)
- **Modify:** `src/components/AdminDashboard.tsx` — add Newsletter section

### Config
- **Modify:** `firebase.json` — add hosting rewrite for `/unsubscribe`
- **Modify:** `firestore.rules` — add rules for `subscribers` and `newsletterDrafts`
- **Modify:** `.env.local` — remove `BUTTONDOWN_API_KEY`
- **Delete:** `apphosting.yaml` — not used (site is static export)

---

## Task 1: Functions setup — dependencies and tsconfig

**Files:**
- Modify: `functions/tsconfig.json`
- Modify: `functions/package.json`

- [ ] **Step 1: Add JSX support to functions tsconfig**

In `functions/tsconfig.json`, add `"jsx": "react-jsx"` to `compilerOptions`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2022",
    "outDir": "lib",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd functions && npm install resend @react-email/components uuid && npm install -D @types/uuid @types/react`

- [ ] **Step 3: Verify build**

Run: `cd functions && npm run build`
Expected: Compiles without errors

- [ ] **Step 4: Commit**

```bash
git add functions/tsconfig.json functions/package.json functions/package-lock.json
git commit -m "chore: add resend, react-email, uuid deps to functions"
```

---

## Task 2: Email template (React Email)

**Files:**
- Create: `functions/src/newsletter/email-template.tsx`

- [ ] **Step 1: Create the email template**

```tsx
import {
  Html, Head, Body, Container, Section, Text, Link, Hr, Font,
} from '@react-email/components'

type NewsletterEmailProps = {
  title: string
  excerpt: string
  postUrl: string
  unsubscribeUrl: string
}

export function NewsletterEmail({
  title,
  excerpt,
  postUrl,
  unsubscribeUrl,
}: NewsletterEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Playfair Display"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTbtbK-F2rA.woff2',
            format: 'woff2',
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Body style={body}>
        <Container style={container}>
          <Text style={label}>THE KOIFMAN BRIEF</Text>
          <Hr style={divider} />
          <Text style={heading}>{title}</Text>
          <Text style={excerptStyle}>{excerpt}</Text>
          <Section style={ctaSection}>
            <Link href={postUrl} style={ctaButton}>
              Read the full analysis
            </Link>
          </Section>
          <Hr style={divider} />
          <Text style={footer}>
            You received this because you subscribed to The Koifman Brief.
          </Text>
          <Link href={unsubscribeUrl} style={unsubscribeLink}>
            Unsubscribe
          </Link>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#F5F0E8',
  fontFamily: '"Libre Franklin", Helvetica, Arial, sans-serif',
  margin: '0',
  padding: '0',
}

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 24px',
}

const label = {
  fontSize: '10px',
  fontWeight: '600' as const,
  letterSpacing: '0.3em',
  textTransform: 'uppercase' as const,
  color: '#8B7B6B',
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
}

const divider = {
  borderTop: '1px solid #D4C5B0',
  margin: '0 0 32px 0',
}

const heading = {
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: '28px',
  fontWeight: '700' as const,
  lineHeight: '1.3',
  color: '#1A1A1A',
  margin: '0 0 16px 0',
}

const excerptStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4A4A4A',
  margin: '0 0 32px 0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 32px 0',
}

const ctaButton = {
  display: 'inline-block',
  backgroundColor: '#B8860B',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: '500' as const,
  padding: '12px 24px',
  textDecoration: 'none',
}

const footer = {
  fontSize: '12px',
  color: '#8B7B6B',
  textAlign: 'center' as const,
  margin: '0 0 8px 0',
}

const unsubscribeLink = {
  display: 'block',
  fontSize: '12px',
  color: '#8B7B6B',
  textAlign: 'center' as const,
  textDecoration: 'underline',
}
```

- [ ] **Step 2: Verify build**

Run: `cd functions && npm run build`
Expected: Compiles without errors

- [ ] **Step 3: Commit**

```bash
git add functions/src/newsletter/email-template.tsx
git commit -m "feat: add React Email newsletter template"
```

---

## Task 3: Subscribe function

**Files:**
- Create: `functions/src/newsletter/subscribe.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Create the subscribe callable**

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { v4 as uuidv4 } from 'uuid'

const db = getFirestore()

export const subscribe = onCall(async (request) => {
  const { email } = request.data as { email?: string }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError('invalid-argument', 'Valid email is required')
  }

  const normalizedEmail = email.toLowerCase().trim()
  const docRef = db.collection('subscribers').doc(normalizedEmail)
  const doc = await docRef.get()

  if (doc.exists) {
    const data = doc.data()!
    if (data.status === 'active') {
      return { success: true }
    }
    // Reactivate unsubscribed user
    await docRef.update({
      status: 'active',
      unsubscribeToken: uuidv4(),
      unsubscribedAt: FieldValue.delete(),
    })
    return { success: true }
  }

  await docRef.set({
    email: normalizedEmail,
    status: 'active',
    unsubscribeToken: uuidv4(),
    subscribedAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
})
```

- [ ] **Step 2: Re-export from index.ts**

Add to `functions/src/index.ts`:

```typescript
import * as admin from 'firebase-admin'
admin.initializeApp()

export { subscribe } from './newsletter/subscribe'
```

Note: `admin.initializeApp()` must be called once before any Firestore access. Add it at the top of `index.ts` if not already present. The existing `translateToFarsi` function uses the Anthropic SDK directly and doesn't need admin init, but the new functions do.

- [ ] **Step 3: Verify build**

Run: `cd functions && npm run build`
Expected: Compiles without errors

- [ ] **Step 4: Commit**

```bash
git add functions/src/newsletter/subscribe.ts functions/src/index.ts
git commit -m "feat: add subscribe Firebase callable function"
```

---

## Task 4: onPostPublished trigger

**Files:**
- Create: `functions/src/newsletter/on-post-published.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Create the Firestore trigger**

```typescript
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const db = getFirestore()
const SITE_URL = 'https://thekoifmanbrief.com'

export const onPostPublished = onDocumentWritten('posts/{postId}', async (event) => {
  const before = event.data?.before?.data()
  const after = event.data?.after?.data()

  if (!after) return // deleted
  if (after.published !== true) return // not published
  if (before?.published === true) return // was already published

  const postId = event.params.postId

  // Skip if draft already exists
  const draftRef = db.collection('newsletterDrafts').doc(postId)
  const draftSnap = await draftRef.get()
  if (draftSnap.exists) return

  await draftRef.set({
    postId,
    title: after.title || '',
    excerpt: after.excerpt || '',
    postUrl: `${SITE_URL}/posts/${after.slug || postId}`,
    status: 'draft',
    createdAt: FieldValue.serverTimestamp(),
  })
})
```

- [ ] **Step 2: Re-export from index.ts**

Add to `functions/src/index.ts`:

```typescript
export { onPostPublished } from './newsletter/on-post-published'
```

- [ ] **Step 3: Verify build**

Run: `cd functions && npm run build`
Expected: Compiles without errors

- [ ] **Step 4: Commit**

```bash
git add functions/src/newsletter/on-post-published.ts functions/src/index.ts
git commit -m "feat: add onPostPublished Firestore trigger for newsletter drafts"
```

---

## Task 5: sendNewsletter function

**Files:**
- Create: `functions/src/newsletter/send-newsletter.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Create the send callable**

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { NewsletterEmail } from './email-template'

const resendApiKey = defineSecret('RESEND_API_KEY')
const db = getFirestore()

const UNSUBSCRIBE_BASE_URL = 'https://thekoifmanbrief.com/unsubscribe'
const BATCH_SIZE = 100

export const sendNewsletter = onCall(
  { secrets: [resendApiKey], maxInstances: 1 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated')
    }

    // Check admin status
    const adminDoc = await db.collection('admins').doc(request.auth.uid).get()
    if (!adminDoc.exists) {
      throw new HttpsError('permission-denied', 'Must be an admin')
    }

    const { draftId } = request.data as { draftId?: string }
    if (!draftId) {
      throw new HttpsError('invalid-argument', 'draftId is required')
    }

    const draftRef = db.collection('newsletterDrafts').doc(draftId)
    const draftSnap = await draftRef.get()
    if (!draftSnap.exists) {
      throw new HttpsError('not-found', 'Draft not found')
    }

    const draft = draftSnap.data()!
    if (draft.status === 'sent') {
      throw new HttpsError('failed-precondition', 'Newsletter already sent')
    }

    // Fetch active subscribers
    const subscribersSnap = await db
      .collection('subscribers')
      .where('status', '==', 'active')
      .get()

    if (subscribersSnap.empty) {
      throw new HttpsError('failed-precondition', 'No active subscribers')
    }

    const resend = new Resend(resendApiKey.value())
    let totalSent = 0

    // Send in batches of 100
    const subscribers = subscribersSnap.docs
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)

      try {
        await resend.batch.send(
          batch.map((sub) => {
            const data = sub.data()
            const unsubscribeUrl = `${UNSUBSCRIBE_BASE_URL}?token=${data.unsubscribeToken}`
            const html = render(
              NewsletterEmail({
                title: draft.title,
                excerpt: draft.excerpt,
                postUrl: draft.postUrl,
                unsubscribeUrl,
              }),
            )

            return {
              from: 'Shahar Koifman <shahar@thekoifmanbrief.com>',
              to: [data.email],
              subject: draft.title,
              html,
              headers: {
                'List-Unsubscribe': `<${unsubscribeUrl}>`,
              },
            }
          }),
        )
        totalSent += batch.length
      } catch (error) {
        console.error(`Batch send failed at offset ${i}:`, error)
      }
    }

    await draftRef.update({
      status: 'sent',
      sentAt: FieldValue.serverTimestamp(),
      recipientCount: totalSent,
    })

    return { success: true, recipientCount: totalSent }
  },
)
```

- [ ] **Step 2: Re-export from index.ts**

Add to `functions/src/index.ts`:

```typescript
export { sendNewsletter } from './newsletter/send-newsletter'
```

- [ ] **Step 3: Verify build**

Run: `cd functions && npm run build`
Expected: Compiles without errors

- [ ] **Step 4: Commit**

```bash
git add functions/src/newsletter/send-newsletter.ts functions/src/index.ts
git commit -m "feat: add sendNewsletter callable with Resend batch sending"
```

---

## Task 6: Unsubscribe HTTP function

**Files:**
- Create: `functions/src/newsletter/unsubscribe.ts`
- Modify: `functions/src/index.ts`
- Modify: `firebase.json`

- [ ] **Step 1: Create the unsubscribe HTTP handler**

```typescript
import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const db = getFirestore()

export const unsubscribe = onRequest(async (req, res) => {
  const token = req.query.token as string | undefined

  if (!token) {
    res.status(400).send(htmlPage('Invalid Request', 'Missing unsubscribe token.'))
    return
  }

  const snapshot = await db
    .collection('subscribers')
    .where('unsubscribeToken', '==', token)
    .limit(1)
    .get()

  if (snapshot.empty) {
    res.status(404).send(htmlPage('Not Found', 'This unsubscribe link is no longer valid.'))
    return
  }

  const doc = snapshot.docs[0]
  await doc.ref.update({
    status: 'unsubscribed',
    unsubscribedAt: FieldValue.serverTimestamp(),
  })

  res.status(200).send(
    htmlPage(
      'Unsubscribed',
      'You have been unsubscribed from The Koifman Brief. You will no longer receive emails.',
    ),
  )
})

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — The Koifman Brief</title>
  <style>
    body {
      font-family: "Libre Franklin", Helvetica, Arial, sans-serif;
      background: #F5F0E8;
      color: #1A1A1A;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
    }
    .card {
      max-width: 420px;
      text-align: center;
    }
    h1 {
      font-family: "Playfair Display", Georgia, serif;
      font-size: 24px;
      margin: 0 0 12px 0;
    }
    p {
      font-size: 15px;
      color: #4A4A4A;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`
}
```

- [ ] **Step 2: Re-export from index.ts**

Add to `functions/src/index.ts`:

```typescript
export { unsubscribe } from './newsletter/unsubscribe'
```

- [ ] **Step 3: Add Firebase Hosting rewrite**

In `firebase.json`, add the unsubscribe rewrite to the `the-koifman-brief` hosting config. It must go **before** the catch-all `**` rewrite:

```json
{ "source": "/unsubscribe", "function": "unsubscribe" }
```

Place it after the `/posts/**` rewrite and before `**`.

- [ ] **Step 4: Verify build**

Run: `cd functions && npm run build`
Expected: Compiles without errors

- [ ] **Step 5: Commit**

```bash
git add functions/src/newsletter/unsubscribe.ts functions/src/index.ts firebase.json
git commit -m "feat: add unsubscribe HTTP function with hosting rewrite"
```

---

## Task 7: Firestore rules for subscribers and newsletterDrafts

**Files:**
- Modify: `firestore.rules`

- [ ] **Step 1: Add collection rules**

Add these rules inside the `match /databases/{database}/documents` block in `firestore.rules`, after the existing `admins` rule:

```
    match /subscribers/{email} {
      allow read, write: if isAdmin();
    }

    match /newsletterDrafts/{draftId} {
      allow read, write: if isAdmin();
    }
```

Note: The `subscribe` callable function uses the Firebase Admin SDK (server-side), which bypasses Firestore rules. So no public write rule is needed for `subscribers`. These rules only govern client-side access from the admin UI.

- [ ] **Step 2: Commit**

```bash
git add firestore.rules
git commit -m "feat: add Firestore rules for subscribers and newsletterDrafts"
```

---

## Task 8: Frontend — export Functions instance + newsletter helpers

**Files:**
- Modify: `src/lib/firebase.ts`
- Create: `src/lib/newsletter.ts`

- [ ] **Step 1: Export Functions instance from firebase.ts**

Add to `src/lib/firebase.ts`:

```typescript
import { getFunctions } from 'firebase/functions'

export const functions = getFunctions(app)
```

- [ ] **Step 2: Create newsletter client helpers**

Create `src/lib/newsletter.ts`:

```typescript
import { httpsCallable } from 'firebase/functions'
import {
  collection, query, where, orderBy, getDocs, doc, updateDoc,
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
  const q = query(
    collection(db, 'newsletterDrafts'),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as NewsletterDraft)
}

// Update draft (edit title/excerpt before sending)
export async function updateDraft(
  draftId: string,
  data: { title?: string; excerpt?: string },
): Promise<void> {
  await updateDoc(doc(db, 'newsletterDrafts', draftId), data)
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build` (from project root)
Expected: Compiles without errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/firebase.ts src/lib/newsletter.ts
git commit -m "feat: add newsletter client helpers and Functions export"
```

---

## Task 9: Update SubscribeForm to use Firebase callable

**Files:**
- Modify: `src/components/SubscribeForm.tsx`

- [ ] **Step 1: Replace Buttondown fetch with callable**

Replace lines 15-28 (the try/catch block inside `handleSubmit`) with:

```typescript
import { subscribeEmail } from '@/lib/newsletter'
```

And in `handleSubmit`:

```typescript
    try {
      await subscribeEmail(email)
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
```

Remove the entire `fetch` call to Buttondown. No other changes to the component — same UI, same states.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles without errors

- [ ] **Step 3: Commit**

```bash
git add src/components/SubscribeForm.tsx
git commit -m "refactor: swap SubscribeForm from Buttondown to Firebase callable"
```

---

## Task 10: Admin UI — Newsletter management section

**Files:**
- Modify: `src/components/AdminDashboard.tsx`

- [ ] **Step 1: Add newsletter section to AdminDashboard**

This section goes in `AdminDashboard.tsx` after the existing articles section. It should follow the same visual patterns as the articles list (borderless rows, same button styles, same section heading pattern).

The newsletter section includes:
1. **Section heading**: "Newsletter" with same styling as "Articles" / "Admin Users"
2. **Drafts list**: Rows showing title, status badge (Draft/Sent), date, recipient count if sent
3. **Edit mode**: Clicking a draft opens inline editable title + excerpt fields
4. **Send button**: Per-draft, only shown when status is `'draft'`
5. **Sent history**: Sent newsletters shown below drafts with `sentAt` and `recipientCount`

State management pattern (same as existing dashboard):
- `useState` for drafts list, loading state, editing state
- `useEffect` to fetch drafts on mount via `getDrafts()`
- `updateDraft()` for saving edits
- `sendNewsletter()` for sending, with loading state and confirmation

Key imports to add:

```typescript
import { getDrafts, updateDraft, sendNewsletter, type NewsletterDraft } from '@/lib/newsletter'
```

Newsletter section UI structure:

```tsx
// State
const [drafts, setDrafts] = useState<NewsletterDraft[]>([])
const [editingDraft, setEditingDraft] = useState<string | null>(null)
const [editTitle, setEditTitle] = useState('')
const [editExcerpt, setEditExcerpt] = useState('')
const [sendingDraft, setSendingDraft] = useState<string | null>(null)

// Fetch on mount (add to existing useEffect or create new one)
useEffect(() => {
  getDrafts().then(setDrafts)
}, [])

// Save edit handler
async function handleSaveDraft(draftId: string) {
  await updateDraft(draftId, { title: editTitle, excerpt: editExcerpt })
  setDrafts((prev) =>
    prev.map((d) => (d.id === draftId ? { ...d, title: editTitle, excerpt: editExcerpt } : d)),
  )
  setEditingDraft(null)
}

// Send handler
async function handleSendNewsletter(draftId: string) {
  if (!confirm('Send this newsletter to all subscribers?')) return
  setSendingDraft(draftId)
  try {
    const { recipientCount } = await sendNewsletter(draftId)
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === draftId ? { ...d, status: 'sent' as const, recipientCount } : d,
      ),
    )
  } catch {
    alert('Failed to send newsletter')
  }
  setSendingDraft(null)
}
```

Render the section with:
- Draft rows: title (editable when clicked), status badge, edit/save/send buttons
- Sent rows: title, "Sent" badge, date, recipient count
- Same styling patterns as the articles list (hover states, icon buttons, border-bottom rows)
- Use `Send` (lucide-react) icon for send button, `Pencil`/`Save` for edit

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles without errors

- [ ] **Step 3: Commit**

```bash
git add src/components/AdminDashboard.tsx
git commit -m "feat: add newsletter management section to admin dashboard"
```

---

## Task 11: Cleanup — remove Buttondown references

**Files:**
- Modify: `.env.local`
- Delete: `apphosting.yaml`

- [ ] **Step 1: Remove BUTTONDOWN_API_KEY from .env.local**

Remove the line `BUTTONDOWN_API_KEY=placeholder` from `.env.local`.

- [ ] **Step 2: Delete apphosting.yaml**

Run: `rm apphosting.yaml`

This file configured App Hosting (Cloud Run) which is not used — the site is deployed as a static export to Firebase Hosting.

- [ ] **Step 3: Commit**

```bash
git add .env.local && git rm apphosting.yaml
git commit -m "chore: remove Buttondown config and unused apphosting.yaml"
```

---

## Task 12: Manual setup — Resend API key + DNS verification

This task requires manual steps outside the codebase.

- [ ] **Step 1: Create Resend account and get API key**

Go to https://resend.com, sign up, create an API key.

- [ ] **Step 2: Add API key to Firebase Secret Manager**

Run: `firebase functions:secrets:set RESEND_API_KEY`
Paste the Resend API key when prompted.

- [ ] **Step 3: Verify domain in Resend**

In Resend dashboard → Domains → Add domain → `thekoifmanbrief.com`.
Add the provided DNS records (DKIM CNAMEs + SPF TXT) in Squarespace Domains → DNS Settings.
Wait for verification (usually a few minutes).

- [ ] **Step 4: Remove old Buttondown secret**

Run: `firebase functions:secrets:destroy buttondown-api-key`

- [ ] **Step 5: Deploy functions**

Run: `cd functions && npm run deploy`

- [ ] **Step 6: Deploy hosting (for unsubscribe rewrite)**

Run: `firebase deploy --only hosting`

- [ ] **Step 7: Test end-to-end**

1. Visit the site → subscribe with a test email → check Firestore `subscribers` collection
2. In Firestore console, create or publish a test post → verify `newsletterDrafts` gets a draft
3. In admin UI → Newsletter section → edit draft → send → check test email inbox
4. Click unsubscribe link in email → verify Firestore status changes to `'unsubscribed'`
