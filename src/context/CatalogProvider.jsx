import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  listCollection,
  subscribeCollection,
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

const CACHE_KEY = 'noah_catalog_cache_v5'
const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

/**
 * Must match firestore.rules: public read requires active == true.
 * Unfiltered collection queries fail for customers under those rules.
 */
const ACTIVE_BANNER_QUERY = [fsQuery.where('active', '==', true)]

function isBannerInDateWindow(b) {
  const now = Date.now()
  if (b.startDate) {
    const start = Date.parse(b.startDate)
    if (Number.isFinite(start) && now < start) return false
  }
  if (b.endDate) {
    const end = Date.parse(b.endDate)
    // Treat endDate as inclusive calendar day
    if (Number.isFinite(end) && now > end + 24 * 60 * 60 * 1000 - 1) return false
  }
  return true
}

function mapVisibleBanners(raw = []) {
  return raw
    .filter(
      (b) =>
        b &&
        b.active === true &&
        b.status !== 'Inactive' &&
        b.status !== 'Scheduled' &&
        isBannerInDateWindow(b),
    )
    .sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt))
}

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
 * Banners are included so Hero/promo stay in sync with Admin → Banners.
 */
function buildCatalogVersion(
  visibleProducts = [],
  visibleCategories = [],
  rawProducts = [],
  rawCategories = [],
  visibleBanners = [],
  rawBanners = [],
) {
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
  const bannerIds = visibleBanners
    .map((b) => b.id)
    .filter(Boolean)
    .sort()
    .join(',')
  return [
    visibleProducts.length,
    visibleCategories.length,
    visibleBanners.length,
    maxDocMillis(rawProducts.length ? rawProducts : visibleProducts),
    maxDocMillis(rawCategories.length ? rawCategories : visibleCategories),
    maxDocMillis(rawBanners.length ? rawBanners : visibleBanners),
    productIds,
    categoryIds,
    bannerIds,
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
    localStorage.removeItem('noah_catalog_cache_v4')
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
 * Returns { changed: true, ... } when out of date.
 */
async function probeCatalogAgainstCache(cachedVersion) {
  const [prodOut, catOut, bannerOut] = await Promise.all([
    safeList('products'),
    safeList('categories'),
    safeList('banners', ACTIVE_BANNER_QUERY),
  ])

  if (!prodOut.ok || prodOut.res.mode !== 'firestore') return null
  if (!catOut.ok || catOut.res.mode !== 'firestore') return null
  // Banners query failure should not block the whole catalog probe
  const rawProducts = Array.isArray(prodOut.res.data) ? prodOut.res.data : []
  const rawCategories = Array.isArray(catOut.res.data) ? catOut.res.data : []
  const rawBanners =
    bannerOut.ok && bannerOut.res.mode === 'firestore' && Array.isArray(bannerOut.res.data)
      ? bannerOut.res.data
      : []
  if (!bannerOut.ok) {
    console.error('[catalog] banners probe failed', bannerOut.err?.message || bannerOut.err)
  }
  const products = mapVisibleProducts(rawProducts)
  const categories = mapVisibleCategories(rawCategories)
  const banners = mapVisibleBanners(rawBanners)
  const version = buildCatalogVersion(
    products,
    categories,
    rawProducts,
    rawCategories,
    banners,
    rawBanners,
  )

  if (cachedVersion && version === cachedVersion) {
    return { changed: false, version, products, categories, banners }
  }
  return { changed: true, version, products, categories, banners }
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
      const resolvedVersion =
        version ||
        buildCatalogVersion(
          payload.products,
          payload.categories,
          payload.products,
          payload.categories,
          payload.banners,
          payload.banners,
        )
      writeCache({
        products: payload.products,
        categories: payload.categories,
        coupons: payload.coupons,
        banners: payload.banners,
        source: 'firestore',
        version: resolvedVersion,
      })
    }
  }, [])

  const refreshBanners = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setBanners([])
      return []
    }
    const bannerOut = await safeList('banners', ACTIVE_BANNER_QUERY)
    if (
      bannerOut.ok &&
      bannerOut.res.mode === 'firestore' &&
      Array.isArray(bannerOut.res.data)
    ) {
      const next = mapVisibleBanners(bannerOut.res.data)
      setBanners(next)
      // Keep cache banners in sync without trusting stale banner rows
      try {
        const existing = readCache()
        if (existing) {
          writeCache({
            ...existing,
            banners: next,
            version: buildCatalogVersion(
              existing.products || [],
              existing.categories || [],
              existing.products || [],
              existing.categories || [],
              next,
              bannerOut.res.data,
            ),
          })
        }
      } catch {
        /* ignore */
      }
      return next
    }
    return null
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
        safeList('banners', ACTIVE_BANNER_QUERY),
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
      let rawBanners = []
      if (
        bannerOut.ok &&
        bannerOut.res.mode === 'firestore' &&
        Array.isArray(bannerOut.res.data)
      ) {
        rawBanners = bannerOut.res.data
        nextBanners = mapVisibleBanners(rawBanners)
      }

      const failed = [prodOut, catOut, couponOut, bannerOut].filter((r) => !r.ok)
      const criticalFailed = !prodOut.ok

      const version = buildCatalogVersion(
        nextProducts,
        nextCategories,
        rawProducts,
        rawCategories,
        nextBanners,
        rawBanners,
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
        // Serve product/category cache immediately; always refresh banners
        setLoading(false)
        await refreshBanners()
        if (cancelled) return

        const probe = await probeCatalogAgainstCache(existing.version || '')
        if (cancelled) return

        // Probe failed or catalog changed (add/edit/delete) → full reload.
        if (!probe || probe.changed) {
          await load()
        } else if (probe.banners) {
          setBanners(probe.banners)
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

    // Realtime banners — matches firestore.rules public read (active == true)
    let unsubBanners = () => {}
    if (isFirebaseConfigured) {
      unsubBanners = subscribeCollection('banners', ACTIVE_BANNER_QUERY, {
        onData: (rows) => {
          if (cancelled) return
          setBanners(mapVisibleBanners(rows || []))
        },
        onError: (message) => {
          console.error('[catalog] banners realtime', message)
        },
      })
    }

    return () => {
      cancelled = true
      window.removeEventListener('noah:catalog-invalidate', onInvalidate)
      unsubBanners()
    }
  }, [load, refreshBanners])

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
