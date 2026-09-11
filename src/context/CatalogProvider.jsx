import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  listCollection,
  isFirebaseConfigured,
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
      const [prodRes, catRes, couponRes, bannerRes] = await Promise.all([
        listCollection('products'),
        listCollection('categories'),
        listCollection('coupons'),
        listCollection('banners'),
      ])

      // Firebase configured: never silently swap in demo catalog
      let nextProducts = []
      if (prodRes.mode === 'firestore' && Array.isArray(prodRes.data)) {
        nextProducts = prodRes.data
          .map(adminProductToStorefront)
          .filter(isStorefrontVisible)
      }

      let nextCategories = []
      if (catRes.mode === 'firestore' && Array.isArray(catRes.data)) {
        nextCategories = catRes.data.filter(
          (c) => c.active !== false && c.status !== 'Inactive',
        )
      }

      let nextCoupons = []
      if (couponRes.mode === 'firestore' && Array.isArray(couponRes.data)) {
        nextCoupons = couponRes.data.filter(
          (c) =>
            c.status === 'Active' ||
            (c.active !== false && c.status !== 'Expired'),
        )
      }

      let nextBanners = []
      if (bannerRes.mode === 'firestore' && Array.isArray(bannerRes.data)) {
        nextBanners = bannerRes.data.filter((b) => b.active !== false)
      }

      setProducts(nextProducts)
      setCategories(nextCategories)
      setCoupons(nextCoupons)
      setBanners(nextBanners)
      setSource('firestore')
      writeCache({
        products: nextProducts,
        categories: nextCategories,
        coupons: nextCoupons,
        banners: nextBanners,
        source: 'firestore',
      })
    } catch (err) {
      console.error('Catalog load failed', err?.message || err)
      setError(err?.message || 'Failed to load catalog from Firebase')
      setSource('error')
      // Do not inject demo products on failure
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
