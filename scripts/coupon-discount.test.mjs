import assert from 'node:assert/strict'
import { evaluateCoupon } from '../src/lib/couponDiscount.js'

const now = Date.parse('2026-10-06T12:00:00.000Z')
const lines = [
  { id: 'dog', lineTotal: 1000, categoryId: 'cat-dog', categorySlug: 'dog-food', category: 'Dog Food' },
  { id: 'cat', lineTotal: 500, categoryId: 'cat-cat', categorySlug: 'cat-food', category: 'Cat Food' },
  { id: 'bird', lineTotal: 800, categoryId: 'cat-bird', categorySlug: 'bird-cage', category: 'Bird Cage' },
]

const base = {
  code: 'SAVE10',
  type: 'Percentage',
  value: 10,
  status: 'Active',
  active: true,
  minOrder: 0,
  maxDiscount: 0,
}

assert.equal(evaluateCoupon({ ...base }, lines, 2300, now).discount, 230)
assert.equal(
  evaluateCoupon(
    {
      ...base,
      code: 'CAT10',
      applicability: 'categories',
      categoryIds: ['cat-dog'],
      categorySlugs: ['dog-food'],
      categoryNames: ['Dog Food'],
    },
    lines,
    2300,
    now,
  ).discount,
  100,
)
assert.equal(
  evaluateCoupon(
    {
      ...base,
      code: 'PROD20',
      type: 'Percentage',
      value: 20,
      applicability: 'products',
      productIds: ['dog'],
    },
    lines,
    2300,
    now,
  ).discount,
  200,
)
assert.equal(
  evaluateCoupon(
    {
      ...base,
      applicability: 'categories',
      categoryIds: ['cat-dog', 'cat-cat'],
      categorySlugs: ['dog-food', 'cat-food'],
    },
    lines,
    2300,
    now,
  ).discount,
  150,
)
assert.equal(evaluateCoupon(null, lines, 2300, now).ok, false)
assert.equal(
  evaluateCoupon({ ...base, endDate: '2026-10-05' }, lines, 2300, now).code,
  'coupon_expired',
)
assert.equal(
  evaluateCoupon({ ...base, endDate: '2026-10-06' }, lines, 2300, now).ok,
  true,
)
assert.equal(
  evaluateCoupon({ ...base, startDate: '2026-10-07' }, lines, 2300, now).code,
  'coupon_not_started',
)
assert.equal(
  evaluateCoupon({ ...base, status: 'Inactive', active: false }, lines, 2300, now).ok,
  false,
)
assert.equal(evaluateCoupon({ ...base }, [], 0, now).code, 'empty_cart')
assert.equal(
  evaluateCoupon(
    { ...base, applicability: 'products', productIds: ['missing'] },
    lines,
    2300,
    now,
  ).code,
  'coupon_not_applicable',
)
assert.equal(
  evaluateCoupon({ ...base, type: 'Fixed Amount', value: 5000 }, lines, 2300, now).discount,
  2300,
)
assert.equal(
  evaluateCoupon({ ...base, maxDiscount: 50 }, lines, 2300, now).discount,
  50,
)
assert.equal(
  evaluateCoupon({ ...base, minOrder: 5000 }, lines, 2300, now).code,
  'coupon_min_order',
)

const doubled = lines.map((line) =>
  line.id === 'dog' ? { ...line, lineTotal: 2000 } : line,
)
assert.equal(
  evaluateCoupon(
    {
      ...base,
      applicability: 'categories',
      categoryIds: ['cat-dog'],
      categorySlugs: ['dog-food'],
    },
    doubled,
    3300,
    now,
  ).discount,
  200,
)
assert.equal(
  evaluateCoupon(
    {
      ...base,
      applicability: 'categories',
      categoryIds: ['cat-dog'],
      categorySlugs: ['dog-food'],
    },
    lines.filter((line) => line.id !== 'dog'),
    1300,
    now,
  ).discount,
  0,
)

console.log('coupon discount ok')
