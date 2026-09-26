import { createHmac, timingSafeEqual } from 'node:crypto'
import Razorpay from 'razorpay'
import { publicError } from './util.js'

let client = null

function readEnv(name) {
  const raw = process.env[name]
  if (raw == null) return ''
  return String(raw).trim().replace(/^['"]|['"]$/g, '')
}

function isUnsetOrPlaceholder(value) {
  if (!value) return true
  const v = String(value).trim()
  return (
    v === 'REPLACE_ME' ||
    v === 'REPLACE_WITH_NEW_ROTATED_TEST_SECRET' ||
    v === 'REPLACE_WITH_MY_NEW_ROTATED_TEST_SECRET' ||
    v.includes('REPLACE_ME') ||
    v.includes('REPLACE_WITH_NEW_ROTATED') ||
    v.includes('REPLACE_WITH_MY_NEW')
  )
}

export function getRazorpayCredentials() {
  const keyId = readEnv('RAZORPAY_KEY_ID')
  const keySecret = readEnv('RAZORPAY_KEY_SECRET')

  if (!keyId || isUnsetOrPlaceholder(keyId)) {
    throw publicError(
      503,
      'payments_unconfigured',
      'Payment service is not configured. Set RAZORPAY_KEY_ID (server env / Vercel) and restart.',
    )
  }

  if (!keySecret || isUnsetOrPlaceholder(keySecret)) {
    throw publicError(
      503,
      'payments_unconfigured',
      'Payment service is not configured. Set RAZORPAY_KEY_SECRET (server-only, never VITE_) and restart.',
    )
  }

  return { keyId, keySecret }
}

export function getRazorpayClient() {
  if (client) return client
  const { keyId, keySecret } = getRazorpayCredentials()
  client = new Razorpay({ key_id: keyId, key_secret: keySecret })
  return client
}

/** Clear cached client after env reload / tests. */
export function resetRazorpayClient() {
  client = null
}

export function verifyCheckoutSignature({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  const { keySecret } = getRazorpayCredentials()
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw publicError(400, 'invalid_payment_payload', 'Missing payment verification fields.')
  }
  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const expected = createHmac('sha256', keySecret).update(body).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(String(razorpay_signature))
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw publicError(400, 'invalid_signature', 'Payment signature verification failed.')
  }
  return true
}

export function verifyWebhookSignature(rawBody, signature) {
  const secret = readEnv('RAZORPAY_WEBHOOK_SECRET')
  if (!secret || isUnsetOrPlaceholder(secret)) {
    throw publicError(503, 'webhook_unconfigured', 'Webhook secret is not configured.')
  }
  if (!signature) {
    throw publicError(401, 'invalid_webhook', 'Missing webhook signature.')
  }
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(String(signature))
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw publicError(401, 'invalid_webhook', 'Invalid webhook signature.')
  }
  return true
}

export async function createRazorpayOrder({ amountPaise, currency, receipt, notes }) {
  const rzp = getRazorpayClient()
  const amount = Number(amountPaise)
  if (!Number.isInteger(amount) || amount < 100) {
    throw publicError(400, 'invalid_amount', 'Order amount is too low to charge.')
  }
  const receiptSafe = String(receipt || '').slice(0, 40)
  if (!receiptSafe) {
    throw publicError(500, 'invalid_receipt', 'Missing payment receipt reference.')
  }
  try {
    const order = await rzp.orders.create({
      amount,
      currency: String(currency || 'INR').toUpperCase(),
      receipt: receiptSafe,
      notes: notes || {},
    })
    return order
  } catch (err) {
    // Log safe diagnostics only — never the secret
    console.error('Razorpay order create failed', {
      statusCode: err?.statusCode || err?.status || null,
      errorCode: err?.error?.code || err?.code || null,
      description: err?.error?.description || err?.message || 'error',
      field: err?.error?.field || null,
      amount,
      currency: String(currency || 'INR').toUpperCase(),
      receiptLength: receiptSafe.length,
      receiptPrefix: receiptSafe.slice(0, 8),
    })
    throw publicError(502, 'razorpay_create_failed', 'Unable to create payment order.')
  }
}

export async function fetchRazorpayPayment(paymentId) {
  const rzp = getRazorpayClient()
  try {
    return await rzp.payments.fetch(paymentId)
  } catch (err) {
    console.error('Razorpay payment fetch failed', err?.statusCode || err?.message || 'error')
    throw publicError(502, 'razorpay_fetch_failed', 'Unable to fetch payment status.')
  }
}

export function isSuccessfulPaymentStatus(status) {
  return status === 'captured' || status === 'authorized'
}
