import { useMemo } from 'react'
import { useAdminStore } from '../context/AdminStore'

/** Thin service wrappers — swap internals for Firestore later. */

export function useProductService() {
  const store = useAdminStore()
  return {
    list: () => store.products,
    getById: (id) => store.products.find((p) => p.id === id),
    create: store.createProduct,
    update: store.updateProduct,
    remove: store.deleteProduct,
    bulkUpdate: store.bulkUpdateProducts,
    bulkDelete: store.bulkDeleteProducts,
    duplicate: store.duplicateProduct,
    adjustStock: store.adjustStock,
  }
}

export function useInventoryService() {
  const store = useAdminStore()
  return {
    list: () => store.products,
    update: store.updateProduct,
    adjustStock: store.adjustStock,
  }
}

export function useOrderService() {
  const store = useAdminStore()
  return {
    list: () => store.orders,
    getById: (id) => store.orders.find((o) => o.id === id),
    updateStatus: store.updateOrderStatus,
  }
}

export function useCategoryService() {
  const store = useAdminStore()
  return {
    list: () => store.categories,
    create: store.createCategory,
    update: store.updateCategory,
    remove: store.deleteCategory,
  }
}

export function useBrandService() {
  const store = useAdminStore()
  return {
    list: () => store.brands,
    create: store.createBrand,
    update: store.updateBrand,
    remove: store.deleteBrand,
  }
}

export function useCustomerService() {
  const store = useAdminStore()
  return {
    list: () => store.customers,
    getById: (id) => store.customers.find((c) => c.id === id),
  }
}

export function useReviewService() {
  const store = useAdminStore()
  return {
    list: () => store.reviews,
    create: store.createReview,
    update: store.updateReview,
    updateStatus: store.updateReviewStatus,
    remove: store.deleteReview,
  }
}

export function useCouponService() {
  const store = useAdminStore()
  return {
    list: () => store.coupons,
    create: store.createCoupon,
    update: store.updateCoupon,
    remove: store.deleteCoupon,
  }
}

export function useBannerService() {
  const store = useAdminStore()
  return {
    list: () => store.banners,
    create: store.createBanner,
    update: store.updateBanner,
    remove: store.deleteBanner,
  }
}

export function useSettingsService() {
  const store = useAdminStore()
  return {
    get: () => store.settings,
    save: store.saveSettings,
  }
}

export function useHomepageService() {
  const store = useAdminStore()
  return {
    list: () => store.homepageSections,
    update: store.updateHomepageSection,
    reorder: store.reorderHomepageSections,
  }
}

export function useSeoService() {
  const store = useAdminStore()
  return {
    get: () => store.seoSettings,
    save: store.saveSeoSettings,
  }
}

export function useShippingService() {
  const store = useAdminStore()
  return {
    getShipping: () => store.shippingSettings,
    getTax: () => store.taxSettings,
    saveShipping: store.saveShippingSettings,
    saveTax: store.saveTaxSettings,
  }
}

export function useBlogService() {
  const store = useAdminStore()
  return {
    list: () => store.blogPosts,
    getById: (id) => store.blogPosts.find((p) => p.id === id),
    create: store.createBlogPost,
    update: store.updateBlogPost,
    remove: store.deleteBlogPost,
  }
}

export function usePaymentsService() {
  const store = useAdminStore()
  return {
    list: () => store.payments,
    settings: () => store.paymentSettings,
  }
}

function isCountableOrder(o) {
  return !['Cancelled', 'Refunded', 'Returned'].includes(o.status)
}

function isPaidOrder(o) {
  return o.payment === 'Paid' || o.paymentStatus === 'Paid'
}

function buildRevenueSeries(orders, rangeKey) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  if (rangeKey === '3m') {
    const buckets = []
    for (let i = 2; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      buckets.push({
        key,
        label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        revenue: 0,
        orders: 0,
      })
    }
    const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))
    for (const o of orders) {
      if (!o.createdAt || !isCountableOrder(o)) continue
      const d = new Date(o.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!byKey[key]) continue
      byKey[key].orders += 1
      if (isPaidOrder(o)) byKey[key].revenue += Number(o.total) || 0
    }
    return buckets
  }

  const days = rangeKey === '30d' ? 30 : 7
  const buckets = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    buckets.push({
      key,
      label:
        days > 14
          ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      revenue: 0,
      orders: 0,
    })
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))
  for (const o of orders) {
    if (!o.createdAt || !isCountableOrder(o)) continue
    const key = new Date(o.createdAt).toISOString().slice(0, 10)
    if (!byKey[key]) continue
    byKey[key].orders += 1
    if (isPaidOrder(o)) byKey[key].revenue += Number(o.total) || 0
  }
  return buckets
}

function aggregateFromOrders(orders, products) {
  const productById = new Map(products.map((p) => [String(p.id), p]))
  const productSales = new Map()
  const categorySales = new Map()

  for (const o of orders) {
    if (!isCountableOrder(o)) continue
    for (const item of o.items || []) {
      const id = String(item.id || item.productId || '')
      const name = item.name || productById.get(id)?.name || id || 'Item'
      const qty = Number(item.quantity) || 0
      const line =
        Number(item.lineTotal) ||
        (Number(item.price) || 0) * qty
      if (!id && !name) continue
      const key = id || name
      const prev = productSales.get(key) || { name, sales: 0, revenue: 0 }
      prev.sales += qty
      prev.revenue += line
      if (!prev.name && name) prev.name = name
      productSales.set(key, prev)

      const product = productById.get(id)
      const cat = product?.category || product?.subcategory || 'Other'
      const cPrev = categorySales.get(cat) || { name: cat, sales: 0, amount: 0 }
      cPrev.sales += qty
      cPrev.amount += line
      categorySales.set(cat, cPrev)
    }
  }

  const topSellingProducts = [...productSales.values()]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 8)

  const catList = [...categorySales.values()].sort((a, b) => b.amount - a.amount)
  const catSum = catList.reduce((s, c) => s + c.amount, 0) || 1
  const categoryRevenue = catList.slice(0, 6).map((c) => ({
    name: c.name,
    value: Math.round((c.amount / catSum) * 100),
    amount: c.amount,
  }))

  return { topSellingProducts, categoryRevenue }
}

/** Helpers for reports page charts — derived from live orders only */
export function useReportsHelpers() {
  const { products, orders } = useAdminStore()

  return useMemo(() => {
    const ordersByStatus = Object.entries(
      orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1
        return acc
      }, {}),
    ).map(([name, value]) => ({ name, value }))

    const { topSellingProducts, categoryRevenue } = aggregateFromOrders(
      orders,
      products,
    )

    const totalRevenue = orders
      .filter((o) => isCountableOrder(o) && isPaidOrder(o))
      .reduce((s, o) => s + (Number(o.total) || 0), 0)

    return {
      revenueSeries: {
        '7d': buildRevenueSeries(orders, '7d'),
        '30d': buildRevenueSeries(orders, '30d'),
        '3m': buildRevenueSeries(orders, '3m'),
      },
      categoryRevenue,
      topSellingProducts,
      ordersByStatus,
      totalRevenue,
      orderCount: orders.length,
    }
  }, [products, orders])
}
