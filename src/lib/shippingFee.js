/** A configured amount, including 0. Blank and non-numeric values are unset. */
export function readMoney(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return null
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
 */
export function shippingFeeForOrder(eligibleSubtotal, settings, fallback) {
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
  return fee
}
