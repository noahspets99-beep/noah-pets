const WHATSAPP_E164 = '919710101045'
const SENT_PREFIX = 'noah_wa_order_'

function money(amount) {
  const n = Number(amount) || 0
  return `₹${n.toLocaleString('en-IN')}`
}

function addressOf(order) {
  return order?.shippingAddress || order?.customer || {}
}

function customerOf(order) {
  return order?.customer || order?.shippingAddress || {}
}

function formatIndianPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  const local = digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits
  if (local.length !== 10) return local ? `+91 ${local}` : ''
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`
}

function isManualOrder(order) {
  const method = String(
    order?.paymentMethod || order?.payment?.method || order?.payment?.provider || '',
  )
  return method === 'manual_whatsapp' || method === 'Manual / WhatsApp Order'
}

export function buildOrderWhatsAppMessage(order) {
  const address = addressOf(order)
  const customer = customerOf(order)
  const name = customer.name || address.name || ''
  const phone = formatIndianPhone(
    customer.mobile || customer.phone || address.mobile || '',
  )
  const items = Array.isArray(order?.items) ? order.items : []
  const lines = items.map((item, index) => {
    const qty = Number(item.quantity) || 1
    const unit = Number(item.price) || 0
    const line = Number(item.lineTotal) || unit * qty
    const label = item.name || item.productName || 'Item'
    const variant = item.variantLabel ? ` (${item.variantLabel})` : ''
    return [
      `${index + 1}. ${label}${variant}`,
      `   Qty: ${qty}`,
      `   Price: ${money(unit)}`,
      `   Total: ${money(line)}`,
    ].join('\n')
  })
  const subtotal = order?.subtotal
  const shipping = Number(order?.shipping) || 0
  const discount = Number(order?.discount) || 0
  const tax = Number(order?.tax) || 0
  const total = order?.total
  const manual = isManualOrder(order)

  const parts = [
    '🛒 NEW ORDER',
    '',
    `Order ID: ${order?.id || ''}`,
    '',
    'CUSTOMER',
    `Name: ${name}`,
    phone ? `Phone: ${phone}` : '',
    '',
    'DELIVERY ADDRESS',
    `House/Flat: ${address.address || address.line1 || ''}`,
    `Street/Area: ${address.area || address.line2 || ''}`,
    address.landmark ? `Landmark: ${address.landmark}` : '',
    `City: ${address.city || ''}`,
    `State: ${address.state || ''}`,
    `Pincode: ${address.pincode || ''}`,
    `Country: ${address.country || 'India'}`,
    '',
    'ORDER ITEMS',
    '',
    lines.join('\n\n') || '—',
    '',
    `Subtotal: ${money(subtotal)}`,
    `Delivery: ${shipping === 0 ? 'Free' : money(shipping)}`,
    discount > 0 ? `Discount: ${money(discount)}` : '',
    tax > 0 ? `Tax: ${money(tax)}` : '',
    '',
    `TOTAL: ${money(total)}`,
    '',
  ]

  if (manual) {
    parts.push(
      'Payment: To be collected manually',
      'Order Type: WhatsApp Order',
      '',
      'Please confirm this order.',
    )
  } else {
    const method =
      order?.payment?.method ||
      order?.paymentMethod ||
      order?.payment?.provider ||
      order?.paymentProvider ||
      ''
    const status = order?.paymentStatus || ''
    if (method) parts.push(`Payment Method: ${method}`)
    if (status) parts.push(`Payment Status: ${status}`)
  }

  return parts.filter((line) => line !== '').join('\n')
}

export function orderWhatsAppUrl(order) {
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(buildOrderWhatsAppMessage(order))}`
}

/** Opens WhatsApp once per order id. The customer still has to press Send. */
export function openOrderWhatsApp(order, existingWindow) {
  const id = String(order?.id || '').trim()
  if (!id || typeof window === 'undefined') return false
  const key = `${SENT_PREFIX}${id}`
  try {
    if (sessionStorage.getItem(key)) {
      existingWindow?.close?.()
      return false
    }
    sessionStorage.setItem(key, '1')
  } catch {
    /* still open once for this call */
  }
  const url = orderWhatsAppUrl(order)
  if (existingWindow && !existingWindow.closed) {
    existingWindow.location.href = url
    return true
  }
  const opened = window.open(url, '_blank')
  if (!opened) window.location.href = url
  return true
}
