import { useMemo } from 'react'
import { useAdminStore } from '../context/AdminStore'
import { categoryRevenue, revenueSeries, topSellingProducts } from '../data/adminDashboard'

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

/** Helpers for reports page charts */
export function useReportsHelpers() {
  const { products, orders } = useAdminStore()

  return useMemo(() => {
    const ordersByStatus = Object.entries(
      orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1
        return acc
      }, {}),
    ).map(([name, value]) => ({ name, value }))

    const salesByCategory = products.reduce((acc, p) => {
      const key = p.category || 'Other'
      const existing = acc.find((x) => x.name === key)
      const amount = (p.sales || 0) * (p.price || 0)
      if (existing) {
        existing.value += p.sales || 0
        existing.amount += amount
      } else {
        acc.push({ name: key, value: p.sales || 0, amount })
      }
      return acc
    }, [])

    const bestSellers = [...products]
      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 8)
      .map((p) => ({
        name: p.name,
        sales: p.sales || 0,
        revenue: (p.sales || 0) * (p.price || 0),
      }))

    const totalRevenue = orders
      .filter((o) => !['Cancelled', 'Refunded', 'Returned'].includes(o.status))
      .reduce((s, o) => s + (o.total || 0), 0)

    return {
      revenueSeries,
      categoryRevenue:
        salesByCategory.length > 0
          ? salesByCategory
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 6)
              .map((c, _, arr) => {
                const sum = arr.reduce((s, x) => s + x.amount, 0) || 1
                return { ...c, value: Math.round((c.amount / sum) * 100) }
              })
          : categoryRevenue,
      topSellingProducts: bestSellers.length ? bestSellers : topSellingProducts,
      ordersByStatus,
      totalRevenue,
      orderCount: orders.length,
    }
  }, [products, orders])
}
