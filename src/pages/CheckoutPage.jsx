import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatPrice } from '../data/products'
import { TN_DISTRICTS, STORE } from '../config/store'
import { useShop } from '../context/useShop'
import {
  createPaymentOrder,
  verifyPayment,
  getActivePaymentProviderName,
} from '../services/payment/paymentService'
import SeoHead from '../components/seo/SeoHead'

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
    tax,
    cartTotal,
    placeOrder,
    showToast,
  } = useShop()
  const [form, setForm] = useState(initialForm)
  const [paying, setPaying] = useState(false)
  const provider = getActivePaymentProviderName()

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
    setPaying(true)
    try {
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
        status: 'Confirmed',
        paymentStatus: 'Paid',
        payment: {
          provider: verified.provider || provider,
          paymentId: verified.paymentId,
          method: verified.method || 'demo',
        },
        shippingAddress: { ...form },
      })
      showToast('Payment successful — order placed')
      navigate(`/orders/${order.id}`)
    } catch (error) {
      showToast(error.message || 'Payment failed', 'error')
    } finally {
      setPaying(false)
    }
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <SeoHead title="Checkout" noindex canonical="/checkout" />
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        Delivery across Tamil Nadu · Payment via {provider} provider
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
            <div className="flex justify-between">
              <dt className="text-muted">GST</dt>
              <dd>{formatPrice(tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-extrabold">{formatPrice(cartTotal)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            disabled={paying}
            className="mt-5 w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {paying ? 'Processing payment…' : `Pay ${formatPrice(cartTotal)} (Demo)`}
          </button>
          <p className="mt-2 text-center text-xs text-muted">
            Demo checkout simulates a successful UPI/card payment.
          </p>
        </aside>
      </form>
    </div>
  )
}
