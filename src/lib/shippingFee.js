/** A configured amount, including 0. Blank and non-numeric values are unset. */
export function readMoney(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

/** Shipping kg above 0. Blank, zero, and non-numeric values are unset. */
export function readShippingKg(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

/**
 * Delivery fee for one order.
 *
 * The threshold is compared with the merchandise subtotal after discount.
 * Checkout and the payments API both use that amount.
 *
 * A threshold above 0 waives the fee once the eligible amount reaches it.
 * A threshold of 0 means free shipping is not offered, so the configured
 * delivery fee is charged on every order.
 *
 * When line items are supplied, each line with a shipping weight above 0 is
 * charged weight × quantity × the standard rate. Lines without a valid weight
 * share that standard rate once. A fully weighted order does not also add it.
 */
export function shippingFeeForOrder(eligibleSubtotal, settings, fallback, items) {
  const amount = Math.max(0, readMoney(eligibleSubtotal) ?? 0)
  const freeMin =
    readMoney(settings?.freeShippingMinOrder) ??
    readMoney(settings?.freeDeliveryThreshold) ??
    readMoney(fallback?.freeShippingMinOrder) ??
    0
  const fee =
    readMoney(settings?.standardShippingFee) ??
    readMoney(settings?.deliveryFee) ??
    readMoney(fallback?.standardShippingFee) ??
    0
  if (freeMin > 0 && amount >= freeMin) return 0

  const lines = Array.isArray(items) ? items : null
  if (!lines || lines.length === 0) return fee

  let weighted = 0
  let hasWeighted = false
  let hasUnweighted = false
  for (const item of lines) {
    const qty = Math.max(0, Number(item?.quantity) || 0)
    if (qty <= 0) continue
    const kg = readShippingKg(item?.shippingWeight ?? item?.shippingKg)
    if (kg == null) {
      hasUnweighted = true
      continue
    }
    hasWeighted = true
    weighted += kg * qty * fee
  }

  if (!hasWeighted) return fee
  return Math.round(hasUnweighted ? weighted + fee : weighted)
}
