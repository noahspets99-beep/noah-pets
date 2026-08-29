import {
  useCallback,
  useMemo,
  useState,
} from 'react'
import { initialAdminBanners } from '../data/adminBanners'
import { initialAdminCategories } from '../data/adminCategories'
import { initialAdminCoupons } from '../data/adminCoupons'
import { initialAdminCustomers } from '../data/adminCustomers'
import {
  initialAdminNotifications,
  initialAdminSettings,
} from '../data/adminDashboard'
import { initialAdminOrders } from '../data/adminOrders'
import { initialAdminReviews } from '../data/adminReviews'
import { catalogProducts } from '../data/catalog'
import { homepageSections as seedHomepageSections } from '../data/homepageSections'
import {
  shippingSettings as seedShippingSettings,
  taxSettings as seedTaxSettings,
} from '../data/shippingTax'
import { blogPosts as seedBlogPosts } from '../data/blogPosts'
import { DEFAULT_SEO, TN_PRIORITY_CITIES } from '../config/store'
import { delay } from '../admin/utils'
import { AdminStoreContext } from './admin-store-context'

function uid(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

const PET_TYPE_MAP = {
  Dogs: 'Dog',
  Cats: 'Cat',
  Birds: 'Bird',
  Fish: 'Fish',
  'Small Pets': 'Small Pets',
  Rabbit: 'Rabbit',
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
    petType: PET_TYPE_MAP[p.petType] || p.petType || 'Other',
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
    sales: typeof p.reviews === 'number' ? Math.min(p.reviews, 999) : 0,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
    variants: (p.variants || []).map((v) => ({
      id: v.id || uid('v'),
      label: v.label || '',
      sku: v.sku || '',
      price: v.price ?? 0,
      mrp: v.mrp ?? v.price ?? 0,
      stock: v.stock ?? 0,
      weight: v.weight || '',
    })),
    seoTitle: seo.title || '',
    seoDescription: seo.description || '',
    seoKeywords: seo.keywords || '',
    canonicalUrl: seo.canonical || '',
    ogTitle: seo.ogTitle || '',
    ogDescription: seo.ogDescription || '',
    socialImage: seo.socialImage || '',
    video: p.video || '',
    benefits: Array.isArray(p.benefits) ? p.benefits.join('\n') : p.benefits || '',
    usageInstructions: p.usageInstructions || '',
    minOrderQty: p.minOrderQty ?? 1,
    color: p.color || '',
  }
}

const initialProducts = catalogProducts.map(mapCatalogToAdmin)

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
  return orders.map((o) => ({
    id: `pay-${o.id}`,
    orderId: o.id,
    amount: o.total,
    provider: 'Demo',
    status:
      o.payment === 'Paid'
        ? 'Captured'
        : o.payment === 'Refunded'
          ? 'Refunded'
          : 'Pending',
    method: o.paymentMethod || 'UPI',
    createdAt: o.createdAt,
    customer: o.customer?.name || 'Customer',
  }))
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
  if (terminal) {
    return order.timeline.map((step) => step)
  }

  const rank = STATUS_RANK[status] ?? 0
  return TIMELINE_LABELS.map((label, idx) => {
    const existing = order.timeline.find(
      (s) => s.label.toLowerCase() === label.toLowerCase(),
    ) || order.timeline[idx]
    const done = idx <= Math.max(rank, 0)
    return {
      label,
      done,
      at:
        done
          ? existing?.at || (idx <= rank ? new Date().toISOString() : null)
          : null,
    }
  })
}

export function AdminStoreProvider({ children }) {
  const [products, setProducts] = useState(initialProducts)
  const [categories, setCategories] = useState(initialAdminCategories)
  const [orders, setOrders] = useState(initialAdminOrders)
  const [customers] = useState(initialAdminCustomers)
  const [reviews, setReviews] = useState(initialAdminReviews)
  const [coupons, setCoupons] = useState(initialAdminCoupons)
  const [banners, setBanners] = useState(initialAdminBanners)
  const [settings, setSettings] = useState(initialAdminSettings)
  const [notifications, setNotifications] = useState(initialAdminNotifications)
  const [toasts, setToasts] = useState([])
  const [homepageSections, setHomepageSections] = useState(
    () => seedHomepageSections.map((s) => ({ ...s, config: { ...s.config } })),
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
  const [payments, setPayments] = useState(() =>
    seedPaymentsFromOrders(initialAdminOrders),
  )
  const [paymentSettings] = useState({
    activeProvider: 'Demo',
    note: 'Razorpay will integrate via paymentService backend later. Demo provider records payments from storefront orders.',
  })

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
      await delay(300)
      const product = {
        ...data,
        id: uid('p'),
        sales: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setProducts((prev) => [product, ...prev])
      pushToast('Product added successfully')
      return product
    },
    [pushToast],
  )

  const updateProduct = useCallback(
    async (id, data) => {
      await delay(300)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...data, updatedAt: new Date().toISOString() }
            : p,
        ),
      )
      pushToast('Product updated successfully')
    },
    [pushToast],
  )

  const deleteProduct = useCallback(
    async (id) => {
      await delay(250)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      pushToast('Product deleted')
    },
    [pushToast],
  )

  const bulkUpdateProducts = useCallback(
    async (ids, patch) => {
      await delay(250)
      setProducts((prev) =>
        prev.map((p) =>
          ids.includes(p.id)
            ? { ...p, ...patch, updatedAt: new Date().toISOString() }
            : p,
        ),
      )
      pushToast('Products updated')
    },
    [pushToast],
  )

  const bulkDeleteProducts = useCallback(
    async (ids) => {
      await delay(250)
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)))
      pushToast(`${ids.length} product${ids.length === 1 ? '' : 's'} deleted`)
    },
    [pushToast],
  )

  const duplicateProduct = useCallback(
    async (id) => {
      await delay(250)
      setProducts((prev) => {
        const source = prev.find((p) => p.id === id)
        if (!source) return prev
        const copy = {
          ...source,
          id: uid('p'),
          name: `${source.name} (Copy)`,
          sku: `${source.sku}-COPY`,
          slug: source.slug ? `${source.slug}-copy` : '',
          status: 'Draft',
          sales: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return [copy, ...prev]
      })
      pushToast('Product duplicated')
    },
    [pushToast],
  )

  const adjustStock = useCallback(
    async (productId, delta) => {
      await delay(150)
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p
          const stock = Math.max(0, (Number(p.stock) || 0) + Number(delta))
          let status = p.status
          if (stock === 0 && status === 'Active') status = 'Out of Stock'
          if (stock > 0 && status === 'Out of Stock') status = 'Active'
          return { ...p, stock, status, updatedAt: new Date().toISOString() }
        }),
      )
    },
    [],
  )

  const createCategory = useCallback(
    async (data) => {
      await delay(250)
      const category = {
        ...data,
        id: uid('c'),
        productCount: 0,
        updatedAt: new Date().toISOString(),
      }
      setCategories((prev) => [category, ...prev])
      pushToast('Category created')
      return category
    },
    [pushToast],
  )

  const updateCategory = useCallback(
    async (id, data) => {
      await delay(250)
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, ...data, updatedAt: new Date().toISOString() }
            : c,
        ),
      )
      pushToast('Category updated')
    },
    [pushToast],
  )

  const deleteCategory = useCallback(
    async (id) => {
      await delay(250)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      pushToast('Category deleted')
    },
    [pushToast],
  )

  const updateOrderStatus = useCallback(
    async (id, status) => {
      await delay(250)
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== id) return o
          const timeline = applyOrderTimeline(o, status)
          return { ...o, status, timeline }
        }),
      )
      setPayments((prev) =>
        prev.map((pay) => {
          if (pay.orderId !== id) return pay
          if (status === 'Refunded') return { ...pay, status: 'Refunded' }
          if (status === 'Cancelled') return pay
          return pay
        }),
      )
      pushToast('Order status updated')
    },
    [pushToast],
  )

  const updateReviewStatus = useCallback(
    async (id, status) => {
      await delay(200)
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      )
      pushToast(`Review ${status.toLowerCase()}`)
    },
    [pushToast],
  )

  const deleteReview = useCallback(
    async (id) => {
      await delay(200)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      pushToast('Review deleted')
    },
    [pushToast],
  )

  const createCoupon = useCallback(
    async (data) => {
      await delay(250)
      const coupon = { ...data, id: uid('cp'), used: 0 }
      setCoupons((prev) => [coupon, ...prev])
      pushToast('Coupon created')
      return coupon
    },
    [pushToast],
  )

  const updateCoupon = useCallback(
    async (id, data) => {
      await delay(250)
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
      )
      pushToast('Coupon updated')
    },
    [pushToast],
  )

  const deleteCoupon = useCallback(
    async (id) => {
      await delay(200)
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      pushToast('Coupon deleted')
    },
    [pushToast],
  )

  const createBanner = useCallback(
    async (data) => {
      await delay(250)
      const banner = { ...data, id: uid('b') }
      setBanners((prev) => [banner, ...prev])
      pushToast('Banner created')
      return banner
    },
    [pushToast],
  )

  const updateBanner = useCallback(
    async (id, data) => {
      await delay(250)
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...data } : b)),
      )
      pushToast('Banner updated')
    },
    [pushToast],
  )

  const deleteBanner = useCallback(
    async (id) => {
      await delay(200)
      setBanners((prev) => prev.filter((b) => b.id !== id))
      pushToast('Banner deleted')
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
                    data.seoDescription ?? p.seoDescription ?? p.seo?.description,
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
