/**
 * Checkout payment switch.
 * 'manual_whatsapp' — Place Order opens WhatsApp from the cart. No order API.
 * 'razorpay' — Place Order uses the existing Razorpay checkout.
 */
export const CHECKOUT_PAYMENT_MODE = 'manual_whatsapp'

export function isManualWhatsAppCheckout() {
  return CHECKOUT_PAYMENT_MODE === 'manual_whatsapp'
}
