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

export function adminProductToStorefront(p) {
  const images = (p.images || []).filter(Boolean)
  const stock = Number(p.stock) || 0
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
    inStock: active && stock > 0 && p.status !== 'Out of Stock',
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
