import { STORE } from '../config/store'
import { isProductInStock, productStock } from '../services/catalogMapper'

const siteUrl = String(STORE.siteUrl || 'https://noahspets.com').replace(/\/$/, '')

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: STORE.name,
    url: siteUrl,
    logo: `${siteUrl}/image.jpeg`,
    email: STORE.email,
    telephone: STORE.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: STORE.address.line1,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.pincode,
      addressCountry: 'IN',
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    sameAs: [STORE.social.instagram, STORE.social.facebook, STORE.social.youtube].filter(
      Boolean,
    ),
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: STORE.name,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function productSchema(product, selectedVariant) {
  const price = selectedVariant?.price ?? product.price
  const availability =
    (selectedVariant
      ? productStock(product, selectedVariant) > 0
      : isProductInStock(product))
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock'

  const images = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : []

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description || undefined,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: String(price),
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  if (images.length) schema.image = images
  if (selectedVariant?.sku || product.sku) {
    schema.sku = selectedVariant?.sku || product.sku
  }
  if (product.brand) {
    schema.brand = { '@type': 'Brand', name: product.brand }
  }
  if (
    product.rating != null &&
    product.reviews != null &&
    Number(product.reviews) > 0
  ) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(product.rating),
      reviewCount: String(product.reviews),
    }
  }

  return schema
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PetStore',
    name: STORE.name,
    image: `${siteUrl}/image.jpeg`,
    telephone: STORE.phone,
    email: STORE.email,
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: STORE.address.line1,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.pincode,
      addressCountry: 'IN',
    },
    description: STORE.shortDescription,
    hasMap: STORE.mapsUrl,
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    priceRange: '₹₹',
  }
}
