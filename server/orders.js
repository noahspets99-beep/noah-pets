import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getApps,
  initializeApp,
  applicationDefault,
  cert,
} from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { lookupUidFromIdToken, writeFirestoreDocument } from './firestoreRest.js'
import {
  createOrderAccessToken,
  generateOrderId,
  hashToken,
  publicError,
  safeEqual,
} from './util.js'

let db = null
let adminReady = false
const memoryOrders = new Map()
const memoryPaymentsByRzpPayId = new Map()

function useMemoryStore() {
  // Never use in-memory orders on Vercel (multi-instance / cold starts).
  if (process.env.VERCEL) return false
  return process.env.PAYMENTS_STORE === 'memory'
}

function isServerRuntime() {
  return Boolean(
    process.env.VERCEL ||
      process.env.K_SERVICE ||
      process.env.FUNCTION_TARGET ||
      process.env.GAE_SERVICE ||
      process.env.CLOUD_RUN_JOB,
  )
}

function loadLocalServiceAccount() {
  const dir = dirname(fileURLToPath(import.meta.url))
  const candidates = [
    join(dir, 'serviceAccount.json'),
    join(dir, '..', 'serviceAccount.json'),
    join(dir, '..', 'functions', 'serviceAccount.json'),
    join(dir, '..', 'serviceAccountKey.json'),
  ]
  for (const file of candidates) {
    if (!existsSync(file)) continue
    try {
      return JSON.parse(readFileSync(file, 'utf8'))
    } catch (err) {
      console.warn('[payments] Could not parse', file, err?.message || err)
    }
  }
  return null
}

function hasExplicitCredentials() {
  return Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
      (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
      loadLocalServiceAccount(),
  )
}

function resolveProjectId(sa) {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    sa?.project_id ||
    'noahpets'
  )
}

function normalizePrivateKey(raw) {
  if (!raw) return ''
  let key = String(raw).trim()
  // Vercel env often stores newlines as literal \n
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1)
  }
  return key.replace(/\\n/g, '\n')
}

export function initAdmin() {
  if (adminReady) return db
  if (getApps().length) {
    if (isServerRuntime() || hasExplicitCredentials()) {
      try {
        db = getFirestore()
        adminReady = true
        return db
      } catch (err) {
        console.warn('[payments] Firestore unavailable:', err?.message || err)
        db = null
        adminReady = true
        return null
      }
    }
    adminReady = true
    db = null
    return null
  }

  try {
    const localSa = loadLocalServiceAccount()
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      const projectId = resolveProjectId(sa)
      initializeApp({
        credential: cert(sa),
        projectId,
      })
    } else if (localSa) {
      const projectId = resolveProjectId(localSa)
      initializeApp({
        credential: cert(localSa),
        projectId,
      })
    } else if (
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      const projectId = resolveProjectId()
      initializeApp({
        credential: cert({
          projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
        }),
        projectId,
      })
    } else if (hasExplicitCredentials() || isServerRuntime()) {
      const projectId = resolveProjectId()
      initializeApp({
        credential: applicationDefault(),
        projectId,
      })
    } else {
      console.info(
        '[payments] Firestore Admin SDK idle (no credentials). Local memory store / public REST only.',
      )
      adminReady = true
      db = null
      return null
    }
    db = getFirestore()
  } catch (err) {
    console.warn(
      '[payments] Firebase Admin init skipped:',
      err?.message || err,
    )
    db = null
  }
  adminReady = true
  return db
}

export function getDb() {
  return db
}

function bearerToken(req) {
  const header = req?.headers?.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : ''
}

export async function resolveVerifiedUid(req) {
  const token = bearerToken(req)
  if (!token) return null
  if (db) {
    try {
      const decoded = await getAuth().verifyIdToken(token)
      return decoded?.uid || null
    } catch {
      /* fall through to Identity Toolkit */
    }
  }
  return lookupUidFromIdToken(token)
}

function stripSecrets(order) {
  if (!order) return null
  const { accessTokenHash, _writeIdToken, ...safe } = order
  return safe
}

function isAlreadyExistsError(err) {
  const code = err?.code
  return (
    code === 6 ||
    code === 'already-exists' ||
    code === 'ALREADY_EXISTS' ||
    /ALREADY_EXISTS/i.test(String(err?.message || ''))
  )
}

export async function createPendingOrder({
  lineItems,
  totals,
  customer,
  shippingAddress,
  customerId = null,
  writeIdToken = null,
}) {
  const accessToken = createOrderAccessToken()
  const now = new Date().toISOString()
  const maxAttempts = 40

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const orderId = generateOrderId()
    if (memoryOrders.has(orderId)) continue

    const order = {
      id: orderId,
      customerId: customerId || null,
      customer: customer || null,
      shippingAddress: shippingAddress || customer || null,
      items: lineItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      currency: totals.currency,
      coupon: totals.coupon,
      status: 'Pending',
      paymentStatus: 'Pending',
      paymentProvider: null,
      razorpayOrderId: null,
      razorpayPaymentId: null,
      paymentMethod: null,
      paymentAmountPaise: null,
      verifiedAt: null,
      inventoryAdjusted: false,
      createdAt: now,
      updatedAt: now,
      accessTokenHash: hashToken(accessToken),
      _writeIdToken: writeIdToken || null,
      timeline: [
        { label: 'Pending', at: now, done: true },
        { label: 'Confirmed', at: null, done: false },
        { label: 'Delivered', at: null, done: false },
      ],
    }

    // Multi-instance (Vercel): persist pending so verify/webhook can load it.
    // Local memory store skips Firestore so Pay does not wait before Razorpay.
    if (useMemoryStore()) {
      memoryOrders.set(orderId, order)
      return { order: stripSecrets(order), accessToken }
    }

    if (!db) initAdmin()
    if (!db) {
      throw publicError(500, 'store_unavailable', 'Order store is unavailable.')
    }

    try {
      // create() fails if the doc already exists — safe under concurrent writers
      await db.collection('orders').doc(orderId).create(stripSecrets(order))
      memoryOrders.set(orderId, order)
      return { order: stripSecrets(order), accessToken }
    } catch (err) {
      if (isAlreadyExistsError(err)) continue
      throw err
    }
  }

  throw publicError(
    500,
    'order_id_exhausted',
    'Could not allocate a unique order ID. Please try again.',
  )
}

function omitUndefined(value) {
  if (Array.isArray(value)) return value.map(omitUndefined)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [key, nested] of Object.entries(value)) {
      if (nested === undefined) continue
      out[key] = omitUndefined(nested)
    }
    return out
  }
  return value
}

async function persistPaidOrder(order) {
  const payload = omitUndefined(stripSecrets(order))
  const orderId = order.id
  console.info('[payments] persist order', {
    collection: 'orders',
    orderId,
    paymentStatus: payload.paymentStatus,
    hasCustomerId: Boolean(payload.customerId),
    via: db ? 'admin-sdk' : 'firestore-rest',
  })

  if (db) {
    await db.collection('orders').doc(orderId).set(payload, { merge: true })
    console.info('[payments] persist order ok', { collection: 'orders', orderId })
    return true
  }

  const idToken = order._writeIdToken || null
  if (!idToken) {
    throw new Error(
      'Cannot write order to Firestore: signed-in customer token missing and Admin SDK is unavailable.',
    )
  }
  const uid = (await lookupUidFromIdToken(idToken)) || payload.customerId
  if (!uid) {
    throw new Error('Cannot write order to Firestore: customer uid could not be verified.')
  }

  const doc = {
    ...payload,
    customerId: uid,
    paymentStatus: 'Paid',
    // Fulfillment stays Pending until admin confirms (do not auto-promote)
    status: payload.status || 'Pending',
  }
  await writeFirestoreDocument({
    collectionName: 'orders',
    documentId: orderId,
    data: doc,
    idToken,
  })
  console.info('[payments] persist order ok', { collection: 'orders', orderId })
  return true
}

export async function getOrder(orderId) {
  if (!orderId) return null
  if (useMemoryStore()) {
    return memoryOrders.get(orderId) || null
  }
  if (!db) initAdmin()
  const snap = await db.collection('orders').doc(orderId).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() }
}

export async function getOrderByRazorpayOrderId(razorpayOrderId) {
  if (!razorpayOrderId) return null
  if (useMemoryStore()) {
    for (const order of memoryOrders.values()) {
      if (order.razorpayOrderId === razorpayOrderId) return order
    }
    return null
  }
  if (!db) initAdmin()
  if (!db) return null
  const snap = await db
    .collection('orders')
    .where('razorpayOrderId', '==', String(razorpayOrderId))
    .limit(1)
    .get()
  if (snap.empty) return null
  const doc = snap.docs[0]
  return { id: doc.id, ...doc.data() }
}

export function assertOrderAccess(order, accessToken, authUid) {
  if (!order) {
    throw publicError(404, 'order_not_found', 'Order does not exist.')
  }
  if (authUid && order.customerId && order.customerId === authUid) {
    return
  }
  if (!accessToken || !order.accessTokenHash) {
    throw publicError(403, 'forbidden', 'Not allowed to access this order.')
  }
  if (!safeEqual(order.accessTokenHash, hashToken(accessToken))) {
    throw publicError(403, 'forbidden', 'Not allowed to access this order.')
  }
}

export async function updateOrder(orderId, patch) {
  const updatedAt = new Date().toISOString()
  if (useMemoryStore()) {
    const current = memoryOrders.get(orderId)
    if (!current) throw publicError(404, 'order_not_found', 'Order does not exist.')
    const next = { ...current, ...patch, updatedAt }
    memoryOrders.set(orderId, next)
    if (db) {
      try {
        await db.collection('orders').doc(orderId).set({ ...patch, updatedAt }, { merge: true })
      } catch (err) {
        console.warn(
          '[payments] Firestore order update failed',
          err?.message || err,
        )
      }
    }
    return stripSecrets(next)
  }
  if (!db) initAdmin()
  await db.collection('orders').doc(orderId).set({ ...patch, updatedAt }, { merge: true })
  return stripSecrets(await getOrder(orderId))
}

/**
 * Idempotent mark-paid. Returns { order, alreadyPaid }.
 */
export async function markOrderPaid({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  paymentMethod,
  amountPaise,
  provider = 'razorpay',
  writeIdToken = null,
}) {
  if (useMemoryStore()) {
    const order = memoryOrders.get(orderId)
    if (!order) throw publicError(404, 'order_not_found', 'Order does not exist.')
    if (writeIdToken) order._writeIdToken = writeIdToken

    if (order.paymentStatus === 'Paid') {
      if (
        order.razorpayPaymentId &&
        order.razorpayPaymentId !== razorpayPaymentId
      ) {
        throw publicError(409, 'already_paid', 'Order is already paid.')
      }
      let persisted = true
      try {
        await persistPaidOrder(order)
      } catch (err) {
        persisted = false
        console.error(
          '[payments] Failed to persist paid order to Firestore',
          { orderId, details: err?.details || err?.message || err },
        )
      }
      return { order: stripSecrets(order), alreadyPaid: true, persisted }
    }

    if (
      order.razorpayOrderId &&
      razorpayOrderId &&
      order.razorpayOrderId !== razorpayOrderId
    ) {
      throw publicError(400, 'order_mismatch', 'Payment does not match this order.')
    }

    if (memoryPaymentsByRzpPayId.has(razorpayPaymentId)) {
      const existingOrderId = memoryPaymentsByRzpPayId.get(razorpayPaymentId)
      if (existingOrderId !== orderId) {
        throw publicError(409, 'payment_reuse', 'Payment already linked to another order.')
      }
      const existing = memoryOrders.get(existingOrderId) || order
      let persisted = true
      try {
        await persistPaidOrder(existing)
      } catch (err) {
        persisted = false
        console.error(
          '[payments] Failed to persist paid order to Firestore',
          { orderId, details: err?.details || err?.message || err },
        )
      }
      return { order: stripSecrets(existing), alreadyPaid: true, persisted }
    }

    const now = new Date().toISOString()
    const timeline = Array.isArray(order.timeline) ? [...order.timeline] : []
    // Keep fulfillment status Pending after successful payment; admin confirms later.
    const next = {
      ...order,
      status: order.status === 'Cancelled' ? 'Cancelled' : 'Pending',
      paymentStatus: 'Paid',
      paymentProvider: provider,
      razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
      razorpayPaymentId,
      paymentMethod: paymentMethod || order.paymentMethod || null,
      paymentAmountPaise: amountPaise ?? order.paymentAmountPaise,
      verifiedAt: now,
      inventoryAdjusted: true,
      timeline,
      updatedAt: now,
    }
    memoryOrders.set(orderId, next)
    memoryPaymentsByRzpPayId.set(razorpayPaymentId, orderId)
    let persisted = true
    try {
      await persistPaidOrder(next)
    } catch (err) {
      persisted = false
      console.error(
        '[payments] Failed to persist paid order to Firestore',
        { orderId, details: err?.details || err?.message || err },
      )
    }
    return { order: stripSecrets(next), alreadyPaid: false, persisted }
  }

  if (!db) initAdmin()

  return db.runTransaction(async (tx) => {
    const ref = db.collection('orders').doc(orderId)
    const snap = await tx.get(ref)
    if (!snap.exists) {
      throw publicError(404, 'order_not_found', 'Order does not exist.')
    }
    const order = { id: snap.id, ...snap.data() }

    const payRef = db.collection('payments').doc(razorpayPaymentId)
    const paySnap = await tx.get(payRef)

    if (order.paymentStatus === 'Paid') {
      if (
        order.razorpayPaymentId &&
        order.razorpayPaymentId !== razorpayPaymentId
      ) {
        throw publicError(409, 'already_paid', 'Order is already paid.')
      }
      return { order: stripSecrets(order), alreadyPaid: true, persisted: true }
    }

    if (
      order.razorpayOrderId &&
      razorpayOrderId &&
      order.razorpayOrderId !== razorpayOrderId
    ) {
      throw publicError(400, 'order_mismatch', 'Payment does not match this order.')
    }

    if (paySnap.exists) {
      const existing = paySnap.data()
      if (existing.internalOrderId !== orderId) {
        throw publicError(409, 'payment_reuse', 'Payment already linked to another order.')
      }
      return { order: stripSecrets(order), alreadyPaid: true, persisted: true }
    }

    const now = new Date().toISOString()
    const timeline = Array.isArray(order.timeline) ? [...order.timeline] : []

    const patch = {
      // Keep fulfillment Pending after payment; admin sets Confirmed/Delivered
      status: order.status === 'Cancelled' ? 'Cancelled' : 'Pending',
      paymentStatus: 'Paid',
      paymentProvider: provider,
      razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
      razorpayPaymentId,
      paymentMethod: paymentMethod || order.paymentMethod || null,
      paymentAmountPaise: amountPaise ?? order.paymentAmountPaise,
      verifiedAt: now,
      inventoryAdjusted: true,
      timeline,
      updatedAt: now,
    }

    if (!order.inventoryAdjusted) {
      await applyInventoryDeduction(tx, db, order.items)
    }

    tx.set(ref, patch, { merge: true })
    tx.set(payRef, {
      internalOrderId: orderId,
      razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
      razorpayPaymentId,
      paymentProvider: provider,
      paymentStatus: 'Paid',
      paymentMethod: paymentMethod || null,
      amount: order.total,
      amountPaise: amountPaise ?? rupeesToPaiseSafe(order.total),
      currency: order.currency || 'INR',
      verifiedAt: now,
      createdAt: now,
      customerId: order.customerId || null,
    })

    return {
      order: stripSecrets({ ...order, ...patch }),
      alreadyPaid: false,
      persisted: true,
    }
  })
}

function rupeesToPaiseSafe(rupees) {
  return Math.round(Number(rupees) * 100)
}

function stockStatusFromCount(stock, currentStatus) {
  let status = currentStatus
  if (stock <= 0 && status === 'Active') status = 'Out of Stock'
  if (stock > 0 && status === 'Out of Stock') status = 'Active'
  return status
}

/**
 * Atomic inventory decrement inside an existing Firestore transaction.
 * All product reads happen before writes. Never stores negative stock.
 * Uses existing `inventoryAdjusted` on the order to stay idempotent.
 */
async function applyInventoryDeduction(tx, db, items) {
  if (!Array.isArray(items) || items.length === 0) return

  const grouped = new Map()
  for (const item of items) {
    const id = String(item.id || item.productId || '')
    if (!id) continue
    const qty = Number.parseInt(String(item.quantity), 10)
    if (!Number.isInteger(qty) || qty < 1) {
      throw publicError(400, 'invalid_item', 'Invalid cart item.')
    }
    if (!grouped.has(id)) grouped.set(id, [])
    grouped.get(id).push({
      qty,
      variantId: item.variantId || null,
      name: item.name,
    })
  }

  const loaded = []
  for (const [id] of grouped) {
    const ref = db.collection('products').doc(id)
    const snap = await tx.get(ref)
    loaded.push({ id, ref, snap })
  }

  for (const { id, ref, snap } of loaded) {
    if (!snap.exists) {
      throw publicError(
        400,
        'product_not_found',
        'A product in this order is no longer available.',
      )
    }
    const data = snap.data() || {}
    let stock = Math.max(0, Number(data.stock) || 0)
    let variants = Array.isArray(data.variants)
      ? data.variants.map((v) => ({ ...v }))
      : []
    const lines = grouped.get(id)

    for (const { qty, variantId, name } of lines) {
      const label = name || data.name || id
      if (variantId && variants.length) {
        const idx = variants.findIndex((v) => v.id === variantId)
        if (idx < 0) {
          throw publicError(400, 'invalid_variant', 'Product variant not found.')
        }
        const vStock = Math.max(0, Number(variants[idx].stock) || 0)
        if (vStock < qty) {
          throw publicError(
            400,
            'insufficient_stock',
            `Insufficient stock for ${label}.`,
          )
        }
        variants[idx] = { ...variants[idx], stock: vStock - qty }
      } else if (stock < qty) {
        throw publicError(
          400,
          'insufficient_stock',
          `Insufficient stock for ${label}.`,
        )
      } else {
        stock -= qty
      }
    }

    if (variants.length) {
      stock = variants.reduce(
        (sum, v) => sum + Math.max(0, Number(v.stock) || 0),
        0,
      )
    }
    stock = Math.max(0, stock)

    const patch = {
      stock,
      status: stockStatusFromCount(stock, data.status),
      updatedAt: new Date().toISOString(),
    }
    if (variants.length) patch.variants = variants
    tx.set(ref, patch, { merge: true })
  }
}

export { FieldValue }
