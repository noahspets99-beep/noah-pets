import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { blogPosts as seedBlogPosts } from '../data/blogPosts'
import {
  cloneHomepageSections,
  mergeHomepageSections,
} from '../data/homepageSections'
import { DEFAULT_SEO } from '../config/store'
import {
  shippingSettings as seedShippingSettings,
  taxSettings as seedTaxSettings,
} from '../data/shippingTax'
import {
  normalizePriorityCities,
} from '../data/indiaCities'
import {
  isFirebaseConfigured,
} from '../services/firestore/repository'
import { loadPublicStorefront } from '../services/cache/publicStorefront'

const StoreContentContext = createContext(null)

function normalizeStorefrontPost(raw) {
  if (!raw) return null
  const status = raw.status || 'Published'
  return {
    ...raw,
    id: raw.id,
    status,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    seo: {
      title: raw.seoTitle || raw.seo?.title || raw.title || '',
      description: raw.seoDescription || raw.seo?.description || raw.excerpt || '',
      keywords: raw.seoKeywords || raw.seo?.keywords || '',
    },
  }
}

function seedPublishedPosts() {
  return seedBlogPosts.map((p) =>
    normalizeStorefrontPost({ ...p, status: p.status || 'Published' }),
  )
}

function normalizeStorefrontReview(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    name: raw.customer || raw.name || raw.customerName || 'Pet parent',
    avatar:
      raw.avatar ||
      raw.customerAvatar ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    petType: raw.petType || raw.customerLabel || 'Pet Parent',
    petName: raw.petName || '',
    rating: Number(raw.rating) || 5,
    review: raw.review || raw.comment || raw.text || '',
    product: raw.product || raw.productName || '',
    productId: raw.productId || null,
    status: raw.status || 'Approved',
  }
}

export function StoreContentProvider({ children }) {
  const [blogPosts, setBlogPosts] = useState(() =>
    isFirebaseConfigured ? [] : seedPublishedPosts(),
  )
  const [blogReady, setBlogReady] = useState(!isFirebaseConfigured)
  const [seoSettings, setSeoSettings] = useState(null)
  const [seoReady, setSeoReady] = useState(!isFirebaseConfigured)
  const [homepageSections, setHomepageSections] = useState(() =>
    cloneHomepageSections(),
  )
  const [homepageReady, setHomepageReady] = useState(!isFirebaseConfigured)
  const [shippingSettings, setShippingSettings] = useState(() => ({
    ...seedShippingSettings,
    priorityCities: normalizePriorityCities(seedShippingSettings.priorityCities),
  }))
  const [shippingReady, setShippingReady] = useState(!isFirebaseConfigured)
  const [taxSettings, setTaxSettings] = useState(() => ({
    ...seedTaxSettings,
    defaultRate: Number(seedTaxSettings.defaultRate) || 0,
  }))
  const [taxReady, setTaxReady] = useState(!isFirebaseConfigured)
  const [approvedReviews, setApprovedReviews] = useState([])
  const [reviewsReady, setReviewsReady] = useState(!isFirebaseConfigured)
  const [storeSettings, setStoreSettings] = useState(null)
  const [brands, setBrands] = useState([])
  const [brandsReady, setBrandsReady] = useState(!isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined

    let cancelled = false

    const apply = (data) => {
      if (cancelled || !data) return
      const nextPosts = (data.blogPosts || [])
        .map(normalizeStorefrontPost)
        .filter(Boolean)
        .sort(
          (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
        )
      setBlogPosts(nextPosts)
      setBlogReady(true)

      if (data.seoSettings) {
        const rest = { ...data.seoSettings }
        delete rest.id
        setSeoSettings(rest)
      } else {
        setSeoSettings(null)
      }
      setSeoReady(true)

      setHomepageSections(mergeHomepageSections(data.homepageSections || []))
      setHomepageReady(true)

      if (data.shippingSettings) {
        const rest = { ...data.shippingSettings }
        delete rest.id
        setShippingSettings((prev) => ({
          ...prev,
          ...rest,
          priorityCities: Array.isArray(rest.priorityCities)
            ? normalizePriorityCities(rest.priorityCities)
            : prev.priorityCities,
        }))
      }
      setShippingReady(true)

      if (data.taxSettings) {
        const rest = { ...data.taxSettings }
        delete rest.id
        const rate = Number(rest.defaultRate)
        setTaxSettings((prev) => ({
          ...prev,
          ...rest,
          defaultRate: Number.isFinite(rate) && rate >= 0 ? rate : 0,
        }))
      } else {
        setTaxSettings((prev) => ({ ...prev, defaultRate: 0 }))
      }
      setTaxReady(true)

      setApprovedReviews(
        (data.reviews || []).map(normalizeStorefrontReview).filter(Boolean),
      )
      setReviewsReady(true)

      setBrands(
        (data.brands || []).sort(
          (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0),
        ),
      )
      setBrandsReady(true)

      if (data.storeSettings) {
        const rest = { ...data.storeSettings }
        delete rest.id
        setStoreSettings(rest)
      } else {
        setStoreSettings(null)
      }
    }

    const pull = ({ force = false } = {}) => {
      loadPublicStorefront({ force })
        .then((result) => {
          if (cancelled) return
          apply(result?.data)
        })
        .catch((err) => {
          if (cancelled) return
          console.warn('[store-content]', err?.code || err?.message || err)
          setBlogReady(true)
          setSeoReady(true)
          setHomepageReady(true)
          setShippingReady(true)
          setTaxReady(true)
          setReviewsReady(true)
          setBrandsReady(true)
        })
    }

    pull()

    const onInvalidate = () => {
      if (!cancelled) pull({ force: true })
    }
    const onUpdated = () => {
      if (!cancelled) pull()
    }
    window.addEventListener('noah:catalog-invalidate', onInvalidate)
    window.addEventListener('noah:storefront-updated', onUpdated)

    return () => {
      cancelled = true
      window.removeEventListener('noah:catalog-invalidate', onInvalidate)
      window.removeEventListener('noah:storefront-updated', onUpdated)
    }
  }, [])

  const getBlogPostBySlug = useCallback(
    (slug) => blogPosts.find((p) => p.slug === slug) || null,
    [blogPosts],
  )

  const getSectionByKey = useCallback(
    (key) => homepageSections.find((s) => s.key === key) || null,
    [homepageSections],
  )

  const homepageSeo = useMemo(() => {
    const homepage = seoSettings?.homepage || {}
    const social = seoSettings?.social || {}
    const defaults = seoSettings?.defaults || {}
    return {
      title: homepage.title || defaults.defaultTitle || DEFAULT_SEO.defaultTitle,
      description:
        homepage.description ||
        defaults.defaultDescription ||
        DEFAULT_SEO.defaultDescription,
      keywords: homepage.keywords || defaults.keywords || DEFAULT_SEO.keywords,
      ogTitle: social.ogTitle || homepage.title || '',
      ogDescription: social.ogDescription || homepage.description || '',
      ogImage: social.ogImage || '',
      twitterCard: social.twitterCard || 'summary_large_image',
      googleVerification:
        seoSettings?.googleVerification || defaults.googleVerification || '',
      analyticsId: seoSettings?.analyticsId || defaults.analyticsId || '',
    }
  }, [seoSettings])

  const value = useMemo(
    () => ({
      blogPosts,
      blogReady,
      seoSettings,
      seoReady,
      homepageSeo,
      homepageSections,
      homepageReady,
      getSectionByKey,
      shippingSettings,
      shippingReady,
      taxSettings,
      taxReady,
      approvedReviews,
      reviewsReady,
      storeSettings,
      brands,
      brandsReady,
      getBlogPostBySlug,
    }),
    [
      blogPosts,
      blogReady,
      seoSettings,
      seoReady,
      homepageSeo,
      homepageSections,
      homepageReady,
      getSectionByKey,
      shippingSettings,
      shippingReady,
      taxSettings,
      taxReady,
      approvedReviews,
      reviewsReady,
      storeSettings,
      brands,
      brandsReady,
      getBlogPostBySlug,
    ],
  )

  return (
    <StoreContentContext.Provider value={value}>
      {children}
    </StoreContentContext.Provider>
  )
}

const FALLBACK = {
  blogPosts: seedPublishedPosts(),
  blogReady: true,
  seoSettings: null,
  seoReady: true,
  homepageSeo: {
    title: DEFAULT_SEO.defaultTitle,
    description: DEFAULT_SEO.defaultDescription,
    keywords: DEFAULT_SEO.keywords,
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
  },
  homepageSections: cloneHomepageSections(),
  homepageReady: true,
  getSectionByKey: (key) =>
    cloneHomepageSections().find((s) => s.key === key) || null,
  shippingSettings: { ...seedShippingSettings },
  shippingReady: true,
  taxSettings: {
    ...seedTaxSettings,
    defaultRate: Number(seedTaxSettings.defaultRate) || 0,
  },
  taxReady: true,
  approvedReviews: [],
  reviewsReady: true,
  storeSettings: null,
  brands: [],
  brandsReady: true,
  getBlogPostBySlug: (slug) =>
    seedPublishedPosts().find((p) => p.slug === slug) || null,
}

export function useStoreContent() {
  const ctx = useContext(StoreContentContext)
  return ctx || FALLBACK
}
