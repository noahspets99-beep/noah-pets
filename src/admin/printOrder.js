import { STORE, formatStoreAddress } from '../config/store'
import { formatDateTime, formatINR } from './utils'

const PRINT_IFRAME_ID = 'noah-admin-print-frame'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatAddress(order) {
  const ship = order?.shippingAddress || {}
  const customer = order?.customer || {}
  const lines = [
    ship.line1 || ship.address || '',
    ship.line2 || ship.area || '',
    [ship.city, ship.district, ship.state, ship.pincode]
      .filter(Boolean)
      .join(', '),
  ].filter(Boolean)
  if (lines.length) return lines.map(escapeHtml).join('<br />')
  if (customer.address) return escapeHtml(customer.address)
  return '—'
}

function buildItemsRows(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<tr><td colspan="4" style="padding:10px;color:#666;">No items</td></tr>`
  }
  return items
    .map((item) => {
      const qty = Number(item.quantity) || 0
      const price = Number(item.price) || 0
      const name = escapeHtml(
        item.name ||
          item.productName ||
          item.title ||
          item.productId ||
          'Item',
      )
      const variant = item.variantLabel
        ? ` <span style="color:#666;font-size:12px;">(${escapeHtml(item.variantLabel)})</span>`
        : ''
      return `<tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${name}${variant}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${qty}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatINR(price))}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(formatINR(price * qty))}</td>
      </tr>`
    })
    .join('')
}

function buildPrintHtml(order) {
  const customer = order.customer || {}
  const items = Array.isArray(order.items) ? order.items : []
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  )
  const subtotal = Number(order.subtotal) || itemsSubtotal || 0
  const discount = Number(order.discount) || 0
  const shipping = Number(order.deliveryFee ?? order.shipping ?? 0) || 0
  const tax = Number(order.tax) || 0
  const total = Number(order.total) || 0
  const paymentStatus = order.paymentStatus || order.payment || '—'
  const paymentMethod = order.paymentMethod || order.paymentProvider || '—'
  const logoUrl = `${window.location.origin}/logo.jpeg`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Order ${escapeHtml(order.id)} — ${escapeHtml(STORE.name)}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Georgia, 'Times New Roman', serif;
      color: #111827;
      font-size: 13px;
      line-height: 1.45;
      background: #fff;
    }
    .sheet { max-width: 800px; margin: 0 auto; }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 2px solid #111827;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand img {
      width: 52px;
      height: 52px;
      object-fit: cover;
      border-radius: 8px;
    }
    .brand h1 { margin: 0; font-size: 22px; }
    .brand p { margin: 2px 0 0; color: #4b5563; font-size: 12px; }
    .meta { text-align: right; }
    .meta strong { font-size: 16px; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-bottom: 18px;
    }
    .card h2 {
      margin: 0 0 8px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #6b7280;
    }
    .card p { margin: 0 0 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    th {
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #6b7280;
      border-bottom: 1px solid #d1d5db;
      padding: 8px 10px;
      background: #f9fafb;
    }
    .totals {
      width: 280px;
      margin-left: auto;
      margin-top: 14px;
    }
    .totals .row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    .totals .row.total {
      border-top: 2px solid #111827;
      margin-top: 6px;
      padding-top: 8px;
      font-size: 15px;
      font-weight: 700;
    }
    .footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 11px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div class="brand">
        <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(STORE.name)}" onerror="this.style.display='none'" />
        <div>
          <h1>${escapeHtml(STORE.name)}</h1>
          <p>${escapeHtml(formatStoreAddress())}</p>
          <p>${escapeHtml(STORE.email)} · ${escapeHtml(STORE.phone)}</p>
        </div>
      </div>
      <div class="meta">
        <div><strong>Order ${escapeHtml(order.id)}</strong></div>
        <div>${escapeHtml(formatDateTime(order.createdAt))}</div>
        <div>Status: ${escapeHtml(order.status || '—')}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Customer</h2>
        <p><strong>${escapeHtml(customer.name || 'Customer')}</strong></p>
        <p>Phone: ${escapeHtml(customer.phone || customer.mobile || '—')}</p>
        <p>Email: ${escapeHtml(customer.email || '—')}</p>
      </div>
      <div class="card">
        <h2>Delivery address</h2>
        <p>${formatAddress(order)}</p>
      </div>
    </div>

    <div class="card">
      <h2>Ordered products</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Price</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemsRows(items)}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${escapeHtml(formatINR(subtotal))}</span></div>
      ${
        discount > 0
          ? `<div class="row"><span>Discount${order.coupon ? ` (${escapeHtml(order.coupon)})` : ''}</span><span>−${escapeHtml(formatINR(discount))}</span></div>`
          : ''
      }
      <div class="row"><span>Delivery</span><span>${shipping === 0 ? 'Free' : escapeHtml(formatINR(shipping))}</span></div>
      ${
        tax > 0
          ? `<div class="row"><span>Tax</span><span>${escapeHtml(formatINR(tax))}</span></div>`
          : ''
      }
      <div class="row total"><span>Total</span><span>${escapeHtml(formatINR(total))}</span></div>
    </div>

    <div class="grid" style="margin-top:22px;">
      <div class="card">
        <h2>Payment</h2>
        <p>Method: ${escapeHtml(paymentMethod)}</p>
        <p>Status: ${escapeHtml(paymentStatus)}</p>
      </div>
      <div class="card">
        <h2>Order status</h2>
        <p><strong>${escapeHtml(order.status || '—')}</strong></p>
      </div>
    </div>

    <div class="footer">
      Printed from ${escapeHtml(STORE.name)} Admin · ${escapeHtml(new Date().toLocaleString('en-IN'))}
    </div>
  </div>
</body>
</html>`
}

function getPrintIframe() {
  let iframe = document.getElementById(PRINT_IFRAME_ID)
  if (!iframe) {
    iframe = document.createElement('iframe')
    iframe.id = PRINT_IFRAME_ID
    iframe.setAttribute('title', 'Print order')
    iframe.setAttribute('aria-hidden', 'true')
    Object.assign(iframe.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '0',
      height: '0',
      border: '0',
      opacity: '0',
      pointerEvents: 'none',
    })
    document.body.appendChild(iframe)
  }
  return iframe
}

/**
 * Print a single admin order via a hidden iframe (no popup window).
 * Only that order's HTML is printed — Admin UI is never included.
 */
export function printAdminOrder(order) {
  if (!order?.id || typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const html = buildPrintHtml(order)
  const iframe = getPrintIframe()
  const doc = iframe.contentWindow?.document || iframe.contentDocument
  if (!doc || !iframe.contentWindow) {
    console.error('[printAdminOrder] Unable to access print frame')
    return
  }

  doc.open()
  doc.write(html)
  doc.close()

  const win = iframe.contentWindow
  const triggerPrint = () => {
    try {
      win.focus()
      win.print()
    } catch (err) {
      console.error('[printAdminOrder]', err)
    }
  }

  // Wait for document + images so the print dialog has full content
  if (doc.readyState === 'complete') {
    setTimeout(triggerPrint, 150)
  } else {
    iframe.onload = () => setTimeout(triggerPrint, 150)
  }
}
