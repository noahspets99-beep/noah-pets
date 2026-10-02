import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatPrice } from '../data/products'
import { INDIA_STATES_AND_UTS } from '../data/indiaCities'
import { useShop } from '../context/useShop'
import { useAuth } from '../context/useAuth'
import {
  startRazorpayCheckout,
  verifyPayment,
  getActivePaymentProviderName,
  openRazorpayCheckout,
  loadRazorpayCheckout,
  createPaymentOrder,
} from '../services/payment/paymentService'
import { isManualWhatsAppCheckout } from '../lib/checkoutPaymentMode'
import SeoHead from '../components/seo/SeoHead'
import {
  clearCheckoutDraft,
  loadCheckoutDraft,
  saveCheckoutDraft,
} from '../lib/checkoutDraft'
import { openOrderWhatsApp } from '../lib/orderWhatsApp'

const initialForm = {
  name: '',
  mobile: '',
  email: '',
  address: '',
  area: '',
  landmark: '',
  city: '',
  district: '',
  state: '',
  pincode: '',
  country: 'India',
}

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

function isIndianMobile(value) {
  const digits = digitsOnly(value)
  const local = digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits
  return /^[6-9]\d{9}$/.test(local)
}

function isIndianPincode(value) {
  return /^[1-9]\d{5}$/.test(digitsOnly(value))
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const {
    cart,
    cartSubtotal,
    couponDiscount,
    shipping,
    tax,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    placeOrder,
    adoptServerOrder,
    showToast,
  } = useShop()
  const { user, authReady, isAuthenticated } = useAuth()
  const [form, setForm] = useState(() => loadCheckoutDraft() || initialForm)
  const [couponCode, setCouponCode] = useState('')
  const [paying, setPaying] = useState(false)
  const submittingRef = useRef(false)
  const provider = getActivePaymentProviderName()
  const manualCheckout = isManualWhatsAppCheckout()

  useEffect(() => {
    if (!manualCheckout && provider === 'razorpay') {
      loadRazorpayCheckout().catch(() => {})
    }
  }, [manualCheckout, provider])

  useEffect(() => {
    saveCheckoutDraft(form)
  }, [form])

  useEffect(() => {
    if (!authReady || !isAuthenticated || !user) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.displayName || '',
      email: prev.email || user.email || '',
      country: prev.country || 'India',
    }))
  }, [authReady, isAuthenticated, user])

  useEffect(() => {
    const pin = digitsOnly(form.pincode)
    if (!isIndianPincode(pin)) return undefined
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${pin}`,
          { signal: controller.signal },
        )
        if (!res.ok) return
        const data = await res.json()
        const office =
          data?.[0]?.Status === 'Success' ? data[0].PostOffice?.[0] : null
        if (!office) return
        setForm((prev) => {
          if (digitsOnly(prev.pincode) !== pin) return prev
          const nextState = office.State || prev.state
          return {
            ...prev,
            city: office.District || office.Block || office.Name || prev.city,
            state: nextState,
            country: 'India',
          }
        })
      } catch {
        /* Pincode lookup is optional. The customer can still type city and state. */
      }
    }, 400)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [form.pincode])

  const handleCoupon = (e) => {
    e?.preventDefault?.()
    applyCoupon(couponCode)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    if (name === 'mobile') {
      setForm((prev) => ({ ...prev, mobile: digitsOnly(value).slice(0, 10) }))
      return
    }
    if (name === 'pincode') {
      setForm((prev) => ({ ...prev, pincode: digitsOnly(value).slice(0, 6) }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!form.name.trim()) return 'Enter your name'
    if (!isIndianMobile(form.mobile)) return 'Enter a valid 10-digit mobile number'
    if (!form.email.includes('@')) return 'Enter a valid email'
    if (!form.address.trim()) return 'Enter house / flat / building'
    if (!form.area.trim()) return 'Enter street / area'
    if (!form.city.trim()) return 'Enter city'
    if (!form.state.trim()) return 'Select a state'
    if (!isIndianPincode(form.pincode)) return 'Enter a valid 6-digit PIN code'
    return null
  }

  const getOptionalIdToken = async () => {
    if (!isAuthenticated || !user) return null
    try {
      return await user.getIdToken()
    } catch {
      return null
    }
  }

  const payAndPlace = (e) => {
    e.preventDefault()
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error')
      return
    }
    const err = validate()
    if (err) {
      showToast(err, 'error')
      return
    }
    if (manualCheckout) {
      placeWhatsAppOrder()
      return
    }
    void payWithProvider()
  }

  const placeWhatsAppOrder = () => {
    const now = new Date()
    const stamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('')
    const serial = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
    const order = {
      id: `WA-${stamp}-${serial}`,
      customer: { ...form },
      shippingAddress: { ...form },
      items: cart.map((item) => ({
        name: item.name,
        variantLabel: item.variantLabel || '',
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        lineTotal: (Number(item.price) || 0) * (Number(item.quantity) || 1),
      })),
      subtotal: cartSubtotal,
      discount: couponDiscount,
      shipping,
      tax,
      total: cartTotal,
      paymentMethod: 'manual_whatsapp',
    }
    openOrderWhatsApp(order)
    showToast('WhatsApp opened — review the message and press Send')
  }

  const payWithProvider = async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setPaying(true)
    try {
      if (provider === 'razorpay') {
        await payWithRazorpay()
      } else {
        await payWithDemo()
      }
    } catch (error) {
      if (error?.code === 'cancelled') {
        showToast('Payment cancelled — your order was not charged', 'info')
      } else if (error?.name === 'AbortError' || error?.code === 'start_timeout') {
        showToast('Order could not be placed. Please try again.', 'error')
      } else {
        showToast(error.message || 'Order could not be placed. Please try again.', 'error')
      }
    } finally {
      submittingRef.current = false
      setPaying(false)
    }
  }

  const payWithDemo = async () => {
    const draftId = `TMP-${Date.now().toString().slice(-6)}`
    const paymentOrder = await createPaymentOrder({
      amount: cartTotal,
      currency: 'INR',
      orderId: draftId,
      customer: {
        name: form.name,
        email: form.email,
        contact: form.mobile,
      },
    })
    const verified = await verifyPayment({
      paymentOrderId: paymentOrder.paymentOrderId,
      orderId: draftId,
    })
    if (verified.status !== 'paid') {
      throw new Error('Payment not verified')
    }
    const order = placeOrder({
      customer: { ...form },
      customerId: user?.uid || null,
      status: 'Pending',
      paymentStatus: 'Paid',
      payment: {
        provider: verified.provider || provider,
        paymentId: verified.paymentId,
        method: verified.method || 'demo',
      },
      shippingAddress: { ...form },
    })
    clearCheckoutDraft()
    showToast('Payment successful — order placed')
    openOrderWhatsApp(order)
    navigate(`/orders/${order.id}`)
  }

  const payWithRazorpay = async () => {
    const idToken = await getOptionalIdToken()
    const paymentOrder = await startRazorpayCheckout({
      items: cart.map((item) => ({
        productId: item.id,
        variantId: item.variantId || null,
        quantity: Number(item.quantity) || 1,
      })),
      customer: { ...form },
      shippingAddress: { ...form },
      couponCode: appliedCoupon?.code || null,
      ...(idToken ? { idToken } : {}),
    })

    const razorpayOrderId =
      paymentOrder.razorpayOrderId || paymentOrder.paymentOrderId
    const amountPaise = Number(paymentOrder.amountPaise)
    const currency = String(paymentOrder.currency || 'INR').toUpperCase()
    const keyId = paymentOrder.keyId || undefined

    if (!razorpayOrderId || !String(razorpayOrderId).startsWith('order_')) {
      throw new Error('Payment could not be started. Please try again.')
    }
    if (!Number.isInteger(amountPaise) || amountPaise < 100) {
      throw new Error('Payment could not be started. Please try again.')
    }

    if (import.meta.env.DEV) {
      console.info('[checkout] razorpay create-order response', {
        internalOrderId: paymentOrder.orderId,
        razorpayOrderId,
        amountPaise,
        currency,
        keyIdPrefix: keyId ? String(keyId).slice(0, 12) : null,
      })
    }

    const checkoutResult = await openRazorpayCheckout({
      keyId,
      razorpayOrderId,
      amountPaise,
      currency,
      customer: form,
      orderId: String(paymentOrder.orderId),
      description: `Order ${paymentOrder.orderId}`,
    })

    const verified = await verifyPayment({
      orderId: String(paymentOrder.orderId),
      accessToken: paymentOrder.accessToken,
      razorpay_order_id: checkoutResult.razorpay_order_id,
      razorpay_payment_id: checkoutResult.razorpay_payment_id,
      razorpay_signature: checkoutResult.razorpay_signature,
      ...(idToken ? { idToken } : {}),
    })

    if (verified.status !== 'paid') {
      throw new Error('Payment not verified')
    }

    // Paid orders are written only by the payments API (Admin SDK). Do not
    // mirror paymentStatus from the browser — Firestore rules reject it.
    const serverOrder = verified.order
    const localOrder = adoptServerOrder(serverOrder, {
      clearCartAfter: true,
      adjustInventory: true,
    })
    clearCheckoutDraft()
    showToast('Payment successful — order placed')
    openOrderWhatsApp(localOrder)
    navigate(`/orders/${localOrder.id}`)
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <SeoHead title="Checkout" noindex canonical="/checkout" />
        <p className="font-semibold text-ink">Nothing to checkout</p>
        <Link
          to="/products/dogs"
          className="mt-4 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Shop products
        </Link>
      </div>
    )
  }

  const fieldClass =
    'mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100'

  const payDisabled = paying
  let payLabel
  if (paying) {
    payLabel = manualCheckout ? 'Placing order…' : 'Processing payment…'
  } else if (manualCheckout) {
    payLabel = 'Place Order'
  } else if (provider === 'razorpay') {
    payLabel = `Pay ${formatPrice(cartTotal)}`
  } else {
    payLabel = `Pay ${formatPrice(cartTotal)} (Demo)`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead title="Checkout" noindex canonical="/checkout" />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        Delivery across India
        {manualCheckout
          ? ''
          : ` · Payment via ${provider === 'razorpay' ? 'Razorpay' : 'demo'} provider`}
      </p>

      <form
        onSubmit={payAndPlace}
        className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]"
      >
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold text-ink">Shipping details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-ink">
              Full name
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
                className={fieldClass}
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Mobile
              <input
                name="mobile"
                value={form.mobile}
                onChange={onChange}
                required
                inputMode="tel"
                className={fieldClass}
              />
            </label>
            <label className="sm:col-span-2 text-sm font-semibold text-ink">
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                className={fieldClass}
              />
            </label>
            <label className="sm:col-span-2 text-sm font-semibold text-ink">
              House / Flat / Building
              <input
                name="address"
                value={form.address}
                onChange={onChange}
                required
                autoComplete="address-line1"
                className={fieldClass}
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Street / Area
              <input
                name="area"
                value={form.area}
                onChange={onChange}
                required
                autoComplete="address-line2"
                className={fieldClass}
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Landmark <span className="font-normal text-muted">(optional)</span>
              <input
                name="landmark"
                value={form.landmark}
                onChange={onChange}
                className={fieldClass}
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Pincode
              <input
                name="pincode"
                value={form.pincode}
                onChange={onChange}
                required
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                placeholder="6-digit PIN"
                className={fieldClass}
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              City
              <input
                name="city"
                value={form.city}
                onChange={onChange}
                required
                autoComplete="address-level2"
                className={fieldClass}
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              State
              <select
                name="state"
                value={form.state}
                onChange={onChange}
                required
                autoComplete="address-level1"
                className={fieldClass}
              >
                <option value="">Select state</option>
                {(INDIA_STATES_AND_UTS.includes(form.state) || !form.state
                  ? INDIA_STATES_AND_UTS
                  : [form.state, ...INDIA_STATES_AND_UTS]
                ).map((stateName) => (
                  <option key={stateName} value={stateName}>
                    {stateName}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-ink">
              Country
              <input
                name="country"
                value={form.country || 'India'}
                onChange={onChange}
                required
                autoComplete="country-name"
                className={fieldClass}
              />
            </label>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="text-lg font-bold text-ink">Order summary</h2>
          <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto text-sm">
            {cart.map((item) => (
              <li
                key={`${item.id}-${item.variantId || 'default'}`}
                className="flex justify-between gap-2"
              >
                <span className="text-ink-soft">
                  {item.name}
                  {item.variantLabel ? ` (${item.variantLabel})` : ''} ×
                  {item.quantity}
                </span>
                <span className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {appliedCoupon ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-sm">
              <span className="font-semibold text-brand-700">
                {appliedCoupon.code}
              </span>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-xs font-semibold text-muted hover:text-danger"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <input
                name="coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCoupon()
                  }
                }}
                placeholder="Coupon code"
                className="flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={handleCoupon}
                className="rounded-xl border border-line px-3 py-2 text-sm font-semibold hover:bg-surface"
              >
                Apply
              </button>
            </div>
          )}

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(cartSubtotal)}</dd>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount</dt>
                <dd>−{formatPrice(couponDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Handling Fee</dt>
              <dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-extrabold">{formatPrice(cartTotal)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            disabled={payDisabled}
            className="mt-5 w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {payLabel}
          </button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
            By placing an order you agree to our{' '}
            <Link to="/terms" className="font-semibold text-brand-600 hover:text-brand-700">
              Terms &amp; Conditions
            </Link>
            ,{' '}
            <Link to="/privacy" className="font-semibold text-brand-600 hover:text-brand-700">
              Privacy Policy
            </Link>
            ,{' '}
            <Link to="/returns" className="font-semibold text-brand-600 hover:text-brand-700">
              Refund &amp; Cancellation Policy
            </Link>
            , and{' '}
            <Link to="/shipping" className="font-semibold text-brand-600 hover:text-brand-700">
              Shipping &amp; Delivery Policy
            </Link>
            .
          </p>
          <p className="mt-2 text-center text-xs text-muted">
            {manualCheckout
              ? 'Place the order to send the details on WhatsApp. Payment is collected manually.'
              : provider === 'razorpay'
                ? 'Secure payment powered by Razorpay. Your order is confirmed only after server verification.'
                : 'Demo checkout simulates a successful UPI/card payment.'}
          </p>
        </aside>
      </form>
    </div>
  )
}
