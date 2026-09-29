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

console.log('shipping fee ok')
