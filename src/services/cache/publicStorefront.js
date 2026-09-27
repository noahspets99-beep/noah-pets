import {
  fsQuery,
  getDocument,
  isFirebaseConfigured,
  listCollection,
} from '../firestore/repository'
import { cacheDecision, PUBLIC_CACHE_TTL_MS } from './cachePolicy'
import { idbDelete, idbGet, idbSet } from './indexedDbCache'

const CACHE_KEY = 'storefront-v1'
const LEGACY_LOCAL_KEYS = [
  'noah_catalog_cache_v5',
  'noah_catalog_cache_v4',
  'noah_catalog_cache_v3',
]

const devLog = (...args) => {
  if (import.meta.env.DEV) console.info('[Cache]', ...args)
}

function toPlain(value) {
  if (value == null) return value
  if (typeof value?.toDate === 'function') {
    try {
      return value.toDate().toISOString()
    } catch {
      return null
    }
  }
  if (Array.isArray(value)) return value.map(toPlain)
  if (typeof value === 'object') {
    const out = {}
    for (const [key, nested] of Object.entries(value)) {
      out[key] = toPlain(nested)
    }
    return out
  }
  return value
}

async function readEntry() {
  try {
    return await idbGet(CACHE_KEY)
  } catch (err) {
    devLog('indexedDB read failed', err?.message || err)
    return null
  }
}

async function writeEntry(data) {
  const now = Date.now()
  const entry = {
    data: toPlain(data),
    cachedAt: now,
    expiresAt: now + PUBLIC_CACHE_TTL_MS,
  }
  try {
    await idbSet(CACHE_KEY, entry)
  } catch (err) {
    devLog('indexedDB write failed', err?.message || err)
  }
  memoryEntry = entry
  return entry
}

/** In-tab copy so StrictMode remounts and route changes do not touch Firestore. */
let memoryEntry = null
let inflight = null
let generation = 0

function dropLegacyLocalStorage() {
  try {
    for (const key of LEGACY_LOCAL_KEYS) localStorage.removeItem(key)
    sessionStorage.removeItem('noah_catalog_cache_v2')
  } catch {
    /* ignore */
  }
}

async function safeRead(label, run) {
  try {
    return await run()
  } catch (err) {
    console.warn('[storefront]', label, err?.code || err?.message || err)
    return { mode: 'error', data: null, error: err }
  }
}

async function fetchStorefront() {
  if (!isFirebaseConfigured) return null
  devLog('storefront MISS — fetching Firestore once')
  const [
    products,
    categories,
    coupons,
    banners,
    blogPosts,
    homepageSections,
    reviews,
    brands,
    seoSettings,
    shippingSettings,
    taxSettings,
    storeSettings,
  ] = await Promise.all([
    safeRead('products', () => listCollection('products')),
    safeRead('categories', () => listCollection('categories')),
    safeRead('coupons', () => listCollection('coupons')),
    safeRead('banners', () =>
      listCollection('banners', [fsQuery.where('active', '==', true)]),
    ),
    safeRead('blogPosts', () =>
      listCollection('blogPosts', [fsQuery.where('status', '==', 'Published')]),
    ),
    safeRead('homepageSections', () => listCollection('homepageSections')),
    safeRead('reviews', () =>
      listCollection('reviews', [fsQuery.where('status', '==', 'Approved')]),
    ),
    safeRead('brands', () =>
      listCollection('brands', [fsQuery.where('active', '==', true)]),
    ),
    safeRead('seoSettings', () => getDocument('seoSettings', 'default')),
    safeRead('shippingSettings', () => getDocument('shippingSettings', 'default')),
    safeRead('taxSettings', () => getDocument('taxSettings', 'default')),
    safeRead('storeSettings', () => getDocument('storeSettings', 'default')),
  ])

  const failed = [products, categories].filter((res) => res.mode !== 'firestore')
  if (failed.length) {
    const err = new Error('Catalog is temporarily unavailable.')
    err.code = 'store_unavailable'
    throw err
  }

  const data = {
    products: products.data || [],
    categories: categories.data || [],
    coupons: coupons.mode === 'firestore' ? coupons.data || [] : [],
    banners: banners.mode === 'firestore' ? banners.data || [] : [],
    blogPosts: blogPosts.mode === 'firestore' ? blogPosts.data || [] : [],
    homepageSections:
      homepageSections.mode === 'firestore' ? homepageSections.data || [] : [],
    reviews: reviews.mode === 'firestore' ? reviews.data || [] : [],
    brands: brands.mode === 'firestore' ? brands.data || [] : [],
    seoSettings: seoSettings.mode === 'firestore' ? seoSettings.data : null,
    shippingSettings:
      shippingSettings.mode === 'firestore' ? shippingSettings.data : null,
    taxSettings: taxSettings.mode === 'firestore' ? taxSettings.data : null,
    storeSettings: storeSettings.mode === 'firestore' ? storeSettings.data : null,
  }
  devLog('storefront FETCHED', {
    products: data.products.length,
    categories: data.categories.length,
    banners: data.banners.length,
  })
  return data
}

function fetchDeduped() {
  if (!inflight) {
    const gen = generation
    inflight = fetchStorefront()
      .then(async (data) => {
        if (gen !== generation) return data
        if (data) await writeEntry(data)
        return data
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

/**
 * Public catalog for this browser.
 * A fresh cache returns before any Firestore query is created.
 * Expired cache is returned immediately; refresh happens in the background.
 */
export async function loadPublicStorefront({ force = false } = {}) {
  dropLegacyLocalStorage()
  if (!force && memoryEntry && cacheDecision(memoryEntry) === 'hit') {
    devLog('storefront HIT (memory)')
    return { data: memoryEntry.data, cache: 'hit' }
  }

  if (!force) {
    const entry = memoryEntry || (await readEntry())
    if (entry) memoryEntry = entry
    const decision = cacheDecision(entry)
    if (decision === 'hit') {
      devLog('storefront HIT')
      return { data: entry.data, cache: 'hit' }
    }
    if (decision === 'expired') {
      devLog('storefront EXPIRED — showing cache, refreshing in background')
      void fetchDeduped()
        .then((data) => {
          if (data) window.dispatchEvent(new CustomEvent('noah:storefront-updated'))
        })
        .catch((err) => {
          devLog('background refresh failed', err?.message || err)
          window.dispatchEvent(new CustomEvent('noah:storefront-refresh-failed'))
        })
      return { data: entry.data, cache: 'stale' }
    }
  }

  devLog(force ? 'storefront FORCE' : 'storefront MISS')
  try {
    const data = await fetchDeduped()
    return { data, cache: 'miss' }
  } catch (err) {
    const fallback = memoryEntry || (await readEntry())
    if (fallback?.data) {
      devLog('storefront fetch failed — keeping previous cache')
      return { data: fallback.data, cache: 'stale', error: err }
    }
    throw err
  }
}

export async function invalidatePublicStorefrontCache() {
  generation += 1
  memoryEntry = null
  inflight = null
  try {
    await idbDelete(CACHE_KEY)
  } catch {
    /* ignore */
  }
  dropLegacyLocalStorage()
  devLog('storefront invalidated')
}

export function friendlyStoreError(err) {
  const code = String(err?.code || '')
  const message = String(err?.message || '')
  if (
    code === 'resource-exhausted' ||
    code === '8' ||
    /quota/i.test(message)
  ) {
    return 'The store is busy right now. Showing saved catalog data when available.'
  }
  if (/unavailable|network|offline/i.test(message) || code === 'unavailable') {
    return 'Catalog is temporarily unavailable.'
  }
  return 'Catalog is temporarily unavailable.'
}
