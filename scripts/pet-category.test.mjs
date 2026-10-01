import assert from 'node:assert/strict'
import { isPetLabel, normalizePetType, productMatchesPet } from '../src/lib/petType.js'
import { countProductsByCategory, getProductsForCategory } from '../src/lib/categoryProducts.js'
import { sellingPrice } from '../src/lib/sellableStock.js'

assert.equal(normalizePetType('Dog'), 'Dogs')
assert.equal(normalizePetType('cat'), 'Cats')
assert.equal(normalizePetType('Rabbit'), 'Small Pets')
assert.equal(normalizePetType('Other'), 'Other')
assert.equal(isPetLabel('Dogs'), true)
assert.equal(isPetLabel('Dog Food'), false)
assert.equal(productMatchesPet({ petType: 'Dog' }, 'Dogs'), true)
assert.equal(productMatchesPet({ petType: 'Cats' }, 'Dogs'), false)

assert.equal(sellingPrice({ price: 120 }, { price: 0 }), 120)
assert.equal(sellingPrice({ price: 120 }, { price: 90 }), 90)
assert.equal(sellingPrice({ price: 120 }, null), 120)

const categories = [
  { id: 'food', name: 'Food', slug: 'food' },
  { id: 'toys', name: 'Toys', slug: 'toys' },
]
const products = [
  { id: 'a', category: 'Food', petType: 'Dogs', status: 'Active', active: true },
  { id: 'b', category: 'Food', petType: 'Cats', status: 'Active', active: true },
  { id: 'c', category: 'Toys', petType: 'Dogs', status: 'Out of Stock', active: true, stock: 0 },
  { id: 'd', category: 'Food', petType: 'Dogs', status: 'Draft', active: true },
  { id: 'e', category: 'Food', subcategory: 'Toys', petType: 'Birds', status: 'Active', active: true },
]

const counts = countProductsByCategory(products, categories)
assert.equal(counts.get('food'), 3)
assert.equal(counts.get('toys'), 1)
assert.equal(getProductsForCategory(products.filter((p) => p.status !== 'Draft'), 'food', categories).length, 3)
assert.equal(products.filter((p) => productMatchesPet(p, 'Dogs') && p.status !== 'Draft').length, 2)

console.log('pet category ok')
