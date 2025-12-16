import { ReactNode, createElement } from 'react'

const RECENT_SEARCHES_KEY = 'beauty_recent_searches'
const MAX_RECENT_SEARCHES = 10

/**
 * Highlight matching text in search results
 */
export function highlightMatch(text: string, query: string): ReactNode {
  if (!query || !text) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text

  const before = text.slice(0, index)
  const match = text.slice(index, index + query.length)
  const after = text.slice(index + query.length)

  return createElement(
    'span',
    null,
    before,
    createElement('mark', { className: 'bg-pink-100 text-pink-700 px-0.5 rounded' }, match),
    after
  )
}

/**
 * Save a search term to localStorage
 */
export function saveRecentSearch(term: string): void {
  if (typeof window === 'undefined' || !term.trim()) return

  try {
    const searches = getRecentSearches()
    const trimmedTerm = term.trim()

    // Remove if already exists
    const filtered = searches.filter(
      (s) => s.toLowerCase() !== trimmedTerm.toLowerCase()
    )

    // Add to beginning
    filtered.unshift(trimmedTerm)

    // Keep only max items
    const limited = filtered.slice(0, MAX_RECENT_SEARCHES)

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(limited))
  } catch (error) {
    console.error('Failed to save recent search:', error)
  }
}

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to get recent searches:', error)
    return []
  }
}

/**
 * Clear all recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch (error) {
    console.error('Failed to clear recent searches:', error)
  }
}

/**
 * Remove a specific search term from recent searches
 */
export function removeRecentSearch(term: string): void {
  if (typeof window === 'undefined') return

  try {
    const searches = getRecentSearches()
    const filtered = searches.filter(
      (s) => s.toLowerCase() !== term.toLowerCase()
    )
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to remove recent search:', error)
  }
}

/**
 * Log a search query to the database (async, fire-and-forget)
 */
export function logSearch(
  query: string,
  resultCount: number,
  userId?: string
): void {
  // Fire and forget - don't await
  fetch('/api/search/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, resultCount, userId }),
  }).catch(() => {
    // Silently ignore logging errors
  })
}
