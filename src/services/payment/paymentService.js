import {
  DemoPaymentProvider,
  RazorpayPaymentProvider,
} from './paymentProvider'

const PROVIDER =
  import.meta.env.VITE_PAYMENT_PROVIDER === 'razorpay'
    ? new RazorpayPaymentProvider({
        createOrderUrl: import.meta.env.VITE_PAYMENT_CREATE_ORDER_URL,
        verifyUrl: import.meta.env.VITE_PAYMENT_VERIFY_URL,
      })
    : new DemoPaymentProvider()

export async function createPaymentOrder(payload) {
  return PROVIDER.createPaymentOrder(payload)
}

export async function verifyPayment(payload) {
  return PROVIDER.verifyPayment(payload)
}

export async function getPaymentStatus(paymentId) {
  return PROVIDER.getPaymentStatus(paymentId)
}

export function getActivePaymentProviderName() {
  return import.meta.env.VITE_PAYMENT_PROVIDER === 'razorpay'
    ? 'razorpay'
    : 'demo'
}

export const paymentService = {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  getActivePaymentProviderName,
}

export default paymentService
