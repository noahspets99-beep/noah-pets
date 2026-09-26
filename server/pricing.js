import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { publicError } from './util.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const catalogPrices = JSON.parse(
  readFileSync(join(__dirname, 'catalogPrices.json'), 'utf8'),
)

const FREE_SHIPPING_MIN = 999
const STANDARD_SHIPPING_FEE = 49
/** Fallback only when Firestore taxSettings is unavailable — never invent a positive rate */
const DEFAULT_TAX_RATE = 0

let taxRateCache = { at: 0, rate: DEFAULT_TAX_RATE }
let shippingCache = {
  at: 0,
  freeShippingMinOrder: FREE_SHIPPING_MIN,
  standardShippingFee: STANDARD_SHIPPING_FEE,
}

function firestoreProjectId() {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    'noahpets'
  )
}

function firestoreWebApiKey() {
  return (
    process.env.FIREBASE_WEB_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    process.env.VITE_FIREBASE_API_KEY ||
    ''
  )
}

function withApiKey(url) {
  const key = firestoreWebApiKey()
  if (!key) return url
  return `${url}${url.includes('?') ? '&' : '?'}key=${encodeURIComponent(key)}`
}

function decodeFirestoreValue(value) {
  if (!value || typeof value !== 'object') return undefined
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('booleanValue' in value) return value.booleanValue
  if ('nullValue' in value) return null
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(decodeFirestoreValue)
  }
  if ('mapValue' in value) {
    const fields = value.mapValue.fields || {}
    const out = {}
    for (const [key, nested] of Object.entries(fields)) {
      out[key] = decodeFirestoreValue(nested)
    }
    return out
  }
  return undefined
}

function decodeFirestoreDocument(json) {
  const fields = json?.fields
  if (!fields) return null
  const data = {}
  for (const [key, value] of Object.entries(fields)) {
    data[key] = decodeFirestoreValue(value)
  }
  return data
}

const productCache = new Map()

/** Public product read via Firestore REST when Admin SDK is unavailable. */
async function fetchPublicProduct(productId) {
  const cached = productCache.get(productId)
  if (cached && Date.now() - cached.at < 60_000) return cached.data
  const projectId = firestoreProjectId()
  const url = withApiKey(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${encodeURIComponent(productId)}`,
  )
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const data = decodeFirestoreDocument(json)
    productCache.set(productId, { at: Date.now(), data })
    return data
  } catch (err) {
    console.warn('[payments] Public product lookup failed', err?.message || err)
    return null
  }
}

async function fetchPublicCouponByCode(code) {
  const projectId = firestoreProjectId()
  const url = withApiKey(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
  )
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'coupons' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'code' },
              op: 'EQUAL',
              value: { stringValue: code },
            },
          },
          limit: 1,
        },
      }),
    })
    if (!res.ok) return null
    const rows = await res.json()
    const document = Array.isArray(rows)
      ? rows.find((row) => row.document)?.document
      : null
    return decodeFirestoreDocument(document)
  } catch (err) {
    console.warn('[payments] Public coupon lookup failed', err?.message || err)
    return null
  }
}

export async function lookupCouponDoc(db, couponCode) {
  if (!couponCode) return null
  const code = String(couponCode).trim().toUpperCase()
  // Always prefer Firestore (Admin source of truth). Never hardcode discounts
  // that could override Admin coupon edits.
  if (db) {
    try {
      const snap = await db
        .collection('coupons')
        .where('code', '==', code)
        .limit(1)
        .get()
      if (!snap.empty) return snap.docs[0].data()
    } catch (err) {
      console.warn('[payments] Admin coupon lookup failed', err?.message || err)
    }
  }
  return fetchPublicCouponByCode(code)
}

async function fetchPublicTaxSettings() {
  const projectId = firestoreProjectId()
  const url = withApiKey(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/taxSettings/default`,
  )
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return decodeFirestoreDocument(await res.json())
  } catch (err) {
    console.warn('[payments] Public taxSettings lookup failed', err?.message || err)
    return null
  }
}

async function fetchPublicShippingSettings() {
  const projectId = firestoreProjectId()
  const url = withApiKey(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/shippingSettings/default`,
  )
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return decodeFirestoreDocument(await res.json())
  } catch (err) {
    console.warn('[payments] Public shippingSettings lookup failed', err?.message || err)
    return null
  }
}

/**
 * Resolve Admin-configured shipping fees from Firestore shippingSettings/default.
 */
export async function resolveShippingSettings(db) {
  if (shippingCache.at && Date.now() - shippingCache.at < 5_000) {
    return {
      freeShippingMinOrder: shippingCache.freeShippingMinOrder,
      standardShippingFee: shippingCache.standardShippingFee,
    }
  }
  let freeShippingMinOrder = FREE_SHIPPING_MIN
  let standardShippingFee = STANDARD_SHIPPING_FEE
  let data = null
  if (db) {
    try {
      const snap = await db.collection('shippingSettings').doc('default').get()
      if (snap.exists) data = snap.data()
    } catch (err) {
      console.warn('[payments] Admin shippingSettings lookup failed', err?.message || err)
      data = await fetchPublicShippingSettings()
    }
  } else {
    data = await fetchPublicShippingSettings()
  }
  if (data) {
    const free = Number(data.freeShippingMinOrder)
    const fee = Number(data.standardShippingFee)
    if (Number.isFinite(free) && free >= 0) freeShippingMinOrder = free
    if (Number.isFinite(fee) && fee >= 0) standardShippingFee = fee
  }
  shippingCache = {
    at: Date.now(),
    freeShippingMinOrder,
    standardShippingFee,
  }
  return { freeShippingMinOrder, standardShippingFee }
}

/**
 * Resolve Admin-configured default tax % from Firestore taxSettings/default.
 * Returns 0 when unset / missing / invalid.
 */
export async function resolveTaxRate(db) {
  if (taxRateCache.at && Date.now() - taxRateCache.at < 5_000) {
    return taxRateCache.rate
  }
  let rate = DEFAULT_TAX_RATE
  if (db) {
    try {
      const snap = await db.collection('taxSettings').doc('default').get()
      if (snap.exists) {
        rate = Number(snap.data()?.defaultRate) || 0
      }
    } catch (err) {
      console.warn('[payments] Admin taxSettings lookup failed', err?.message || err)
      const publicDoc = await fetchPublicTaxSettings()
      if (publicDoc) rate = Number(publicDoc.defaultRate) || 0
    }
  } else {
    const publicDoc = await fetchPublicTaxSettings()
    if (publicDoc) rate = Number(publicDoc.defaultRate) || 0
  }
  if (!Number.isFinite(rate) || rate < 0) rate = 0
  taxRateCache = { at: Date.now(), rate }
  return rate
}

/**
 * Resolve unit price from Firestore product doc or local catalog snapshot.
 * Never trusts browser-supplied prices.
 */
export async function resolveLineItem(db, { productId, variantId, quantity }) {
  const qty = Number.parseInt(String(quantity), 10)
  if (!productId || !Number.isInteger(qty) || qty < 1 || qty > 99) {
    throw publicError(400, 'invalid_item', 'Invalid cart item.')
  }

  let name
  let unitPrice
  let variantLabel = null
  let stock = null

  let data = null
  if (db) {
    try {
      const snap = await db.collection('products').doc(String(productId)).get()
      if (snap.exists) data = snap.data()
    } catch (err) {
      console.warn('[payments] Admin product lookup failed', err?.message || err)
    }
  }
  if (!data) {
    data = await fetchPublicProduct(String(productId))
  }

  if (data) {
    name = data.name
    if (variantId && Array.isArray(data.variants)) {
      const variant = data.variants.find((v) => v.id === variantId)
      if (!variant) {
        throw publicError(400, 'invalid_variant', 'Product variant not found.')
      }
      unitPrice = Number(variant.price)
      variantLabel = variant.label || variant.weight || null
      stock = variant.stock
    } else {
      unitPrice = Number(data.price)
      stock = data.stock
    }
  }

  if (unitPrice == null || Number.isNaN(unitPrice)) {
    const catalog = catalogPrices[String(productId)]
    if (!catalog) {
      throw publicError(400, 'product_not_found', 'One or more products were not found.')
    }
    name = catalog.name
    if (variantId) {
      const variant = catalog.variants?.[variantId]
      if (!variant) {
        throw publicError(400, 'invalid_variant', 'Product variant not found.')
      }
      unitPrice = Number(variant.price)
      variantLabel = variant.label || null
      stock = variant.stock
    } else {
      unitPrice = Number(catalog.price)
    }
  }

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw publicError(400, 'invalid_price', 'Unable to price order items.')
  }

  if (stock != null && Number(stock) < qty) {
    throw publicError(400, 'insufficient_stock', `Insufficient stock for ${name}.`)
  }

  return {
    id: String(productId),
    variantId: variantId || null,
    variantLabel,
    name,
    quantity: qty,
    price: unitPrice,
    lineTotal: unitPrice * qty,
  }
}

export function calculateTotals(lineItems, couponCode, couponDoc = null, options = {}) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
  let discount = 0
  let appliedCoupon = null

  if (couponCode) {
    const code = String(couponCode).trim().toUpperCase()
    const coupon = couponDoc || null
    if (!coupon || (coupon.status && coupon.status !== 'Active') || coupon.active === false) {
      throw publicError(400, 'invalid_coupon', 'Invalid coupon code.')
    }
    const endDate = coupon.endDate || coupon.expiresAt || coupon.validUntil
    if (endDate) {
      const end = new Date(endDate)
      if (!Number.isNaN(end.getTime()) && end.getTime() < Date.now()) {
        throw publicError(400, 'coupon_expired', 'This coupon has expired.')
      }
    }
    const usageLimit = Number(coupon.usageLimit ?? coupon.maxUses ?? 0)
    const usedCount = Number(
      coupon.used ?? coupon.usedCount ?? coupon.usageCount ?? 0,
    )
    if (usageLimit > 0 && usedCount >= usageLimit) {
      throw publicError(400, 'coupon_exhausted', 'This coupon is no longer available.')
    }
    const minOrder = Number(coupon.minOrder ?? coupon.minOrderAmount ?? 0)
    if (subtotal < minOrder) {
      throw publicError(
        400,
        'coupon_min_order',
        `Coupon requires a minimum order of ₹${minOrder}.`,
      )
    }
    const type = String(coupon.type || '')
    const value = Number(coupon.value) || 0
    const maxDiscount = Number(coupon.maxDiscount) || 0
    if (type === 'Percentage' || type === 'percent') {
      discount = Math.round((subtotal * value) / 100)
      if (maxDiscount > 0) {
        discount = Math.min(discount, maxDiscount)
      }
    } else {
      discount = Math.min(value, subtotal)
    }
    appliedCoupon = code
  }

  const taxable = Math.max(0, subtotal - discount)
  const freeMin =
    Number(options.freeShippingMinOrder) >= 0
      ? Number(options.freeShippingMinOrder)
      : FREE_SHIPPING_MIN
  const shipFee =
    Number(options.standardShippingFee) >= 0
      ? Number(options.standardShippingFee)
      : STANDARD_SHIPPING_FEE
  const shipping = taxable >= freeMin ? 0 : shipFee
  const taxRate = Number(options.taxRate)
  const safeRate =
    Number.isFinite(taxRate) && taxRate > 0 ? taxRate : DEFAULT_TAX_RATE
  const tax = Math.round((taxable * safeRate) / 100)
  const total = Math.max(0, taxable + shipping + tax)

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    coupon: appliedCoupon,
    currency: 'INR',
  }
}
