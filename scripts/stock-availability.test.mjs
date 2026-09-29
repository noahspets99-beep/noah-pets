import assert from 'node:assert/strict'
import { productStock } from '../src/lib/sellableStock.js'

function isProductInStock(product, variant = null) {
  if (!product) return false
  if (product.active === false || product.status === 'Draft') return false
  return productStock(product, variant) > 0
}

const birdLegRing = {
  name: 'Bird Leg Ring',
  active: true,
  status: 'Active',
  stock: 100,
  variants: [
    { id: 'a', label: 'Budgies Closed Ring', stock: 0, price: 35 },
    { id: 'b', label: 'Budgies Cut Ring', stock: 0, price: 35 },
  ],
}

assert.equal(productStock(birdLegRing), 100)
assert.equal(productStock(birdLegRing, birdLegRing.variants[0]), 100)
assert.equal(isProductInStock(birdLegRing), true)
assert.equal(isProductInStock(birdLegRing, birdLegRing.variants[0]), true)

assert.equal(productStock({ stock: '10', variants: [] }), 10)
assert.equal(isProductInStock({ stock: '10', active: true }), true)

assert.equal(productStock({ stock: 0, variants: [{ stock: 0 }] }), 0)
assert.equal(isProductInStock({ stock: 0, active: true }), false)
assert.equal(productStock({ stock: null }), 0)
assert.equal(productStock({ stock: undefined }), 0)
assert.equal(productStock({ stock: '' }), 0)
assert.equal(isProductInStock({ stock: null, inStock: true, active: true }), false)

const sized = {
  stock: 5,
  active: true,
  variants: [
    { id: 's', stock: 2 },
    { id: 'l', stock: 8 },
  ],
}
assert.equal(productStock(sized), 10)
assert.equal(productStock(sized, sized.variants[0]), 2)
assert.equal(isProductInStock(sized, sized.variants[1]), true)

assert.equal(
  isProductInStock({ stock: 25, inStock: false, active: true, status: 'Out of Stock' }),
  true,
)

console.log('stock availability ok')
