import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatPrice } from '../data/products'
import { TN_DISTRICTS, STORE } from '../config/store'
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
import SeoHead from '../components/seo/SeoHead'
import {
  clearCheckoutDraft,
  loadCheckoutDraft,
  saveCheckoutDraft,
} from '../lib/checkoutDraft'

const initialForm = {
  name: '',
  mobile: '',
  email: '',
  address: '',
  area: '',
  city: 'Chennai',
  district: 'Chennai',
  state: STORE.defaultState,
  pincode: '',
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const {
    cart,
    cartSubtotal,
    couponDiscount,
    shipping,
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
  const provider = getActivePaymentProviderName()

  useEffect(() => {
    if (provider === 'razorpay') {
      loadRazorpayCheckout().catch(() => {})
    }
  }, [provider])

  useEffect(() => {
    saveCheckoutDraft(form)
  }, [form])

  useEffect(() => {
    if (!authReady || !isAuthenticated || !user) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.displayName || '',
      email: prev.email || user.email || '',
    }))
  }, [authReady, isAuthenticated, user])

  const handleCoupon = (e) => {
    e?.preventDefault?.()
    applyCoupon(couponCode)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!form.name.trim()) return 'Enter your name'
    if (!/^\d{10}$/.test(form.mobile.replace(/\D/g, '').slice(-10)))
      return 'Enter a valid 10-digit mobile'
    if (!form.email.includes('@')) return 'Enter a valid email'
    if (!form.address.trim()) return 'Enter address'
    if (!form.city.trim()) return 'Enter city'
    if (!form.pincode || form.pincode.length < 6) return 'Enter a valid pincode'
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

  const payAndPlace = async (e) => {
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
    if (paying) return
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
        showToast('Payment could not be started. Please try again.', 'error')
      } else {
        showToast(error.message || 'Payment could not be started. Please try again.', 'error')
      }
    } finally {
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
      orderId: paymentOrder.orderId,
      description: `Order ${paymentOrder.orderId}`,
    })

    const verified = await verifyPayment({
      orderId: paymentOrder.orderId,
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
    payLabel = 'Processing payment…'
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
        Delivery across India · Payment via{' '}
        {provider === 'razorpay' ? 'Razorpay' : 'demo'} provider
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
              Address
              <input
                name="address"
                value={form.address}
                onChange={onChange}
                required
                className={fieldClass}
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Area / Locality
              <input
                name="area"
                value={form.area}
                onChange={onChange}
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
                className={fieldClass}
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              District
              <select
                name="district"
                value={form.district}
                onChange={onChange}
                className={fieldClass}
              >
                {TN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-ink">
              State
              <input
                name="state"
                value={form.state}
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
                maxLength={6}
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
              <dt className="text-muted">Shipping</dt>
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
            {provider === 'razorpay'
              ? 'Secure payment powered by Razorpay. Your order is confirmed only after server verification.'
              : 'Demo checkout simulates a successful UPI/card payment.'}
          </p>
        </aside>
      </form>
    </div>
  )
}
