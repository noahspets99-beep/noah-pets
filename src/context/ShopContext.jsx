import { useCallback, useEffect, useMemo, useState } from 'react'
import { ShopContext } from './shop-context'
import { shippingSettings as seedShippingSettings } from '../data/shippingTax'
import { decreaseStockForCartItems } from '../services/inventoryService'
import { invalidateCatalogCache } from './CatalogProvider'
import { isProductInStock, productStock, firstAvailableVariant } from '../services/catalogMapper'
import { useCatalog } from './CatalogProvider'
import { useStoreContent } from './StoreContentProvider'
import { useAuth } from './useAuth'
import {
  listCollection,
  fsQuery,
  isFirebaseConfigured,
  patchDocument,
} from '../services/firestore/repository'
import {
  buildOrderTimeline,
  normalizeOrderStatus,
} from '../lib/orderStatus'

const CART_KEY = 'noah_cart_v1'
const WISHLIST_KEY = 'noah_wishlist_v1'
const ORDERS_KEY = 'noah_customer_orders_v1'
const COUPON_KEY = 'noah_applied_coupon_v1'

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function cartLineKey(item) {
  return `${item.id}::${item.variantId || 'default'}`
}

function calcTax(subtotal, ratePercent) {
  const rate = Number(ratePercent)
  if (!Number.isFinite(rate) || rate <= 0) return 0
  return Math.round((subtotal * rate) / 100)
}

function calcShipping(subtotal, settings) {
  const freeRaw = Number(settings?.freeShippingMinOrder)
  const feeRaw = Number(settings?.standardShippingFee)
  const freeMin =
    Number.isFinite(freeRaw) && freeRaw >= 0
      ? freeRaw
      : Number(seedShippingSettings.freeShippingMinOrder) || 0
  const fee =
    Number.isFinite(feeRaw) && feeRaw >= 0
      ? feeRaw
      : Number(seedShippingSettings.standardShippingFee) || 0
  if (subtotal >= freeMin) return 0
  return fee
}

export function ShopProvider({ children }) {
  const { coupons: liveCoupons } = useCatalog()
  const { shippingSettings: liveShipping, taxSettings: liveTax } =
    useStoreContent()
  const { user, isAuthenticated } = useAuth()
  const [cart, setCart] = useState(() => loadJson(CART_KEY, []))
  const [wishlist, setWishlist] = useState(() => loadJson(WISHLIST_KEY, []))
  const [orders, setOrders] = useState(() => loadJson(ORDERS_KEY, []))
  const [appliedCoupon, setAppliedCoupon] = useState(() =>
    loadJson(COUPON_KEY, null),
  )
  const [toast, setToast] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  /** Live tax % from Admin taxSettings/default (realtime via StoreContentProvider) */
  const taxRatePercent = useMemo(() => {
    const rate = Number(liveTax?.defaultRate)
    return Number.isFinite(rate) && rate >= 0 ? rate : 0
  }, [liveTax])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
  }, [wishlist])

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon))
    } else {
      localStorage.removeItem(COUPON_KEY)
    }
  }, [appliedCoupon])

  // Merge authenticated customer's Firestore orders (status updates from admin)
  useEffect(() => {
    let cancelled = false
    async function syncOrders() {
      if (!isAuthenticated || !user?.uid || !isFirebaseConfigured) return
      try {
        const res = await listCollection('orders', [
          fsQuery.where('customerId', '==', user.uid),
        ])
        if (cancelled || res.mode !== 'firestore' || !Array.isArray(res.data)) return
        const remote = res.data.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        )
        setOrders((local) => {
          const byId = new Map()
          for (const o of local) byId.set(o.id, o)
          for (const o of remote) {
            const prev = byId.get(o.id)
            const merged = prev ? { ...prev, ...o } : o
            byId.set(o.id, {
              ...merged,
              status: normalizeOrderStatus(merged.status),
            })
          }
          return [...byId.values()].sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
          )
        })
      } catch (err) {
        console.warn('Order sync skipped', err?.message || err)
      }
    }
    syncOrders()
    const onFocus = () => syncOrders()
    window.addEventListener('focus', onFocus)
    const interval = setInterval(syncOrders, 60_000)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      clearInterval(interval)
    }
  }, [isAuthenticated, user?.uid])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const addToCart = useCallback(
    (product, options = {}) => {
      const quantity = options.quantity || 1
      const variant =
        options.variant || firstAvailableVariant(product) || null
      const stock = productStock(product, variant)
      if (stock < 1 || !isProductInStock(product, variant)) {
        showToast('This item is out of stock', 'error')
        return false
      }

      const line = {
        id: product.id,
        variantId: variant?.id || null,
        variantLabel: variant?.label || product.weight || null,
        name: product.name,
        brand: product.brand,
        slug: product.slug,
        image: product.image || product.images?.[0],
        price: variant?.price ?? product.price,
        originalPrice: variant?.mrp ?? product.originalPrice ?? product.mrp,
        sku: variant?.sku || product.sku,
        maxStock: stock,
        quantity,
      }

      setCart((prev) => {
        const key = cartLineKey(line)
        const existing = prev.find((item) => cartLineKey(item) === key)
        if (existing) {
          const nextQty = Math.min(
            existing.quantity + quantity,
            existing.maxStock || stock,
          )
          return prev.map((item) =>
            cartLineKey(item) === key ? { ...item, quantity: nextQty } : item,
          )
        }
        return [...prev, line]
      })
      showToast(`${product.name} added to cart`)
      return true
    },
    [showToast],
  )

  const removeFromCart = useCallback((id, variantId = null) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === id && (item.variantId || null) === variantId),
      ),
    )
  }, [])

  const updateQuantity = useCallback((id, quantity, variantId = null) => {
    setCart((prev) => {
      if (quantity < 1) {
        return prev.filter(
          (item) =>
            !(item.id === id && (item.variantId || null) === variantId),
        )
      }
      return prev.map((item) => {
        if (item.id === id && (item.variantId || null) === variantId) {
          const max = item.maxStock || 99
          return { ...item, quantity: Math.min(quantity, max) }
        }
        return item
      })
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setAppliedCoupon(null)
  }, [])

  const toggleWishlist = useCallback(
    (product) => {
      setWishlist((prev) => {
        const exists = prev.some((item) => item.id === product.id)
        if (exists) {
          showToast(`${product.name} removed from wishlist`, 'info')
          return prev.filter((item) => item.id !== product.id)
        }
        showToast(`${product.name} saved to wishlist`)
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            brand: product.brand,
            slug: product.slug,
            image: product.image || product.images?.[0],
            price: product.price,
            originalPrice: product.originalPrice || product.mrp,
            rating: product.rating,
            reviews: product.reviews,
            inStock: product.inStock !== false,
            discount: product.discount,
            badge: product.badge,
            weight: product.weight,
            age: product.age,
            flavor: product.flavor,
            description: product.shortDescription || product.description,
            petType: product.petType,
            category: product.category,
          },
        ]
      })
    },
    [showToast],
  )

  const isWishlisted = useCallback(
    (id) => wishlist.some((item) => item.id === id),
    [wishlist],
  )

  /** Total qty for a product across default (no-variant) lines — used by product cards. */
  const getCartQuantity = useCallback(
    (productId, variantId = null) => {
      return cart.reduce((sum, item) => {
        if (item.id !== productId) return sum
        if (variantId != null) {
          return item.variantId === variantId ? sum + item.quantity : sum
        }
        // Product cards add without a variant — sum matching default lines, or all lines for that product
        if (item.variantId == null) return sum + item.quantity
        return sum + item.quantity
      }, 0)
    },
    [cart],
  )

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0
    const min = Number(appliedCoupon.minOrder || appliedCoupon.minOrderAmount || 0)
    if (cartSubtotal < min) return 0
    const type = (appliedCoupon.type || appliedCoupon.discountType || '').toLowerCase()
    const rawValue = Number(appliedCoupon.value || appliedCoupon.amount || 0)
    let computed
    if (type.includes('percent') || type === '%') {
      computed = Math.round((cartSubtotal * rawValue) / 100)
      const max = Number(
        appliedCoupon.maxDiscount || appliedCoupon.maximumDiscount || 0,
      )
      if (max > 0) computed = Math.min(computed, max)
    } else {
      computed = rawValue
    }
    return Math.min(computed, cartSubtotal)
  }, [appliedCoupon, cartSubtotal])

  const shipping = useMemo(
    () =>
      calcShipping(
        Math.max(0, cartSubtotal - couponDiscount),
        liveShipping || seedShippingSettings,
      ),
    [cartSubtotal, couponDiscount, liveShipping],
  )

  const tax = useMemo(
    () => calcTax(Math.max(0, cartSubtotal - couponDiscount), taxRatePercent),
    [cartSubtotal, couponDiscount, taxRatePercent],
  )

  const cartTotal = useMemo(
    () => Math.max(0, cartSubtotal - couponDiscount + shipping + tax),
    [cartSubtotal, couponDiscount, shipping, tax],
  )

  const applyCoupon = useCallback(
    (code) => {
      const normalized = String(code || '').trim().toUpperCase()
      if (!normalized) {
        showToast('Enter a coupon code', 'error')
        return false
      }
      const found = liveCoupons.find(
        (c) =>
          String(c.code).toUpperCase() === normalized &&
          (c.status === 'Active' || c.active !== false) &&
          c.status !== 'Expired',
      )
      if (!found) {
        showToast('Invalid coupon code', 'error')
        return false
      }
      const min = Number(found.minOrder || found.minOrderAmount || 0)
      if (cartSubtotal < min) {
        showToast(`Minimum order ₹${min} required`, 'error')
        return false
      }
      setAppliedCoupon(found)
      showToast(`Coupon ${found.code} applied`)
      return true
    },
    [cartSubtotal, showToast, liveCoupons],
  )

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null)
    showToast('Coupon removed', 'info')
  }, [showToast])

  const placeOrder = useCallback(
    (orderPayload) => {
      if (!isFirebaseConfigured) {
        decreaseStockForCartItems(cart)
      } else {
        invalidateCatalogCache()
      }
      const order = {
        ...orderPayload,
        id:
          orderPayload.id && /^\d{6}$/.test(String(orderPayload.id))
            ? String(orderPayload.id)
            : String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0'),
        createdAt: new Date().toISOString(),
        items: cart.map((item) => ({ ...item })),
        subtotal: cartSubtotal,
        discount: couponDiscount,
        shipping,
        tax,
        total: cartTotal,
        coupon: appliedCoupon?.code || null,
        status: normalizeOrderStatus(orderPayload.status || 'Pending'),
        paymentStatus: orderPayload.paymentStatus || 'Pending',
        timeline:
          orderPayload.timeline ||
          buildOrderTimeline(orderPayload.status || 'Pending', {
            createdAt: new Date().toISOString(),
            paymentPaidAt:
              orderPayload.paymentStatus === 'Paid'
                ? new Date().toISOString()
                : null,
          }),
      }
      setOrders((prev) => [order, ...prev])
      clearCart()
      return order
    },
    [
      cart,
      cartSubtotal,
      couponDiscount,
      shipping,
      tax,
      cartTotal,
      appliedCoupon,
      clearCart,
    ],
  )

  /**
   * Mirror a server-verified order into local order history.
   * Paid status must already be confirmed by the backend.
   */
  const adoptServerOrder = useCallback(
    (serverOrder, { clearCartAfter = true, adjustInventory = true } = {}) => {
      if (!serverOrder?.id) {
        throw new Error('Invalid server order')
      }
      if (adjustInventory) {
        if (isFirebaseConfigured) {
          invalidateCatalogCache()
        } else if (Array.isArray(serverOrder.items)) {
          decreaseStockForCartItems(serverOrder.items)
        }
      }
      const order = {
        ...serverOrder,
        status: normalizeOrderStatus(serverOrder.status),
        timeline:
          Array.isArray(serverOrder.timeline) && serverOrder.timeline.length
            ? serverOrder.timeline
            : buildOrderTimeline(serverOrder.status, {
                createdAt: serverOrder.createdAt,
                paymentPaidAt: serverOrder.verifiedAt,
              }),
        payment: {
          provider: serverOrder.paymentProvider || 'razorpay',
          paymentId: serverOrder.razorpayPaymentId,
          method: serverOrder.paymentMethod || 'razorpay',
        },
      }
      setOrders((prev) => {
        const without = prev.filter((o) => o.id !== order.id)
        return [order, ...without]
      })
      if (clearCartAfter) clearCart()
      return order
    },
    [clearCart],
  )

  const cancelOrder = useCallback(
    async (orderId) => {
      const current = orders.find((o) => o.id === orderId)
      if (!current) return
      if (!['Pending', 'Confirmed'].includes(current.status)) {
        showToast('This order can no longer be cancelled', 'error')
        return
      }
      const patch = {
        status: 'Cancelled',
        cancelledAt: new Date().toISOString(),
      }
      try {
        if (isFirebaseConfigured) {
          await patchDocument('orders', orderId, patch)
        }
      } catch (err) {
        console.warn('Cancel sync failed', err?.message || err)
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o)),
      )
      showToast('Order cancelled')
    },
    [orders, showToast],
  )

  const getOrderById = useCallback(
    (id) => orders.find((o) => o.id === id),
    [orders],
  )

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      orders,
      toast,
      cartOpen,
      searchQuery,
      mobileSearchOpen,
      cartCount,
      cartSubtotal,
      couponDiscount,
      shipping,
      tax,
      cartTotal,
      appliedCoupon,
      wishlistCount: wishlist.length,
      setCartOpen,
      setSearchQuery,
      setMobileSearchOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      getCartQuantity,
      applyCoupon,
      removeCoupon,
      placeOrder,
      adoptServerOrder,
      cancelOrder,
      getOrderById,
      showToast,
      dismissToast,
    }),
    [
      cart,
      wishlist,
      orders,
      toast,
      cartOpen,
      searchQuery,
      mobileSearchOpen,
      cartCount,
      cartSubtotal,
      couponDiscount,
      shipping,
      tax,
      cartTotal,
      appliedCoupon,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      getCartQuantity,
      applyCoupon,
      removeCoupon,
      placeOrder,
      adoptServerOrder,
      cancelOrder,
      getOrderById,
      showToast,
      dismissToast,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
