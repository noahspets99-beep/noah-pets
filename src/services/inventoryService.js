/**
 * Client-side inventory overrides for demo mode.
 * When Firebase is connected, decrease stock in a Cloud Function / transaction instead.
 */
const KEY = 'noah_inventory_overrides_v1'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

function write(map) {
  localStorage.setItem(KEY, JSON.stringify(map))
}

export function getStockOverride(productId, variantId = null) {
  const map = read()
  const key = variantId ? `${productId}::${variantId}` : productId
  return map[key]
}

export function setStock(productId, stock, variantId = null) {
  const map = read()
  const key = variantId ? `${productId}::${variantId}` : productId
  map[key] = Math.max(0, stock)
  write(map)
}

export function decreaseStockForCartItems(items = []) {
  const map = read()
  for (const item of items) {
    const key = item.variantId ? `${item.id}::${item.variantId}` : item.id
    const current =
      map[key] !== undefined ? map[key] : item.maxStock ?? 99
    map[key] = Math.max(0, current - item.quantity)
  }
  write(map)
  return map
}

export function applyInventoryToProduct(product) {
  if (!product) return product
  const base = getStockOverride(product.id)
  let next = { ...product }
  if (base !== undefined) {
    next.stock = base
    next.inStock = base > 0
  }
  if (Array.isArray(product.variants)) {
    next.variants = product.variants.map((v) => {
      const ov = getStockOverride(product.id, v.id)
      if (ov === undefined) return v
      return { ...v, stock: ov }
    })
    if (base === undefined) {
      const total = next.variants.reduce((s, v) => s + (v.stock || 0), 0)
      next.stock = total
      next.inStock = total > 0
    }
  }
  return next
}
