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

const CACHE_KEY = 'noah_catalog_cache_v3'
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

/** Lightweight fingerprint from public catalog rows (uses existing updatedAt when present). */
function buildCatalogVersion(products = [], categories = []) {
  let maxProduct = 0
  for (const p of products) {
    maxProduct = Math.max(
      maxProduct,
      toMillis(p.updatedAt),
      toMillis(p.createdAt),
    )
  }
  let maxCategory = 0
  for (const c of categories) {
    maxCategory = Math.max(
      maxCategory,
      toMillis(c.updatedAt),
      toMillis(c.createdAt),
    )
  }
  return [
    products.length,
    categories.length,
    maxProduct,
    maxCategory,
  ].join(':')
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

/**
 * Lightweight change check using existing updatedAt fields (newest doc only).
 * Falls back to null when the query is unavailable so TTL still governs refresh.
 */
async function fetchRemoteCatalogVersion() {
  try {
    const [prodOut, catOut] = await Promise.all([
      safeList('products', [
        fsQuery.orderBy('updatedAt', 'desc'),
        fsQuery.limit(1),
      ]),
      safeList('categories', [
        fsQuery.orderBy('updatedAt', 'desc'),
        fsQuery.limit(1),
      ]),
    ])

    if (!prodOut.ok && !catOut.ok) return null

    const prod = prodOut.ok && prodOut.res.mode === 'firestore'
      ? prodOut.res.data?.[0]
      : null
    const cat = catOut.ok && catOut.res.mode === 'firestore'
      ? catOut.res.data?.[0]
      : null

    // Count is unknown from limit(1); include max timestamps as change signal.
    // Full load still reconciles exact counts into the stored version.
    return [
      'probe',
      toMillis(prod?.updatedAt),
      toMillis(cat?.updatedAt),
      prod?.id || '',
      cat?.id || '',
    ].join(':')
  } catch {
    return null
  }
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

  const applyPayload = useCallback((payload, { persist = true } = {}) => {
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
        version: buildCatalogVersion(payload.products, payload.categories),
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
      if (prodOut.ok && prodOut.res.mode === 'firestore' && Array.isArray(prodOut.res.data)) {
        nextProducts = prodOut.res.data
          .map(adminProductToStorefront)
          .filter(isStorefrontVisible)
      }

      let nextCategories = []
      if (catOut.ok && catOut.res.mode === 'firestore' && Array.isArray(catOut.res.data)) {
        nextCategories = catOut.res.data.filter(
          (c) => c.active !== false && c.status !== 'Inactive',
        )
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

      applyPayload(
        {
          products: nextProducts,
          categories: nextCategories,
          coupons: nextCoupons,
          banners: nextBanners,
          source: criticalFailed ? 'error' : 'firestore',
        },
        { persist: !criticalFailed },
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

        // Lightweight remote change check; refresh if data changed
        const remoteVersion = await fetchRemoteCatalogVersion()
        if (cancelled) return

        const cachedMaxProduct = Number(localVersion.split(':')[2] || 0)
        const cachedMaxCategory = Number(localVersion.split(':')[3] || 0)
        let remoteChanged = !localVersion
        if (remoteVersion) {
          const parts = remoteVersion.split(':')
          const remoteProd = Number(parts[1] || 0)
          const remoteCat = Number(parts[2] || 0)
          if (remoteProd > 0 && remoteProd !== cachedMaxProduct) {
            remoteChanged = true
          }
          if (remoteCat > 0 && remoteCat !== cachedMaxCategory) {
            remoteChanged = true
          }
        }

        if (remoteChanged) {
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
