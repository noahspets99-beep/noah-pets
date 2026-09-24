import express from 'express'
import cors from 'cors'
import {
  assertOrderAccess,
  createPendingOrder,
  getDb,
  getOrder,
  getOrderByRazorpayOrderId,
  initAdmin,
  markOrderPaid,
  resolveVerifiedUid,
  updateOrder,
} from './orders.js'
import {
  calculateTotals,
  lookupCouponDoc,
  resolveLineItem,
  resolveTaxRate,
  resolveShippingSettings,
} from './pricing.js'
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  getRazorpayCredentials,
  isSuccessfulPaymentStatus,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from './razorpayClient.js'
import { publicError, rupeesToPaise } from './util.js'

async function requireAuthenticatedUid(req) {
  const authUid = await resolveVerifiedUid(req)
  if (!authUid) {
    throw publicError(
      401,
      'unauthorized',
      'Sign in to continue with payment.',
    )
  }
  return authUid
}

async function attachRazorpayOrder(order) {
  if (order.paymentStatus === 'Paid') {
    throw publicError(409, 'already_paid', 'Order is already paid.')
  }
  if (order.status === 'Cancelled') {
    throw publicError(400, 'order_cancelled', 'Order has been cancelled.')
  }

  const { keyId } = getRazorpayCredentials()
  const amountPaise = rupeesToPaise(order.total)
  if (!Number.isInteger(amountPaise) || amountPaise < 100) {
    throw publicError(400, 'invalid_amount', 'Order amount is too low to charge.')
  }

  const rzpOrder = await createRazorpayOrder({
    amountPaise,
    currency: order.currency || 'INR',
    receipt: String(order.id).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40),
    notes: {
      internalOrderId: String(order.id),
    },
  })

  const razorpayAmountPaise = Number(rzpOrder.amount)
  const razorpayCurrency = String(rzpOrder.currency || 'INR').toUpperCase()

  if (
    !rzpOrder?.id ||
    !String(rzpOrder.id).startsWith('order_') ||
    !Number.isFinite(razorpayAmountPaise) ||
    !Number.isInteger(razorpayAmountPaise) ||
    razorpayAmountPaise !== amountPaise ||
    razorpayCurrency !== 'INR'
  ) {
    console.error('Razorpay order response validation failed', {
      hasId: Boolean(rzpOrder?.id),
      amountPaise,
      razorpayAmountPaise,
      currency: razorpayCurrency,
    })
    throw publicError(502, 'razorpay_create_failed', 'Invalid Razorpay order response.')
  }

  await updateOrder(order.id, {
    razorpayOrderId: rzpOrder.id,
    paymentProvider: 'razorpay',
    paymentStatus: 'Pending',
    paymentAmountPaise: razorpayAmountPaise,
  })

  console.log('[payments] create-order ok', {
    internalOrderId: order.id,
    razorpayOrderId: rzpOrder.id,
    amountPaise: razorpayAmountPaise,
    currency: razorpayCurrency,
    keyIdConfigured: Boolean(keyId),
    secretConfigured: true,
  })

  return {
    provider: 'razorpay',
    keyId,
    orderId: order.id,
    paymentOrderId: rzpOrder.id,
    razorpayOrderId: rzpOrder.id,
    amount: order.total,
    amountPaise: razorpayAmountPaise,
    currency: razorpayCurrency,
    status: rzpOrder.status || 'created',
  }
}

export function createApp() {
  initAdmin()

  const app = express()
  app.set('trust proxy', 1)

  app.use(
    cors({
      origin: true,
      methods: ['GET', 'POST', 'OPTIONS'],
    }),
  )

  // Webhook needs raw body for signature verification
  app.post(
    '/api/payments/razorpay/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      try {
        const signature = req.headers['x-razorpay-signature']
        const rawBody = Buffer.isBuffer(req.body)
          ? req.body
          : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}))

        verifyWebhookSignature(rawBody, signature)
        const event = JSON.parse(rawBody.toString('utf8'))
        await handleWebhookEvent(event)
        return res.status(200).json({ received: true })
      } catch (err) {
        return sendError(res, err)
      }
    },
  )

  app.use(express.json({ limit: '256kb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'noah-payments' })
  })

  /**
   * Create a pending ecommerce order. Amounts are calculated server-side.
   * Body: { items: [{ productId, variantId?, quantity }], customer, shippingAddress?, couponCode? }
   */
  app.post('/api/orders/pending', async (req, res) => {
    try {
      const { items, customer: rawCustomer, shippingAddress, couponCode } =
        req.body || {}
      if (!Array.isArray(items) || items.length === 0) {
        throw publicError(400, 'empty_cart', 'Cart is empty.')
      }
      const customer = {
        name: String(rawCustomer?.name || '').trim(),
        email: String(rawCustomer?.email || '').trim(),
        mobile: String(rawCustomer?.mobile || rawCustomer?.contact || '')
          .replace(/\D/g, '')
          .slice(-10),
        address: String(rawCustomer?.address || '').trim(),
        area: String(rawCustomer?.area || '').trim(),
        city: String(rawCustomer?.city || '').trim(),
        district: String(rawCustomer?.district || '').trim(),
        state: String(rawCustomer?.state || '').trim(),
        pincode: String(rawCustomer?.pincode || '').trim(),
      }
      if (!customer.name || !customer.email || customer.mobile.length !== 10) {
        throw publicError(400, 'invalid_customer', 'Customer details are required.')
      }

      const db = getDb()
      const lines = await Promise.all(
        items.slice(0, 50).map((raw) =>
          resolveLineItem(db, {
            productId: raw.productId || raw.id,
            variantId: raw.variantId || null,
            quantity: raw.quantity,
          }),
        ),
      )

      const couponDoc = await lookupCouponDoc(db, couponCode)
      const taxRate = await resolveTaxRate(db)
      const shippingSettings = await resolveShippingSettings(db)
      const totals = calculateTotals(lines, couponCode, couponDoc, {
        taxRate,
        ...shippingSettings,
      })
      if (totals.total < 1) {
        throw publicError(400, 'invalid_amount', 'Order total must be at least ₹1.')
      }

      const authHeader = req.headers.authorization || ''
      const writeIdToken = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : null
      const authUid = await requireAuthenticatedUid(req)
      const { order, accessToken } = await createPendingOrder({
        lineItems: lines,
        totals,
        customer,
        shippingAddress: shippingAddress || customer,
        customerId: authUid,
        writeIdToken,
      })

      return res.status(201).json({
        orderId: order.id,
        accessToken,
        amount: order.total,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        status: order.status,
      })
    } catch (err) {
      return sendError(res, err)
    }
  })

  /**
   * One-shot checkout start: price cart, create pending order, create Razorpay order.
   * Avoids a second round-trip before Checkout.js opens.
   */
  app.post('/api/checkout/razorpay', async (req, res) => {
    try {
      const { items, customer: rawCustomer, shippingAddress, couponCode } =
        req.body || {}
      if (!Array.isArray(items) || items.length === 0) {
        throw publicError(400, 'empty_cart', 'Cart is empty.')
      }
      const customer = {
        name: String(rawCustomer?.name || '').trim(),
        email: String(rawCustomer?.email || '').trim(),
        mobile: String(rawCustomer?.mobile || rawCustomer?.contact || '')
          .replace(/\D/g, '')
          .slice(-10),
        address: String(rawCustomer?.address || '').trim(),
        area: String(rawCustomer?.area || '').trim(),
        city: String(rawCustomer?.city || '').trim(),
        district: String(rawCustomer?.district || '').trim(),
        state: String(rawCustomer?.state || '').trim(),
        pincode: String(rawCustomer?.pincode || '').trim(),
      }
      if (!customer.name || !customer.email || customer.mobile.length !== 10) {
        throw publicError(400, 'invalid_customer', 'Customer details are required.')
      }

      const db = getDb()
      const lines = await Promise.all(
        items.slice(0, 50).map((raw) =>
          resolveLineItem(db, {
            productId: raw.productId || raw.id,
            variantId: raw.variantId || null,
            quantity: raw.quantity,
          }),
        ),
      )

      const couponDoc = await lookupCouponDoc(db, couponCode)
      const taxRate = await resolveTaxRate(db)
      const shippingSettings = await resolveShippingSettings(db)
      const totals = calculateTotals(lines, couponCode, couponDoc, {
        taxRate,
        ...shippingSettings,
      })
      if (totals.total < 1) {
        throw publicError(400, 'invalid_amount', 'Order total must be at least ₹1.')
      }

      const authHeader = req.headers.authorization || ''
      const writeIdToken = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : null
      const authUid = await requireAuthenticatedUid(req)
      const { order, accessToken } = await createPendingOrder({
        lineItems: lines,
        totals,
        customer,
        shippingAddress: shippingAddress || customer,
        customerId: authUid,
        writeIdToken,
      })

      const checkout = await attachRazorpayOrder(order)
      return res.status(201).json({
        ...checkout,
        orderId: order.id,
        accessToken,
        amount: order.total,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        status: order.status,
      })
    } catch (err) {
      return sendError(res, err)
    }
  })

  /**
   * Create Razorpay order from authoritative ecommerce order total.
   * Body: { orderId, accessToken }
   * Ignores any client-supplied amount.
   */
  app.post('/api/payments/razorpay/create-order', async (req, res) => {
    try {
      const { orderId, accessToken } = req.body || {}
      if (!orderId) {
        throw publicError(400, 'missing_order_id', 'Order ID is required.')
      }

      // Explicitly ignore amount/price/total from client if present
      const order = await getOrder(orderId)
      const authUid = await requireAuthenticatedUid(req)
      assertOrderAccess(order, accessToken, authUid)

      const checkout = await attachRazorpayOrder(order)
      return res.json(checkout)
    } catch (err) {
      return sendError(res, err)
    }
  })

  /**
   * Verify Razorpay checkout signature + payment status, then mark order Paid.
   */
  app.post('/api/payments/razorpay/verify', async (req, res) => {
    try {
      const {
        orderId,
        accessToken,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body || {}

      if (!orderId) {
        throw publicError(400, 'missing_order_id', 'Order ID is required.')
      }

      const order = await getOrder(orderId)
      const authUid = await requireAuthenticatedUid(req)
      assertOrderAccess(order, accessToken, authUid)
      const writeIdToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7).trim()
        : null

      verifyCheckoutSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      })

      if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
        throw publicError(400, 'order_mismatch', 'Razorpay order does not match this ecommerce order.')
      }

      const payment = await fetchRazorpayPayment(razorpay_payment_id)
      if (!isSuccessfulPaymentStatus(payment.status)) {
        throw publicError(400, 'payment_not_captured', 'Payment is not completed.')
      }

      if (payment.order_id && payment.order_id !== razorpay_order_id) {
        throw publicError(400, 'order_mismatch', 'Payment does not belong to this Razorpay order.')
      }

      const expectedPaise = rupeesToPaise(order.total)
      if (Number(payment.amount) !== expectedPaise) {
        throw publicError(400, 'amount_mismatch', 'Paid amount does not match the order total.')
      }

      const { order: paidOrder, alreadyPaid, persisted } = await markOrderPaid({
        orderId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentMethod: payment.method || null,
        amountPaise: expectedPaise,
        writeIdToken,
      })

      console.info('[payments] verify ok', {
        orderId: paidOrder.id,
        alreadyPaid: Boolean(alreadyPaid),
        firestorePersisted: persisted !== false,
      })

      return res.json({
        provider: 'razorpay',
        orderId: paidOrder.id,
        paymentId: razorpay_payment_id,
        paymentOrderId: razorpay_order_id,
        status: 'paid',
        alreadyPaid,
        persisted: persisted !== false,
        method: paidOrder.paymentMethod || payment.method || null,
        amount: paidOrder.total,
        currency: paidOrder.currency || 'INR',
        verifiedAt: paidOrder.verifiedAt,
        order: paidOrder,
      })
    } catch (err) {
      return sendError(res, err)
    }
  })

  app.get('/api/payments/razorpay/status/:paymentId', async (req, res) => {
    try {
      await requireAuthenticatedUid(req)
      const paymentId = req.params.paymentId
      if (!paymentId) {
        throw publicError(400, 'missing_payment_id', 'Payment ID is required.')
      }
      const payment = await fetchRazorpayPayment(paymentId)
      return res.json({
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method || null,
        orderId: payment.order_id || null,
        provider: 'razorpay',
        captured: Boolean(payment.captured),
      })
    } catch (err) {
      return sendError(res, err)
    }
  })

  app.get('/api/orders/:orderId', async (req, res) => {
    try {
      const order = await getOrder(req.params.orderId)
      const authUid = await resolveVerifiedUid(req)
      assertOrderAccess(
        order,
        req.query.accessToken || req.headers['x-order-access-token'],
        authUid,
      )
      const { accessTokenHash, ...safe } = order
      return res.json({ order: safe })
    } catch (err) {
      return sendError(res, err)
    }
  })

  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found', message: 'Not found.' })
  })

  return app
}

async function handleWebhookEvent(event) {
  const eventType = event?.event
  const paymentEntity = event?.payload?.payment?.entity
  if (!paymentEntity) return

  if (
    eventType === 'payment.captured' ||
    eventType === 'payment.authorized'
  ) {
    const razorpayPaymentId = paymentEntity.id
    const razorpayOrderId = paymentEntity.order_id
    const internalOrderId =
      paymentEntity.notes?.internalOrderId ||
      event?.payload?.order?.entity?.notes?.internalOrderId

    let order = internalOrderId ? await getOrder(internalOrderId) : null
    if (!order && razorpayOrderId) {
      order = await getOrderByRazorpayOrderId(razorpayOrderId)
    }
    if (!order) return
    if (order.paymentStatus === 'Paid') return

    if (!isSuccessfulPaymentStatus(paymentEntity.status) && !paymentEntity.captured) {
      return
    }

    const expectedPaise = rupeesToPaise(order.total)
    if (Number(paymentEntity.amount) !== expectedPaise) {
      console.error('Webhook amount mismatch for order', order.id)
      return
    }

    await markOrderPaid({
      orderId: order.id,
      razorpayOrderId,
      razorpayPaymentId,
      paymentMethod: paymentEntity.method || null,
      amountPaise: expectedPaise,
    })
  }
}

function sendError(res, err) {
  const status = err?.status || 500
  const code = err?.code || 'server_error'
  const message =
    err?.expose || status < 500
      ? err.message || 'Request failed.'
      : 'Something went wrong. Please try again.'

  if (status >= 400) {
    console.warn('Payments API', status, code, message)
  }
  if (status >= 500) {
    console.error('Payments API error', code, err?.message || err)
  }

  return res.status(status).json({ error: code, message })
}
