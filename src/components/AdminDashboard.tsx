'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAuth, signOut } from 'firebase/auth'
import { app } from '@/lib/firebase'
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

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

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
