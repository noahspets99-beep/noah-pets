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
 * Placeholder for future Razorpay integration.
 * createPaymentOrder / verifyPayment MUST call a secure backend —
 * never expose Razorpay key_secret in the browser.
 */
export class RazorpayPaymentProvider extends PaymentProvider {
  constructor({ createOrderUrl, verifyUrl } = {}) {
    super()
    this.createOrderUrl = createOrderUrl || '/api/payments/razorpay/create-order'
    this.verifyUrl = verifyUrl || '/api/payments/razorpay/verify'
  }

  async createPaymentOrder(payload) {
    const res = await fetch(this.createOrderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Failed to create Razorpay order')
    return res.json()
  }

  async verifyPayment(payload) {
    const res = await fetch(this.verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Failed to verify Razorpay payment')
    return res.json()
  }

  async getPaymentStatus(paymentId) {
    const res = await fetch(`/api/payments/razorpay/status/${paymentId}`)
    if (!res.ok) throw new Error('Failed to fetch payment status')
    return res.json()
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
