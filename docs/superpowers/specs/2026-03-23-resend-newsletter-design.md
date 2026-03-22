# Resend + Firestore Newsletter System

Replace Buttondown with Resend + React Email + Firestore. Subscribers stored in Firestore, emails sent via Resend from `shahar@thekoifmanbrief.com`, email templates built as React components.

## Requirements

- Subscribe form on the site writes to Firestore (no third-party embed API)
- When a post is published, auto-generate an editable newsletter draft
- Shahar reviews/edits the draft in the admin UI, then manually sends
- Teaser format: title, excerpt, "Read more" link (drives traffic to site)
- English only
- Minimal unsubscribe: token-based link in every email, removes from Firestore
- Sent from `shahar@thekoifmanbrief.com` (Resend domain verification required)

## Architecture

All backend logic lives in Firebase Functions (matches existing `translateToFarsi` pattern). No API routes — the site remains a static export. The subscribe form calls a Firebase callable function instead of Buttondown.

### Send Flow

1. Post published → Firestore trigger creates draft in `newsletterDrafts`
2. Admin UI shows draft with editable title/excerpt fields
3. Shahar edits if needed → clicks "Send Newsletter"
4. Firebase Function renders React Email template, sends via Resend batch API
5. Draft marked as `sent` with timestamp and recipient count

## Data Model

### `subscribers` collection

Document ID: lowercased email address (natural dedup, case-normalized)

```
{
  email: string
  status: 'active' | 'unsubscribed'
  unsubscribeToken: string        // UUID v4, used in unsubscribe links
  subscribedAt: Timestamp
  unsubscribedAt?: Timestamp
}
```

### `newsletterDrafts` collection

Document ID: same as `postId`

```
{
  postId: string
  title: string                   // pre-filled from post, editable
  excerpt: string                 // pre-filled from post, editable
  postUrl: string                 // full URL to the article
  status: 'draft' | 'sent'
  createdAt: Timestamp
  sentAt?: Timestamp
  recipientCount?: number
}
```

No changes to the existing `posts` collection.

## Firebase Functions

All added to `functions/src/index.ts`.

### `subscribe` (HTTPS callable, public)

- Validates email format, lowercases before use as document ID
- If email exists and active: return success silently
- If email exists and unsubscribed: reactivate, regenerate token
- If new: generate `unsubscribeToken` (UUID v4), write to `subscribers`
- No authentication required

### `onPostPublished` (Firestore trigger)

- Triggers on `posts/{postId}` update where `published` changes from `false` to `true` (the field is a boolean, not a string status)
- Skips if a draft already exists for this `postId` (prevents duplicates on re-publish)
- Reads title, excerpt from the post document
- Creates draft in `newsletterDrafts` with status `'draft'`
- No email sent

### `sendNewsletter` (HTTPS callable, auth required)

- Checks `request.auth` UID against `admins` Firestore collection
- Reads draft from `newsletterDrafts`
- Queries all `subscribers` where `status == 'active'`
- Renders React Email template with draft content + per-subscriber unsubscribe link
- Sends via Resend batch API in chunks of 100 (loops if more subscribers). If a batch fails, logs the error and continues with remaining batches. `recipientCount` reflects successfully queued emails.
- Updates draft: status `'sent'`, `sentAt`, `recipientCount`

### `unsubscribe` (HTTPS function, GET)

- Takes `token` query parameter
- Finds subscriber by `unsubscribeToken`
- Sets status to `'unsubscribed'`, writes `unsubscribedAt`
- Returns simple HTML page: "You've been unsubscribed"
- URL exposed via Firebase Hosting rewrite (e.g., `thekoifmanbrief.com/unsubscribe?token=...`) for on-brand links in emails

## Frontend Changes

### `SubscribeForm.tsx`

Replace Buttondown fetch with `httpsCallable(functions, 'subscribe')`. Same UI, states, and animations — only the backend call changes.

### Admin UI — Newsletter Section

- List of drafts (`status == 'draft'`) from `newsletterDrafts`
- Edit view: editable title and excerpt fields, preview
- "Send Newsletter" button → calls `sendNewsletter` callable
- Sent history: list with `sentAt` and `recipientCount`

### Email Template (React Email)

- Editorial design matching site aesthetic (Playfair Display heading, Libre Franklin body)
- Content: title, excerpt, "Read the full analysis" CTA button linking to post
- Footer: "The Koifman Brief" branding + unsubscribe link
- Sent from `shahar@thekoifmanbrief.com`

## Dependencies

Added to `functions/package.json`:
- `resend`
- `@react-email/components`

Functions `tsconfig.json` must add `"jsx": "react-jsx"` to support React Email JSX compilation.

No new dependencies in the main app `package.json`.

## DNS Setup (Squarespace)

Resend domain verification requires DNS records in Squarespace (typically 3 DKIM CNAME records + 1 SPF TXT record). Follow Resend's domain verification flow — exact records are provided during setup.

## Cleanup

- Remove Buttondown API key from Firebase Secret Manager
- Remove `BUTTONDOWN_API_KEY` from `.env.local`
- Remove `apphosting.yaml` (site uses Firebase Hosting static export, not App Hosting)
- Add `RESEND_API_KEY` to Firebase Secret Manager

## Known Limitations (v1)

- No double opt-in / email verification — any submitted email goes straight to active
- No Resend webhook handling for bounces/complaints — future enhancement for domain reputation management
