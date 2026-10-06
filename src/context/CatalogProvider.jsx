import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isFirebaseConfigured } from '../services/firestore/repository'
import {
  friendlyStoreError,
  invalidatePublicStorefrontCache,
  loadPublicCoupons,
  loadPublicStorefront,
} from '../services/cache/publicStorefront'
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
import { getProductsForCategory } from '../lib/categoryProducts'
import { productMatchesPet } from '../lib/petType'

const CatalogContext = createContext(null)

function isBannerInDateWindow(b) {
  const now = Date.now()
  if (b.startDate) {
    const start = Date.parse(b.startDate)
    if (Number.isFinite(start) && now < start) return false
  }
  if (b.endDate) {
    const end = Date.parse(b.endDate)
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

function mapVisibleProducts(raw = []) {
  return raw.map(adminProductToStorefront).filter(isStorefrontVisible)
}

function mapVisibleCategories(raw = []) {
  return raw.filter((c) => c.active !== false && c.status !== 'Inactive')
}

function mapCoupons(raw = []) {
  return raw.filter(
    (c) =>
      c.status === 'Active' ||
      (c.active !== false && c.status !== 'Expired'),
  )
}

/** Clears this browser's public catalog cache. Other visitors keep their 24-hour copy. */
export function invalidateCatalogCache() {
  void invalidatePublicStorefrontCache()
  window.dispatchEvent(new Event('noah:catalog-invalidate'))
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(() =>
    isFirebaseConfigured ? [] : FALLBACK_CATALOG_PRODUCTS,
  )
  const [categories, setCategories] = useState(() =>
    isFirebaseConfigured ? [] : catalogCategories,
  )
  const [coupons, setCoupons] = useState([])
  const [banners, setBanners] = useState([])
  const [source, setSource] = useState(isFirebaseConfigured ? 'loading' : 'fallback')
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState(null)

  const applyRaw = useCallback((data, { stale = false } = {}) => {
    setProducts(mapVisibleProducts(data?.products || []))
    setCategories(mapVisibleCategories(data?.categories || []))
    setCoupons(mapCoupons(data?.coupons || []))
    setBanners(mapVisibleBanners(data?.banners || []))
    setSource(stale ? 'cache' : 'firestore')
  }, [])

  const load = useCallback(
    async ({ force = false } = {}) => {
      if (!isFirebaseConfigured) return
      try {
        const result = await loadPublicStorefront({ force })
        let liveCoupons = null
        try {
          liveCoupons = await loadPublicCoupons()
        } catch (couponErr) {
          console.warn(
            'Coupon refresh failed',
            couponErr?.code || couponErr?.message || couponErr,
          )
        }
        if (result?.data) {
          applyRaw(result.data, { stale: result.cache === 'stale' })
          if (Array.isArray(liveCoupons)) setCoupons(liveCoupons)
          setError(result.error ? 'Data may be temporarily outdated.' : null)
        }
      } catch (err) {
        console.error('Catalog load failed', err?.code || err?.message || err)
        setError(friendlyStoreError(err))
        setSource('error')
      } finally {
        setLoading(false)
      }
    },
    [applyRaw],
  )

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined
    let cancelled = false

    // Cache check and any Firestore fetch run after this effect; state updates
    // happen only once that promise resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() awaits IndexedDB/Firestore before setState
    load().catch(() => {})

    const onInvalidate = () => {
      if (!cancelled) load({ force: true })
    }
    const onUpdated = () => {
      if (!cancelled) load()
    }
    const onRefreshFailed = () => {
      if (!cancelled) setError('Data may be temporarily outdated.')
    }
    window.addEventListener('noah:catalog-invalidate', onInvalidate)
    window.addEventListener('noah:storefront-updated', onUpdated)
    window.addEventListener('noah:storefront-refresh-failed', onRefreshFailed)

    return () => {
      cancelled = true
      window.removeEventListener('noah:catalog-invalidate', onInvalidate)
      window.removeEventListener('noah:storefront-updated', onUpdated)
      window.removeEventListener('noah:storefront-refresh-failed', onRefreshFailed)
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
      refresh: () => load({ force: true }),
      getProductBySlug: getBySlug,
      filterProducts: (filter) => filterProductList(products, filter),
      searchProducts: (query) => searchProductList(products, query),
      getProductsByCategorySlug: (slug) =>
        getProductsForCategory(products, slug, categories),
      getProductsByPetType: (petType) =>
        products.filter((p) => productMatchesPet(p, petType)),
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
