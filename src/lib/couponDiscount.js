/** Shared coupon checks for the storefront and the payments API. */

function fail(code, message) {
  return { ok: false, code, message, discount: 0, eligibleSubtotal: 0 }
}

function asTextList(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      if (entry && typeof entry === 'object') {
        return String(entry.id || entry.slug || entry.name || '')
      }
      return String(entry ?? '')
    })
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function dayBound(value, end) {
  if (value == null || value === '') return null
  const text = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const stamp = Date.parse(
      end ? `${text}T23:59:59.999Z` : `${text}T00:00:00.000Z`,
    )
    return Number.isFinite(stamp) ? stamp : null
  }
  const stamp = Date.parse(text)
  return Number.isFinite(stamp) ? stamp : null
}

export function couponScope(coupon) {
  const applicability = String(coupon?.applicability || '').trim().toLowerCase()
  const categoryIds = asTextList(coupon?.categoryIds)
  const categorySlugs = asTextList(coupon?.categorySlugs).map((entry) =>
    entry.toLowerCase(),
  )
  const categoryNames = asTextList(coupon?.categoryNames).map((entry) =>
    entry.toLowerCase(),
  )
  const productIds = asTextList(coupon?.productIds)
  const hasLists =
    categoryIds.length > 0 ||
    categorySlugs.length > 0 ||
    categoryNames.length > 0 ||
    productIds.length > 0

  if (applicability === 'all' || (!applicability && !hasLists)) {
    return { mode: 'all' }
  }

  return {
    mode: 'restricted',
    applicability,
    categoryIds,
    categorySlugs,
    categoryNames,
    productIds,
  }
}

export function lineEligible(line, coupon) {
  const scope = couponScope(coupon)
  if (scope.mode === 'all') return true

  const productId = String(line?.id || line?.productId || '')
  const categoryId = String(line?.categoryId || '')
  const slug = String(line?.categorySlug || '').trim().toLowerCase()
  const name = String(line?.category || '').trim().toLowerCase()
  const productHit = Boolean(productId) && scope.productIds.includes(productId)
  const categoryHit =
    (categoryId && scope.categoryIds.includes(categoryId)) ||
    (slug && scope.categorySlugs.includes(slug)) ||
    (name && scope.categoryNames.includes(name))

  if (scope.applicability === 'products') return productHit
  if (scope.applicability === 'categories') return categoryHit
  return productHit || categoryHit
}

export function eligibleSubtotal(lines, coupon) {
  return (Array.isArray(lines) ? lines : []).reduce((sum, line) => {
    const total = Number(line?.lineTotal)
    if (!Number.isFinite(total) || total <= 0) return sum
    if (!lineEligible(line, coupon)) return sum
    return sum + total
  }, 0)
}

/**
 * Validate a coupon against the current cart.
 * Minimum order uses the full cart subtotal. The discount uses only eligible lines.
 * A missing applicability field means the whole cart, so older coupons stay valid.
 */
export function evaluateCoupon(coupon, lines, cartSubtotal, now = Date.now()) {
  if (!coupon) return fail('invalid_coupon', 'Invalid coupon code.')

  const status = String(coupon.status || '').trim().toLowerCase()
  if (coupon.active === false || (status && status !== 'active')) {
    return fail('invalid_coupon', 'Invalid coupon code.')
  }

  const start = dayBound(coupon.startDate || coupon.startsAt || coupon.validFrom, false)
  if (start != null && now < start) {
    return fail('coupon_not_started', 'This coupon is not active yet.')
  }

  const end = dayBound(
    coupon.endDate || coupon.expiresAt || coupon.validUntil,
    true,
  )
  if (end != null && now > end) {
    return fail('coupon_expired', 'This coupon has expired.')
  }

  const usageLimit = Number(coupon.usageLimit ?? coupon.maxUses ?? 0)
  const usedCount = Number(
    coupon.used ?? coupon.usedCount ?? coupon.usageCount ?? 0,
  )
  if (usageLimit > 0 && usedCount >= usageLimit) {
    return fail('coupon_exhausted', 'This coupon is no longer available.')
  }

  const subtotal = Math.max(0, Number(cartSubtotal) || 0)
  if (subtotal <= 0) return fail('empty_cart', 'Your cart is empty.')

  const minOrder = Number(coupon.minOrder ?? coupon.minOrderAmount ?? coupon.minimumOrder ?? 0)
  if (Number.isFinite(minOrder) && minOrder > 0 && subtotal < minOrder) {
    return fail(
      'coupon_min_order',
      `Minimum order ₹${minOrder} required`,
    )
  }

  const eligible = eligibleSubtotal(lines, coupon)
  if (eligible <= 0) {
    return fail(
      'coupon_not_applicable',
      'This coupon does not apply to the items in your cart.',
    )
  }

  const type = String(coupon.type || coupon.discountType || '').toLowerCase()
  const rawValue = Number(coupon.value ?? coupon.amount ?? coupon.discount ?? 0)
  const value = Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 0
  let discount = 0
  if (type.includes('percent') || type === '%') {
    discount = Math.round((eligible * value) / 100)
    const max = Number(coupon.maxDiscount ?? coupon.maximumDiscount ?? 0)
    if (Number.isFinite(max) && max > 0) discount = Math.min(discount, max)
  } else {
    discount = value
  }
  discount = Math.min(Math.max(0, discount), eligible)

  return { ok: true, code: 'ok', message: '', discount, eligibleSubtotal: eligible }
}
