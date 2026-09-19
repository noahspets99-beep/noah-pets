import { catalogProducts, toStorefrontProduct } from '../data/catalog'
import { slugify } from '../admin/utils'

/** Normalize pet type to storefront plural vocabulary. */
export function normalizePetType(petType) {
  const map = {
    Dog: 'Dogs',
    Cat: 'Cats',
    Bird: 'Birds',
    Fish: 'Fish',
    Rabbit: 'Small Pets',
    Other: 'Small Pets',
    Dogs: 'Dogs',
    Cats: 'Cats',
    Birds: 'Birds',
    'Small Pets': 'Small Pets',
  }
  return map[petType] || petType || 'Dogs'
}

export function variantStock(variant) {
  if (!variant) return 0
  const n = Number(variant.stock)
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

/** Authoritative sellable units from Firestore `stock` (and variant.stock when present). */
export function productStock(product, variant = null) {
  if (!product) return 0
  if (variant) return variantStock(variant)
  const variants = Array.isArray(product.variants)
    ? product.variants.filter(Boolean)
    : []
  if (variants.some((v) => v.stock != null && v.stock !== '')) {
    return variants.reduce((sum, v) => sum + variantStock(v), 0)
  }
  const n = Number(product.stock)
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

export function isProductInStock(product, variant = null) {
  if (!product) return false
  if (product.active === false || product.status === 'Draft') return false
  return productStock(product, variant) > 0
}

export function firstAvailableVariant(product) {
  const variants = Array.isArray(product?.variants)
    ? product.variants.filter(Boolean)
    : []
  if (!variants.length) return null
  return variants.find((v) => variantStock(v) > 0) || variants[0]
}

export function adminProductToStorefront(p) {
  const images = (p.images || []).filter(Boolean)
  const stock = productStock(p)
  const active = p.active !== false && p.status !== 'Draft'
  const petType = normalizePetType(p.petType)
  const categorySlug =
    p.categorySlug ||
    slugify(p.subcategory || p.category || '') ||
    'products'

  return toStorefrontProduct({
    id: p.id,
    name: p.name,
    slug: p.slug || slugify(p.name) || p.id,
    brand: p.brand,
    petType,
    category: p.category || p.subcategory || '',
    subcategory: p.subcategory || p.category || '',
    categorySlug,
    subcategorySlug: p.subcategorySlug || categorySlug,
    rating: p.rating ?? 4.5,
    reviews: p.reviews ?? p.sales ?? 0,
    price: Number(p.price) || 0,
    originalPrice: Number(p.mrp) || Number(p.price) || 0,
    discount: Number(p.discount) || 0,
    inStock: active && stock > 0,
    stock,
    badge: p.badge || (p.bestseller ? 'Bestseller' : p.newArrival ? 'New' : ''),
    image: images[0] || p.image || '',
    images: images.length ? images : p.image ? [p.image] : [],
    description: p.description || '',
    shortDescription: p.shortDescription || '',
    age: p.ageGroup || p.age || '',
    flavor: p.flavor || '',
    weight: p.weight || '',
    size: p.size || '',
    color: p.color || '',
    featured: !!p.featured,
    bestseller: !!p.bestseller,
    newArrival: !!p.newArrival,
    variants: p.variants || [],
    keywords: p.seoKeywords
      ? String(p.seoKeywords)
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : [],
    seo: {
      title: p.seoTitle || '',
      description: p.seoDescription || '',
      keywords: p.seoKeywords || '',
      canonical: p.canonicalUrl || '',
      ogTitle: p.ogTitle || '',
      ogDescription: p.ogDescription || '',
      socialImage: p.socialImage || '',
    },
    relatedIds: p.relatedIds || [],
    frequentlyBoughtWith: p.frequentlyBoughtWith || [],
    active,
    status: p.status,
  })
}

export function isStorefrontVisible(p) {
  if (!p) return false
  if (p.active === false) return false
  if (p.status === 'Draft') return false
  return true
}

export const FALLBACK_CATALOG_PRODUCTS = catalogProducts.map(toStorefrontProduct)

export function stripUndefined(obj) {
  return JSON.parse(JSON.stringify(obj))
}
