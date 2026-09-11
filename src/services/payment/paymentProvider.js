/**
 * Payment provider interface.
 * Swap DemoPaymentProvider for RazorpayPaymentProvider without rewriting checkout.
 */
export class PaymentProvider {
  async createPaymentOrder() {
    throw new Error('createPaymentOrder not implemented')
  }

  async verifyPayment() {
    throw new Error('verifyPayment not implemented')
  }

  async getPaymentStatus() {
    throw new Error('getPaymentStatus not implemented')
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function readJson(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`
    const err = new Error(message)
    err.code = data?.error
    err.status = res.status
    throw err
  }
  return data
}

/**
 * Demo provider — simulates a successful card/UPI payment.
 * Never put Razorpay secret keys in the frontend.
 */
export class DemoPaymentProvider extends PaymentProvider {
  async createPaymentOrder({ amount, currency = 'INR', orderId, customer }) {
    await wait(400)
    return {
      provider: 'demo',
      paymentOrderId: `demo_po_${Date.now()}`,
      amount,
      currency,
      orderId,
      customer,
      status: 'created',
    }
  }

  async verifyPayment({ paymentOrderId, orderId }) {
    await wait(600)
    return {
      provider: 'demo',
      paymentId: `demo_pay_${Date.now()}`,
      paymentOrderId,
      orderId,
      status: 'paid',
      method: 'demo',
      verifiedAt: new Date().toISOString(),
    }
  }

  async getPaymentStatus(paymentId) {
    return {
      paymentId,
      status: paymentId?.startsWith('demo_') ? 'paid' : 'unknown',
      provider: 'demo',
    }
  }
}

/**
 * Razorpay provider — talks ONLY to backend endpoints.
 * key_secret must never appear in the browser.
 */
export class RazorpayPaymentProvider extends PaymentProvider {
  constructor({ createOrderUrl, verifyUrl, statusUrl } = {}) {
    super()
    this.createOrderUrl =
      createOrderUrl || '/api/payments/razorpay/create-order'
    this.verifyUrl = verifyUrl || '/api/payments/razorpay/verify'
    this.statusUrl = statusUrl || '/api/payments/razorpay/status'
  }

  async createPaymentOrder(payload) {
    // Only send order identity — never rely on client amount for charging
    const headers = { 'Content-Type': 'application/json' }
    if (payload.idToken) {
      headers.Authorization = `Bearer ${payload.idToken}`
    }
    const res = await fetch(this.createOrderUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        orderId: payload.orderId,
        accessToken: payload.accessToken,
      }),
    })
    return readJson(res)
  }

  async verifyPayment(payload) {
    const headers = { 'Content-Type': 'application/json' }
    if (payload.idToken) {
      headers.Authorization = `Bearer ${payload.idToken}`
    }
    const res = await fetch(this.verifyUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        orderId: payload.orderId,
        accessToken: payload.accessToken,
        razorpay_order_id: payload.razorpay_order_id,
        razorpay_payment_id: payload.razorpay_payment_id,
        razorpay_signature: payload.razorpay_signature,
      }),
    })
    return readJson(res)
  }

  async getPaymentStatus(paymentId) {
    const res = await fetch(
      `${this.statusUrl}/${encodeURIComponent(paymentId)}`,
    )
    return readJson(res)
  }
}
