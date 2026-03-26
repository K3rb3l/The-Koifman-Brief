'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAuth, signOut } from 'firebase/auth'
import { app } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { getAllPosts, deletePost as removePost } from '@/lib/posts'
import { getAllAdmins, addAdmin, removeAdmin } from '@/lib/admins'
import { deletePostImages } from '@/lib/storage'
import { getDrafts, createDraft, updateDraft, sendNewsletter, getSubscribers, addSubscriber } from '@/lib/newsletter'
import type { NewsletterDraft, Subscriber } from '@/lib/newsletter'
import { formatDate, slugToTitle } from '@/lib/utils'
import type { Post, Admin } from '@/types/post'
import { Pencil, Trash2, Plus, LogOut, Eye, EyeOff, UserPlus, UserMinus, Send, Save, Loader2 } from 'lucide-react'

export function AdminDashboard() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [admins, setAdmins] = useState<(Admin & { uid: string })[]>([])
  const [drafts, setDrafts] = useState<NewsletterDraft[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [showSubscribers, setShowSubscribers] = useState(false)
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminUid, setNewAdminUid] = useState('')
  const [showUsers, setShowUsers] = useState(false)
  const [editingDraft, setEditingDraft] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editExcerpt, setEditExcerpt] = useState('')
  const [sendingDraft, setSendingDraft] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [composeTitle, setComposeTitle] = useState('')
  const [composeExcerpt, setComposeExcerpt] = useState('')
  const [composeUrl, setComposeUrl] = useState('https://thekoifmanbrief.com/')

  const loadData = async () => {
    const [postsData, adminsData, draftsData, subscribersData] = await Promise.all([getAllPosts(), getAllAdmins(), getDrafts(), getSubscribers()])
    setPosts(postsData)
    setAdmins(adminsData)
    setDrafts(draftsData)
    setSubscribers(subscribersData)
    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const startEditing = (draft: NewsletterDraft) => {
    setEditingDraft(draft.id)
    setEditTitle(draft.title)
    setEditExcerpt(draft.excerpt)
  }

  const handleSaveDraft = async (draftId: string) => {
    await updateDraft(draftId, { title: editTitle, excerpt: editExcerpt })
    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, title: editTitle, excerpt: editExcerpt } : d)),
    )
    setEditingDraft(null)
  }

  const handleSendNewsletter = async (draftId: string) => {
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

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = newSubscriberEmail.trim()
    if (!email) return
    await addSubscriber(email)
    setSubscribers((prev) => {
      const exists = prev.some((s) => s.email === email.toLowerCase())
      if (exists) return prev.map((s) => s.email === email.toLowerCase() ? { ...s, status: 'active' as const } : s)
      return [{ email: email.toLowerCase(), status: 'active' as const, subscribedAt: { seconds: Math.floor(Date.now() / 1000) } }, ...prev]
    })
    setNewSubscriberEmail('')
  }

  const handleCreateDraft = async () => {
    if (!composeTitle.trim()) return
    const id = await createDraft({
      title: composeTitle,
      excerpt: composeExcerpt,
      postUrl: composeUrl,
    })
    setDrafts((prev) => [{
      id,
      postId: '',
      title: composeTitle,
      excerpt: composeExcerpt,
      postUrl: composeUrl,
      status: 'draft',
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
    }, ...prev])
    setComposing(false)
    setComposeTitle('')
    setComposeExcerpt('')
    setComposeUrl('https://thekoifmanbrief.com/')
  }

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
            onClick={() => signOut(getAuth(app))}
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

      {/* Newsletter Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-foreground">
            Newsletter ({drafts.length})
          </h2>
          <button
            onClick={() => setComposing(!composing)}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white font-sans text-xs rounded hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> New Newsletter
          </button>
        </div>
        {composing && (
          <div className="border border-border rounded p-4 mb-4 space-y-3">
            <input
              type="text"
              value={composeTitle}
              onChange={(e) => setComposeTitle(e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-surface text-foreground font-sans text-sm input-glow focus:outline-none focus:border-accent"
              placeholder="Subject line"
            />
            <textarea
              value={composeExcerpt}
              onChange={(e) => setComposeExcerpt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded border border-border bg-surface text-foreground font-sans text-sm input-glow focus:outline-none focus:border-accent resize-none"
              placeholder="Email body / excerpt"
            />
            <input
              type="url"
              value={composeUrl}
              onChange={(e) => setComposeUrl(e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-surface text-foreground font-sans text-sm input-glow focus:outline-none focus:border-accent"
              placeholder="Link URL (e.g. https://thekoifmanbrief.com/posts/...)"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateDraft}
                disabled={!composeTitle.trim()}
                className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white font-sans text-xs rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save size={12} /> Create Draft
              </button>
              <button
                onClick={() => setComposing(false)}
                className="px-3 py-1.5 text-muted font-sans text-xs hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="border border-border rounded overflow-hidden">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface transition-colors"
            >
              {editingDraft === draft.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-foreground font-sans text-sm input-glow focus:outline-none focus:border-accent"
                    placeholder="Title"
                  />
                  <textarea
                    value={editExcerpt}
                    onChange={(e) => setEditExcerpt(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-foreground font-sans text-sm input-glow focus:outline-none focus:border-accent resize-none"
                    placeholder="Excerpt"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveDraft(draft.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white font-sans text-xs rounded hover:opacity-90 transition-opacity"
                    >
                      <Save size={12} /> Save
                    </button>
                    <button
                      onClick={() => setEditingDraft(null)}
                      className="px-3 py-1.5 text-muted font-sans text-xs hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-semibold text-foreground truncate">
                        {draft.title}
                      </h3>
                      {draft.status === 'sent' ? (
                        <span className="flex items-center gap-1 text-[10px] font-sans uppercase tracking-wider text-green-600 dark:text-green-400">
                          Sent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-sans uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted font-sans">
                      {draft.status === 'sent' && draft.sentAt && (
                        <>
                          <span>Sent {new Date(draft.sentAt.seconds * 1000).toLocaleDateString()}</span>
                          <span>-</span>
                        </>
                      )}
                      {draft.recipientCount !== undefined && (
                        <span>{draft.recipientCount} recipients</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {draft.status === 'draft' && (
                      <>
                        <button
                          onClick={() => startEditing(draft)}
                          className="p-2 text-muted hover:text-accent transition-colors"
                          title="Edit draft"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleSendNewsletter(draft.id)}
                          disabled={sendingDraft === draft.id}
                          className="p-2 text-muted hover:text-accent transition-colors disabled:opacity-50"
                          title="Send newsletter"
                        >
                          {sendingDraft === draft.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {drafts.length === 0 && (
            <div className="px-4 py-8 text-center text-muted font-sans">
              No newsletter drafts yet.
            </div>
          )}
        </div>
      </section>

      {/* Subscribers Section */}
      <section>
        <button
          onClick={() => setShowSubscribers(!showSubscribers)}
          className="flex items-center gap-2 font-serif text-lg font-bold text-foreground mb-4 hover:text-accent transition-colors"
        >
          <span className={`transform transition-transform ${showSubscribers ? 'rotate-90' : ''}`}>▸</span>
          Subscribers ({subscribers.filter((s) => s.status === 'active').length} active)
        </button>
        {showSubscribers && (
          <>
          <form onSubmit={handleAddSubscriber} className="flex gap-2 mb-4">
            <input
              type="email"
              required
              value={newSubscriberEmail}
              onChange={(e) => setNewSubscriberEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 px-3 py-2 rounded border border-border bg-surface text-foreground font-sans text-sm input-glow focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-2 bg-accent text-white font-sans text-xs rounded hover:opacity-90 transition-opacity"
            >
              <UserPlus size={14} /> Add
            </button>
          </form>
          <div className="border border-border rounded overflow-hidden">
            {subscribers.map((sub) => (
              <div
                key={sub.email}
                className="px-4 py-2.5 border-b border-border last:border-b-0 flex items-center justify-between"
              >
                <span className="font-sans text-sm text-foreground">{sub.email}</span>
                <div className="flex items-center gap-3 text-xs font-sans text-muted">
                  {sub.subscribedAt && (
                    <span>{new Date(sub.subscribedAt.seconds * 1000).toLocaleDateString()}</span>
                  )}
                  {sub.status === 'unsubscribed' ? (
                    <span className="text-red-500 uppercase tracking-wider text-[10px]">Unsubscribed</span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400 uppercase tracking-wider text-[10px]">Active</span>
                  )}
                </div>
              </div>
            ))}
            {subscribers.length === 0 && (
              <div className="px-4 py-8 text-center text-muted font-sans">
                No subscribers yet.
              </div>
            )}
          </div>
          </>
        )}
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
