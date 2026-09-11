import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  initialAdminNotifications,
  initialAdminSettings,
} from '../data/adminDashboard'
import { homepageSections as seedHomepageSections } from '../data/homepageSections'
import {
  shippingSettings as seedShippingSettings,
  taxSettings as seedTaxSettings,
} from '../data/shippingTax'
import { blogPosts as seedBlogPosts } from '../data/blogPosts'
import { DEFAULT_SEO, TN_PRIORITY_CITIES } from '../config/store'
import { delay } from '../admin/utils'
import { AdminStoreContext } from './admin-store-context'
import {
  listCollection,
  subscribeCollection,
  upsertDocument,
  patchDocument,
  isFirebaseConfigured,
} from '../services/firestore/repository'
import { invalidateCatalogCache } from './CatalogProvider'
import { stripUndefined } from '../services/catalogMapper'

function uid(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

const PET_TYPE_MAP = {
  Dogs: 'Dogs',
  Cats: 'Cats',
  Birds: 'Birds',
  Fish: 'Fish',
  'Small Pets': 'Small Pets',
  Dog: 'Dogs',
  Cat: 'Cats',
  Bird: 'Birds',
  Rabbit: 'Small Pets',
}

function mapCatalogToAdmin(p) {
  const seo = p.seo || {}
  const stock = Number(p.stock) || 0
  let status = 'Active'
  if (p.active === false) status = 'Draft'
  else if (stock <= 0 || p.inStock === false) status = 'Out of Stock'

  return {
    id: p.id,
    name: p.name,
    slug: p.slug || '',
    sku: p.sku || '',
    barcode: p.barcode || '',
    brand: p.brand || '',
    petType: PET_TYPE_MAP[p.petType] || p.petType || 'Dogs',
    category: p.subcategory || p.category || '',
    subcategory: p.subcategory || '',
    description: p.description || '',
    shortDescription: p.shortDescription || '',
    price: p.price ?? 0,
    mrp: p.originalPrice ?? p.mrp ?? p.price ?? 0,
    discount: p.discount ?? 0,
    tax: 5,
    stock,
    lowStockThreshold: p.lowStockThreshold ?? 10,
    images: p.images?.length ? [...p.images] : p.image ? [p.image] : [''],
    weight: p.weight || '',
    size: p.size || '',
    flavor: p.flavor || '',
    ageGroup: p.age || p.ageGroup || '',
    material: p.material || '',
    ingredients: p.ingredients || '',
    shippingWeight: p.shippingWeight || '',
    dimensions: p.dimensions || '',
    deliveryAvailable: p.deliveryAvailable !== false,
    status,
    featured: !!p.featured,
    bestseller: !!p.bestseller,
    newArrival: !!p.newArrival,
    active: p.active !== false,
    sales:
      typeof p.reviews === 'number'
        ? Math.min(p.reviews, 999)
        : Number(p.sales) || 0,
    createdAt: p.createdAt || null,
    updatedAt: p.updatedAt || null,
    variants: (p.variants || []).map((v) => ({
      id: v.id || uid('v'),
      label: v.label || '',
      sku: v.sku || '',
      price: v.price ?? 0,
      mrp: v.mrp ?? v.price ?? 0,
      stock: v.stock ?? 0,
      weight: v.weight || '',
    })),
    seoTitle: seo.title || p.seoTitle || '',
    seoDescription: seo.description || p.seoDescription || '',
    seoKeywords: seo.keywords || p.seoKeywords || '',
    canonicalUrl: seo.canonical || p.canonicalUrl || '',
    ogTitle: seo.ogTitle || p.ogTitle || '',
    ogDescription: seo.ogDescription || p.ogDescription || '',
    socialImage: seo.socialImage || p.socialImage || '',
    video: p.video || '',
    benefits: Array.isArray(p.benefits)
      ? p.benefits.join('\n')
      : p.benefits || '',
    usageInstructions: p.usageInstructions || '',
    minOrderQty: p.minOrderQty ?? 1,
    color: p.color || '',
  }
}

function buildInitialSeoSettings() {
  return {
    homepage: {
      title: DEFAULT_SEO.defaultTitle,
      description: DEFAULT_SEO.defaultDescription,
      keywords: DEFAULT_SEO.keywords,
    },
    defaults: {
      titleTemplate: DEFAULT_SEO.titleTemplate,
      defaultTitle: DEFAULT_SEO.defaultTitle,
      defaultDescription: DEFAULT_SEO.defaultDescription,
      keywords: DEFAULT_SEO.keywords,
    },
    googleVerification: '',
    analyticsId: '',
    sitemapNotes:
      'Sitemap is generated at /sitemap.xml covering products, categories, blog posts, and location pages. Submit via Google Search Console after go-live.',
    robotsNotes:
      'Allow crawl of storefront pages. Disallow /admin, /admin-login, /cart, /checkout, and account routes in production robots.txt.',
    social: {
      ogTitle: "Noah's Pets — Pet Food & Supplies in Tamil Nadu",
      ogDescription: DEFAULT_SEO.defaultDescription,
      ogImage: '',
      twitterCard: 'summary_large_image',
    },
    locationSeo: TN_PRIORITY_CITIES.map((c) => ({
      slug: c.slug,
      name: c.name,
      title: `Pet Shop in ${c.name} | Noah's Pets Tamil Nadu`,
      description: c.highlights,
    })),
  }
}

function seedPaymentsFromOrders(orders) {
  return orders
    .filter((o) => o.payment === 'Paid' || o.paymentStatus === 'Paid')
    .map((o) => ({
      id: `pay-${o.id}`,
      orderId: o.id,
      amount: o.total,
      provider: o.paymentProvider || 'razorpay',
      status: 'Captured',
      method: o.paymentMethod || o.paymentProvider || '—',
      createdAt: o.createdAt,
      customer: o.customer?.name || 'Customer',
    }))
}

function toIsoDate(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value.toDate === 'function') {
    try {
      return value.toDate().toISOString()
    } catch {
      return null
    }
  }
  if (typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000).toISOString()
  }
  return null
}

function normalizeAdminOrder(raw) {
  if (!raw) return null
  const customer = raw.customer || {}
  const paymentStatus =
    raw.paymentStatus ||
    (typeof raw.payment === 'string' ? raw.payment : null) ||
    'Pending'
  const createdAt = toIsoDate(raw.createdAt) || toIsoDate(raw.updatedAt)
  return {
    ...raw,
    createdAt,
    updatedAt: toIsoDate(raw.updatedAt) || createdAt,
    customer: {
      id: customer.id || raw.customerId || '',
      name: customer.name || 'Customer',
      email: customer.email || '',
      phone: customer.phone || customer.mobile || '',
    },
    items: Array.isArray(raw.items) ? raw.items : [],
    payment: paymentStatus,
    paymentStatus,
    paymentMethod: raw.paymentMethod || raw.paymentProvider || '—',
    deliveryFee: raw.deliveryFee ?? raw.shipping ?? 0,
    discount: raw.discount ?? 0,
    tax: raw.tax ?? 0,
    total: Number(raw.total) || 0,
    status: raw.status || 'Pending',
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
  }
}

function customersFromOrders(orders) {
  const map = new Map()
  for (const o of orders) {
    const key =
      o.customerId ||
      o.customer?.email?.toLowerCase() ||
      o.customer?.id ||
      null
    if (!key) continue
    const existing = map.get(key)
    const total = Number(o.total) || 0
    if (!existing) {
      map.set(key, {
        id: key,
        name: o.customer?.name || 'Customer',
        email: o.customer?.email || '',
        phone: o.customer?.phone || o.customer?.mobile || '',
        orders: 1,
        totalSpent: total,
        lastOrderAt: o.createdAt || null,
        status: 'Active',
      })
    } else {
      existing.orders += 1
      existing.totalSpent += total
      if (
        o.createdAt &&
        (!existing.lastOrderAt ||
          new Date(o.createdAt) > new Date(existing.lastOrderAt))
      ) {
        existing.lastOrderAt = o.createdAt
      }
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.lastOrderAt || 0) - new Date(a.lastOrderAt || 0),
  )
}

function normalizeBlogPost(p) {
  return {
    ...p,
    status: p.status || 'Published',
    tags: Array.isArray(p.tags) ? p.tags : [],
    seoTitle: p.seoTitle ?? p.seo?.title ?? '',
    seoDescription: p.seoDescription ?? p.seo?.description ?? '',
    seoKeywords: p.seoKeywords ?? p.seo?.keywords ?? '',
  }
}

const STATUS_RANK = {
  Pending: 0,
  Confirmed: 1,
  Processing: 2,
  Shipped: 3,
  'Out for Delivery': 4,
  Delivered: 5,
}

const TIMELINE_LABELS = [
  'Order placed',
  'Payment confirmed',
  'Order processing',
  'Shipped',
  'Out for delivery',
  'Delivered',
]

function applyOrderTimeline(order, status) {
  const terminal = ['Cancelled', 'Returned', 'Refunded'].includes(status)
  const timeline = Array.isArray(order.timeline) ? order.timeline : []
  if (terminal) return timeline.map((step) => step)

  const rank = STATUS_RANK[status] ?? 0
  return TIMELINE_LABELS.map((label, idx) => {
    const existing =
      timeline.find((s) => s.label.toLowerCase() === label.toLowerCase()) ||
      timeline[idx]
    const done = idx <= Math.max(rank, 0)
    return {
      label,
      done,
      at: done
        ? existing?.at || (idx <= rank ? new Date().toISOString() : null)
        : null,
    }
  })
}

export function AdminStoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [reviews, setReviews] = useState([])
  const [coupons, setCoupons] = useState([])
  const [banners, setBanners] = useState([])
  const [settings, setSettings] = useState(initialAdminSettings)
  const [notifications, setNotifications] = useState(initialAdminNotifications)
  const [toasts, setToasts] = useState([])
  const [dataStatus, setDataStatus] = useState({
    loading: true,
    error: null,
    ordersReady: false,
  })
  const [homepageSections, setHomepageSections] = useState(() =>
    seedHomepageSections.map((s) => ({ ...s, config: { ...s.config } })),
  )
  const [seoSettings, setSeoSettings] = useState(buildInitialSeoSettings)
  const [shippingSettings, setShippingSettings] = useState(() => ({
    ...seedShippingSettings,
    priorityCities: seedShippingSettings.priorityCities.map((c) => ({ ...c })),
    serviceableStates: [...seedShippingSettings.serviceableStates],
  }))
  const [taxSettings, setTaxSettings] = useState(() => ({
    ...seedTaxSettings,
    rates: seedTaxSettings.rates.map((r) => ({
      ...r,
      appliesToCategories: [...(r.appliesToCategories || [])],
      appliesToCategorySlugs: [...(r.appliesToCategorySlugs || [])],
    })),
  }))
  const [blogPosts, setBlogPosts] = useState(() =>
    seedBlogPosts.map(normalizeBlogPost),
  )
  const [payments, setPayments] = useState([])
  const [paymentSettings] = useState({
    activeProvider: 'Razorpay',
    note: 'Payment verification runs server-side. Order payment status comes from Firebase.',
  })

  useEffect(() => {
    let cancelled = false
    let unsubOrders = () => {}

    async function loadStaticCollections() {
      if (!isFirebaseConfigured) {
        setDataStatus({
          loading: false,
          error: 'Firebase is not configured',
          ordersReady: true,
        })
        setProducts([])
        setCategories([])
        setCoupons([])
        setCustomers([])
        setOrders([])
        setPayments([])
        return
      }

      setDataStatus((s) => ({ ...s, loading: true, error: null }))

      try {
        const [prodRes, catRes, couponRes, customerRes, reviewRes, bannerRes] =
          await Promise.all([
            listCollection('products'),
            listCollection('categories'),
            listCollection('coupons'),
            listCollection('customers'),
            listCollection('reviews'),
            listCollection('banners'),
          ])

        if (cancelled) return

        if (prodRes.mode === 'firestore') {
          setProducts(
            (prodRes.data || []).map((p) => ({
              ...mapCatalogToAdmin(p),
              ...p,
            })),
          )
        }

        if (catRes.mode === 'firestore') {
          setCategories(catRes.data || [])
        }

        if (couponRes.mode === 'firestore') {
          setCoupons(couponRes.data || [])
        }

        if (customerRes.mode === 'firestore') {
          setCustomers(customerRes.data || [])
        }

        if (reviewRes.mode === 'firestore') {
          setReviews(reviewRes.data || [])
        }

        if (bannerRes.mode === 'firestore') {
          setBanners(bannerRes.data || [])
        } else {
          setBanners([])
        }

        unsubOrders = subscribeCollection('orders', [], {
          onData: (rows) => {
            if (cancelled) return
            const normalized = (rows || [])
              .map(normalizeAdminOrder)
              .filter(Boolean)
              .sort(
                (a, b) =>
                  new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
              )
            setOrders(normalized)
            if (import.meta.env.DEV) {
              console.info('[admin] orders snapshot', {
                collection: 'orders',
                count: normalized.length,
              })
            }
            setPayments(seedPaymentsFromOrders(normalized))
            setCustomers((prev) => {
              if (prev.length > 0) return prev
              return customersFromOrders(normalized)
            })
            setDataStatus((s) => ({
              ...s,
              loading: false,
              error: null,
              ordersReady: true,
            }))
          },
          onError: (message) => {
            if (cancelled) return
            setOrders([])
            setPayments([])
            setDataStatus({
              loading: false,
              error: message || 'Failed to load orders from Firebase',
              ordersReady: true,
            })
          },
        })
      } catch (err) {
        console.error('Admin Firebase load failed', err?.message || err)
        if (!cancelled) {
          setProducts([])
          setCategories([])
          setCoupons([])
          setCustomers([])
          setOrders([])
          setPayments([])
          setDataStatus({
            loading: false,
            error: err?.message || 'Failed to load Firebase data',
            ordersReady: true,
          })
        }
      }
    }

    loadStaticCollections()

    return () => {
      cancelled = true
      unsubOrders()
    }
  }, [])

  const pushToast = useCallback((message, type = 'success') => {
    const id = uid('t')
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2800)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const createProduct = useCallback(
    async (data) => {
      const product = {
        ...data,
        id: data.id || uid('p'),
        categorySlug:
          data.categorySlug ||
          (data.category
            ? String(data.category)
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
            : 'products'),
        sales: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await upsertDocument('products', product.id, stripUndefined(product))
      setProducts((prev) => [product, ...prev])
      invalidateCatalogCache()
      pushToast('Product saved — visible on storefront')
      return product
    },
    [pushToast],
  )

  const updateProduct = useCallback(
    async (id, data) => {
      const updatedAt = new Date().toISOString()
      const patch = { ...data, updatedAt }
      await upsertDocument('products', id, stripUndefined(patch))
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      )
      invalidateCatalogCache()
      pushToast('Product updated — storefront refreshed')
    },
    [pushToast],
  )

  const deleteProduct = useCallback(
    async (id) => {
      const patch = {
        active: false,
        status: 'Draft',
        updatedAt: new Date().toISOString(),
      }
      await upsertDocument('products', id, patch)
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      )
      invalidateCatalogCache()
      pushToast('Product deactivated (hidden from storefront)')
    },
    [pushToast],
  )

  const bulkUpdateProducts = useCallback(
    async (ids, patch) => {
      const updatedAt = new Date().toISOString()
      const next = { ...patch, updatedAt }
      await Promise.all(
        ids.map((id) => upsertDocument('products', id, stripUndefined(next))),
      )
      setProducts((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, ...next } : p)),
      )
      invalidateCatalogCache()
      pushToast('Products updated')
    },
    [pushToast],
  )

  const bulkDeleteProducts = useCallback(
    async (ids) => {
      const patch = {
        active: false,
        status: 'Draft',
        updatedAt: new Date().toISOString(),
      }
      await Promise.all(ids.map((id) => upsertDocument('products', id, patch)))
      setProducts((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, ...patch } : p)),
      )
      invalidateCatalogCache()
      pushToast(`${ids.length} product${ids.length === 1 ? '' : 's'} deactivated`)
    },
    [pushToast],
  )

  const duplicateProduct = useCallback(
    async (id) => {
      const source = products.find((p) => p.id === id)
      if (!source) return
      const copy = {
        ...source,
        id: uid('p'),
        name: `${source.name} (Copy)`,
        sku: `${source.sku || 'SKU'}-COPY`,
        slug: source.slug ? `${source.slug}-copy` : '',
        status: 'Draft',
        active: false,
        sales: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await upsertDocument('products', copy.id, stripUndefined(copy))
      setProducts((prev) => [copy, ...prev])
      invalidateCatalogCache()
      pushToast('Product duplicated as Draft')
    },
    [products, pushToast],
  )

  const adjustStock = useCallback(
    async (productId, delta) => {
      const current = products.find((p) => p.id === productId)
      if (!current) return
      const stock = Math.max(0, (Number(current.stock) || 0) + Number(delta))
      let status = current.status
      if (stock === 0 && status === 'Active') status = 'Out of Stock'
      if (stock > 0 && status === 'Out of Stock') status = 'Active'
      const patch = { stock, status, updatedAt: new Date().toISOString() }
      await upsertDocument('products', productId, patch)
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...patch } : p)),
      )
      invalidateCatalogCache()
    },
    [products],
  )

  const createCoupon = useCallback(
    async (data) => {
      const coupon = {
        ...data,
        id: data.id || uid('cp'),
        code: String(data.code || '').trim().toUpperCase(),
        used: data.used || 0,
        updatedAt: new Date().toISOString(),
      }
      await upsertDocument('coupons', coupon.id, stripUndefined(coupon))
      setCoupons((prev) => [coupon, ...prev])
      invalidateCatalogCache()
      pushToast('Coupon created — available at checkout')
      return coupon
    },
    [pushToast],
  )

  const updateCoupon = useCallback(
    async (id, data) => {
      const patch = {
        ...data,
        ...(data.code
          ? { code: String(data.code).trim().toUpperCase() }
          : {}),
        updatedAt: new Date().toISOString(),
      }
      await upsertDocument('coupons', id, stripUndefined(patch))
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      )
      invalidateCatalogCache()
      pushToast('Coupon updated')
    },
    [pushToast],
  )

  const deleteCoupon = useCallback(
    async (id) => {
      await upsertDocument('coupons', id, {
        status: 'Expired',
        active: false,
        updatedAt: new Date().toISOString(),
      })
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: 'Expired', active: false } : c,
        ),
      )
      invalidateCatalogCache()
      pushToast('Coupon deactivated')
    },
    [pushToast],
  )

  const createCategory = useCallback(
    async (data) => {
      const category = {
        ...data,
        id: data.id || uid('c'),
        productCount: data.productCount || 0,
        updatedAt: new Date().toISOString(),
      }
      await upsertDocument('categories', category.id, stripUndefined(category))
      setCategories((prev) => [category, ...prev])
      invalidateCatalogCache()
      pushToast('Category created — live on storefront')
      return category
    },
    [pushToast],
  )

  const updateCategory = useCallback(
    async (id, data) => {
      const patch = { ...data, updatedAt: new Date().toISOString() }
      await upsertDocument('categories', id, stripUndefined(patch))
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      )
      invalidateCatalogCache()
      pushToast('Category updated')
    },
    [pushToast],
  )

  const deleteCategory = useCallback(
    async (id) => {
      await upsertDocument('categories', id, {
        active: false,
        status: 'Inactive',
        updatedAt: new Date().toISOString(),
      })
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, active: false, status: 'Inactive' } : c,
        ),
      )
      invalidateCatalogCache()
      pushToast('Category deactivated')
    },
    [pushToast],
  )

  const updateOrderStatus = useCallback(
    async (id, status) => {
      const current = orders.find((o) => o.id === id)
      if (!current) {
        pushToast('Order not found', 'error')
        return
      }
      const timeline = applyOrderTimeline(current, status)
      const patch = { status, timeline, updatedAt: new Date().toISOString() }
      try {
        await patchDocument('orders', id, patch)
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        )
        pushToast('Order status updated')
      } catch (err) {
        pushToast(err?.message || 'Failed to update order status', 'error')
      }
    },
    [orders, pushToast],
  )

  const updateReviewStatus = useCallback(
    async (id, status) => {
      try {
        await patchDocument('reviews', id, { status })
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r)),
        )
        pushToast(`Review ${status.toLowerCase()}`)
      } catch (err) {
        pushToast(err?.message || 'Failed to update review', 'error')
      }
    },
    [pushToast],
  )

  const deleteReview = useCallback(
    async (id) => {
      try {
        await upsertDocument('reviews', id, { status: 'Deleted' })
        setReviews((prev) => prev.filter((r) => r.id !== id))
        pushToast('Review removed')
      } catch (err) {
        pushToast(err?.message || 'Failed to delete review', 'error')
      }
    },
    [pushToast],
  )

  const createBanner = useCallback(
    async (data) => {
      const banner = {
        ...data,
        id: data.id || uid('b'),
        active: data.active !== false,
        updatedAt: new Date().toISOString(),
      }
      await upsertDocument('banners', banner.id, stripUndefined(banner))
      setBanners((prev) => [banner, ...prev])
      invalidateCatalogCache()
      pushToast('Banner created')
      return banner
    },
    [pushToast],
  )

  const updateBanner = useCallback(
    async (id, data) => {
      const patch = { ...data, updatedAt: new Date().toISOString() }
      await upsertDocument('banners', id, stripUndefined(patch))
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      )
      invalidateCatalogCache()
      pushToast('Banner updated')
    },
    [pushToast],
  )

  const deleteBanner = useCallback(
    async (id) => {
      await upsertDocument('banners', id, {
        active: false,
        updatedAt: new Date().toISOString(),
      })
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, active: false } : b)),
      )
      invalidateCatalogCache()
      pushToast('Banner deactivated')
    },
    [pushToast],
  )

  const saveSettings = useCallback(
    async (data) => {
      await delay(300)
      setSettings((prev) => ({ ...prev, ...data }))
      pushToast('Settings saved')
    },
    [pushToast],
  )

  const updateHomepageSection = useCallback(
    async (id, data) => {
      await delay(200)
      setHomepageSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...data } : s)),
      )
      pushToast('Homepage section updated')
    },
    [pushToast],
  )

  const reorderHomepageSections = useCallback(
    async (id, direction) => {
      await delay(150)
      setHomepageSections((prev) => {
        const sorted = [...prev].sort((a, b) => a.sortOrder - b.sortOrder)
        const idx = sorted.findIndex((s) => s.id === id)
        if (idx < 0) return prev
        const swapWith = direction === 'up' ? idx - 1 : idx + 1
        if (swapWith < 0 || swapWith >= sorted.length) return prev
        const a = sorted[idx]
        const b = sorted[swapWith]
        const aOrder = a.sortOrder
        sorted[idx] = { ...a, sortOrder: b.sortOrder }
        sorted[swapWith] = { ...b, sortOrder: aOrder }
        return sorted
      })
      pushToast('Section order updated')
    },
    [pushToast],
  )

  const saveSeoSettings = useCallback(
    async (data) => {
      await delay(300)
      setSeoSettings((prev) => ({ ...prev, ...data }))
      pushToast('SEO settings saved')
    },
    [pushToast],
  )

  const saveShippingSettings = useCallback(
    async (data) => {
      await delay(300)
      setShippingSettings((prev) => ({ ...prev, ...data }))
      pushToast('Shipping settings saved')
    },
    [pushToast],
  )

  const saveTaxSettings = useCallback(
    async (data) => {
      await delay(300)
      setTaxSettings((prev) => ({ ...prev, ...data }))
      pushToast('Tax settings saved')
    },
    [pushToast],
  )

  const createBlogPost = useCallback(
    async (data) => {
      await delay(250)
      const post = normalizeBlogPost({
        ...data,
        id: uid('b'),
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.excerpt,
          keywords: data.seoKeywords || '',
        },
      })
      setBlogPosts((prev) => [post, ...prev])
      pushToast('Blog post created')
      return post
    },
    [pushToast],
  )

  const updateBlogPost = useCallback(
    async (id, data) => {
      await delay(250)
      setBlogPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? normalizeBlogPost({
                ...p,
                ...data,
                seo: {
                  title: data.seoTitle ?? p.seoTitle ?? p.seo?.title,
                  description:
                    data.seoDescription ??
                    p.seoDescription ??
                    p.seo?.description,
                  keywords:
                    data.seoKeywords ?? p.seoKeywords ?? p.seo?.keywords,
                },
              })
            : p,
        ),
      )
      pushToast('Blog post updated')
    },
    [pushToast],
  )

  const deleteBlogPost = useCallback(
    async (id) => {
      await delay(200)
      setBlogPosts((prev) => prev.filter((p) => p.id !== id))
      pushToast('Blog post deleted')
    },
    [pushToast],
  )

  const value = useMemo(
    () => ({
      products,
      categories,
      orders,
      customers,
      reviews,
      coupons,
      banners,
      settings,
      notifications,
      toasts,
      homepageSections,
      seoSettings,
      shippingSettings,
      taxSettings,
      blogPosts,
      payments,
      paymentSettings,
      dataStatus,
      catalogReadOnly: false,
      couponsReadOnly: false,
      pushToast,
      dismissToast,
      markNotificationRead,
      markAllNotificationsRead,
      createProduct,
      updateProduct,
      deleteProduct,
      bulkUpdateProducts,
      bulkDeleteProducts,
      duplicateProduct,
      adjustStock,
      createCategory,
      updateCategory,
      deleteCategory,
      updateOrderStatus,
      updateReviewStatus,
      deleteReview,
      createCoupon,
      updateCoupon,
      deleteCoupon,
      createBanner,
      updateBanner,
      deleteBanner,
      saveSettings,
      updateHomepageSection,
      reorderHomepageSections,
      saveSeoSettings,
      saveShippingSettings,
      saveTaxSettings,
      createBlogPost,
      updateBlogPost,
      deleteBlogPost,
    }),
    [
      products,
      categories,
      orders,
      customers,
      reviews,
      coupons,
      banners,
      settings,
      notifications,
      toasts,
      homepageSections,
      seoSettings,
      shippingSettings,
      taxSettings,
      blogPosts,
      payments,
      paymentSettings,
      dataStatus,
      pushToast,
      dismissToast,
      markNotificationRead,
      markAllNotificationsRead,
      createProduct,
      updateProduct,
      deleteProduct,
      bulkUpdateProducts,
      bulkDeleteProducts,
      duplicateProduct,
      adjustStock,
      createCategory,
      updateCategory,
      deleteCategory,
      updateOrderStatus,
      updateReviewStatus,
      deleteReview,
      createCoupon,
      updateCoupon,
      deleteCoupon,
      createBanner,
      updateBanner,
      deleteBanner,
      saveSettings,
      updateHomepageSection,
      reorderHomepageSections,
      saveSeoSettings,
      saveShippingSettings,
      saveTaxSettings,
      createBlogPost,
      updateBlogPost,
      deleteBlogPost,
    ],
  )

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
    </AdminStoreContext.Provider>
  )
}

export { useAdminStore } from './useAdminStore'
