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
import {
  cloneHomepageSections,
  mergeHomepageSections,
} from '../data/homepageSections'
import {
  shippingSettings as seedShippingSettings,
  taxSettings as seedTaxSettings,
} from '../data/shippingTax'
import {
  INDIA_STATES_AND_UTS,
  normalizePriorityCities,
} from '../data/indiaCities'
import { blogPosts as seedBlogPosts } from '../data/blogPosts'
import { DEFAULT_SEO, TN_PRIORITY_CITIES } from '../config/store'
import { delay, slugify } from '../admin/utils'
import { AdminStoreContext } from './admin-store-context'
import {
  listCollection,
  subscribeCollection,
  upsertDocument,
  patchDocument,
  removeDocument,
  getDocument,
  isFirebaseConfigured,
} from '../services/firestore/repository'
import { invalidateCatalogCache } from './CatalogProvider'
import { stripUndefined } from '../services/catalogMapper'
import { normalizeOrderStatus, ORDER_STATUSES } from '../lib/orderStatus'

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
    category: p.category || p.subcategory || '',
    subcategory: p.subcategory || '',
    categoryId: p.categoryId || '',
    categorySlug: p.categorySlug || '',
    description: p.description || '',
    shortDescription: p.shortDescription || '',
    price: p.price ?? 0,
    mrp: p.originalPrice ?? p.mrp ?? p.price ?? 0,
    discount: p.discount ?? 0,
    tax: (() => {
      const rate = Number(p.tax)
      return Number.isFinite(rate) && rate >= 0 ? rate : 0
    })(),
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
    sales: Number(p.sales) || 0,
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
      ogTitle: "Noah's Pets — Pet Food & Supplies Online in India",
      ogDescription: DEFAULT_SEO.defaultDescription,
      ogImage: '',
      twitterCard: 'summary_large_image',
    },
    locationSeo: TN_PRIORITY_CITIES.map((c) => ({
      slug: c.slug,
      name: c.name,
      title: `Pet Shop in ${c.name} | Noah's Pets`,
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

function normalizeOrderPets(raw) {
  if (!raw) return []
  if (Array.isArray(raw.pets)) {
    return raw.pets
      .map((pet, index) => {
        if (pet == null) return null
        if (typeof pet === 'string') {
          const name = pet.trim()
          return name ? { id: `pet-${index + 1}`, name } : null
        }
        const name = String(pet.name || pet.petName || '').trim()
        if (!name && !pet.id) return null
        return {
          ...pet,
          id: pet.id || `pet-${index + 1}`,
          name: name || '',
        }
      })
      .filter(Boolean)
  }
  const legacy =
    raw.petName || raw.pet?.name || raw.customer?.petName || ''
  const name = String(legacy).trim()
  return name ? [{ id: 'pet-1', name }] : []
}

function normalizeAdminOrder(raw) {
  if (!raw) return null
  const customer = raw.customer || {}
  const paymentStatus =
    raw.paymentStatus ||
    (typeof raw.payment === 'string' ? raw.payment : null) ||
    'Pending'
  const createdAt = toIsoDate(raw.createdAt) || toIsoDate(raw.updatedAt)
  const ship = raw.shippingAddress || {}
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
    shippingAddress: {
      ...ship,
      line1: ship.line1 || ship.address || '',
      line2: ship.line2 || ship.area || '',
      city: ship.city || '',
      state: ship.state || '',
      pincode: ship.pincode || '',
    },
    items: Array.isArray(raw.items) ? raw.items : [],
    pets: normalizeOrderPets(raw),
    payment: paymentStatus,
    paymentStatus,
    paymentMethod: raw.paymentMethod || raw.paymentProvider || '—',
    deliveryFee: raw.deliveryFee ?? raw.shipping ?? 0,
    discount: raw.discount ?? 0,
    tax: raw.tax ?? 0,
    total: Number(raw.total) || 0,
    status: normalizeOrderStatus(raw.status),
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
  }
}

function normalizeCustomer(raw) {
  if (!raw) return null
  const address =
    raw.address && typeof raw.address === 'object'
      ? {
          line1: raw.address.line1 || raw.address.address || '',
          line2: raw.address.line2 || raw.address.area || '',
          city: raw.address.city || '',
          state: raw.address.state || '',
          pincode: raw.address.pincode || '',
        }
      : null
  return {
    ...raw,
    id: raw.id || raw.uid || raw.customerId,
    name: raw.name || raw.displayName || 'Customer',
    email: raw.email || '',
    phone: raw.phone || raw.mobile || '',
    mobile: raw.mobile || raw.phone || '',
    avatar: raw.avatar || raw.photoURL || null,
    address,
    orders: Number(raw.orders ?? raw.orderCount ?? 0) || 0,
    totalSpent: Number(raw.totalSpent) || 0,
    lastOrderAt: toIsoDate(raw.lastOrderAt) || null,
    joinedAt: toIsoDate(raw.joinedAt) || toIsoDate(raw.createdAt) || null,
    status: raw.status || 'Active',
  }
}

function normalizeAdminReview(raw) {
  if (!raw) return null
  return {
    ...raw,
    id: raw.id,
    productId: raw.productId || raw.productDocId || '',
    product:
      raw.product ||
      raw.productName ||
      raw.productTitle ||
      '',
    customer: raw.customer || raw.customerName || raw.name || 'Customer',
    review: raw.review || raw.text || raw.comment || '',
    rating: Number(raw.rating) || 0,
    date: raw.date || raw.createdAt || raw.updatedAt || null,
    status: raw.status || 'Pending',
  }
}

function addressFromOrder(order) {
  const ship = order?.shippingAddress || order?.customer || null
  if (!ship || typeof ship !== 'object') return null
  const line1 = ship.line1 || ship.address || ''
  const city = ship.city || ''
  if (!line1 && !city) return null
  return {
    line1,
    line2: ship.line2 || ship.area || '',
    city,
    state: ship.state || '',
    pincode: ship.pincode || '',
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
    const address = addressFromOrder(o)
    if (!existing) {
      map.set(key, {
        id: key,
        name: o.customer?.name || 'Customer',
        email: o.customer?.email || o.shippingAddress?.email || '',
        phone:
          o.customer?.phone ||
          o.customer?.mobile ||
          o.shippingAddress?.mobile ||
          '',
        avatar: null,
        address,
        orders: 1,
        totalSpent: total,
        lastOrderAt: o.createdAt || null,
        joinedAt: o.createdAt || null,
        status: 'Active',
      })
    } else {
      existing.orders += 1
      existing.totalSpent += total
      if (!existing.address && address) existing.address = address
      if (
        o.createdAt &&
        (!existing.lastOrderAt ||
          new Date(o.createdAt) > new Date(existing.lastOrderAt))
      ) {
        existing.lastOrderAt = o.createdAt
      }
      if (
        o.createdAt &&
        (!existing.joinedAt ||
          new Date(o.createdAt) < new Date(existing.joinedAt))
      ) {
        existing.joinedAt = o.createdAt
      }
    }
  }
  return [...map.values()]
    .map(normalizeCustomer)
    .filter(Boolean)
    .sort(
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
  Delivered: 2,
}

const TIMELINE_LABELS = ['Pending', 'Confirmed', 'Delivered']

function applyOrderTimeline(order, status) {
  const terminal = status === 'Cancelled'
  const timeline = Array.isArray(order.timeline) ? order.timeline : []
  if (terminal) {
    return [
      {
        label: 'Pending',
        at: order.createdAt || new Date().toISOString(),
        done: true,
      },
      { label: 'Cancelled', at: new Date().toISOString(), done: true },
    ]
  }

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

async function ensureOrderNotifications(orders) {
  if (!isFirebaseConfigured || !Array.isArray(orders)) return
  const pending = orders.filter((o) => o.status === 'Pending')
  await Promise.all(
    pending.map(async (order) => {
      const id = `order-${order.id}`
      try {
        const existing = await getDocument('adminNotifications', id)
        if (existing.mode === 'firestore' && existing.data) return
        const total = Number(order.total) || 0
        const name = order.customer?.name || 'Customer'
        await upsertDocument(
          'adminNotifications',
          id,
          stripUndefined({
            id,
            type: 'order',
            orderId: String(order.id),
            title: 'New order',
            message: `${name} placed order #${order.id} · ₹${total.toLocaleString('en-IN')}`,
            createdAt: order.createdAt || new Date().toISOString(),
            time: new Date(
              order.createdAt || Date.now(),
            ).toLocaleString('en-IN'),
            read: false,
          }),
        )
      } catch (err) {
        console.warn('[admin] notification create', id, err?.message || err)
      }
    }),
  )
}

export function AdminStoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [reviews, setReviews] = useState([])
  const [brands, setBrands] = useState([])
  const [coupons, setCoupons] = useState([])
  const [banners, setBanners] = useState([])
  const [settings, setSettings] = useState(initialAdminSettings)
  const [notifications, setNotifications] = useState(() =>
    isFirebaseConfigured ? [] : initialAdminNotifications,
  )
  const [toasts, setToasts] = useState([])
  const [dataStatus, setDataStatus] = useState({
    loading: true,
    error: null,
    ordersReady: false,
  })
  const [homepageSections, setHomepageSections] = useState(() =>
    cloneHomepageSections(),
  )
  const [seoSettings, setSeoSettings] = useState(buildInitialSeoSettings)
  const [shippingSettings, setShippingSettings] = useState(() => ({
    ...seedShippingSettings,
    priorityCities: normalizePriorityCities(seedShippingSettings.priorityCities),
    serviceableStates: [
      ...(seedShippingSettings.serviceableStates?.length
        ? seedShippingSettings.serviceableStates
        : INDIA_STATES_AND_UTS),
    ],
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
    isFirebaseConfigured
      ? []
      : seedBlogPosts.map(normalizeBlogPost),
  )
  const [payments, setPayments] = useState([])
  const [paymentSettings] = useState({
    activeProvider: 'Razorpay',
    note: 'Payment verification runs server-side. Order payment status comes from Firebase.',
  })

  useEffect(() => {
    let cancelled = false
    let unsubOrders = () => {}
    let unsubNotifications = () => {}

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
        const [
          prodRes,
          catRes,
          couponRes,
          customerRes,
          reviewRes,
          bannerRes,
          taxRes,
          shippingRes,
          blogRes,
          seoRes,
          homepageRes,
          settingsRes,
          brandRes,
        ] = await Promise.all([
          listCollection('products'),
          listCollection('categories'),
          listCollection('coupons'),
          listCollection('customers'),
          listCollection('reviews'),
          listCollection('banners'),
          getDocument('taxSettings', 'default'),
          getDocument('shippingSettings', 'default'),
          listCollection('blogPosts'),
          getDocument('seoSettings', 'default'),
          listCollection('homepageSections'),
          getDocument('storeSettings', 'default'),
          listCollection('brands'),
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
          setCustomers(
            (customerRes.data || []).map(normalizeCustomer).filter(Boolean),
          )
        }

        if (reviewRes.mode === 'firestore') {
          setReviews(
            (reviewRes.data || [])
              .filter((r) => r.status !== 'Deleted')
              .map(normalizeAdminReview),
          )
        }

        if (brandRes.mode === 'firestore') {
          setBrands(
            (brandRes.data || []).sort(
              (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0),
            ),
          )
        }

        if (bannerRes.mode === 'firestore') {
          setBanners(bannerRes.data || [])
        } else {
          setBanners([])
        }

        if (blogRes.mode === 'firestore') {
          setBlogPosts(
            (blogRes.data || [])
              .map(normalizeBlogPost)
              .sort(
                (a, b) =>
                  new Date(b.publishedAt || b.updatedAt || 0) -
                  new Date(a.publishedAt || a.updatedAt || 0),
              ),
          )
        }

        if (seoRes.mode === 'firestore' && seoRes.data) {
          const { id: _seoId, ...seoData } = seoRes.data
          setSeoSettings((prev) => ({
            ...prev,
            ...seoData,
            homepage: { ...prev.homepage, ...(seoData.homepage || {}) },
            defaults: { ...prev.defaults, ...(seoData.defaults || {}) },
            social: { ...prev.social, ...(seoData.social || {}) },
            locationSeo: Array.isArray(seoData.locationSeo)
              ? seoData.locationSeo
              : prev.locationSeo,
          }))
        }

        if (taxRes.mode === 'firestore' && taxRes.data) {
          const { id: _id, ...taxData } = taxRes.data
          setTaxSettings((prev) => ({
            ...prev,
            ...taxData,
            defaultRate: Number(taxData.defaultRate) || 0,
            rates: Array.isArray(taxData.rates)
              ? taxData.rates
              : prev.rates,
          }))
        }

        if (shippingRes.mode === 'firestore' && shippingRes.data) {
          const { id: _sid, ...shipData } = shippingRes.data
          setShippingSettings((prev) => ({
            ...prev,
            ...shipData,
            priorityCities: Array.isArray(shipData.priorityCities)
              ? normalizePriorityCities(shipData.priorityCities)
              : prev.priorityCities,
            serviceableStates:
              Array.isArray(shipData.serviceableStates) &&
              shipData.serviceableStates.length
                ? shipData.serviceableStates
                : prev.serviceableStates?.length
                  ? prev.serviceableStates
                  : [...INDIA_STATES_AND_UTS],
          }))
        }

        if (homepageRes.mode === 'firestore') {
          const remote = homepageRes.data || []
          const merged = mergeHomepageSections(remote)
          setHomepageSections(merged)
          // Persist seed docs once so storefront and admin share the same source
          if (remote.length === 0 && isFirebaseConfigured) {
            Promise.all(
              merged.map((s) =>
                upsertDocument(
                  'homepageSections',
                  s.id,
                  stripUndefined({
                    key: s.key,
                    title: s.title,
                    enabled: s.enabled !== false,
                    sortOrder: Number(s.sortOrder) || 0,
                    config: s.config || {},
                    updatedAt: new Date().toISOString(),
                  }),
                ),
              ),
            ).catch((err) =>
              console.warn('[admin] homepageSections seed', err?.message || err),
            )
          }
        }

        if (settingsRes.mode === 'firestore' && settingsRes.data) {
          const { id: _setId, ...settingsData } = settingsRes.data
          const taxData =
            taxRes.mode === 'firestore' && taxRes.data
              ? (() => {
                  const { id: _t, ...rest } = taxRes.data
                  return rest
                })()
              : null
          const shipData =
            shippingRes.mode === 'firestore' && shippingRes.data
              ? (() => {
                  const { id: _s, ...rest } = shippingRes.data
                  return rest
                })()
              : null
          setSettings((prev) => {
            const next = { ...prev, ...settingsData }
            if (taxData && taxData.defaultRate != null) {
              const rate = Number(taxData.defaultRate)
              next.taxPercent = Number.isFinite(rate) && rate >= 0 ? rate : 0
            }
            if (shipData) {
              const fee = Number(shipData.standardShippingFee)
              const freeMin = Number(shipData.freeShippingMinOrder)
              if (Number.isFinite(fee) && fee >= 0) next.deliveryFee = fee
              if (Number.isFinite(freeMin) && freeMin >= 0) {
                next.freeDeliveryThreshold = freeMin
              }
            }
            return next
          })
        } else if (
          (taxRes.mode === 'firestore' && taxRes.data) ||
          (shippingRes.mode === 'firestore' && shippingRes.data)
        ) {
          // Mirror canonical tax/shipping into Settings even if storeSettings is empty
          setSettings((prev) => {
            const next = { ...prev }
            if (taxRes.mode === 'firestore' && taxRes.data) {
              const rate = Number(taxRes.data.defaultRate)
              next.taxPercent = Number.isFinite(rate) && rate >= 0 ? rate : 0
            }
            if (shippingRes.mode === 'firestore' && shippingRes.data) {
              const fee = Number(shippingRes.data.standardShippingFee)
              const freeMin = Number(shippingRes.data.freeShippingMinOrder)
              if (Number.isFinite(fee) && fee >= 0) next.deliveryFee = fee
              if (Number.isFinite(freeMin) && freeMin >= 0) {
                next.freeDeliveryThreshold = freeMin
              }
            }
            return next
          })
        }

        unsubNotifications = subscribeCollection('adminNotifications', [], {
          onData: (rows) => {
            if (cancelled) return
            const list = (rows || [])
              .map((n) => ({
                ...n,
                id: n.id,
                title: n.title || 'Notification',
                message: n.message || '',
                time:
                  n.time ||
                  (n.createdAt
                    ? new Date(n.createdAt).toLocaleString('en-IN')
                    : ''),
                read: Boolean(n.read),
                type: n.type || 'order',
                orderId: n.orderId || null,
              }))
              .sort(
                (a, b) =>
                  new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
              )
            setNotifications(list)
          },
          onError: (message) => {
            if (cancelled) return
            console.warn('[admin] notifications', message)
          },
        })

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
            ensureOrderNotifications(normalized).catch((err) =>
              console.warn(
                '[admin] ensureOrderNotifications',
                err?.message || err,
              ),
            )
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
      unsubNotifications()
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

  const markNotificationRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
    if (!isFirebaseConfigured) return
    try {
      await patchDocument('adminNotifications', id, { read: true })
    } catch (err) {
      console.warn('[admin] markNotificationRead', err?.message || err)
    }
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    if (!isFirebaseConfigured) return
    try {
      const unread = notifications.filter((n) => !n.read)
      await Promise.all(
        unread.map((n) =>
          patchDocument('adminNotifications', n.id, { read: true }),
        ),
      )
    } catch (err) {
      console.warn('[admin] markAllNotificationsRead', err?.message || err)
    }
  }, [notifications])

  const createProduct = useCallback(
    async (data) => {
      const matchedCategory = categories.find(
        (c) =>
          String(c.name || '').trim().toLowerCase() ===
            String(data.category || '').trim().toLowerCase() ||
          String(c.id) === String(data.categoryId || ''),
      )
      const categorySlug =
        data.categorySlug ||
        matchedCategory?.slug ||
        (data.category
          ? slugify(data.category)
          : 'products')
      const product = {
        ...data,
        id: data.id || uid('p'),
        categoryId: data.categoryId || matchedCategory?.id || '',
        categorySlug,
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
    [categories, pushToast],
  )

  const updateProduct = useCallback(
    async (id, data) => {
      const updatedAt = new Date().toISOString()
      const matchedCategory = categories.find(
        (c) =>
          String(c.name || '').trim().toLowerCase() ===
            String(data.category || '').trim().toLowerCase() ||
          String(c.id) === String(data.categoryId || ''),
      )
      const patch = {
        ...data,
        updatedAt,
      }
      if (data.category != null || data.categoryId != null) {
        patch.categoryId = data.categoryId || matchedCategory?.id || ''
        patch.categorySlug =
          data.categorySlug ||
          matchedCategory?.slug ||
          (data.category ? slugify(data.category) : undefined)
      }
      await upsertDocument('products', id, stripUndefined(patch))
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      )
      invalidateCatalogCache()
      pushToast('Product updated — storefront refreshed')
    },
    [categories, pushToast],
  )

  const deleteProduct = useCallback(
    async (id) => {
      try {
        await removeDocument('products', id)
        setProducts((prev) => prev.filter((p) => p.id !== id))
        invalidateCatalogCache()
        pushToast('Product deleted')
      } catch (err) {
        pushToast(err?.message || 'Failed to delete product', 'error')
        throw err
      }
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
      try {
        await Promise.all(ids.map((id) => removeDocument('products', id)))
        setProducts((prev) => prev.filter((p) => !ids.includes(p.id)))
        invalidateCatalogCache()
        pushToast(
          `${ids.length} product${ids.length === 1 ? '' : 's'} deleted`,
        )
      } catch (err) {
        pushToast(err?.message || 'Failed to delete products', 'error')
        throw err
      }
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
      try {
        await removeDocument('categories', id)
        setCategories((prev) => prev.filter((c) => c.id !== id))
        invalidateCatalogCache()
        pushToast('Category deleted')
      } catch (err) {
        pushToast(err?.message || 'Failed to delete category', 'error')
        throw err
      }
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
      if (!ORDER_STATUSES.includes(status)) {
        pushToast('Invalid order status', 'error')
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

  const updateOrderPets = useCallback(
    async (id, petsInput) => {
      const current = orders.find((o) => o.id === id)
      if (!current) {
        pushToast('Order not found', 'error')
        return
      }
      const pets = (Array.isArray(petsInput) ? petsInput : [])
        .map((pet, index) => {
          if (!pet) return null
          const name = String(pet.name || '').trim()
          if (!name) return null
          return {
            id: pet.id || `pet-${Date.now()}-${index}`,
            name,
            ...(pet.type || pet.petType
              ? { type: pet.type || pet.petType }
              : {}),
            ...(pet.breed ? { breed: String(pet.breed).trim() } : {}),
            ...(pet.notes ? { notes: String(pet.notes).trim() } : {}),
          }
        })
        .filter(Boolean)
      const patch = { pets, updatedAt: new Date().toISOString() }
      try {
        await patchDocument('orders', id, patch)
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        )
        pushToast('Order pets updated')
      } catch (err) {
        pushToast(err?.message || 'Failed to update order pets', 'error')
        throw err
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

  const createReview = useCallback(
    async (data) => {
      const productId = String(data.productId || '').trim()
      if (!productId) {
        pushToast('Select a product for this review', 'error')
        throw new Error('productId required')
      }
      const id = data.id || uid('rev')
      const now = new Date().toISOString()
      const review = normalizeAdminReview({
        id,
        productId,
        product: data.product || data.productName || '',
        customer: data.customer || data.name || 'Customer',
        review: data.review || data.text || '',
        rating: Number(data.rating) || 5,
        status: data.status || 'Approved',
        date: now,
        createdAt: now,
        updatedAt: now,
      })
      try {
        await upsertDocument('reviews', id, stripUndefined(review))
        setReviews((prev) => [review, ...prev])
        pushToast('Review added')
        return review
      } catch (err) {
        pushToast(err?.message || 'Failed to add review', 'error')
        throw err
      }
    },
    [pushToast],
  )

  const updateReview = useCallback(
    async (id, data) => {
      const patch = {
        ...data,
        productId: data.productId ? String(data.productId).trim() : undefined,
        rating:
          data.rating !== undefined ? Number(data.rating) || 0 : undefined,
        updatedAt: new Date().toISOString(),
      }
      try {
        await upsertDocument('reviews', id, stripUndefined(patch))
        setReviews((prev) =>
          prev.map((r) =>
            r.id === id ? normalizeAdminReview({ ...r, ...patch }) : r,
          ),
        )
        pushToast('Review updated')
      } catch (err) {
        pushToast(err?.message || 'Failed to update review', 'error')
        throw err
      }
    },
    [pushToast],
  )

  const deleteReview = useCallback(
    async (id) => {
      try {
        await removeDocument('reviews', id)
        setReviews((prev) => prev.filter((r) => r.id !== id))
        pushToast('Review removed')
      } catch (err) {
        pushToast(err?.message || 'Failed to delete review', 'error')
      }
    },
    [pushToast],
  )

  const createBrand = useCallback(
    async (data) => {
      const id = data.id || uid('br')
      const brand = {
        id,
        name: String(data.name || '').trim(),
        slug: data.slug || '',
        logo: data.logo || data.image || '',
        image: data.image || data.logo || '',
        active: data.active !== false && data.status !== 'Inactive',
        status: data.status || (data.active === false ? 'Inactive' : 'Active'),
        sortOrder: Number(data.sortOrder) || 0,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      try {
        await upsertDocument('brands', id, stripUndefined(brand))
        setBrands((prev) =>
          [...prev, brand].sort(
            (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0),
          ),
        )
        pushToast('Brand created')
        return brand
      } catch (err) {
        pushToast(err?.message || 'Failed to create brand', 'error')
        throw err
      }
    },
    [pushToast],
  )

  const updateBrand = useCallback(
    async (id, data) => {
      const patch = {
        ...data,
        active:
          data.active !== undefined
            ? data.active
            : data.status !== 'Inactive',
        status:
          data.status ||
          (data.active === false ? 'Inactive' : undefined),
        updatedAt: new Date().toISOString(),
      }
      if (patch.logo && !patch.image) patch.image = patch.logo
      if (patch.image && !patch.logo) patch.logo = patch.image
      try {
        await upsertDocument('brands', id, stripUndefined(patch))
        setBrands((prev) =>
          prev
            .map((b) => (b.id === id ? { ...b, ...patch } : b))
            .sort(
              (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0),
            ),
        )
        pushToast('Brand updated')
      } catch (err) {
        pushToast(err?.message || 'Failed to update brand', 'error')
        throw err
      }
    },
    [pushToast],
  )

  const deleteBrand = useCallback(
    async (id) => {
      try {
        await removeDocument('brands', id)
        setBrands((prev) => prev.filter((b) => b.id !== id))
        pushToast('Brand deleted')
      } catch (err) {
        pushToast(err?.message || 'Failed to delete brand', 'error')
        throw err
      }
    },
    [pushToast],
  )

  const createBanner = useCallback(
    async (data) => {
      // firestore.rules: public read requires active === true exactly
      const active =
        data.status === 'Active' ||
        (data.status !== 'Inactive' &&
          data.status !== 'Scheduled' &&
          data.active !== false)
      const banner = {
        ...data,
        id: data.id || uid('b'),
        active: active === true,
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
      const active =
        data.status === 'Active' ||
        (data.status !== 'Inactive' &&
          data.status !== 'Scheduled' &&
          data.active !== false)
      const patch = {
        ...data,
        active: active === true,
        updatedAt: new Date().toISOString(),
      }
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
      try {
        await removeDocument('banners', id)
        setBanners((prev) => prev.filter((b) => b.id !== id))
        invalidateCatalogCache()
        pushToast('Banner deleted')
      } catch (err) {
        pushToast(err?.message || 'Failed to delete banner', 'error')
        throw err
      }
    },
    [pushToast],
  )

  const saveSettings = useCallback(
    async (data) => {
      const next = { ...data }
      const taxPercent = Number(data.taxPercent)
      const deliveryFee = Number(data.deliveryFee)
      const freeThreshold = Number(data.freeDeliveryThreshold)
      try {
        if (isFirebaseConfigured) {
          await upsertDocument('storeSettings', 'default', stripUndefined(next))
          // Canonical checkout sources — keep in sync with Settings page
          if (Number.isFinite(taxPercent) && taxPercent >= 0) {
            await upsertDocument(
              'taxSettings',
              'default',
              stripUndefined({
                defaultRate: taxPercent,
                updatedAt: new Date().toISOString(),
              }),
            )
            setTaxSettings((prev) => ({ ...prev, defaultRate: taxPercent }))
          }
          if (
            (Number.isFinite(deliveryFee) && deliveryFee >= 0) ||
            (Number.isFinite(freeThreshold) && freeThreshold >= 0)
          ) {
            const shipPatch = {
              updatedAt: new Date().toISOString(),
            }
            if (Number.isFinite(deliveryFee) && deliveryFee >= 0) {
              shipPatch.standardShippingFee = deliveryFee
            }
            if (Number.isFinite(freeThreshold) && freeThreshold >= 0) {
              shipPatch.freeShippingMinOrder = freeThreshold
            }
            await upsertDocument(
              'shippingSettings',
              'default',
              stripUndefined(shipPatch),
            )
            setShippingSettings((prev) => ({ ...prev, ...shipPatch }))
          }
        }
        setSettings((prev) => ({
          ...prev,
          ...next,
          taxPercent: Number.isFinite(taxPercent) && taxPercent >= 0 ? taxPercent : prev.taxPercent,
          deliveryFee:
            Number.isFinite(deliveryFee) && deliveryFee >= 0
              ? deliveryFee
              : prev.deliveryFee,
          freeDeliveryThreshold:
            Number.isFinite(freeThreshold) && freeThreshold >= 0
              ? freeThreshold
              : prev.freeDeliveryThreshold,
        }))
        pushToast('Settings saved')
      } catch (err) {
        pushToast(err?.message || 'Failed to save settings', 'error')
        throw err
      }
    },
    [pushToast],
  )

  const persistHomepageSection = useCallback(async (section) => {
    if (!isFirebaseConfigured || !section?.id) return
    await upsertDocument(
      'homepageSections',
      section.id,
      stripUndefined({
        key: section.key,
        title: section.title,
        enabled: section.enabled !== false,
        sortOrder: Number(section.sortOrder) || 0,
        config: section.config || {},
        updatedAt: new Date().toISOString(),
      }),
    )
  }, [])

  const updateHomepageSection = useCallback(
    async (id, data) => {
      const existing = homepageSections.find((s) => s.id === id)
      if (!existing) {
        pushToast('Section not found', 'error')
        return
      }
      const updated = {
        ...existing,
        ...data,
        config: data.config !== undefined ? data.config : existing.config,
      }
      setHomepageSections((prev) =>
        prev.map((s) => (s.id === id ? updated : s)),
      )
      try {
        await persistHomepageSection(updated)
        pushToast('Homepage section updated')
      } catch (err) {
        pushToast(err?.message || 'Failed to update homepage section', 'error')
        throw err
      }
    },
    [homepageSections, persistHomepageSection, pushToast],
  )

  const reorderHomepageSections = useCallback(
    async (id, direction) => {
      const sorted = [...homepageSections].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      )
      const idx = sorted.findIndex((s) => s.id === id)
      if (idx < 0) return
      const swapWith = direction === 'up' ? idx - 1 : idx + 1
      if (swapWith < 0 || swapWith >= sorted.length) return

      const a = sorted[idx]
      const b = sorted[swapWith]
      const nextA = { ...a, sortOrder: b.sortOrder }
      const nextB = { ...b, sortOrder: a.sortOrder }
      const next = sorted.map((s) => {
        if (s.id === nextA.id) return nextA
        if (s.id === nextB.id) return nextB
        return s
      })
      setHomepageSections(next)
      try {
        await Promise.all([
          persistHomepageSection(nextA),
          persistHomepageSection(nextB),
        ])
        pushToast('Section order updated')
      } catch (err) {
        pushToast(err?.message || 'Failed to reorder sections', 'error')
        throw err
      }
    },
    [homepageSections, persistHomepageSection, pushToast],
  )

  const saveSeoSettings = useCallback(
    async (data) => {
      const next = { ...data }
      if (isFirebaseConfigured) {
        await upsertDocument('seoSettings', 'default', stripUndefined(next))
      }
      setSeoSettings((prev) => ({ ...prev, ...next }))
      pushToast('SEO settings saved')
    },
    [pushToast],
  )

  const saveShippingSettings = useCallback(
    async (data) => {
      const fee = Number(data.standardShippingFee)
      const freeMin = Number(data.freeShippingMinOrder)
      const next = {
        ...data,
        standardShippingFee:
          Number.isFinite(fee) && fee >= 0 ? fee : 0,
        freeShippingMinOrder:
          Number.isFinite(freeMin) && freeMin >= 0 ? freeMin : 0,
        priorityCities: normalizePriorityCities(data.priorityCities),
        serviceableStates:
          Array.isArray(data.serviceableStates) && data.serviceableStates.length
            ? data.serviceableStates
            : [...INDIA_STATES_AND_UTS],
        updatedAt: new Date().toISOString(),
      }
      if (isFirebaseConfigured) {
        await upsertDocument('shippingSettings', 'default', stripUndefined(next))
        // Keep Settings page fields in sync
        await upsertDocument(
          'storeSettings',
          'default',
          stripUndefined({
            deliveryFee: next.standardShippingFee,
            freeDeliveryThreshold: next.freeShippingMinOrder,
            updatedAt: next.updatedAt,
          }),
        )
      }
      setShippingSettings((prev) => ({ ...prev, ...next }))
      setSettings((prev) => ({
        ...prev,
        deliveryFee: next.standardShippingFee,
        freeDeliveryThreshold: next.freeShippingMinOrder,
      }))
      pushToast('Shipping settings saved')
    },
    [pushToast],
  )

  const saveTaxSettings = useCallback(
    async (data) => {
      const rate = Number(data.defaultRate)
      const next = {
        ...data,
        defaultRate: Number.isFinite(rate) && rate >= 0 ? rate : 0,
        updatedAt: new Date().toISOString(),
      }
      if (isFirebaseConfigured) {
        await upsertDocument('taxSettings', 'default', stripUndefined(next))
        await upsertDocument(
          'storeSettings',
          'default',
          stripUndefined({
            taxPercent: next.defaultRate,
            updatedAt: next.updatedAt,
          }),
        )
      }
      setTaxSettings((prev) => ({ ...prev, ...next }))
      setSettings((prev) => ({ ...prev, taxPercent: next.defaultRate }))
      pushToast('Tax settings saved')
    },
    [pushToast],
  )

  const createBlogPost = useCallback(
    async (data) => {
      const id = uid('b')
      const now = new Date().toISOString()
      const post = normalizeBlogPost({
        ...data,
        id,
        status: data.status || 'Draft',
        createdAt: now,
        updatedAt: now,
        seo: {
          title: data.seoTitle || data.title,
          description: data.seoDescription || data.excerpt,
          keywords: data.seoKeywords || '',
        },
      })
      if (isFirebaseConfigured) {
        await upsertDocument('blogPosts', id, stripUndefined(post))
      }
      setBlogPosts((prev) => [post, ...prev])
      pushToast('Blog post created')
      return post
    },
    [pushToast],
  )

  const updateBlogPost = useCallback(
    async (id, data) => {
      const current = blogPosts.find((p) => p.id === id)
      if (!current) {
        pushToast('Blog post not found', 'error')
        return
      }
      const next = normalizeBlogPost({
        ...current,
        ...data,
        id,
        updatedAt: new Date().toISOString(),
        seo: {
          title: data.seoTitle ?? current.seoTitle ?? current.seo?.title,
          description:
            data.seoDescription ??
            current.seoDescription ??
            current.seo?.description,
          keywords:
            data.seoKeywords ?? current.seoKeywords ?? current.seo?.keywords,
        },
      })
      if (isFirebaseConfigured) {
        await upsertDocument('blogPosts', id, stripUndefined(next))
      }
      setBlogPosts((prev) => prev.map((p) => (p.id === id ? next : p)))
      pushToast('Blog post updated')
    },
    [blogPosts, pushToast],
  )

  const deleteBlogPost = useCallback(
    async (id) => {
      if (isFirebaseConfigured) {
        await removeDocument('blogPosts', id)
      }
      setBlogPosts((prev) => prev.filter((p) => p.id !== id))
      pushToast('Blog post deleted')
    },
    [pushToast],
  )

  const pendingOrderCount = useMemo(
    () => orders.filter((o) => o.status === 'Pending').length,
    [orders],
  )

  const value = useMemo(
    () => ({
      products,
      categories,
      brands,
      orders,
      pendingOrderCount,
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
      createBrand,
      updateBrand,
      deleteBrand,
      updateOrderStatus,
      updateOrderPets,
      createReview,
      updateReview,
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
      brands,
      orders,
      pendingOrderCount,
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
      createBrand,
      updateBrand,
      deleteBrand,
      updateOrderStatus,
      updateOrderPets,
      createReview,
      updateReview,
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
