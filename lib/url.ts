/**
 * Sanitize a URL to prevent XSS via javascript:, data:, etc. protocols.
 * Returns the URL if safe, or null if invalid/dangerous.
 */
export function sanitizeUrl(url: string | undefined | null): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    return url
  } catch {
    return null
  }
}
