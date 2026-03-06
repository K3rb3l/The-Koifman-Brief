# Admin Panel Design

## Overview
Replace Keystatic CMS with a custom admin interface at `/admin` for managing articles. All operations are client-side using Firebase SDK. Static export preserved.

## Data Model

### Firestore `posts` collection
- **Document ID**: slug
- `title`: string
- `date`: string (ISO)
- `category`: "geopolitics" | "fintech" | "real-estate" | "macro"
- `excerpt`: string
- `coverImageUrl`: string (Firebase Storage URL)
- `body`: string (markdown)
- `published`: boolean
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Firestore `admins` collection
- **Document ID**: Firebase Auth UID
- `email`: string
- `createdAt`: Timestamp

### Firebase Storage
- Path: `images/posts/{slug}/cover.{ext}`

## Routes

| Route | Purpose |
|-------|---------|
| `/admin` | Login (email/password) |
| `/admin/dashboard` | Article list + quick actions |
| `/admin/articles/new` | Create article (rich editor + image upload) |
| `/admin/articles/[slug]/edit` | Edit existing article |
| `/admin/users` | Add/remove admin users |

## Auth Flow
1. Sign in with Firebase Auth (email/password)
2. Client checks if UID exists in `admins` collection
3. All admin routes wrapped in auth guard component
4. Firestore rules enforce admin-only writes

## Public Site Changes
- Homepage + post pages fetch from Firestore client-side
- Only `published == true` shown publicly
- Markdown rendered with `react-markdown`
- Remove Keystatic, Markdoc, `content/posts/` directory

## Firestore Security Rules
- `posts`: anyone can read where `published == true`, only admins can write
- `admins`: only admins can read/write

## Dependencies
**Add**: `firebase`, `react-markdown`, rich markdown editor library
**Remove**: `@keystatic/core`, `@keystatic/next`, `@markdoc/markdoc`

## Migration
- Script to parse 3 existing `.mdoc` files and upload to Firestore
- Upload cover images to Firebase Storage
- Tests to verify migration correctness

## Product Refinement

### Refined User Flow

**Admin flow (2 clicks to wow):**
1. `/admin` — shows login if unauthenticated, dashboard if authenticated (merged)
2. Dashboard shows all articles (published + drafts) with prominent "New Article" button
3. Click "New Article" → rich editor with title, metadata, cover image upload, markdown body
4. Publish toggle + Save button right on the editor — "done" = hit Publish

**Simplified routes:**
| Route | Purpose |
|-------|---------|
| `/admin` | Login OR dashboard (context-dependent) |
| `/admin/articles/new` | Create article |
| `/admin/articles/[slug]/edit` | Edit article (reuses same editor component) |
| `/admin/users` | Modal/section on dashboard, not a separate page |

### Cuts Made
- **Merged `/admin` and `/admin/dashboard`** — one route, auth-aware rendering
- **User management is a section on the dashboard** — not a separate page, reduces navigation
- **No separate drafts view** — published/draft is a toggle per article in the list
- **Single editor component** — shared between new and edit, loaded with data when editing

### Scope Boundaries

**Must-haves (ship):**
- Firebase Auth + admin guard (check `admins` collection)
- Create/edit/delete articles with Firestore
- Cover image upload to Firebase Storage
- Publish/unpublish toggle
- Public site reads from Firestore (client-side)
- Migration of 3 existing articles + tests
- Firestore + Storage security rules

**Delighters (ship):**
- Rich markdown editor (toolbar, formatting, live preview)
- Admin user management UI (add/remove from dashboard)
- Inline image upload in markdown body

**Rabbit holes (avoid):**
- No real-time preview with perfect styling parity
- No complex role system beyond admin/not-admin
- No offline support or optimistic updates
- No auto-save or version history
