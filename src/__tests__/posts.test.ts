import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/firebase', () => ({
  db: {},
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
}))

import { generateSlug } from '@/lib/posts'

describe('generateSlug', () => {
  it('converts title to lowercase kebab-case', () => {
    expect(generateSlug('Why Did Iran Attack Turkey?')).toBe('why-did-iran-attack-turkey')
  })

  it('removes special characters', () => {
    expect(generateSlug("What's Next for FinTech?")).toBe('what-s-next-for-fintech')
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
