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
import { shippingSettings as seedShippingSettings } from '../data/shippingTax'
import {
  normalizePriorityCities,
} from '../data/indiaCities'
import {
  fsQuery,
  isFirebaseConfigured,
  subscribeCollection,
  subscribeDocument,
} from '../services/firestore/repository'

const StoreContentContext = createContext(null)

const PUBLISHED_BLOG_QUERY = [fsQuery.where('status', '==', 'Published')]
const APPROVED_REVIEWS_QUERY = [fsQuery.where('status', '==', 'Approved')]
const ACTIVE_BRANDS_QUERY = [fsQuery.where('active', '==', true)]

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
  const [approvedReviews, setApprovedReviews] = useState([])
  const [reviewsReady, setReviewsReady] = useState(!isFirebaseConfigured)
  const [storeSettings, setStoreSettings] = useState(null)
  const [brands, setBrands] = useState([])
  const [brandsReady, setBrandsReady] = useState(!isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setBlogPosts(seedPublishedPosts())
      setBlogReady(true)
      setSeoSettings(null)
      setSeoReady(true)
      setHomepageSections(cloneHomepageSections())
      setHomepageReady(true)
      setShippingSettings({ ...seedShippingSettings })
      setShippingReady(true)
      setApprovedReviews([])
      setReviewsReady(true)
      setStoreSettings(null)
      setBrands([])
      setBrandsReady(true)
      return undefined
    }

    let cancelled = false
    const unsubBlog = subscribeCollection('blogPosts', PUBLISHED_BLOG_QUERY, {
      onData: (rows) => {
        if (cancelled) return
        const next = (rows || [])
          .map(normalizeStorefrontPost)
          .filter(Boolean)
          .sort(
            (a, b) =>
              new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
          )
        setBlogPosts(next)
        setBlogReady(true)
      },
      onError: (message) => {
        if (cancelled) return
        console.warn('[store-content] blogPosts', message)
        setBlogPosts([])
        setBlogReady(true)
      },
    })

    const unsubSeo = subscribeDocument('seoSettings', 'default', {
      onData: (docData) => {
        if (cancelled) return
        if (docData) {
          const { id: _id, ...rest } = docData
          setSeoSettings(rest)
        } else {
          setSeoSettings(null)
        }
        setSeoReady(true)
      },
      onError: (message) => {
        if (cancelled) return
        console.warn('[store-content] seoSettings', message)
        setSeoSettings(null)
        setSeoReady(true)
      },
    })

    const unsubHomepage = subscribeCollection('homepageSections', [], {
      onData: (rows) => {
        if (cancelled) return
        setHomepageSections(mergeHomepageSections(rows || []))
        setHomepageReady(true)
      },
      onError: (message) => {
        if (cancelled) return
        console.warn('[store-content] homepageSections', message)
        setHomepageSections(cloneHomepageSections())
        setHomepageReady(true)
      },
    })

    const unsubShipping = subscribeDocument('shippingSettings', 'default', {
      onData: (docData) => {
        if (cancelled) return
        if (docData) {
          const { id: _id, ...rest } = docData
          setShippingSettings((prev) => ({
            ...prev,
            ...rest,
            priorityCities: normalizePriorityCities(
              rest.priorityCities?.length
                ? rest.priorityCities
                : prev.priorityCities,
            ),
          }))
        }
        setShippingReady(true)
      },
      onError: (message) => {
        if (cancelled) return
        console.warn('[store-content] shippingSettings', message)
        setShippingReady(true)
      },
    })

    const unsubReviews = subscribeCollection('reviews', APPROVED_REVIEWS_QUERY, {
      onData: (rows) => {
        if (cancelled) return
        setApprovedReviews(
          (rows || []).map(normalizeStorefrontReview).filter(Boolean),
        )
        setReviewsReady(true)
      },
      onError: (message) => {
        if (cancelled) return
        console.warn('[store-content] reviews', message)
        setApprovedReviews([])
        setReviewsReady(true)
      },
    })

    const unsubBrands = subscribeCollection('brands', ACTIVE_BRANDS_QUERY, {
      onData: (rows) => {
        if (cancelled) return
        setBrands(
          (rows || []).sort(
            (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0),
          ),
        )
        setBrandsReady(true)
      },
      onError: (message) => {
        if (cancelled) return
        console.warn('[store-content] brands', message)
        // Fallback: try unfiltered if active index/query fails
        setBrands([])
        setBrandsReady(true)
      },
    })

    const unsubStore = subscribeDocument('storeSettings', 'default', {
      onData: (docData) => {
        if (cancelled) return
        if (docData) {
          const { id: _id, ...rest } = docData
          setStoreSettings(rest)
        } else {
          setStoreSettings(null)
        }
      },
      onError: (message) => {
        if (cancelled) return
        console.warn('[store-content] storeSettings', message)
        setStoreSettings(null)
      },
    })

    return () => {
      cancelled = true
      unsubBlog()
      unsubSeo()
      unsubHomepage()
      unsubShipping()
      unsubReviews()
      unsubBrands()
      unsubStore()
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
