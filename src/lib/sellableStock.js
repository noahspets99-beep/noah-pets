/** Missing or non-numeric stock is not a quantity. "10" counts; "", null, and undefined do not. */
export function readStock(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.max(0, n)
}

export function variantStock(variant) {
  return readStock(variant?.stock) ?? 0
}

/**
 * Variant rows are inventory only when at least one has a positive quantity.
 * Admin Inventory edits product.stock. Saving a product writes variant.stock as 0
 * for size/label options that were never stocked separately. Those zeros must not
 * hide the product quantity.
 */
function variantsTrackInventory(variants) {
  return variants.some((variant) => {
    const qty = readStock(variant?.stock)
    return qty != null && qty > 0
  })
}

function variantList(product) {
  const raw = product?.variants
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (raw && typeof raw === 'object') return Object.values(raw).filter(Boolean)
  return []
}

/**
 * Sellable units. Variant quantities win only when they are actually stocked.
 * Returns null when no numeric stock is stored, so callers can tell "missing"
 * from an explicit zero.
 */
export function productStock(product, variant = null) {
  if (!product) return 0
  const variants = variantList(product)
  const parent = readStock(product.stock)
  const tracked = variantsTrackInventory(variants)
  if (variant) {
    if (tracked) return variantStock(variant)
    return parent ?? 0
  }
  if (tracked) return variants.reduce((sum, item) => sum + variantStock(item), 0)
  return parent ?? 0
}
