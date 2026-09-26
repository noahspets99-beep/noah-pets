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
  // Exactly 6 numeric digits (000000–999999), zero-padded.
  const n = randomBytes(4).readUInt32BE(0) % 1_000_000
  return String(n).padStart(6, '0')
}

export function publicError(status, code, message) {
  const err = new Error(message)
  err.status = status
  err.code = code
  err.expose = true
  return err
}
