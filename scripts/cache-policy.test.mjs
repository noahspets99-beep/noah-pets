import assert from 'node:assert/strict'
import { cacheDecision, PUBLIC_CACHE_TTL_MS } from '../src/services/cache/cachePolicy.js'

const now = 1_700_000_000_000
const data = { products: [{ id: 'p1' }] }

assert.equal(cacheDecision(null, now), 'miss')
assert.equal(cacheDecision({ cachedAt: now, data }, now), 'hit')
assert.equal(
  cacheDecision(
    { cachedAt: now, expiresAt: now + PUBLIC_CACHE_TTL_MS, data },
    now + PUBLIC_CACHE_TTL_MS - 1,
  ),
  'hit',
)
assert.equal(
  cacheDecision(
    { cachedAt: now, expiresAt: now + PUBLIC_CACHE_TTL_MS, data },
    now + PUBLIC_CACHE_TTL_MS,
  ),
  'expired',
)
assert.equal(
  cacheDecision({ cachedAt: now - PUBLIC_CACHE_TTL_MS - 1, data }, now),
  'expired',
)
assert.equal(PUBLIC_CACHE_TTL_MS, 24 * 60 * 60 * 1000)

console.log('cache policy ok')
