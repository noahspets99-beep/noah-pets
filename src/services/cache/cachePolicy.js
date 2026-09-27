/** Public storefront catalog TTL. One browser, 24 hours, then one refresh. */
export const PUBLIC_CACHE_TTL_MS = 24 * 60 * 60 * 1000

/**
 * Decide whether a cache entry may be used without contacting Firestore.
 * `now` is injectable so tests can simulate expiry.
 */
export function cacheDecision(entry, now = Date.now()) {
  if (!entry || !entry.data || !Number.isFinite(entry.cachedAt)) return 'miss'
  const expiresAt = Number.isFinite(entry.expiresAt)
    ? entry.expiresAt
    : entry.cachedAt + PUBLIC_CACHE_TTL_MS
  if (now < expiresAt) return 'hit'
  return 'expired'
}
