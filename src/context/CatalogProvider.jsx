import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  listCollection,
  isFirebaseConfigured,
  fsQuery,
} from '../services/firestore/repository'
import {
  FALLBACK_CATALOG_PRODUCTS,
  adminProductToStorefront,
  isStorefrontVisible,
} from '../services/catalogMapper'
import { catalogCategories } from '../data/catalog'
import {
  filterProducts as filterProductList,
  searchProducts as searchProductList,
  getProductBySlug as getStaticBySlug,
} from '../data/catalog'

const CatalogContext = createContext(null)

const CACHE_KEY = 'noah_catalog_cache_v4'
const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

function toMillis(value) {
  if (!value) return 0
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const t = Date.parse(value)
    return Number.isFinite(t) ? t : 0
  }
  if (typeof value?.toMillis === 'function') {
    try {
      return value.toMillis()
    } catch {
      return 0
    }
  }
  if (typeof value?.seconds === 'number') {
    return value.seconds * 1000
  }
  return 0
}

function maxDocMillis(docs = []) {
  let max = 0
  for (const d of docs) {
    max = Math.max(max, toMillis(d?.updatedAt), toMillis(d?.createdAt))
  }
  return max
}

/**
 * Fingerprint of the storefront-visible catalog.
 * Includes sorted IDs so deletes/adds are detected even when timestamps are ambiguous,
 * and max updatedAt across ALL raw docs so soft-deletes bump the version.
 */
function buildCatalogVersion(visibleProducts = [], visibleCategories = [], rawProducts = [], rawCategories = []) {
  const productIds = visibleProducts
    .map((p) => p.id)
    .filter(Boolean)
    .sort()
    .join(',')
  const categoryIds = visibleCategories
    .map((c) => c.id)
    .filter(Boolean)
    .sort()
    .join(',')
  return [
    visibleProducts.length,
    visibleCategories.length,
    maxDocMillis(rawProducts.length ? rawProducts : visibleProducts),
    maxDocMillis(rawCategories.length ? rawCategories : visibleCategories),
    productIds,
    categoryIds,
  ].join('|')
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.at || !Array.isArray(parsed.products)) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(payload) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...payload, at: Date.now() }),
    )
  } catch {
    /* ignore quota */
  }
}

function isCacheFresh(cache) {
  if (!cache?.at) return false
  return Date.now() - cache.at < CACHE_TTL_MS
}

export function invalidateCatalogCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem('noah_catalog_cache_v3')
    sessionStorage.removeItem('noah_catalog_cache_v2')
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('noah:catalog-invalidate'))
}

async function safeList(name, constraints = []) {
  try {
    const res = await listCollection(name, constraints)
    return { name, ok: true, res }
  } catch (err) {
    console.error(`Catalog load failed (${name})`, err?.code || err?.message || err)
    return { name, ok: false, err }
  }
}

function mapVisibleProducts(raw = []) {
  return raw.map(adminProductToStorefront).filter(isStorefrontVisible)
}

function mapVisibleCategories(raw = []) {
  return raw.filter((c) => c.active !== false && c.status !== 'Inactive')
}

/**
 * Compare live Firestore catalog to cached version.
 * Returns null on failure (caller should full-refresh).
 * Returns { changed: false } when cache still matches.
 * Returns { changed: true, products, categories, version } when out of date.
 */
async function probeCatalogAgainstCache(cachedVersion) {
  const [prodOut, catOut] = await Promise.all([
    safeList('products'),
    safeList('categories'),
  ])

  if (!prodOut.ok || prodOut.res.mode !== 'firestore') return null
  if (!catOut.ok || catOut.res.mode !== 'firestore') return null

  const rawProducts = Array.isArray(prodOut.res.data) ? prodOut.res.data : []
  const rawCategories = Array.isArray(catOut.res.data) ? catOut.res.data : []
  const products = mapVisibleProducts(rawProducts)
  const categories = mapVisibleCategories(rawCategories)
  const version = buildCatalogVersion(
    products,
    categories,
    rawProducts,
    rawCategories,
  )

  if (cachedVersion && version === cachedVersion) {
    return { changed: false, version, products, categories }
  }
  return { changed: true, version, products, categories }
}

export function CatalogProvider({ children }) {
  const cached = readCache()
  const cacheFresh = isCacheFresh(cached)
  const [products, setProducts] = useState(cached?.products || [])
  const [categories, setCategories] = useState(cached?.categories || [])
  const [coupons, setCoupons] = useState(cached?.coupons || [])
  const [banners, setBanners] = useState(cached?.banners || [])
  const [source, setSource] = useState(
    cacheFresh && cached?.source ? cached.source : cached?.source || 'loading',
  )
  const [loading, setLoading] = useState(!(cacheFresh && cached?.products))
  const [error, setError] = useState(null)

  const applyPayload = useCallback((payload, { persist = true, version } = {}) => {
    setProducts(payload.products)
    setCategories(payload.categories)
    setCoupons(payload.coupons)
    setBanners(payload.banners)
    setSource(payload.source)
    if (persist && payload.source === 'firestore') {
      writeCache({
        products: payload.products,
        categories: payload.categories,
        coupons: payload.coupons,
        banners: payload.banners,
        source: 'firestore',
        version:
          version ||
          buildCatalogVersion(payload.products, payload.categories),
      })
    }
  }, [])

  const load = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setProducts(FALLBACK_CATALOG_PRODUCTS)
      setCategories(catalogCategories)
      setCoupons([])
      setBanners([])
      setSource('fallback')
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [prodOut, catOut, couponOut, bannerOut] = await Promise.all([
        safeList('products'),
        safeList('categories'),
        safeList('coupons'),
        safeList('banners', [fsQuery.where('active', '==', true)]),
      ])

      let nextProducts = []
      let rawProducts = []
      if (prodOut.ok && prodOut.res.mode === 'firestore' && Array.isArray(prodOut.res.data)) {
        rawProducts = prodOut.res.data
        nextProducts = mapVisibleProducts(rawProducts)
      }

      let nextCategories = []
      let rawCategories = []
      if (catOut.ok && catOut.res.mode === 'firestore' && Array.isArray(catOut.res.data)) {
        rawCategories = catOut.res.data
        nextCategories = mapVisibleCategories(rawCategories)
      }

      let nextCoupons = []
      if (
        couponOut.ok &&
        couponOut.res.mode === 'firestore' &&
        Array.isArray(couponOut.res.data)
      ) {
        nextCoupons = couponOut.res.data.filter(
          (c) =>
            c.status === 'Active' ||
            (c.active !== false && c.status !== 'Expired'),
        )
      }

      let nextBanners = []
      if (
        bannerOut.ok &&
        bannerOut.res.mode === 'firestore' &&
        Array.isArray(bannerOut.res.data)
      ) {
        nextBanners = bannerOut.res.data.filter((b) => b.active !== false)
      }

      const failed = [prodOut, catOut, couponOut, bannerOut].filter((r) => !r.ok)
      const criticalFailed = !prodOut.ok

      const version = buildCatalogVersion(
        nextProducts,
        nextCategories,
        rawProducts,
        rawCategories,
      )

      applyPayload(
        {
          products: nextProducts,
          categories: nextCategories,
          coupons: nextCoupons,
          banners: nextBanners,
          source: criticalFailed ? 'error' : 'firestore',
        },
        { persist: !criticalFailed, version },
      )

      setError(
        criticalFailed
          ? prodOut.err?.message || 'Failed to load products from Firebase'
          : failed.length
            ? `Partial catalog load (${failed.map((f) => f.name).join(', ')})`
            : null,
      )
    } catch (err) {
      console.error('Catalog load failed', err?.code || err?.message || err)
      setError(err?.message || 'Failed to load catalog from Firebase')
      setSource('error')
    } finally {
      setLoading(false)
    }
  }, [applyPayload])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      if (!isFirebaseConfigured) {
        await load()
        return
      }

      const existing = readCache()
      const fresh = isCacheFresh(existing)

      if (fresh && Array.isArray(existing.products)) {
        // Serve cache immediately (already seeded into state)
        setLoading(false)

        const probe = await probeCatalogAgainstCache(existing.version || '')
        if (cancelled) return

        // Probe failed or catalog changed (add/edit/delete) → full reload.
        // Matching fingerprint keeps the 12h cache without trusting stale IDs.
        if (!probe || probe.changed) {
          await load()
        }
        return
      }

      // Expired or missing cache → full fetch
      await load()
    }

    boot()

    const onInvalidate = () => {
      if (!cancelled) load()
    }
    window.addEventListener('noah:catalog-invalidate', onInvalidate)
    return () => {
      cancelled = true
      window.removeEventListener('noah:catalog-invalidate', onInvalidate)
    }
  }, [load])

  const value = useMemo(() => {
    const getBySlug = (slug) => {
      const found = products.find((p) => p.slug === slug || p.id === slug)
      if (found) return found
      if (source === 'fallback') return getStaticBySlug(slug)
      return null
    }

    return {
      products,
      categories,
      coupons,
      banners,
      loading,
      error,
      source,
      refresh: load,
      getProductBySlug: getBySlug,
      filterProducts: (filter) => filterProductList(products, filter),
      searchProducts: (query) => searchProductList(products, query),
      getProductsByCategorySlug: (slug) =>
        products.filter(
          (p) =>
            p.categorySlug === slug ||
            p.subcategorySlug === slug ||
            p.petType?.toLowerCase() === slug ||
            String(slug || '').toLowerCase() ===
              String(p.petType || '')
                .toLowerCase()
                .replace(/\s+/g, '-'),
        ),
      getProductsByPetType: (petType) =>
        products.filter((p) => p.petType === petType),
    }
  }, [products, categories, coupons, banners, loading, error, source, load])

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  )
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) {
    return {
      products: [],
      categories: [],
      coupons: [],
      banners: [],
      loading: false,
      error: 'Catalog provider missing',
      source: 'error',
      refresh: async () => {},
      getProductBySlug: () => null,
      filterProducts: () => [],
      searchProducts: () => [],
      getProductsByCategorySlug: () => [],
      getProductsByPetType: () => [],
    }
  }
  return ctx
}
