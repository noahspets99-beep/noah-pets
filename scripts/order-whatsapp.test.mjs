import assert from 'node:assert/strict'
import { buildOrderWhatsAppMessage, orderWhatsAppUrl } from '../src/lib/orderWhatsApp.js'

const message = buildOrderWhatsAppMessage({
  id: '583214',
  paymentMethod: 'manual_whatsapp',
  paymentStatus: 'Pending',
  status: 'Pending',
  customer: { name: 'John Mathew', mobile: '9876543210' },
  shippingAddress: {
    address: '12A',
    area: 'Main Road',
    landmark: 'Near Bus Stand',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',
  },
  items: [
    { name: 'Product A', quantity: 2, price: 500, lineTotal: 1000 },
    { name: 'Product B', quantity: 1, price: 300, lineTotal: 300 },
  ],
  subtotal: 1300,
  shipping: 50,
  discount: 100,
  total: 1250,
})

assert.match(message, /NEW ORDER/)
assert.match(message, /Order ID: 583214/)
assert.match(message, /Name: John Mathew/)
assert.match(message, /Phone: \+91 98765 43210/)
assert.match(message, /House\/Flat: 12A/)
assert.match(message, /Street\/Area: Main Road/)
assert.match(message, /Landmark: Near Bus Stand/)
assert.match(message, /City: Mumbai/)
assert.match(message, /State: Maharashtra/)
assert.match(message, /Pincode: 400001/)
assert.match(message, /Country: India/)
assert.match(message, /1\. Product A/)
assert.match(message, /Qty: 2/)
assert.match(message, /Price: ₹500/)
assert.match(message, /Total: ₹1,000/)
assert.match(message, /2\. Product B/)
assert.match(message, /Qty: 1/)
assert.match(message, /Subtotal: ₹1,300/)
assert.match(message, /Delivery: ₹50/)
assert.match(message, /Discount: ₹100/)
assert.match(message, /TOTAL: ₹1,250/)
assert.match(message, /Payment: To be collected manually/)
assert.match(message, /Order Type: WhatsApp Order/)
assert.match(message, /Please confirm this order\./)
assert.doesNotMatch(message, /Chennai/)
assert.doesNotMatch(message, /Successful/)

const url = orderWhatsAppUrl({
  id: '583214',
  paymentMethod: 'manual_whatsapp',
  customer: { name: 'John Mathew', mobile: '9876543210' },
  shippingAddress: { city: 'Mumbai', country: 'India' },
  items: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
})
assert.match(url, /^https:\/\/wa\.me\/919710101045\?text=/)
assert.match(decodeURIComponent(url.split('text=')[1]), /Order ID: 583214/)

console.log('whatsapp message ok')
