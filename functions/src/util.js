import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export const CURRENCY = 'INR'

export function rupeesToPaise(rupees) {
  const n = Number(rupees)
  if (!Number.isFinite(n) || n < 0) {
    throw new Error('Invalid amount')
  }
  return Math.round(n * 100)
}

export function paiseToRupees(paise) {
  return Number(paise) / 100
}

export function createOrderAccessToken() {
  return randomBytes(32).toString('hex')
}

export function hashToken(token) {
  return createHash('sha256').update(String(token)).digest('hex')
}

export function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''))
  const right = Buffer.from(String(b || ''))
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function generateOrderId() {
  // Exactly 6 numeric digits in the range 100000–999999 (no leading zeros).
  // Avoids JSON/number coercion bugs while remaining a unique customer-facing ID.
  const n = 100000 + (randomBytes(4).readUInt32BE(0) % 900000)
  return String(n)
}

/**
 * Razorpay `receipt` must be unique per merchant and is NOT the customer order ID.
 * Shape matches the previously working ORD-{stamp}-{rand} receipts.
 * Customer-facing 6-digit IDs stay in notes.internalOrderId / Firestore doc id only.
 */
export function razorpayReceiptForOrder(orderId) {
  const rand = randomBytes(3).toString('hex').toUpperCase()
  return `ORD-${String(orderId || '')}-${rand}`
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 40)
}

export function publicError(status, code, message) {
  const err = new Error(message)
  err.status = status
  err.code = code
  err.expose = true
  return err
}
