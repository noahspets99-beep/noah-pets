import assert from 'node:assert/strict'
import { shippingFeeForOrder } from '../src/lib/shippingFee.js'

const configured = { freeShippingMinOrder: 0, standardShippingFee: 69 }
assert.equal(shippingFeeForOrder(500, configured), 69)
assert.equal(shippingFeeForOrder(0, configured), 69)

const threshold = { freeShippingMinOrder: 1500, standardShippingFee: '69' }
assert.equal(shippingFeeForOrder(500, threshold), 69)
assert.equal(shippingFeeForOrder(1499, threshold), 69)
assert.equal(shippingFeeForOrder(1500, threshold), 0)
assert.equal(shippingFeeForOrder(1800, threshold), 0)

const afterDiscount = 1600 - 200
assert.equal(shippingFeeForOrder(afterDiscount, threshold), 69)
assert.equal(1600 - 200 + shippingFeeForOrder(afterDiscount, threshold), 1469)
assert.equal(1500 - 0 + shippingFeeForOrder(1500, threshold), 1500)

const fromSettingsPage = { freeDeliveryThreshold: 1000, deliveryFee: 80 }
assert.equal(shippingFeeForOrder(999, fromSettingsPage), 80)
assert.equal(shippingFeeForOrder(1000, fromSettingsPage), 0)

const rate = { freeShippingMinOrder: 0, standardShippingFee: 50 }
const line = (kg, quantity = 1) => [{ shippingWeight: kg, quantity }]
assert.equal(shippingFeeForOrder(200, rate, null, line(1)), 50)
assert.equal(shippingFeeForOrder(200, rate, null, line(2)), 100)
assert.equal(shippingFeeForOrder(200, rate, null, line(5)), 250)
assert.equal(shippingFeeForOrder(200, rate, null, line(null)), 50)
assert.equal(shippingFeeForOrder(200, rate, null, line('')), 50)
assert.equal(shippingFeeForOrder(200, rate, null, line(0)), 50)
assert.equal(shippingFeeForOrder(200, rate, null, line('abc')), 50)
assert.equal(shippingFeeForOrder(200, rate, null, line(-2)), 50)

const free = { freeShippingMinOrder: 999, standardShippingFee: 50 }
assert.equal(shippingFeeForOrder(999, free, null, line(5)), 0)
assert.equal(shippingFeeForOrder(998, free, null, line(5)), 250)

assert.equal(
  shippingFeeForOrder(200, rate, null, [
    { shippingWeight: '', quantity: 1 },
    { shippingWeight: null, quantity: 2 },
  ]),
  50,
)
assert.equal(
  shippingFeeForOrder(200, rate, null, [
    { shippingWeight: 2, quantity: 1 },
    { shippingWeight: '', quantity: 1 },
  ]),
  150,
)
assert.equal(shippingFeeForOrder(200, rate, null, line(2, 2)), 200)

console.log('shipping fee ok')
