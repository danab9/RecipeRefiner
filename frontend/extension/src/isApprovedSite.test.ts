import { describe, expect, it } from 'vitest'
import { isApprovedSite } from './isApprovedSite'

describe('isApprovedSite', () => {
  it('matches an approved bare domain', () => {
    expect(isApprovedSite('https://allrecipes.com/recipe/123')).toBe(true)
  })

  it('matches a www. subdomain of an approved domain', () => {
    expect(isApprovedSite('https://www.bbcgoodfood.com/recipes/x')).toBe(true)
  })

  it('matches an approved .co.uk domain via www.', () => {
    expect(isApprovedSite('https://www.bbc.co.uk/food/recipes/x')).toBe(true)
  })

  it('matches an approved subdomain-only entry', () => {
    expect(isApprovedSite('https://cooking.nytimes.com/recipes/x')).toBe(true)
  })

  it('does not match a lookalike domain', () => {
    expect(isApprovedSite('https://notallrecipes.com/recipe')).toBe(false)
  })

  it('does not match the parent of a subdomain-only entry', () => {
    // Only cooking.nytimes.com is listed, not nytimes.com itself.
    expect(isApprovedSite('https://www.nytimes.com/section/food')).toBe(false)
  })

  it('returns false for a non-approved host', () => {
    expect(isApprovedSite('https://example.com')).toBe(false)
  })

  it('returns false for chrome:// and empty/nullish input', () => {
    expect(isApprovedSite('chrome://extensions')).toBe(false)
    expect(isApprovedSite('')).toBe(false)
    expect(isApprovedSite(null)).toBe(false)
    expect(isApprovedSite(undefined)).toBe(false)
  })
})
