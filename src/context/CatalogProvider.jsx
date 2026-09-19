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

const CACHE_KEY = 'noah_catalog_cache_v2'
const CACHE_TTL_MS = 45_000

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.at || Date.now() - parsed.at > CACHE_TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(payload) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...payload, at: Date.now() }),
    )
  } catch {
    /* ignore quota */
  }
}

export function invalidateCatalogCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY)
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

export function CatalogProvider({ children }) {
  const cached = readCache()
  const [products, setProducts] = useState(cached?.products || [])
  const [categories, setCategories] = useState(cached?.categories || [])
  const [coupons, setCoupons] = useState(cached?.coupons || [])
  const [banners, setBanners] = useState(cached?.banners || [])
  const [source, setSource] = useState(cached?.source || 'loading')
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!isFirebaseConfigured) {
      // Local/dev without Firebase only — static catalog for preview
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
      // Load independently so one collection (e.g. banners rules) cannot wipe the catalog.
      // Banners rules require active==true for public list — must filter in the query.
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

      setProducts(nextProducts)
      setCategories(nextCategories)
      setCoupons(nextCoupons)
      setBanners(nextBanners)
      setSource(criticalFailed ? 'error' : 'firestore')
      setError(
        criticalFailed
          ? prodOut.err?.message || 'Failed to load products from Firebase'
          : failed.length
            ? `Partial catalog load (${failed.map((f) => f.name).join(', ')})`
            : null,
      )

      if (!criticalFailed) {
        writeCache({
          products: nextProducts,
          categories: nextCategories,
          coupons: nextCoupons,
          banners: nextBanners,
          source: 'firestore',
        })
      }
    } catch (err) {
      console.error('Catalog load failed', err?.code || err?.message || err)
      setError(err?.message || 'Failed to load catalog from Firebase')
      setSource('error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const onInvalidate = () => load()
    window.addEventListener('noah:catalog-invalidate', onInvalidate)
    return () =>
      window.removeEventListener('noah:catalog-invalidate', onInvalidate)
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
