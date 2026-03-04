import { describe, it, expect } from 'vitest'
import { formatDate, estimateReadingTime, slugToTitle } from '../utils'

describe('formatDate', () => {
  it('formats ISO date to readable string', () => {
    expect(formatDate('2026-03-04')).toBe('March 4, 2026')
  })
})

describe('estimateReadingTime', () => {
  it('returns 1 min for short content', () => {
    expect(estimateReadingTime('Hello world')).toBe('1 min read')
  })

  it('calculates correctly for longer content', () => {
    const words = Array(500).fill('word').join(' ')
    expect(estimateReadingTime(words)).toBe('3 min read')
  })
})

describe('slugToTitle', () => {
  it('converts slug to title case', () => {
    expect(slugToTitle('geopolitics')).toBe('Geopolitics')
    expect(slugToTitle('real-estate')).toBe('Real Estate')
    expect(slugToTitle('fintech')).toBe('FinTech')
  })
})
