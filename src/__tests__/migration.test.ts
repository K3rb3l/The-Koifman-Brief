import { describe, it, expect } from 'vitest'

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
