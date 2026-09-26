import {
  DemoPaymentProvider,
  RazorpayPaymentProvider,
} from './paymentProvider'

const PROVIDER =
  import.meta.env.VITE_PAYMENT_PROVIDER === 'razorpay'
    ? new RazorpayPaymentProvider({
        createOrderUrl: import.meta.env.VITE_PAYMENT_CREATE_ORDER_URL,
        verifyUrl: import.meta.env.VITE_PAYMENT_VERIFY_URL,
        statusUrl: import.meta.env.VITE_PAYMENT_STATUS_URL,
      })
    : new DemoPaymentProvider()

export async function createPendingOrder(payload) {
  const url =
    import.meta.env.VITE_PAYMENT_PENDING_ORDER_URL || '/api/orders/pending'
  return postJson(url, payload, { timeoutMs: 20000 })
}

export async function startRazorpayCheckout(payload) {
  const url =
    import.meta.env.VITE_PAYMENT_CHECKOUT_START_URL || '/api/checkout/razorpay'
  try {
    return await postJson(url, payload, { timeoutMs: 20000 })
  } catch (err) {
    if (err?.status === 404 || err?.status === 405) {
      const pending = await createPendingOrder(payload)
      const paymentOrder = await createPaymentOrder({
        orderId: String(pending.orderId),
        accessToken: pending.accessToken,
        idToken: payload.idToken,
      })
      return { ...pending, ...paymentOrder, orderId: String(pending.orderId) }
    }
    if (err?.name === 'AbortError') {
      throw Object.assign(
        new Error('Payment could not be started. Please try again.'),
        { code: 'start_timeout' },
      )
    }
    throw Object.assign(
      new Error(err.message || 'Payment could not be started. Please try again.'),
      { code: err.code, status: err.status },
    )
  }
}

async function postJson(url, payload, { timeoutMs = 20000 } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (payload.idToken) {
    headers.Authorization = `Bearer ${payload.idToken}`
  }
  const { idToken, firebaseUid, ...body } = payload
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const error = new Error(data?.message || 'Request failed')
      error.code = data?.error
      error.status = res.status
      throw error
    }
    return data
  } finally {
    clearTimeout(timer)
  }
}

export async function createPaymentOrder(payload) {
  return PROVIDER.createPaymentOrder(payload)
}

export async function verifyPayment(payload) {
  return PROVIDER.verifyPayment(payload)
}

export async function getPaymentStatus(paymentId) {
  return PROVIDER.getPaymentStatus(paymentId)
}

export function getActivePaymentProviderName() {
  return import.meta.env.VITE_PAYMENT_PROVIDER === 'razorpay'
    ? 'razorpay'
    : 'demo'
}

export function getRazorpayKeyId() {
  return import.meta.env.VITE_RAZORPAY_KEY_ID || ''
}

export function loadRazorpayCheckout() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay requires a browser'))
  }
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Razorpay))
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Razorpay Checkout')),
      )
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpay = 'true'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () =>
      reject(new Error('Failed to load Razorpay Checkout'))
    document.body.appendChild(script)
  })
}

/**
 * Open Razorpay Checkout using a server-created order.
 * Resolves with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 * or rejects on cancel/failure.
 */
export async function openRazorpayCheckout({
  keyId,
  razorpayOrderId,
  amountPaise,
  currency = 'INR',
  name = 'Noahs Pets',
  description = 'Order payment',
  customer,
  orderId,
}) {
  const RazorpayCtor = await loadRazorpayCheckout()
  const key = String(keyId || getRazorpayKeyId() || '').trim()
  const order_id = String(razorpayOrderId || '').trim()
  const amount = Number(amountPaise)
  const currencyCode = String(currency || 'INR').trim().toUpperCase()
  const contact = String(customer?.mobile || customer?.contact || '')
    .replace(/\D/g, '')
    .slice(-10)
  const email = String(customer?.email || '').trim()

  if (!key || !key.startsWith('rzp_')) {
    throw new Error('Razorpay Key ID is missing or invalid')
  }
  if (!order_id.startsWith('order_')) {
    throw new Error('Invalid Razorpay order ID from server')
  }
  if (!Number.isInteger(amount) || amount < 100) {
    throw new Error('Invalid payment amount from server')
  }
  if (currencyCode !== 'INR') {
    throw new Error('Unsupported payment currency')
  }

  if (import.meta.env.DEV) {
    console.info('[razorpay-checkout]', {
      keyIdConfigured: Boolean(key),
      keyIdPrefix: key.slice(0, 12),
      keyIsTest: key.startsWith('rzp_test_'),
      internalOrderId: orderId || null,
      razorpayOrderId: order_id,
      amountPaise: amount,
      currency: currencyCode,
    })
  }

  return new Promise((resolve, reject) => {
    let settled = false

    const options = {
      key,
      amount, // must match Razorpay order amount (paise), integer
      currency: currencyCode,
      name,
      description: String(description || 'Order payment').slice(0, 255),
      order_id,
      prefill: {
        name: String(customer?.name || '').trim().slice(0, 100),
        email,
        // Razorpay India expects E.164-style contact when possible
        contact: contact.length === 10 ? `+91${contact}` : '',
      },
      notes: {
        internalOrderId: String(orderId || ''),
      },
      theme: { color: '#0ea5e9' },
      handler(response) {
        if (settled) return
        settled = true
        resolve(response)
      },
      modal: {
        ondismiss() {
          if (settled) return
          settled = true
          reject(
            Object.assign(new Error('Payment cancelled'), { code: 'cancelled' }),
          )
        },
      },
    }

    const rzp = new RazorpayCtor(options)
    rzp.on('payment.failed', (response) => {
      if (settled) return
      settled = true
      const err = response?.error || {}
      const reason =
        err.description || err.reason || err.code || 'Payment failed'
      if (import.meta.env.DEV) {
        console.warn('[razorpay-checkout] payment.failed', {
          code: err.code || null,
          reason: err.reason || null,
          description: err.description || null,
          orderId: err.metadata?.order_id || order_id,
        })
      }
      reject(Object.assign(new Error(reason), { code: 'payment_failed', details: err }))
    })
    rzp.open()
  })
}

export const paymentService = {
  createPendingOrder,
  startRazorpayCheckout,
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  getActivePaymentProviderName,
  getRazorpayKeyId,
  openRazorpayCheckout,
}

export default paymentService
