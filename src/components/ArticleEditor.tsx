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
