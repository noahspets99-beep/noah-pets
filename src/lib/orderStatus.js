/** Canonical customer/admin fulfillment statuses (exactly four). */
export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Delivered',
  'Cancelled',
]

/**
 * Map legacy/internal order.status values to the four customer-facing statuses.
 * Does not treat paymentStatus (e.g. Paid) as an order status.
 */
export function normalizeOrderStatus(status) {
  const s = String(status || 'Pending').trim()
  if (ORDER_STATUSES.includes(s)) return s

  const lower = s.toLowerCase()
  if (
    lower === 'processing' ||
    lower === 'shipped' ||
    lower === 'out for delivery' ||
    lower === 'out for delivery'
  ) {
    return 'Confirmed'
  }
  if (lower === 'completed' || lower === 'complete') return 'Delivered'
  if (
    lower === 'returned' ||
    lower === 'refunded' ||
    lower === 'failed' ||
    lower === 'payment failed'
  ) {
    return 'Cancelled'
  }
  // Never show Paid / Payment Pending as fulfillment status
  if (
    lower === 'paid' ||
    lower === 'payment pending' ||
    lower === 'payment_pending'
  ) {
    return 'Pending'
  }
  return 'Pending'
}

/** Timeline steps aligned to the four statuses (for local order history). */
export function buildOrderTimeline(status, { createdAt, paymentPaidAt } = {}) {
  const normalized = normalizeOrderStatus(status)
  const now = new Date().toISOString()
  const placedAt = createdAt || now
  const rank = {
    Pending: 0,
    Confirmed: 1,
    Delivered: 2,
    Cancelled: -1,
  }[normalized]

  if (normalized === 'Cancelled') {
    return [
      { label: 'Pending', at: placedAt, done: true },
      { label: 'Cancelled', at: now, done: true },
    ]
  }

  return [
    {
      label: 'Pending',
      at: placedAt,
      done: true,
    },
    {
      label: 'Confirmed',
      at: rank >= 1 ? paymentPaidAt || now : null,
      done: rank >= 1,
    },
    {
      label: 'Delivered',
      at: rank >= 2 ? now : null,
      done: rank >= 2,
    },
  ]
}
