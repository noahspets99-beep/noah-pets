/**
 * Shared product↔category matching for admin counts and storefront filters.
 * Counts are derived from live product data (not stored category.productCount).
 */

function norm(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function productCategoryIds(product) {
  return [product?.categoryId, product?.categoryDocId, product?.categoryRef]
    .filter(Boolean)
    .map(String)
}

function productCategoryNames(product) {
  return [product?.category, product?.categoryName]
    .filter(Boolean)
    .map(norm)
}

function productCategorySlugs(product) {
  return [product?.categorySlug]
    .filter(Boolean)
    .map(norm)
}

function productSubcategoryNames(product) {
  return [product?.subcategory]
    .filter(Boolean)
    .map(norm)
}

function productSubcategorySlugs(product) {
  return [product?.subcategorySlug]
    .filter(Boolean)
    .map(norm)
}

/**
 * Whether a product is assigned to a category (by id, name, or slug).
 * Does not match via petType — that caused parent categories to over-count.
 */
export function productMatchesCategory(product, category) {
  if (!product || !category) return false

  const catId = String(category.id || '')
  if (catId && productCategoryIds(product).includes(catId)) return true

  const cName = norm(category.name)
  const cSlug = norm(category.slug)

  if (cName && productCategoryNames(product).includes(cName)) return true
  if (cSlug && productCategorySlugs(product).includes(cSlug)) return true

  // Legacy catalog rows often store the browse category in subcategory
  if (cName && productSubcategoryNames(product).includes(cName)) return true
  if (cSlug && productSubcategorySlugs(product).includes(cSlug)) return true

  return false
}

/**
 * Resolve the single best category for a product so each product is counted once.
 * Preference: id → primary category name/slug → subcategory name/slug.
 */
export function resolveProductCategoryId(product, categories = []) {
  if (!product || !categories.length) return null

  const byId = categories.find((c) =>
    productCategoryIds(product).includes(String(c.id)),
  )
  if (byId) return byId.id

  const names = productCategoryNames(product)
  const slugs = productCategorySlugs(product)
  const byPrimary = categories.find((c) => {
    const cName = norm(c.name)
    const cSlug = norm(c.slug)
    return (cName && names.includes(cName)) || (cSlug && slugs.includes(cSlug))
  })
  if (byPrimary) return byPrimary.id

  const subNames = productSubcategoryNames(product)
  const subSlugs = productSubcategorySlugs(product)
  const bySub = categories.find((c) => {
    const cName = norm(c.name)
    const cSlug = norm(c.slug)
    return (
      (cName && subNames.includes(cName)) || (cSlug && subSlugs.includes(cSlug))
    )
  })
  return bySub?.id ?? null
}

/** Live product counts per category id (no double-counting). */
export function countProductsByCategory(products = [], categories = []) {
  const counts = new Map()
  for (const c of categories) counts.set(c.id, 0)

  for (const product of products) {
    const categoryId = resolveProductCategoryId(product, categories)
    if (categoryId != null && counts.has(categoryId)) {
      counts.set(categoryId, (counts.get(categoryId) || 0) + 1)
    }
  }

  return counts
}

/** Filter products that belong to a category document or slug string. */
export function getProductsForCategory(products = [], categoryOrSlug, categories = []) {
  if (!categoryOrSlug) return []

  const category =
    typeof categoryOrSlug === 'object'
      ? categoryOrSlug
      : categories.find(
          (c) =>
            norm(c.slug) === norm(categoryOrSlug) ||
            String(c.id) === String(categoryOrSlug),
        )

  if (category) {
    if (categories.length) {
      return products.filter(
        (p) => resolveProductCategoryId(p, categories) === category.id,
      )
    }
    return products.filter((p) => productMatchesCategory(p, category))
  }

  const slug = norm(categoryOrSlug)
  return products.filter((p) => {
    return (
      productCategorySlugs(p).includes(slug) ||
      productSubcategorySlugs(p).includes(slug) ||
      productCategoryNames(p).some((n) => n.replace(/\s+/g, '-') === slug) ||
      productSubcategoryNames(p).some((n) => n.replace(/\s+/g, '-') === slug)
    )
  })
}
